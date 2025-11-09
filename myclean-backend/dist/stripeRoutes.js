"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("./prisma");
const zod_1 = require("zod");
const mailer_1 = require("./mailer");
const router = (0, express_1.Router)();
const mockPaymentSchema = zod_1.z.object({
    bookingId: zod_1.z.number(),
    paymentMethod: zod_1.z.string().optional(),
    last4: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
router.post("/mock/checkout", async (req, res) => {
    try {
        const payload = mockPaymentSchema.parse(req.body);
        const booking = await prisma_1.prisma.booking.findUnique({
            where: { id: payload.bookingId },
            include: {
                customer: { select: { id: true, name: true, email: true } },
                provider: { select: { id: true, name: true, email: true } },
                service: { select: { serviceName: true } },
            },
        });
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        if (!["PENDING", "ACCEPTED"].includes(booking.status)) {
            return res.status(400).json({ error: "This booking is not eligible for payment" });
        }
        if (booking.paymentStatus === "PAID") {
            return res.json({ success: true, paymentStatus: "PAID" });
        }
        const updatedBooking = await prisma_1.prisma.booking.update({
            where: { id: booking.id },
            data: {
                paymentStatus: "PAID",
                paymentCaptured: true,
                paymentIntentId: `mock-${Date.now()}`,
                status: booking.status === "PENDING" ? "ACCEPTED" : booking.status,
            },
        });
        if (booking.providerId) {
            await prisma_1.prisma.notification.create({
                data: {
                    userId: booking.providerId,
                    type: "PAYMENT_COMPLETED",
                    title: "Payment received",
                    message: `${booking.customer?.name ?? "Your client"} completed payment for ${booking.service?.serviceName ?? "a booking"}.`,
                    link: "/provider/dashboard",
                },
            });
        }
        if (booking.provider?.email) {
            await (0, mailer_1.sendPaymentReceivedEmail)({
                to: booking.provider.email,
                providerName: booking.provider.name,
                customerName: booking.customer?.name ?? "Your client",
                serviceName: booking.service?.serviceName ?? "your service",
            });
        }
        res.json({ success: true, paymentStatus: "PAID", booking: { id: updatedBooking.id, status: updatedBooking.status } });
    }
    catch (error) {
        console.error("Mock payment failed", error);
        res.status(400).json({ error: "Unable to process mock payment" });
    }
});
exports.default = router;
//# sourceMappingURL=stripeRoutes.js.map