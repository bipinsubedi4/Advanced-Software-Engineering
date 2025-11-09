"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/providers.ts
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("./prisma");
const middleware_1 = require("./middleware");
const router = (0, express_1.Router)();
const withProfileCompletion = (profile) => ({
    ...profile,
    profileComplete: profile.isProfileComplete,
});
const profileSchema = zod_1.z.object({
    userId: zod_1.z.number(),
    basicInfo: zod_1.z.object({
        fullName: zod_1.z.string().min(1),
        phone: zod_1.z.string().min(1),
        address: zod_1.z.string().min(1),
        city: zod_1.z.string().min(1),
        state: zod_1.z.string().min(1),
        zipCode: zod_1.z.string().min(1),
        bio: zod_1.z.string().min(1),
    }),
    professional: zod_1.z.object({
        yearsExperience: zod_1.z.string().min(1),
        hasInsurance: zod_1.z.boolean(),
        insuranceProvider: zod_1.z.string().optional(),
        hasVehicle: zod_1.z.boolean(),
        hasEquipment: zod_1.z.boolean(),
        certifications: zod_1.z.string().optional(),
    }),
    services: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        rate: zod_1.z.string(),
        selected: zod_1.z.boolean(),
    })),
    availability: zod_1.z.array(zod_1.z.object({
        day: zod_1.z.string(),
        enabled: zod_1.z.boolean(),
        startTime: zod_1.z.string(),
        endTime: zod_1.z.string(),
    })),
    blockedDates: zod_1.z
        .array(zod_1.z.object({
        date: zod_1.z.string().min(1),
        reason: zod_1.z.string().optional(),
    }))
        .optional(),
    settings: zod_1.z.object({
        maxBookingsPerDay: zod_1.z.string(),
        advanceBookingDays: zod_1.z.string(),
    }),
});
/* ---------- PUBLIC: list providers (you already have this) ---------- */
router.get("/", async (_req, res) => {
    try {
        const providers = await prisma_1.prisma.providerProfile.findMany({
            where: { isActive: true },
            include: {
                user: { select: { id: true, name: true, profileImage: true } },
                services: true,
                blockedDates: true,
            },
            orderBy: { averageRating: "desc" },
        });
        res.json({ success: true, providers: providers.map(withProfileCompletion) });
    }
    catch (error) {
        console.error("Error fetching providers:", error);
        res.status(500).json({ error: "Failed to list providers", details: error instanceof Error ? error.message : String(error) });
    }
});
/* ---------- PUBLIC: provider by id (you already have this) ---------- */
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const profile = await prisma_1.prisma.providerProfile.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, profileImage: true } },
                services: true,
                blockedDates: true,
            },
        });
        if (!profile)
            return res.status(404).json({ error: "Profile not found" });
        res.json({ success: true, profile: withProfileCompletion(profile) });
    }
    catch (error) {
        console.error("Error fetching provider by id:", error);
        res.status(500).json({ error: "Failed to fetch profile", details: error instanceof Error ? error.message : String(error) });
    }
});
/* ---------- PRIVATE: get my provider profile (for edit screens) ---------- */
router.get("/me/profile", middleware_1.authenticateToken, async (req, res) => {
    const userId = req.user?.sub;
    if (!userId)
        return res.status(401).json({ error: "Unauthorized" });
    const me = await prisma_1.prisma.providerProfile.findUnique({
        where: { userId },
        include: {
            user: { select: { id: true, name: true, profileImage: true } },
            services: true,
            blockedDates: true,
        },
    });
    // if not found, create a basic one now (safety)
    if (!me) {
        const created = await prisma_1.prisma.providerProfile.create({
            data: { userId, isActive: true, isVerified: false, isProfileComplete: false },
            include: {
                user: { select: { id: true, name: true, profileImage: true } },
                services: true,
                blockedDates: true,
            },
        });
        return res.json({ success: true, profile: withProfileCompletion(created) });
    }
    res.json({ success: true, profile: withProfileCompletion(me) });
});
/* ---------- PRIVATE: upsert my provider profile ---------- */
router.post("/me/profile", middleware_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        const { bio, yearsExperience, hasInsurance, insuranceProvider, hasVehicle, hasEquipment, certifications, address, city, state, zipCode, isActive = true, phone, // Optional: update user's phone
        name, // Optional: update user's name
         } = req.body ?? {};
        // Update user's phone and name if provided
        if (phone || name) {
            const userUpdate = {};
            if (phone)
                userUpdate.phone = phone;
            if (name)
                userUpdate.name = name;
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: userUpdate,
            });
        }
        const upserted = await prisma_1.prisma.providerProfile.upsert({
            where: { userId },
            update: {
                bio,
                yearsExperience,
                hasInsurance: !!hasInsurance,
                insuranceProvider: insuranceProvider || null,
                hasVehicle: !!hasVehicle,
                hasEquipment: !!hasEquipment,
                certifications,
                address,
                city,
                state,
                zipCode,
                isActive: !!isActive,
                isProfileComplete: true,
            },
            create: {
                userId,
                bio,
                yearsExperience,
                hasInsurance: !!hasInsurance,
                insuranceProvider: insuranceProvider || null,
                hasVehicle: !!hasVehicle,
                hasEquipment: !!hasEquipment,
                certifications,
                address,
                city,
                state,
                zipCode,
                isActive: !!isActive,
                isProfileComplete: true,
            },
            include: {
                user: { select: { id: true, name: true, profileImage: true } },
                services: true,
            },
        });
        res.json({ success: true, profile: withProfileCompletion(upserted) });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to save provider profile" });
    }
});
/* ---------- PRIVATE: replace my services (bulk) ---------- */
router.post("/me/services", middleware_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        // Expect: [{ serviceName, pricePerHour (cents), durationMin, description? }, ...]
        const services = Array.isArray(req.body?.services) ? req.body.services : [];
        const provider = await prisma_1.prisma.providerProfile.findUnique({ where: { userId } });
        if (!provider)
            return res.status(404).json({ error: "Provider profile not found" });
        // clear old
        await prisma_1.prisma.providerService.deleteMany({ where: { providerId: provider.id } });
        // create new
        if (services.length) {
            await prisma_1.prisma.providerService.createMany({
                data: services.map((s) => ({
                    providerId: provider.id,
                    serviceName: s.serviceName,
                    description: s.description ?? null,
                    pricePerHour: Number(s.pricePerHour) || 0, // cents
                    durationMin: Number(s.durationMin) || 60,
                    isActive: true,
                })),
            });
        }
        const refreshed = await prisma_1.prisma.providerProfile.findUnique({
            where: { id: provider.id },
            include: {
                user: { select: { id: true, name: true, profileImage: true } },
                services: true,
                blockedDates: true,
            },
        });
        res.json({ success: true, profile: refreshed ? withProfileCompletion(refreshed) : null });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to save services" });
    }
});
// Create or update provider profile
router.post("/profile", async (req, res) => {
    try {
        console.log("=== RECEIVED PROFILE DATA ===");
        console.log("Request body:", JSON.stringify(req.body, null, 2));
        console.log("=== END RECEIVED DATA ===");
        const validatedData = profileSchema.parse(req.body);
        // Update user's name and phone
        await prisma_1.prisma.user.update({
            where: { id: validatedData.userId },
            data: {
                name: validatedData.basicInfo.fullName,
                phone: validatedData.basicInfo.phone,
            },
        });
        // Create or update provider profile
        const profile = await prisma_1.prisma.providerProfile.upsert({
            where: { userId: validatedData.userId },
            create: {
                userId: validatedData.userId,
                bio: validatedData.basicInfo.bio,
                address: validatedData.basicInfo.address,
                city: validatedData.basicInfo.city,
                state: validatedData.basicInfo.state,
                zipCode: validatedData.basicInfo.zipCode,
                yearsExperience: validatedData.professional.yearsExperience,
                hasInsurance: validatedData.professional.hasInsurance,
                insuranceProvider: validatedData.professional.insuranceProvider || null,
                hasVehicle: validatedData.professional.hasVehicle,
                hasEquipment: validatedData.professional.hasEquipment,
                certifications: validatedData.professional.certifications || null,
                isProfileComplete: true,
                isActive: true, // Provider is active immediately
                isVerified: true, // Auto-verify for demo (in production, admin would verify)
            },
            update: {
                bio: validatedData.basicInfo.bio,
                address: validatedData.basicInfo.address,
                city: validatedData.basicInfo.city,
                state: validatedData.basicInfo.state,
                zipCode: validatedData.basicInfo.zipCode,
                yearsExperience: validatedData.professional.yearsExperience,
                hasInsurance: validatedData.professional.hasInsurance,
                insuranceProvider: validatedData.professional.insuranceProvider || null,
                hasVehicle: validatedData.professional.hasVehicle,
                hasEquipment: validatedData.professional.hasEquipment,
                certifications: validatedData.professional.certifications || null,
                isProfileComplete: true,
                isActive: true, // Ensure provider stays active on update
                updatedAt: new Date(),
            },
        });
        // Delete existing services and availability to replace with new ones
        await prisma_1.prisma.providerService.deleteMany({
            where: { providerId: profile.id },
        });
        await prisma_1.prisma.providerAvailability.deleteMany({
            where: { providerId: profile.id },
        });
        // Create services
        const selectedServices = validatedData.services.filter((service) => service.selected && service.rate);
        if (selectedServices.length > 0) {
            await prisma_1.prisma.providerService.createMany({
                data: selectedServices.map((service) => ({
                    providerId: profile.id,
                    serviceName: service.name,
                    pricePerHour: Math.round(parseFloat(service.rate) * 100), // Convert to cents
                    durationMin: 60, // Default 1 hour minimum
                    isActive: true,
                })),
            });
        }
        // Create availability
        const enabledDays = validatedData.availability.filter((availability) => availability.enabled);
        if (enabledDays.length > 0) {
            await prisma_1.prisma.providerAvailability.createMany({
                data: enabledDays.map((availability) => ({
                    providerId: profile.id,
                    dayOfWeek: availability.day.toUpperCase(),
                    startTime: availability.startTime,
                    endTime: availability.endTime,
                    isAvailable: true,
                })),
            });
        }
        // Replace blocked dates
        await prisma_1.prisma.providerBlockedDate.deleteMany({
            where: { providerId: profile.id },
        });
        const blockedDates = validatedData.blockedDates ?? [];
        if (blockedDates.length > 0) {
            await prisma_1.prisma.providerBlockedDate.createMany({
                data: blockedDates.map((blocked) => ({
                    providerId: profile.id,
                    date: new Date(blocked.date),
                    reason: blocked.reason ?? null,
                })),
            });
        }
        // Fetch complete profile with relations
        const completeProfile = await prisma_1.prisma.providerProfile.findUnique({
            where: { id: profile.id },
            include: {
                services: true,
                availability: true,
                blockedDates: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
        res.status(201).json({
            success: true,
            message: "Profile created successfully!",
            profile: completeProfile ? withProfileCompletion(completeProfile) : null,
        });
    }
    catch (error) {
        console.error("Profile creation error:", error);
        if (error instanceof zod_1.z.ZodError) {
            console.error("Zod validation issues:", JSON.stringify(error.issues, null, 2));
            return res.status(400).json({
                error: "Invalid data",
                details: error.issues
            });
        }
        res.status(500).json({ error: "Failed to create provider profile" });
    }
});
// Get provider's own profile
router.get("/profile/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await prisma_1.prisma.providerProfile.findUnique({
            where: { userId: parseInt(userId) },
            include: {
                services: true,
                availability: true,
                blockedDates: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        profileImage: true,
                    },
                },
            },
        });
        if (!profile) {
            return res.status(404).json({ error: "Profile not found" });
        }
        res.json({
            success: true,
            profile: profile ? withProfileCompletion(profile) : null,
        });
    }
    catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Failed to get profile" });
    }
});
exports.default = router;
//# sourceMappingURL=providers.js.map