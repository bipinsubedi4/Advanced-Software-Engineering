import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "./prisma";
import { authenticateToken, AuthRequest } from "./middleware";

const router = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const cloudinaryReady =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (cloudinaryReady) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const profileInclude = {
  user: { select: { id: true, name: true, email: true, phone: true, profileImage: true } },
  services: true,
  availability: true,
  blockedDates: true,
} as const;

const wizardSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(6),
  bio: z.string().min(10),
  profileImageUrl: z.string().url().optional().nullable(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  serviceRadius: z.number().int().min(1).max(200),
  services: z
    .array(
      z.object({
        name: z.string().min(1),
        category: z.string().min(1),
      })
    )
    .min(1),
  availability: z.array(
    z.object({
      day: z.string().min(1),
      blocks: z.array(
        z.object({
          startTime: z.string().min(1),
          endTime: z.string().min(1),
        })
      ),
    })
  ),
});

type WizardPayload = z.infer<typeof wizardSchema>;

const withProfileCompletion = <T extends { isProfileComplete: boolean }>(profile: T) => ({
  ...profile,
  profileComplete: profile.isProfileComplete,
});

const ensureProviderProfile = async (userId: number) => {
  let profile = await prisma.providerProfile.findUnique({
    where: { userId },
    include: profileInclude,
  });

  if (!profile) {
    profile = await prisma.providerProfile.create({
      data: {
        userId,
        isActive: true,
        isVerified: false,
        isProfileComplete: false,
      },
      include: profileInclude,
    });
  }

  return profile;
};

router.get("/me", authenticateToken, async (req, res) => {
  const userId = (req as AuthRequest).user?.sub;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const profile = await ensureProviderProfile(userId);
  const serialized = withProfileCompletion(profile);

  res.json({
    success: true,
    profileComplete: serialized.profileComplete,
    isProfileComplete: serialized.profileComplete,
    profile: serialized,
  });
});

const normalizeServices = (services: WizardPayload["services"]) => {
  const map = new Map<string, { name: string; category: string }>();
  for (const service of services) {
    const key = service.name.toLowerCase();
    if (!map.has(key)) {
      map.set(key, { name: service.name, category: service.category });
    }
  }
  return Array.from(map.values());
};

router.put("/me/profile", authenticateToken, async (req, res) => {
  try {
    const userId = (req as AuthRequest).user?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = wizardSchema.parse(req.body);
    const profile = await ensureProviderProfile(userId);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          name: payload.fullName,
          phone: payload.phone,
          profileImage: payload.profileImageUrl ?? undefined,
        },
      });

      await tx.providerProfile.update({
        where: { id: profile.id },
        data: {
          bio: payload.bio,
          address: payload.address,
          city: payload.city,
          state: payload.state,
          zipCode: payload.zipCode,
          serviceRadius: payload.serviceRadius,
          isActive: true,
          isProfileComplete: true,
        },
      });

      await tx.providerService.deleteMany({ where: { providerId: profile.id } });
      const services = normalizeServices(payload.services);
      if (services.length) {
        await tx.providerService.createMany({
          data: services.map((service) => ({
            providerId: profile.id,
            serviceName: service.name,
            description: `${service.category} service`,
            pricePerHour: 0,
            durationMin: 60,
            isActive: true,
          })),
        });
      }

      await tx.providerAvailability.deleteMany({ where: { providerId: profile.id } });
      const availabilityData = payload.availability.flatMap((day) =>
        day.blocks.map((block) => ({
          providerId: profile.id,
          dayOfWeek: day.day.toUpperCase(),
          startTime: block.startTime,
          endTime: block.endTime,
          isAvailable: true,
        }))
      );
      if (availabilityData.length) {
        await tx.providerAvailability.createMany({ data: availabilityData });
      }
    });

    const updated = await prisma.providerProfile.findUnique({
      where: { id: profile.id },
      include: profileInclude,
    });

    const serialized = updated ? withProfileCompletion(updated) : null;

    res.json({
      success: true,
      profileComplete: serialized?.profileComplete ?? false,
      isProfileComplete: serialized?.profileComplete ?? false,
      profile: serialized,
    });
  } catch (error) {
    console.error("Failed to save cleaner profile", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid payload", details: error.flatten() });
    }
    res.status(500).json({ error: "Unable to save profile" });
  }
});

router.post("/me/profile-image", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    const userId = (req as AuthRequest).user?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    let imageUrl: string;
    if (cloudinaryReady) {
      imageUrl = await new Promise<string>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: "myclean/providers",
            public_id: `${userId}-${crypto.randomUUID()}`,
            transformation: [{ width: 512, height: 512, crop: "fill", gravity: "face" }],
          },
          (error, result) => {
            if (error || !result?.secure_url) {
              return reject(error ?? new Error("Missing Cloudinary response"));
            }
            resolve(result.secure_url);
          }
        );
        upload.end(req.file!.buffer);
      });
    } else {
      console.warn("Cloudinary credentials missing; using placeholder profile image");
      imageUrl = `https://placehold.co/320x320?text=${encodeURIComponent("Cleaner")}`;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { profileImage: imageUrl },
    });

    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Profile image upload failed", error);
    res.status(500).json({ error: "Failed to upload profile image" });
  }
});

export default router;
