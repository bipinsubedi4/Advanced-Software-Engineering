"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("./prisma");
const middleware_1 = require("./middleware");
const isAdmin_1 = require("./middleware/isAdmin");
const adminRouter = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const normalizeCompletedStatus = () => ["COMPLETED", "completed"];
adminRouter.post("/login", async (req, res) => {
    try {
        if (!ADMIN_EMAIL) {
            return res.status(500).json({ error: "ADMIN_EMAIL is not configured" });
        }
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
            return res.status(403).json({ error: "Forbidden" });
        }
        const adminUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!adminUser) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const passwordValid = await bcryptjs_1.default.compare(password, adminUser.passwordHash);
        if (!passwordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ sub: adminUser.id, role: adminUser.role, email: adminUser.email, scope: "admin" }, JWT_SECRET, { expiresIn: "8h" });
        res.json({
            token,
            user: {
                id: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
                role: adminUser.role,
            },
        });
    }
    catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ error: "Failed to login" });
    }
});
adminRouter.use(middleware_1.authenticateToken);
adminRouter.use(isAdmin_1.requireAdmin);
adminRouter.get("/stats", async (_req, res) => {
    try {
        const [userCount, bookingCount, revenueSum] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.booking.count(),
            prisma_1.prisma.booking.aggregate({
                _sum: {
                    totalPrice: true,
                },
                where: {
                    status: {
                        in: normalizeCompletedStatus(),
                    },
                },
            }),
        ]);
        res.json({
            users: userCount,
            bookings: bookingCount,
            revenue: Number(revenueSum._sum.totalPrice ?? 0),
        });
    }
    catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({ error: "Failed to load stats" });
    }
});
adminRouter.get("/providers/pending", async (_req, res) => {
    try {
        const pendingProviders = await prisma_1.prisma.providerProfile.findMany({
            where: { isVerified: false },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });
        res.json({
            providers: pendingProviders.map((provider) => ({
                id: provider.id,
                userId: provider.userId,
                name: provider.user?.name ?? "Unknown",
                email: provider.user?.email ?? "",
                createdAt: provider.createdAt,
                city: provider.city,
                state: provider.state,
                isVerified: provider.isVerified,
                verificationStatus: provider.verificationStatus,
            })),
        });
    }
    catch (error) {
        console.error("Pending providers error:", error);
        res.status(500).json({ error: "Failed to load providers" });
    }
});
adminRouter.post("/providers/approve/:id", async (req, res) => {
    try {
        const providerId = Number(req.params.id);
        if (Number.isNaN(providerId)) {
            return res.status(400).json({ error: "Invalid provider id" });
        }
        const updated = await prisma_1.prisma.providerProfile.update({
            where: { id: providerId },
            data: {
                isVerified: true,
                verificationStatus: "APPROVED",
                isActive: true,
            },
        });
        res.json({ provider: updated });
    }
    catch (error) {
        console.error("Approve provider error:", error);
        res.status(500).json({ error: "Failed to approve provider" });
    }
});
adminRouter.post("/providers/reject/:id", async (req, res) => {
    try {
        const providerId = Number(req.params.id);
        if (Number.isNaN(providerId)) {
            return res.status(400).json({ error: "Invalid provider id" });
        }
        const updated = await prisma_1.prisma.providerProfile.update({
            where: { id: providerId },
            data: {
                isVerified: false,
                isActive: false,
                verificationStatus: "REJECTED",
            },
        });
        res.json({ provider: updated });
    }
    catch (error) {
        console.error("Reject provider error:", error);
        res.status(500).json({ error: "Failed to reject provider" });
    }
});
adminRouter.get("/users", async (_req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                isSuspended: true,
            },
        });
        res.json({ users });
    }
    catch (error) {
        console.error("Admin users error:", error);
        res.status(500).json({ error: "Failed to load users" });
    }
});
adminRouter.put("/users/:id/suspend", async (req, res) => {
    try {
        const userId = Number(req.params.id);
        if (Number.isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user id" });
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const updated = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { isSuspended: !user.isSuspended },
        });
        res.json({ user: updated });
    }
    catch (error) {
        console.error("Suspend user error:", error);
        res.status(500).json({ error: "Failed to update user status" });
    }
});
exports.default = adminRouter;
//# sourceMappingURL=admin.js.map