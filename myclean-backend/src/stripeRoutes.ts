import { Router } from "express";
import { prisma } from "./prisma";
import { z } from "zod";
const router = Router();

const mockPaymentSchema = z.object({
  bookingId: z.number(),
  paymentMethod: z.string().optional(),
  last4: z.string().optional(),
  notes: z.string().optional(),
});

router.post("/mock/checkout", async (req, res) => {
  try {
    const payload = mockPaymentSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({
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

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: "PAID",
        paymentCaptured: true,
        paymentIntentId: `mock-${Date.now()}`,
        status: booking.status === "PENDING" ? "ACCEPTED" : booking.status,
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        provider: { select: { id: true, name: true, email: true, phone: true } },
        service: { select: { serviceName: true } },
      },
    });

    if (booking.providerId) {
      await prisma.notification.create({
        data: {
          userId: booking.providerId,
          type: "PAYMENT_COMPLETED",
          title: "Payment received",
          message: `${booking.customer?.name ?? "Your client"} completed payment for ${booking.service?.serviceName ?? "a booking"}.`,
          link: "/provider/dashboard",
        },
      });
    }

    res.json({ success: true, paymentStatus: "PAID", booking: { id: updatedBooking.id, status: updatedBooking.status } });
  } catch (error) {
    console.error("Mock payment failed", error);
    res.status(400).json({ error: "Unable to process mock payment" });
  }
});

export default router;
