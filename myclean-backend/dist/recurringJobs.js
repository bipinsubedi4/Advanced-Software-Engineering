"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("./prisma");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const recurringJobSchema = zod_1.z.object({
    customerId: zod_1.z.number(),
    providerId: zod_1.z.number(),
    serviceId: zod_1.z.number(),
    frequency: zod_1.z.nativeEnum(client_1.RecurringFrequency),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string().optional(),
    startTime: zod_1.z.string(),
    endTime: zod_1.z.string(),
    address: zod_1.z.string(),
    city: zod_1.z.string(),
    state: zod_1.z.string(),
    zipCode: zod_1.z.string(),
    timezone: zod_1.z.string().default("UTC"),
    notes: zod_1.z.string().optional(),
});
router.post("/recurring", async (req, res) => {
    try {
        const payload = recurringJobSchema.parse(req.body);
        const recurringJob = await prisma_1.prisma.recurringJob.create({
            data: {
                customerId: payload.customerId,
                providerId: payload.providerId,
                serviceId: payload.serviceId,
                frequency: payload.frequency,
                startDate: new Date(payload.startDate),
                endDate: payload.endDate ? new Date(payload.endDate) : null,
                startTime: payload.startTime,
                endTime: payload.endTime,
                address: payload.address,
                city: payload.city,
                state: payload.state,
                zipCode: payload.zipCode,
                timezone: payload.timezone,
                notes: payload.notes,
                nextOccurrence: new Date(payload.startDate),
            },
        });
        res.status(201).json({ success: true, recurringJob });
    }
    catch (error) {
        console.error("Create recurring job failed", error);
        res.status(400).json({ error: "Invalid recurring job payload" });
    }
});
router.get("/recurring/customer/:customerId", async (req, res) => {
    try {
        const jobs = await prisma_1.prisma.recurringJob.findMany({
            where: { customerId: Number(req.params.customerId) },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, jobs });
    }
    catch (error) {
        console.error("List recurring jobs failed", error);
        res.status(500).json({ error: "Failed to fetch recurring jobs" });
    }
});
exports.default = router;
//# sourceMappingURL=recurringJobs.js.map