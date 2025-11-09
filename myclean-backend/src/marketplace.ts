import { Request, Response, Router } from "express";
import { prisma } from "./prisma";
import { z } from "zod";
import { PublicJobStatus, PublicJobBidStatus } from "@prisma/client";

const router = Router();

const createPublicJobSchema = z.object({
  clientId: z.number(),
  title: z.string().min(3),
  description: z.string().min(10),
  serviceType: z.string().min(3),
  preferredDate: z.string().optional(),
  preferredStartTime: z.string().optional(),
  preferredEndTime: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
});

router.post("/public", async (req: Request, res: Response) => {
  try {
    const payload = createPublicJobSchema.parse(req.body);

    const job = await prisma.publicJob.create({
      data: {
        clientId: payload.clientId,
        title: payload.title,
        description: payload.description,
        serviceType: payload.serviceType,
        preferredDate: payload.preferredDate ? new Date(payload.preferredDate) : undefined,
        preferredStartTime: payload.preferredStartTime,
        preferredEndTime: payload.preferredEndTime,
        city: payload.city,
        state: payload.state,
        postalCode: payload.postalCode,
        budgetMin: payload.budgetMin,
        budgetMax: payload.budgetMax,
        status: PublicJobStatus.BIDDING,
      },
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    console.error("Create public job failed", error);
    res.status(400).json({ error: "Invalid job payload" });
  }
});

router.get("/public", async (req: Request, res: Response) => {
  try {
    const { city, status = PublicJobStatus.BIDDING, clientId } = req.query;

    const jobs = await prisma.publicJob.findMany({
      where: {
        status: status as PublicJobStatus,
        ...(city ? { city: city as string } : {}),
        ...(clientId ? { clientId: Number(clientId) } : {}),
      },
      include: {
        bids: {
          include: {
            cleaner: {
              select: { id: true, name: true, profileImage: true },
            },
          },
        },
        client: {
          select: { id: true, name: true, profileImage: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, jobs });
  } catch (error) {
    console.error("List public jobs failed", error);
    res.status(500).json({ error: "Failed to load marketplace jobs" });
  }
});

const bidSchema = z.object({
  cleanerId: z.number(),
  message: z.string().max(2000).optional(),
  proposedPrice: z.number().int().positive().optional(),
});

router.post("/public/:id/bid", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = bidSchema.parse(req.body);

    const publicJob = await prisma.publicJob.findUnique({
      where: { id: Number(id) },
    });

    if (!publicJob || publicJob.status !== PublicJobStatus.BIDDING) {
      return res.status(404).json({ error: "Job not open for bidding" });
    }

    if (publicJob.clientId === payload.cleanerId) {
      return res.status(400).json({ error: "Cleaners cannot bid on their own jobs" });
    }

    const existingBid = await prisma.publicJobBid.findFirst({
      where: {
        publicJobId: publicJob.id,
        cleanerId: payload.cleanerId,
      },
    });

    if (existingBid) {
      return res.status(400).json({ error: "You already placed a bid for this job" });
    }

    const bid = await prisma.publicJobBid.create({
      data: {
        publicJobId: publicJob.id,
        cleanerId: payload.cleanerId,
        message: payload.message,
        proposedPrice: payload.proposedPrice,
        status: PublicJobBidStatus.PENDING,
      },
    });

    await prisma.notification.create({
      data: {
        userId: publicJob.clientId,
        type: "PUBLIC_JOB_BID",
        title: "New bid received",
        message: "A cleaner has submitted a bid on your marketplace post.",
        link: "/my-public-jobs",
      },
    });

    res.status(201).json({ success: true, bid });
  } catch (error) {
    console.error("Bid submission failed", error);
    res.status(400).json({ error: "Failed to submit bid" });
  }
});

const acceptBidSchema = z.object({
  clientId: z.number(),
  serviceId: z.number(),
  bookingDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  specialInstructions: z.string().optional(),
});

router.post("/public/:bidId/accept", async (req: Request, res: Response) => {
  try {
    const { bidId } = req.params;
    const payload = acceptBidSchema.parse(req.body);

    const bid = await prisma.publicJobBid.findUnique({
      where: { id: Number(bidId) },
      include: {
        publicJob: true,
      },
    });

    if (!bid || !bid.publicJob) {
      return res.status(404).json({ error: "Bid not found" });
    }

    if (bid.publicJob.clientId !== payload.clientId) {
      return res.status(403).json({ error: "You cannot accept this bid" });
    }

    if (bid.publicJob.status !== PublicJobStatus.BIDDING) {
      return res.status(400).json({ error: "Job is already closed" });
    }

    await prisma.$transaction([
      prisma.publicJob.update({
        where: { id: bid.publicJobId },
        data: { status: PublicJobStatus.CLOSED },
      }),
      prisma.publicJobBid.update({
        where: { id: bid.id },
        data: { status: PublicJobBidStatus.ACCEPTED },
      }),
      prisma.publicJobBid.updateMany({
        where: {
          publicJobId: bid.publicJobId,
          id: { not: bid.id },
        },
        data: { status: PublicJobBidStatus.REJECTED },
      }),
    ]);

    const booking = await prisma.booking.create({
      data: {
        customerId: bid.publicJob.clientId,
        providerId: bid.cleanerId,
        serviceId: payload.serviceId,
        bookingDate: payload.bookingDate
          ? new Date(payload.bookingDate)
          : bid.publicJob.preferredDate ?? new Date(),
        startTime: payload.startTime ?? bid.publicJob.preferredStartTime ?? "09:00",
        endTime: payload.endTime ?? bid.publicJob.preferredEndTime ?? "11:00",
        address: payload.address ?? bid.publicJob.title,
        city: payload.city ?? bid.publicJob.city,
        state: payload.state ?? bid.publicJob.state,
        zipCode: payload.zipCode ?? bid.publicJob.postalCode,
        specialInstructions: payload.specialInstructions ?? bid.publicJob.description,
        totalPrice: bid.proposedPrice ?? bid.publicJob.budgetMax ?? 0,
        paymentStatus: "PENDING",
        publicJobId: bid.publicJobId,
        status: "PENDING",
      },
    });

    await prisma.notification.createMany({
      data: [
        {
          userId: bid.cleanerId,
          type: "PUBLIC_JOB_ACCEPTED",
          title: "Bid accepted",
          message: "Your bid was accepted. A booking has been created.",
          link: "/provider/bookings",
        },
        {
          userId: bid.publicJob.clientId,
          type: "BOOKING_CREATED",
          title: "Booking created",
          message: "We created a booking with your selected cleaner.",
          link: "/my-bookings",
        },
      ],
    });

    res.json({ success: true, booking });
  } catch (error) {
    console.error("Bid acceptance failed", error);
    res.status(400).json({ error: "Failed to accept bid" });
  }
});

export default router;
