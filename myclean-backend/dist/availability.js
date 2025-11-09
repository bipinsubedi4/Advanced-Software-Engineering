"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("./prisma");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const saveSchema = zod_1.z.object({
    cleanerId: zod_1.z.number(),
    blocks: zod_1.z
        .array(zod_1.z.object({
        dayOfWeek: zod_1.z.number().min(0).max(6),
        startTime: zod_1.z.string(),
        endTime: zod_1.z.string(),
    }))
        .max(70),
});
router.put("/cleaners/me/availability", async (req, res) => {
    try {
        const payload = saveSchema.parse(req.body);
        await prisma_1.prisma.cleanerAvailability.deleteMany({
            where: { cleanerId: payload.cleanerId },
        });
        if (payload.blocks.length) {
            await prisma_1.prisma.cleanerAvailability.createMany({
                data: payload.blocks.map((block) => ({
                    cleanerId: payload.cleanerId,
                    dayOfWeek: block.dayOfWeek,
                    startTime: block.startTime,
                    endTime: block.endTime,
                })),
            });
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error("Save availability failed", error);
        res.status(400).json({ error: "Invalid availability payload" });
    }
});
router.get("/cleaners/:id/availability", async (req, res) => {
    try {
        const slots = await prisma_1.prisma.cleanerAvailability.findMany({
            where: { cleanerId: Number(req.params.id) },
            orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        });
        res.json({ success: true, slots });
    }
    catch (error) {
        console.error("Fetch availability failed", error);
        res.status(500).json({ error: "Failed to load availability" });
    }
});
exports.default = router;
//# sourceMappingURL=availability.js.map