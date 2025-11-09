import { Router } from "express";
import { prisma } from "./prisma";
import { z } from "zod";
import { RecurringFrequency } from "@prisma/client";

const router = Router();

const recurringJobSchema = z.object({
  customerId: z.number(),
  providerId: z.number(),
  serviceId: z.number(),
  frequency: z.nativeEnum(RecurringFrequency),
  startDate: z.string(),
  endDate: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  timezone: z.string().default("UTC"),
  notes: z.string().optional(),
});

router.post("/recurring", async (req, res) => {
  try {
    const payload = recurringJobSchema.parse(req.body);

    const recurringJob = await prisma.recurringJob.create({
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
  } catch (error) {
    console.error("Create recurring job failed", error);
    res.status(400).json({ error: "Invalid recurring job payload" });
  }
});

router.get("/recurring/customer/:customerId", async (req, res) => {
  try {
    const jobs = await prisma.recurringJob.findMany({
      where: { customerId: Number(req.params.customerId) },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, jobs });
  } catch (error) {
    console.error("List recurring jobs failed", error);
    res.status(500).json({ error: "Failed to fetch recurring jobs" });
  }
});

export default router;
