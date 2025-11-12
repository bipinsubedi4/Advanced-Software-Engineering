"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("./prisma");
const middleware_1 = require("./middleware");
const adminRouter = (0, express_1.Router)();
const requireAdmin = (req, res, next) => {
    const authUser = req.user;
    if (!authUser) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (authUser.role !== "ADMIN") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
};
adminRouter.use(middleware_1.authenticateToken);
adminRouter.use(requireAdmin);
const getStartOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
};
adminRouter.get("/overview", async (_req, res) => {
    try {
        const startOfMonth = getStartOfMonth();
        const [totalUsers, totalCustomers, totalProviders, totalBookings, activeBookings, revenueAggregate, averageBookingAggregate, bookingsByStatus, recentProviders, recentCustomers,] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.user.count({ where: { role: "CUSTOMER" } }),
            prisma_1.prisma.user.count({ where: { role: "PROVIDER" } }),
            prisma_1.prisma.booking.count(),
            prisma_1.prisma.booking.count({
                where: {
                    status: {
                        in: ["PENDING", "ACCEPTED"],
                    },
                },
            }),
            prisma_1.prisma.booking.aggregate({
                _sum: { totalPrice: true },
                where: {
                    paymentStatus: "PAID",
                    createdAt: { gte: startOfMonth },
                },
            }),
            prisma_1.prisma.booking.aggregate({
                _avg: { totalPrice: true },
            }),
            prisma_1.prisma.booking.groupBy({
                by: ["status"],
                _count: { _all: true },
            }),
            prisma_1.prisma.providerProfile.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
            prisma_1.prisma.user.findMany({
                where: { role: "CUSTOMER" },
                take: 5,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                },
            }),
        ]);
        const monthlyRevenue = Number(revenueAggregate._sum.totalPrice ?? 0);
        const averageBookingValue = Number(averageBookingAggregate._avg.totalPrice ?? 0);
        res.json({
            totalUsers,
            totalCustomers,
            totalProviders,
            totalBookings,
            activeBookings,
            monthlyRevenue,
            averageBookingValue,
            bookingsByStatus: bookingsByStatus.map((group) => ({
                status: group.status,
                count: group._count._all,
            })),
            recentProviders: recentProviders.map((provider) => ({
                id: provider.user?.id ?? provider.id,
                name: provider.user?.name ?? "Unknown",
                email: provider.user?.email ?? "",
                city: provider.city,
                state: provider.state,
                isVerified: provider.isVerified,
                createdAt: provider.createdAt,
            })),
            recentCustomers,
        });
    }
    catch (error) {
        console.error("Admin overview error:", error);
        res.status(500).json({ error: "Failed to load admin overview" });
    }
});
adminRouter.get("/bookings/recent", async (_req, res) => {
    try {
        const bookings = await prisma_1.prisma.booking.findMany({
            take: 20,
            orderBy: { createdAt: "desc" },
            include: {
                customer: { select: { id: true, name: true, email: true } },
                provider: { select: { id: true, name: true, email: true } },
                service: { select: { serviceName: true } },
            },
        });
        res.json({
            bookings: bookings.map((booking) => ({
                id: booking.id,
                status: booking.status,
                totalPrice: booking.totalPrice,
                paymentStatus: booking.paymentStatus,
                createdAt: booking.createdAt,
                bookingDate: booking.bookingDate,
                serviceName: booking.service?.serviceName ?? "Service",
                customer: booking.customer,
                provider: booking.provider,
            })),
        });
    }
    catch (error) {
        console.error("Admin recent bookings error:", error);
        res.status(500).json({ error: "Failed to load bookings" });
    }
});
adminRouter.get("/users", async (_req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        res.json({ users });
    }
    catch (error) {
        console.error("Admin users error:", error);
        res.status(500).json({ error: "Failed to load users" });
    }
});
adminRouter.get("/providers", async (_req, res) => {
    try {
        const providers = await prisma_1.prisma.providerProfile.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
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
        });
        res.json({
            providers: providers.map((provider) => ({
                id: provider.id,
                userId: provider.userId,
                name: provider.user?.name ?? "Unknown",
                email: provider.user?.email ?? "",
                city: provider.city,
                state: provider.state,
                serviceRadius: provider.serviceRadius,
                isVerified: provider.isVerified,
                isActive: provider.isActive,
                isProfileComplete: provider.isProfileComplete,
                createdAt: provider.createdAt,
                averageRating: provider.averageRating,
                totalBookings: provider.totalBookings,
            })),
        });
    }
    catch (error) {
        console.error("Admin providers error:", error);
        res.status(500).json({ error: "Failed to load providers" });
    }
});
exports.default = adminRouter;
//# sourceMappingURL=admin.js.map