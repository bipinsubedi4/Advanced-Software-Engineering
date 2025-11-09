import cron from "node-cron";
import { RecurringFrequency } from "@prisma/client";
import { prisma } from "../prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

function addFrequency(date: Date, frequency: RecurringFrequency): Date {
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

  const jobs = await prisma.recurringJob.findMany({
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
    if (occurrence > horizon) continue;
    if (job.endDate && occurrence > job.endDate) {
      await prisma.recurringJob.update({
        where: { id: job.id },
        data: { isActive: false },
      });
      continue;
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        recurringJobId: job.id,
        bookingDate: occurrence,
      },
    });

    if (!existingBooking) {
      await prisma.booking.create({
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

    await prisma.recurringJob.update({
      where: { id: job.id },
      data: { nextOccurrence: addFrequency(occurrence, job.frequency) },
    });
  }
}

export function startRecurringJobProcessor() {
  if (process.env.DISABLE_RECURRING_CRON === "true") {
    console.log("⏸ Recurring job processor disabled via env toggle");
    return;
  }

  cron.schedule("0 2 * * *", async () => {
    try {
      console.log("⏰ Running recurring job processor");
      await processRecurringJobsWindow();
    } catch (error) {
      console.error("Recurring job processor failed", error);
    }
  });
}

export const recurringJobProcessorDebug = processRecurringJobsWindow;
