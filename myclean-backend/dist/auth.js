"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma_1 = require("./prisma");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const createProviderProfileSkeleton = async (userId) => {
    await prisma_1.prisma.providerProfile.create({
        data: {
            userId,
            bio: "",
            yearsExperience: "0",
            hasInsurance: false,
            hasVehicle: false,
            hasEquipment: false,
            certifications: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            serviceRadius: 10,
            isVerified: true,
            isActive: true,
            isProfileComplete: false,
            averageRating: 0,
            totalReviews: 0,
            totalBookings: 0,
        },
    });
};
// Schema for user registration
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(["CUSTOMER", "PROVIDER", "ADMIN"]).optional().default("CUSTOMER"),
});
// Register Route
router.post("/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json(parsed.error.format());
    const { name, email, password, role } = parsed.data;
    const accountType = role;
    // Check if user already exists
    const existing = await prisma_1.prisma.user.findUnique({
        where: { email },
        include: { providerProfile: true },
    });
    if (existing) {
        const passwordMatches = await bcryptjs_1.default.compare(password, existing.passwordHash);
        if (!passwordMatches) {
            return res.status(409).json({ error: "Email already in use" });
        }
        if (accountType === "ADMIN") {
            return res.status(403).json({ error: "Cannot create another admin with this email" });
        }
        if (accountType === "CUSTOMER" && existing.hasCustomerAccount) {
            return res.status(409).json({ error: "This email already has a customer account" });
        }
        if (accountType === "PROVIDER" && existing.hasProviderAccount) {
            return res.status(409).json({ error: "This email already has a provider account" });
        }
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: existing.id },
            data: {
                hasCustomerAccount: accountType === "CUSTOMER" ? true : undefined,
                hasProviderAccount: accountType === "PROVIDER" ? true : undefined,
                role: accountType === "PROVIDER" ? "PROVIDER" : existing.role,
            },
        });
        if (accountType === "PROVIDER" && !existing.providerProfile) {
            await createProviderProfileSkeleton(existing.id);
        }
        const upgradeToken = jsonwebtoken_1.default.sign({ sub: updatedUser.id, role: accountType }, JWT_SECRET, {
            expiresIn: "7d",
        });
        return res.status(200).json({
            token: upgradeToken,
            user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: accountType },
            message: "Account type added to your profile.",
        });
    }
    // Hash password and create user
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role: accountType,
            hasCustomerAccount: accountType === "CUSTOMER",
            hasProviderAccount: accountType === "PROVIDER",
        },
    });
    if (accountType === "PROVIDER") {
        await createProviderProfileSkeleton(user.id);
    }
    const token = jsonwebtoken_1.default.sign({ sub: user.id, role: accountType }, JWT_SECRET, {
        expiresIn: "7d",
    });
    return res.status(201).json({
        token,
        user: { id: user.id, email: user.email, name: user.name, role: accountType },
    });
});
// Schema for login credentials
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    accountType: zod_1.z.enum(["CUSTOMER", "PROVIDER", "ADMIN"]).optional(),
});
// Login Route
router.post("/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json(parsed.error.format());
    const { email, password, accountType } = parsed.data;
    const requestedRole = accountType ?? "CUSTOMER";
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ error: "Invalid credentials" });
    if (user.isSuspended) {
        return res.status(403).json({ error: "Account is suspended. Contact support." });
    }
    const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ error: "Invalid credentials" });
    if (requestedRole === "ADMIN") {
        if (user.role !== "ADMIN") {
            return res.status(403).json({ error: "You do not have admin access" });
        }
    }
    else if (requestedRole === "CUSTOMER") {
        if (!user.hasCustomerAccount) {
            return res.status(403).json({ error: "No customer account associated with this email" });
        }
    }
    else if (requestedRole === "PROVIDER") {
        if (!user.hasProviderAccount) {
            return res.status(403).json({ error: "No provider account associated with this email" });
        }
    }
    const token = jsonwebtoken_1.default.sign({ sub: user.id, role: requestedRole }, JWT_SECRET, {
        expiresIn: "7d",
    });
    res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: requestedRole },
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map