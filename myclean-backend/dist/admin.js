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
adminRouter.get("/services", async (req, res) => {
    try {
        const requestedStatus = typeof req.query.status === "string" ? req.query.status.toUpperCase() : undefined;
        const where = requestedStatus && ["PENDING", "APPROVED", "REJECTED"].includes(requestedStatus)
            ? { status: requestedStatus }
            : undefined;
        const services = await prisma_1.prisma.providerService.findMany({
            where,
            include: {
                provider: {
                    include: {
                        user: { select: { id: true, name: true, email: true, createdAt: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({
            services: services.map((service) => ({
                id: service.id,
                serviceName: service.serviceName,
                description: service.description,
                pricePerHour: service.pricePerHour,
                durationMin: service.durationMin,
                status: service.status,
                rejectionReason: service.rejectionReason,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt,
                provider: {
                    profileId: service.provider.id,
                    userId: service.provider.userId,
                    name: service.provider.user?.name ?? "Unknown",
                    email: service.provider.user?.email ?? "",
                    city: service.provider.city,
                    state: service.provider.state,
                },
            })),
        });
    }
    catch (error) {
        console.error("Admin services error:", error);
        res.status(500).json({ error: "Failed to load services" });
    }
});
adminRouter.post("/services/:id/approve", async (req, res) => {
    try {
        const serviceId = Number(req.params.id);
        if (Number.isNaN(serviceId)) {
            return res.status(400).json({ error: "Invalid service id" });
        }
        const updated = await prisma_1.prisma.providerService.update({
            where: { id: serviceId },
            data: { status: "APPROVED", rejectionReason: null, isActive: true },
        });
        res.json({ service: updated });
    }
    catch (error) {
        console.error("Approve service error:", error);
        res.status(500).json({ error: "Failed to approve service" });
    }
});
adminRouter.post("/services/:id/reject", async (req, res) => {
    try {
        const serviceId = Number(req.params.id);
        if (Number.isNaN(serviceId)) {
            return res.status(400).json({ error: "Invalid service id" });
        }
        const reason = typeof req.body?.reason === "string" ? req.body.reason : null;
        const updated = await prisma_1.prisma.providerService.update({
            where: { id: serviceId },
            data: { status: "REJECTED", rejectionReason: reason, isActive: false },
        });
        res.json({ service: updated });
    }
    catch (error) {
        console.error("Reject service error:", error);
        res.status(500).json({ error: "Failed to reject service" });
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
adminRouter.get("/provider-profiles", async (_req, res) => {
    try {
        const profiles = await prisma_1.prisma.providerProfile.findMany({
            include: {
                user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
                services: { select: { id: true, serviceName: true, status: true, isActive: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 200,
        });
        res.json({ profiles });
    }
    catch (error) {
        console.error("Admin provider profiles error:", error);
        res.status(500).json({ error: "Failed to load provider profiles" });
    }
});
adminRouter.get("/bookings", async (_req, res) => {
    try {
        const bookings = await prisma_1.prisma.booking.findMany({
            include: {
                customer: { select: { id: true, name: true, email: true } },
                provider: { select: { id: true, name: true, email: true } },
                service: { select: { id: true, serviceName: true, status: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 200,
        });
        res.json({ bookings });
    }
    catch (error) {
        console.error("Admin bookings error:", error);
        res.status(500).json({ error: "Failed to load bookings" });
    }
});
adminRouter.get("/reviews", async (_req, res) => {
    try {
        const reviews = await prisma_1.prisma.review.findMany({
            include: {
                booking: {
                    select: {
                        id: true,
                        service: { select: { id: true, serviceName: true } },
                    },
                },
                customer: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 200,
        });
        res.json({ reviews });
    }
    catch (error) {
        console.error("Admin reviews error:", error);
        res.status(500).json({ error: "Failed to load reviews" });
    }
});
exports.default = adminRouter;
//# sourceMappingURL=admin.js.map