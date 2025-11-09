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
    latitude: zod_1.z.number().min(-90).max(90).optional().nullable(),
    longitude: zod_1.z.number().min(-180).max(180).optional().nullable(),
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
                    latitude: payload.latitude ?? profile.latitude,
                    longitude: payload.longitude ?? profile.longitude,
                    isActive: true,
                    isProfileComplete: true,
                },
            });
            const services = normalizeServices(payload.services);
            const existingServices = await tx.providerService.findMany({
                where: { providerId: profile.id },
                include: { _count: { select: { bookings: true } } },
            });
            const incomingNames = new Set(services.map((service) => service.name.toLowerCase()));
            const existingByName = new Map(existingServices.map((service) => [service.serviceName.toLowerCase(), service]));
            for (const service of services) {
                const key = service.name.toLowerCase();
                const current = existingByName.get(key);
                if (current) {
                    await tx.providerService.update({
                        where: { id: current.id },
                        data: {
                            serviceName: service.name,
                            description: `${service.category} service`,
                            isActive: true,
                        },
                    });
                }
                else {
                    await tx.providerService.create({
                        data: {
                            providerId: profile.id,
                            serviceName: service.name,
                            description: `${service.category} service`,
                            pricePerHour: 0,
                            durationMin: 60,
                            isActive: true,
                        },
                    });
                }
            }
            for (const service of existingServices) {
                const key = service.serviceName.toLowerCase();
                if (incomingNames.has(key))
                    continue;
                if (service._count.bookings > 0) {
                    await tx.providerService.update({
                        where: { id: service.id },
                        data: { isActive: false },
                    });
                }
                else {
                    await tx.providerService.delete({ where: { id: service.id } });
                }
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
const parseNumber = (value, fallback) => {
    if (!value)
        return fallback;
    const numeric = Array.isArray(value) ? Number(value[0]) : Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
};
const parseArrayParam = (value) => {
    if (!value)
        return [];
    if (Array.isArray(value)) {
        return value.flatMap((entry) => entry.split(",")).map((entry) => entry.trim()).filter(Boolean);
    }
    return value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
};
const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
    if (typeof lat1 !== "number" ||
        typeof lon1 !== "number" ||
        typeof lat2 !== "number" ||
        typeof lon2 !== "number") {
        return null;
    }
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
router.get("/search", async (req, res) => {
    try {
        const qParam = req.query.q;
        const minPriceParam = req.query.minPrice;
        const maxPriceParam = req.query.maxPrice;
        const minRatingParam = req.query.minRating;
        const serviceParam = req.query.service;
        const dateParam = req.query.date;
        const radiusParam = req.query.radiusInKm;
        const latParam = req.query.lat;
        const lngParam = req.query.lng;
        const sortByParam = req.query.sortBy ?? "rating_desc";
        const pageParam = req.query.page ?? "1";
        const pageSizeParam = req.query.pageSize ?? "20";
        const queryString = typeof qParam === "string" ? qParam.trim() : "";
        const serviceFilters = parseArrayParam(serviceParam);
        const minPriceValue = parseNumber(minPriceParam);
        const maxPriceValue = parseNumber(maxPriceParam);
        const minRatingValue = parseNumber(minRatingParam);
        const latValue = parseNumber(latParam);
        const lngValue = parseNumber(lngParam);
        const radiusValue = parseNumber(radiusParam);
        const pageNumber = Math.max(parseNumber(pageParam, 1) ?? 1, 1);
        const limit = Math.min(Math.max(parseNumber(pageSizeParam, 20) ?? 20, 1), 50);
        const availabilityDay = (() => {
            if (!dateParam || typeof dateParam !== "string")
                return null;
            const parsed = new Date(dateParam);
            if (Number.isNaN(parsed.getTime()))
                return null;
            return parsed.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
        })();
        const andConditions = [];
        if (queryString) {
            const searchCondition = {
                OR: [
                    { user: { name: { contains: queryString, mode: "insensitive" } } },
                    { city: { contains: queryString, mode: "insensitive" } },
                    { state: { contains: queryString, mode: "insensitive" } },
                    { bio: { contains: queryString, mode: "insensitive" } },
                ],
            };
            andConditions.push(searchCondition);
        }
        if (minRatingValue) {
            andConditions.push({ averageRating: { gte: minRatingValue } });
        }
        if (availabilityDay) {
            andConditions.push({
                availability: {
                    some: {
                        dayOfWeek: availabilityDay,
                        isAvailable: true,
                    },
                },
            });
        }
        if (minPriceValue !== undefined || maxPriceValue !== undefined) {
            andConditions.push({
                services: {
                    some: {
                        pricePerHour: {
                            gte: minPriceValue ? Math.round(minPriceValue * 100) : undefined,
                            lte: maxPriceValue ? Math.round(maxPriceValue * 100) : undefined,
                        },
                    },
                },
            });
        }
        if (serviceFilters.length) {
            serviceFilters.forEach((serviceName) => {
                andConditions.push({
                    services: {
                        some: {
                            serviceName: { equals: serviceName, mode: "insensitive" },
                        },
                    },
                });
            });
        }
        const where = {
            isActive: true,
            user: { role: "PROVIDER" },
            AND: andConditions,
        };
        const providers = await prisma_1.prisma.providerProfile.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true, phone: true, profileImage: true } },
                services: true,
                availability: true,
            },
            take: limit * 3, // fetch extra to allow distance filtering before pagination
        });
        const enriched = providers
            .map((provider) => {
            const prices = provider.services.map((service) => service.pricePerHour ?? 0);
            const minServicePrice = prices.length ? Math.min(...prices) / 100 : null;
            const maxServicePrice = prices.length ? Math.max(...prices) / 100 : null;
            const distanceKm = haversineDistanceKm(latValue ?? null, lngValue ?? null, provider.latitude, provider.longitude);
            const availableOnDate = availabilityDay
                ? provider.availability.some((slot) => slot.dayOfWeek === availabilityDay && slot.isAvailable)
                : true;
            return {
                id: provider.id,
                name: provider.user?.name ?? "New Provider",
                bio: provider.bio ?? "",
                city: provider.city ?? "",
                state: provider.state ?? "",
                averageRating: provider.averageRating ?? 0,
                totalReviews: provider.totalReviews ?? 0,
                minPrice: minServicePrice,
                maxPrice: maxServicePrice,
                services: provider.services,
                serviceRadius: provider.serviceRadius,
                distanceKm,
                availableOnDate,
                profileImage: provider.user?.profileImage ?? null,
                latitude: provider.latitude,
                longitude: provider.longitude,
            };
        })
            .filter((provider) => {
            if (!availabilityDay)
                return true;
            return provider.availableOnDate;
        })
            .filter((provider) => {
            if (radiusValue && latValue !== undefined && lngValue !== undefined) {
                if (provider.distanceKm == null)
                    return false;
                return provider.distanceKm <= radiusValue;
            }
            return true;
        });
        const sorted = enriched.sort((a, b) => {
            switch (sortByParam) {
                case "price_asc":
                    return (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity);
                case "price_desc":
                    return (b.maxPrice ?? 0) - (a.maxPrice ?? 0);
                case "distance_asc":
                    return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
                case "rating_asc":
                    return (a.averageRating ?? 0) - (b.averageRating ?? 0);
                case "name_asc":
                    return a.name.localeCompare(b.name);
                case "rating_desc":
                default:
                    return (b.averageRating ?? 0) - (a.averageRating ?? 0);
            }
        });
        const start = (pageNumber - 1) * limit;
        const paged = sorted.slice(start, start + limit);
        res.json({
            success: true,
            count: paged.length,
            total: sorted.length,
            page: pageNumber,
            pageSize: limit,
            providers: paged,
        });
    }
    catch (error) {
        console.error("Cleaner search failed", error);
        res.status(500).json({ error: "Failed to search cleaners" });
    }
});
exports.default = router;
//# sourceMappingURL=cleaners.js.map