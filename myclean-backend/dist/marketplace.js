"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("./prisma");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const emailService_1 = require("./email/emailService");
const router = (0, express_1.Router)();
const createPublicJobSchema = zod_1.z.object({
    clientId: zod_1.z.number(),
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(10),
    serviceType: zod_1.z.string().min(3),
    preferredDate: zod_1.z.string().optional(),
    preferredStartTime: zod_1.z.string().optional(),
    preferredEndTime: zod_1.z.string().optional(),
    city: zod_1.z.string().min(2),
    state: zod_1.z.string().min(2),
    postalCode: zod_1.z.string().min(3),
    budgetMin: zod_1.z.number().int().positive().optional(),
    budgetMax: zod_1.z.number().int().positive().optional(),
});
router.post("/public", async (req, res) => {
    try {
        const payload = createPublicJobSchema.parse(req.body);
        const job = await prisma_1.prisma.publicJob.create({
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
                status: client_1.PublicJobStatus.BIDDING,
            },
        });
        res.status(201).json({ success: true, job });
    }
    catch (error) {
        console.error("Create public job failed", error);
        res.status(400).json({ error: "Invalid job payload" });
    }
});
router.get("/public", async (req, res) => {
    try {
        const { city, status = client_1.PublicJobStatus.BIDDING, clientId } = req.query;
        const jobs = await prisma_1.prisma.publicJob.findMany({
            where: {
                status: status,
                ...(city ? { city: city } : {}),
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
    }
    catch (error) {
        console.error("List public jobs failed", error);
        res.status(500).json({ error: "Failed to load marketplace jobs" });
    }
});
const bidSchema = zod_1.z.object({
    cleanerId: zod_1.z.number(),
    message: zod_1.z.string().max(2000).optional(),
    proposedPrice: zod_1.z.number().int().positive().optional(),
});
router.post("/public/:id/bid", async (req, res) => {
    try {
        const { id } = req.params;
        const payload = bidSchema.parse(req.body);
        const publicJob = await prisma_1.prisma.publicJob.findUnique({
            where: { id: Number(id) },
        });
        if (!publicJob || publicJob.status !== client_1.PublicJobStatus.BIDDING) {
            return res.status(404).json({ error: "Job not open for bidding" });
        }
        if (publicJob.clientId === payload.cleanerId) {
            return res.status(400).json({ error: "Cleaners cannot bid on their own jobs" });
        }
        const existingBid = await prisma_1.prisma.publicJobBid.findFirst({
            where: {
                publicJobId: publicJob.id,
                cleanerId: payload.cleanerId,
            },
        });
        if (existingBid) {
            return res.status(400).json({ error: "You already placed a bid for this job" });
        }
        const bid = await prisma_1.prisma.publicJobBid.create({
            data: {
                publicJobId: publicJob.id,
                cleanerId: payload.cleanerId,
                message: payload.message,
                proposedPrice: payload.proposedPrice,
                status: client_1.PublicJobBidStatus.PENDING,
            },
        });
        await prisma_1.prisma.notification.create({
            data: {
                userId: publicJob.clientId,
                type: "PUBLIC_JOB_BID",
                title: "New bid received",
                message: "A cleaner has submitted a bid on your marketplace post.",
                link: "/my-public-jobs",
            },
        });
        res.status(201).json({ success: true, bid });
    }
    catch (error) {
        console.error("Bid submission failed", error);
        res.status(400).json({ error: "Failed to submit bid" });
    }
});
const acceptBidSchema = zod_1.z.object({
    clientId: zod_1.z.number(),
    serviceId: zod_1.z.number().optional(),
    bookingDate: zod_1.z.string().optional(),
    startTime: zod_1.z.string().optional(),
    endTime: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    zipCode: zod_1.z.string().optional(),
    specialInstructions: zod_1.z.string().optional(),
});
router.post("/public/:bidId/accept", async (req, res) => {
    try {
        const { bidId } = req.params;
        const payload = acceptBidSchema.parse(req.body);
        const bid = await prisma_1.prisma.publicJobBid.findUnique({
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
        if (bid.publicJob.status !== client_1.PublicJobStatus.BIDDING) {
            return res.status(400).json({ error: "Job is already closed" });
        }
        const providerProfile = await prisma_1.prisma.providerProfile.findUnique({
            where: { userId: bid.cleanerId },
            include: { services: true },
        });
        if (!providerProfile) {
            return res.status(404).json({ error: "Cleaner profile not found" });
        }
        let selectedServiceId = payload.serviceId;
        if (selectedServiceId) {
            const ownsService = providerProfile.services.some((service) => service.id === selectedServiceId);
            if (!ownsService) {
                return res.status(400).json({ error: "Selected service does not belong to this provider" });
            }
        }
        else {
            if (providerProfile.services.length > 0) {
                selectedServiceId = providerProfile.services[0].id;
            }
            else {
                const fallbackPrice = bid.proposedPrice ?? bid.publicJob.budgetMax ?? bid.publicJob.budgetMin ?? 100;
                const autoService = await prisma_1.prisma.providerService.create({
                    data: {
                        providerId: providerProfile.id,
                        serviceName: bid.publicJob.serviceType || "Marketplace job",
                        description: bid.publicJob.description?.slice(0, 180) ?? "Automatically created from accepted marketplace job",
                        pricePerHour: Math.max(fallbackPrice * 100, 1000),
                        durationMin: 60,
                    },
                });
                selectedServiceId = autoService.id;
            }
        }
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.publicJob.update({
                where: { id: bid.publicJobId },
                data: { status: client_1.PublicJobStatus.CLOSED },
            }),
            prisma_1.prisma.publicJobBid.update({
                where: { id: bid.id },
                data: { status: client_1.PublicJobBidStatus.ACCEPTED },
            }),
            prisma_1.prisma.publicJobBid.updateMany({
                where: {
                    publicJobId: bid.publicJobId,
                    id: { not: bid.id },
                },
                data: { status: client_1.PublicJobBidStatus.REJECTED },
            }),
        ]);
        const booking = await prisma_1.prisma.booking.create({
            data: {
                customerId: bid.publicJob.clientId,
                providerId: bid.cleanerId,
                serviceId: selectedServiceId,
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
            include: {
                customer: { select: { name: true, email: true, phone: true } },
                provider: { select: { name: true, email: true, phone: true } },
                service: { select: { serviceName: true } },
            },
        });
        await prisma_1.prisma.notification.createMany({
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
        (0, emailService_1.queueBookingConfirmationEmails)((0, emailService_1.buildBookingEmailContextFromModel)(booking), booking.status).catch((error) => {
            console.error("Failed to queue booking confirmation emails for marketplace job", error);
        });
        res.json({ success: true, booking });
    }
    catch (error) {
        console.error("Bid acceptance failed", error);
        res.status(400).json({ error: "Failed to accept bid" });
    }
});
exports.default = router;
//# sourceMappingURL=marketplace.js.map