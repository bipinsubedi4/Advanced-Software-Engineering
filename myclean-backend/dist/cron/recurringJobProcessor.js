"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recurringJobProcessorDebug = void 0;
exports.startRecurringJobProcessor = startRecurringJobProcessor;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../prisma");
const DAY_MS = 24 * 60 * 60 * 1000;
function addFrequency(date, frequency) {
    const next = new Date(date);
    switch (frequency) {
        case "WEEKLY":
            next.setTime(next.getTime() + 7 * DAY_MS);
            break;
        case "BIWEEKLY":
            next.setTime(next.getTime() + 14 * DAY_MS);
            break;
        case "MONTHLY":
            next.setMonth(next.getMonth() + 1);
            break;
        default:
            next.setTime(next.getTime() + 30 * DAY_MS);
    }
    return next;
}
async function processRecurringJobsWindow() {
    const lookAheadDays = Number(process.env.RECURRING_LOOKAHEAD_DAYS ?? "28");
    const now = new Date();
    const horizon = new Date(now.getTime() + lookAheadDays * DAY_MS);
    const jobs = await prisma_1.prisma.recurringJob.findMany({
        where: {
            isActive: true,
            OR: [
                { nextOccurrence: null },
                { nextOccurrence: { lte: horizon } },
            ],
        },
    });
    for (const job of jobs) {
        const occurrence = job.nextOccurrence ?? job.startDate;
        if (occurrence > horizon)
            continue;
        if (job.endDate && occurrence > job.endDate) {
            await prisma_1.prisma.recurringJob.update({
                where: { id: job.id },
                data: { isActive: false },
            });
            continue;
        }
        const existingBooking = await prisma_1.prisma.booking.findFirst({
            where: {
                recurringJobId: job.id,
                bookingDate: occurrence,
            },
        });
        if (!existingBooking) {
            await prisma_1.prisma.booking.create({
                data: {
                    customerId: job.customerId,
                    providerId: job.providerId,
                    serviceId: job.serviceId,
                    bookingDate: occurrence,
                    startTime: job.startTime,
                    endTime: job.endTime,
                    address: job.address,
                    city: job.city,
                    state: job.state,
                    zipCode: job.zipCode,
                    specialInstructions: job.notes,
                    status: "PENDING",
                    totalPrice: 0,
                    paymentStatus: "PENDING",
                    recurringJobId: job.id,
                },
            });
        }
        await prisma_1.prisma.recurringJob.update({
            where: { id: job.id },
            data: { nextOccurrence: addFrequency(occurrence, job.frequency) },
        });
    }
}
function startRecurringJobProcessor() {
    if (process.env.DISABLE_RECURRING_CRON === "true") {
        console.log("⏸ Recurring job processor disabled via env toggle");
        return;
    }
    node_cron_1.default.schedule("0 2 * * *", async () => {
        try {
            console.log("⏰ Running recurring job processor");
            await processRecurringJobsWindow();
        }
        catch (error) {
            console.error("Recurring job processor failed", error);
        }
    });
}
exports.recurringJobProcessorDebug = processRecurringJobsWindow;
//# sourceMappingURL=recurringJobProcessor.js.map