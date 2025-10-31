import { Router } from "express";
import { prisma } from "./prisma";
import { z } from "zod";

const router = Router();

const createReviewSchema = z.object({
  bookingId: z.number(),
  customerId: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  photos: z.string().optional(), // JSON string of photo URLs
});

// Create a review
router.post("/", async (req, res) => {
  try {
    const parsed = createReviewSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }

    const { bookingId, customerId, rating, comment, photos } = parsed.data;

    // Verify booking exists and is completed
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: {
          include: { providerProfile: true },
        },
        review: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.customerId !== customerId) {
      return res.status(403).json({ error: "Unauthorized to review this booking" });
    }

    if (booking.status !== "COMPLETED") {
      return res.status(400).json({ error: "Can only review completed bookings" });
    }

    if (booking.review) {
      return res.status(400).json({ error: "Booking already reviewed" });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId,
        customerId,
        rating,
        comment,
        photos,
      },
    });

    // Update provider's average rating and review count
    if (booking.provider.providerProfile) {
      const allReviews = await prisma.review.findMany({
        where: {
          booking: {
            providerId: booking.providerId,
          },
        },
      });

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / allReviews.length;

      await prisma.providerProfile.update({
        where: { id: booking.provider.providerProfile.id },
        data: {
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          totalReviews: allReviews.length,
        },
      });
    }

    // Create notification for provider
    await prisma.notification.create({
      data: {
        userId: booking.providerId,
        type: "NEW_REVIEW",
        title: "New Review Received",
        message: `You received a ${rating}-star review`,
        link: "/provider/dashboard",
      },
    });

    res.status(201).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// Get reviews for a provider
router.get("/provider/:providerId", async (req, res) => {
  try {
    const { providerId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        booking: {
          providerId: parseInt(providerId),
        },
      },
      include: {
        customer: {
          select: { name: true, profileImage: true },
        },
        booking: {
          select: {
            bookingDate: true,
            service: {
              select: { serviceName: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: reviews.length,
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        photos: r.photos,
        createdAt: r.createdAt,
        customerName: r.customer.name,
        customerImage: r.customer.profileImage,
        serviceName: r.booking.service.serviceName,
        bookingDate: r.booking.bookingDate,
      })),
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ error: "Failed to get reviews" });
  }
});

export default router;

