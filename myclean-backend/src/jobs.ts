import { Router } from "express";
import { prisma } from "./prisma";
import { z } from "zod";

const router = Router();

const paramsSchema = z.object({
  jobId: z.string().regex(/^\d+$/).transform((val) => Number(val)),
});

const jobInclude = {
  customer: { select: { id: true, name: true, profileImage: true } },
  provider: { select: { id: true, name: true, profileImage: true } },
  service: { select: { id: true, serviceName: true } },
  cleanerRating: true,
} as const;

const serializeJob = (booking: any) => ({
  id: booking.id,
  bookingDate: booking.bookingDate,
  startTime: booking.startTime,
  endTime: booking.endTime,
  address: booking.address,
  city: booking.city,
  state: booking.state,
  zipCode: booking.zipCode,
  specialInstructions: booking.specialInstructions,
  status: booking.status,
  totalPrice: booking.totalPrice / 100,
  customer: booking.customer,
  provider: booking.provider,
  service: {
    id: booking.service.id,
    name: booking.service.serviceName,
  },
  cleanerRating: booking.cleanerRating,
});

const cleanerActionBody = z.object({
  cleanerId: z.number(),
});

router.post("/:jobId/accept", async (req, res) => {
  try {
    const { jobId } = paramsSchema.parse(req.params);
    const { cleanerId } = cleanerActionBody.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: jobId },
      include: jobInclude,
    });

    if (!booking) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (booking.providerId !== cleanerId) {
      return res.status(403).json({ error: "You are not assigned to this job" });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({ error: "Only pending jobs can be accepted" });
    }

    const updated = await prisma.booking.update({
      where: { id: jobId },
      data: { status: "ACCEPTED" },
      include: jobInclude,
    });

    await prisma.notification.create({
      data: {
        userId: booking.customerId,
        type: "BOOKING_ACCEPTED",
        title: "Job accepted",
        message: `${booking.provider.name} accepted your job request`,
        link: "/my-bookings",
      },
    });

    res.json({ success: true, job: serializeJob(updated) });
  } catch (error) {
    console.error("Accept job error:", error);
    res.status(500).json({ error: "Failed to accept job" });
  }
});

router.post("/:jobId/decline", async (req, res) => {
  try {
    const { jobId } = paramsSchema.parse(req.params);
    const { cleanerId } = cleanerActionBody.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: jobId },
      include: jobInclude,
    });

    if (!booking) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (booking.providerId !== cleanerId) {
      return res.status(403).json({ error: "You are not assigned to this job" });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({ error: "Only pending jobs can be declined" });
    }

    const updated = await prisma.booking.update({
      where: { id: jobId },
      data: { status: "DECLINED" },
      include: jobInclude,
    });

    await prisma.notification.create({
      data: {
        userId: booking.customerId,
        type: "BOOKING_DECLINED",
        title: "Job declined",
        message: `${booking.provider.name} declined your job request`,
        link: "/my-bookings",
      },
    });

    res.json({ success: true, job: serializeJob(updated) });
  } catch (error) {
    console.error("Decline job error:", error);
    res.status(500).json({ error: "Failed to decline job" });
  }
});

router.post("/:jobId/complete", async (req, res) => {
  try {
    const { jobId } = paramsSchema.parse(req.params);
    const { cleanerId } = cleanerActionBody.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: jobId },
      include: jobInclude,
    });

    if (!booking) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (booking.providerId !== cleanerId) {
      return res.status(403).json({ error: "You are not assigned to this job" });
    }

    if (booking.status !== "ACCEPTED") {
      return res.status(400).json({ error: "Only accepted jobs can be completed" });
    }

    if (booking.totalPrice > 0 && booking.paymentStatus !== "PAID") {
      return res.status(400).json({ error: "Customer must complete payment before you can mark this job done" });
    }

    const updated = await prisma.booking.update({
      where: { id: jobId },
      data: { status: "COMPLETED" },
      include: jobInclude,
    });

    await prisma.notification.create({
      data: {
        userId: booking.customerId,
        type: "JOB_COMPLETED",
        title: "Job completed",
        message: `Please rate ${booking.provider.name} for the recent job`,
        link: "/my-bookings",
      },
    });

    res.json({ success: true, job: serializeJob(updated) });
  } catch (error) {
    console.error("Complete job error:", error);
    res.status(500).json({ error: "Failed to mark job complete" });
  }
});

const ratingSchema = z.object({
  customerId: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(600).optional(),
});

router.post("/:jobId/rate", async (req, res) => {
  try {
    const { jobId } = paramsSchema.parse(req.params);
    const { customerId, rating, comment } = ratingSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: jobId },
      include: {
        provider: {
          select: {
            id: true,
            providerProfile: true,
            name: true,
          },
        },
        customer: { select: { id: true, name: true } },
        cleanerRating: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (booking.customerId !== customerId) {
      return res.status(403).json({ error: "You are not allowed to rate this job" });
    }

    if (!["COMPLETED", "RATED"].includes(booking.status)) {
      return res.status(400).json({ error: "Job must be completed before rating" });
    }

    if (booking.cleanerRating) {
      return res.status(400).json({ error: "Job already rated" });
    }

    const createdRating = await prisma.cleanerRating.create({
      data: {
        bookingId: jobId,
        cleanerId: booking.providerId,
        customerId,
        rating,
        comment,
      },
      include: {
        booking: {
          include: jobInclude,
        },
      },
    });

    await prisma.booking.update({
      where: { id: jobId },
      data: { status: "RATED" },
    });

    if (booking.provider.providerProfile) {
      const providerRatings = await prisma.cleanerRating.findMany({
        where: { cleanerId: booking.providerId },
        select: { rating: true },
      });

      const averageRating =
        providerRatings.reduce((sum, r) => sum + r.rating, 0) / providerRatings.length;

      await prisma.providerProfile.update({
        where: { id: booking.provider.providerProfile.id },
        data: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: providerRatings.length,
        },
      });
    }

    await prisma.notification.create({
      data: {
        userId: booking.providerId,
        type: "NEW_REVIEW",
        title: "You received a new rating",
        message: `${booking.customer.name} left a ${rating}-star rating`,
        link: "/provider/dashboard",
      },
    });

    res.status(201).json({
      success: true,
      rating: {
        id: createdRating.id,
        rating: createdRating.rating,
        comment: createdRating.comment,
        createdAt: createdRating.createdAt,
      },
    });
  } catch (error) {
    console.error("Rate cleaner error:", error);
    res.status(500).json({ error: "Failed to submit rating" });
  }
});

export default router;
