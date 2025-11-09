import { Router } from "express";
import { prisma } from "./prisma";
import { z } from "zod";

const router = Router();

const saveSchema = z.object({
  cleanerId: z.number(),
  blocks: z
    .array(
      z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .max(70),
});

router.put("/cleaners/me/availability", async (req, res) => {
  try {
    const payload = saveSchema.parse(req.body);
    await prisma.cleanerAvailability.deleteMany({
      where: { cleanerId: payload.cleanerId },
    });

    if (payload.blocks.length) {
      await prisma.cleanerAvailability.createMany({
        data: payload.blocks.map((block) => ({
          cleanerId: payload.cleanerId,
          dayOfWeek: block.dayOfWeek,
          startTime: block.startTime,
          endTime: block.endTime,
        })),
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Save availability failed", error);
    res.status(400).json({ error: "Invalid availability payload" });
  }
});

router.get("/cleaners/:id/availability", async (req, res) => {
  try {
    const slots = await prisma.cleanerAvailability.findMany({
      where: { cleanerId: Number(req.params.id) },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    res.json({ success: true, slots });
  } catch (error) {
    console.error("Fetch availability failed", error);
    res.status(500).json({ error: "Failed to load availability" });
  }
});

export default router;
