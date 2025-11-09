"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const multer_1 = __importDefault(require("multer"));
const crypto_1 = __importDefault(require("crypto"));
const cloudinary_1 = require("cloudinary");
const prisma_1 = require("./prisma");
const middleware_1 = require("./middleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const cloudinaryReady = Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET);
if (cloudinaryReady) {
    cloudinary_1.v2.config({
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
};
const wizardSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1),
    phone: zod_1.z.string().min(6),
    bio: zod_1.z.string().min(10),
    profileImageUrl: zod_1.z.string().url().optional().nullable(),
    address: zod_1.z.string().min(1),
    city: zod_1.z.string().min(1),
    state: zod_1.z.string().min(1),
    zipCode: zod_1.z.string().min(1),
    serviceRadius: zod_1.z.number().int().min(1).max(200),
    services: zod_1.z
        .array(zod_1.z.object({
        name: zod_1.z.string().min(1),
        category: zod_1.z.string().min(1),
    }))
        .min(1),
    availability: zod_1.z.array(zod_1.z.object({
        day: zod_1.z.string().min(1),
        blocks: zod_1.z.array(zod_1.z.object({
            startTime: zod_1.z.string().min(1),
            endTime: zod_1.z.string().min(1),
        })),
    })),
});
const withProfileCompletion = (profile) => ({
    ...profile,
    profileComplete: profile.isProfileComplete,
});
const ensureProviderProfile = async (userId) => {
    let profile = await prisma_1.prisma.providerProfile.findUnique({
        where: { userId },
        include: profileInclude,
    });
    if (!profile) {
        profile = await prisma_1.prisma.providerProfile.create({
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
router.get("/me", middleware_1.authenticateToken, async (req, res) => {
    const userId = req.user?.sub;
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
const normalizeServices = (services) => {
    const map = new Map();
    for (const service of services) {
        const key = service.name.toLowerCase();
        if (!map.has(key)) {
            map.set(key, { name: service.name, category: service.category });
        }
    }
    return Array.from(map.values());
};
router.put("/me/profile", middleware_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const payload = wizardSchema.parse(req.body);
        const profile = await ensureProviderProfile(userId);
        await prisma_1.prisma.$transaction(async (tx) => {
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
            const availabilityData = payload.availability.flatMap((day) => day.blocks.map((block) => ({
                providerId: profile.id,
                dayOfWeek: day.day.toUpperCase(),
                startTime: block.startTime,
                endTime: block.endTime,
                isAvailable: true,
            })));
            if (availabilityData.length) {
                await tx.providerAvailability.createMany({ data: availabilityData });
            }
        });
        const updated = await prisma_1.prisma.providerProfile.findUnique({
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
    }
    catch (error) {
        console.error("Failed to save cleaner profile", error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: "Invalid payload", details: error.flatten() });
        }
        res.status(500).json({ error: "Unable to save profile" });
    }
});
router.post("/me/profile-image", middleware_1.authenticateToken, upload.single("file"), async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!req.file) {
            return res.status(400).json({ error: "Image file is required" });
        }
        let imageUrl;
        if (cloudinaryReady) {
            imageUrl = await new Promise((resolve, reject) => {
                const upload = cloudinary_1.v2.uploader.upload_stream({
                    folder: "myclean/providers",
                    public_id: `${userId}-${crypto_1.default.randomUUID()}`,
                    transformation: [{ width: 512, height: 512, crop: "fill", gravity: "face" }],
                }, (error, result) => {
                    if (error || !result?.secure_url) {
                        return reject(error ?? new Error("Missing Cloudinary response"));
                    }
                    resolve(result.secure_url);
                });
                upload.end(req.file.buffer);
            });
        }
        else {
            console.warn("Cloudinary credentials missing; using placeholder profile image");
            imageUrl = `https://placehold.co/320x320?text=${encodeURIComponent("Cleaner")}`;
        }
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { profileImage: imageUrl },
        });
        res.json({ success: true, imageUrl });
    }
    catch (error) {
        console.error("Profile image upload failed", error);
        res.status(500).json({ error: "Failed to upload profile image" });
    }
});
exports.default = router;
//# sourceMappingURL=cleaners.js.map