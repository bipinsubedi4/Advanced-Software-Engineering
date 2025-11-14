import { Booking, EmailJobStatus, EmailTemplate, Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { deliverEmail } from "../mailer";
import { buildEmailContent, getTemplateSubject, TemplatePayloads } from "./templates";

const APP_BASE_URL = process.env.APP_BASE_URL ?? "https://myclean.app";
const DEFAULT_MAX_ATTEMPTS = Number(process.env.EMAIL_QUEUE_MAX_ATTEMPTS ?? "4");
const DEFAULT_BATCH_SIZE = Number(process.env.EMAIL_QUEUE_BATCH_SIZE ?? "20");
const WORKER_INTERVAL_MS = Number(process.env.EMAIL_QUEUE_INTERVAL_MS ?? "15000");
const RETRY_MINUTES = (process.env.EMAIL_QUEUE_RETRY_MINUTES ?? "5,15,60")
  .split(",")
  .map((value) => Number(value.trim()))
  .filter((value) => !Number.isNaN(value) && value > 0);
const RETRY_DELAYS_MS = (RETRY_MINUTES.length ? RETRY_MINUTES : [5, 15, 60]).map((value) => value * 60 * 1000);

type JsonValue = Prisma.InputJsonValue;

export type QueueEmailParams<TTemplate extends EmailTemplate> = {
  to: string;
  template: TTemplate;
  payload: TemplatePayloads[TTemplate];
  sendAfter?: Date;
  maxAttempts?: number;
};

export type BookingParticipant = {
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type BookingEmailContext = {
  bookingId: number;
  bookingDate: Date | string;
  startTime: string;
  endTime: string;
  serviceName: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string | null;
  totalPriceCents?: number | null;
  specialInstructions?: string | null;
  timezone?: string | null;
  customer: BookingParticipant;
  provider: BookingParticipant;
};

export type BookingNotificationRecord = {
  id: number;
  bookingDate: Date | string;
  startTime: string;
  endTime: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string | null;
  totalPrice: number;
  service: {
    serviceName: string;
  };
  customer: BookingParticipant;
  provider: BookingParticipant;
  specialInstructions?: string | null;
};

export type BookingWithRelations = Booking & {
  service: {
    serviceName: string;
  };
  customer: BookingParticipant & { id?: number };
  provider: BookingParticipant & { id?: number };
};

const ensureISODate = (value: Date | string): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
};

const basePayloadFromContext = (context: BookingEmailContext) => ({
  bookingId: context.bookingId,
  bookingDateISO: ensureISODate(context.bookingDate),
  startTime: context.startTime,
  endTime: context.endTime,
  serviceName: context.serviceName,
  address: context.address,
  city: context.city,
  state: context.state,
  zipCode: context.zipCode ?? undefined,
  totalPriceCents: context.totalPriceCents ?? undefined,
  customerName: context.customer.name,
  providerName: context.provider.name,
  specialInstructions: context.specialInstructions ?? undefined,
  timezone: context.timezone ?? undefined,
});

export const buildBookingEmailContext = (booking: BookingNotificationRecord): BookingEmailContext => ({
  bookingId: booking.id,
  bookingDate: booking.bookingDate,
  startTime: booking.startTime,
  endTime: booking.endTime,
  serviceName: booking.service.serviceName,
  address: booking.address,
  city: booking.city,
  state: booking.state,
  zipCode: booking.zipCode ?? undefined,
  totalPriceCents: booking.totalPrice,
  specialInstructions: booking.specialInstructions ?? undefined,
  customer: booking.customer,
  provider: booking.provider,
});

export const buildBookingEmailContextFromModel = (booking: BookingWithRelations) =>
  buildBookingEmailContext({
    id: booking.id,
    bookingDate: booking.bookingDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
    address: booking.address,
    city: booking.city,
    state: booking.state,
    zipCode: booking.zipCode,
    totalPrice: booking.totalPrice,
    service: {
      serviceName: booking.service.serviceName,
    },
    customer: {
      name: booking.customer.name,
      email: booking.customer.email,
      phone: booking.customer.phone,
    },
    provider: {
      name: booking.provider.name,
      email: booking.provider.email,
      phone: booking.provider.phone,
    },
    specialInstructions: booking.specialInstructions,
  });

export const queueEmail = async <TTemplate extends EmailTemplate>({
  to,
  template,
  payload,
  sendAfter,
  maxAttempts,
}: QueueEmailParams<TTemplate>) => {
  const subject = getTemplateSubject(template, payload) ?? `${process.env.BRAND_NAME ?? "MyClean"} notification`;
  return prisma.emailJob.create({
    data: {
      to,
      template,
      payload: payload as JsonValue,
      subject,
      scheduledFor: sendAfter ?? new Date(),
      maxAttempts: maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
    },
  });
};

const getRetryDelayMs = (attemptNumber: number): number => {
  const index = Math.min(Math.max(attemptNumber - 1, 0), RETRY_DELAYS_MS.length - 1);
  return RETRY_DELAYS_MS[index] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
};

export const processEmailQueue = async (batchSize = DEFAULT_BATCH_SIZE): Promise<void> => {
  const jobs = await prisma.emailJob.findMany({
    where: {
      status: EmailJobStatus.PENDING,
      scheduledFor: {
        lte: new Date(),
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: batchSize,
  });

  for (const job of jobs) {
    const claimed = await prisma.emailJob.updateMany({
      where: { id: job.id, status: EmailJobStatus.PENDING },
      data: { status: EmailJobStatus.PROCESSING },
    });

    if (claimed.count === 0) {
      continue;
    }

    const attemptNumber = job.attemptCount + 1;

    try {
      const content = buildEmailContent(job.template, job.payload as TemplatePayloads[typeof job.template]);
      await deliverEmail({
        to: job.to,
        subject: content.subject,
        html: content.html,
        text: content.text,
      });

      await prisma.emailJob.update({
        where: { id: job.id },
        data: {
          status: EmailJobStatus.SENT,
          sentAt: new Date(),
          attemptCount: attemptNumber,
          lastError: null,
        },
      });
    } catch (error) {
      console.error("Failed to deliver email", { jobId: job.id, error });
      const hasAttemptsLeft = attemptNumber < job.maxAttempts;
      await prisma.emailJob.update({
        where: { id: job.id },
        data: {
          status: hasAttemptsLeft ? EmailJobStatus.PENDING : EmailJobStatus.FAILED,
          attemptCount: attemptNumber,
          lastError: error instanceof Error ? error.message : "Unknown email send failure",
          scheduledFor: hasAttemptsLeft ? new Date(Date.now() + getRetryDelayMs(attemptNumber)) : job.scheduledFor,
        },
      });
    }
  }
};

let workerHandle: NodeJS.Timeout | null = null;

export const startEmailQueueWorker = () => {
  if (process.env.DISABLE_EMAIL_QUEUE === "true") {
    console.log("⏸ Email queue worker disabled via env toggle");
    return;
  }

  if (workerHandle) {
    return;
  }

  console.log(`📧 Email queue worker started (interval ${WORKER_INTERVAL_MS}ms)`);
  const runWorker = () =>
    processEmailQueue().catch((error) => {
      console.error("Email queue worker iteration failed", error);
    });

  runWorker();
  workerHandle = setInterval(runWorker, WORKER_INTERVAL_MS);
};

export const queueWelcomeEmail = async ({
  email,
  name,
  role,
}: {
  email?: string | null;
  name: string;
  role: string;
}) => {
  if (!email) {
    return;
  }

  // Only send welcome email to customers with @gmail.com addresses
  if (role === "CUSTOMER" && !email.toLowerCase().endsWith("@gmail.com")) {
    console.log(`Skipping welcome email for ${email} - not a Gmail address`);
    return;
  }

  await queueEmail({
    to: email,
    template: EmailTemplate.WELCOME,
    payload: {
      userName: name,
      role,
    },
  });
};

export const queueBookingConfirmationEmails = async (context: BookingEmailContext, bookingStatus: string) => {
  const basePayload = basePayloadFromContext(context);
  const tasks: Promise<unknown>[] = [];

  if (context.customer.email) {
    tasks.push(
      queueEmail({
        to: context.customer.email,
        template: EmailTemplate.BOOKING_CONFIRM_CUSTOMER,
        payload: {
          ...basePayload,
          bookingStatus,
        },
      })
    );
  }

  if (context.provider.email) {
    tasks.push(
      queueEmail({
        to: context.provider.email,
        template: EmailTemplate.BOOKING_CONFIRM_PROVIDER,
        payload: {
          ...basePayload,
          customerEmail: context.customer.email ?? undefined,
          customerPhone: context.customer.phone ?? undefined,
        },
      })
    );
  }

  await Promise.all(tasks);
};

export const queuePaymentReminderEmail = async (context: BookingEmailContext) => {
  if (!context.customer.email) {
    return;
  }

  const basePayload = basePayloadFromContext(context);
  const paymentLink = `${APP_BASE_URL}/payment?bookingId=${context.bookingId}`;

  await queueEmail({
    to: context.customer.email,
    template: EmailTemplate.PAYMENT_REMINDER_CUSTOMER,
    payload: {
      ...basePayload,
      paymentLink,
    },
  });
};

export const queuePaymentReceivedEmail = async (context: BookingEmailContext, paymentReference?: string | null) => {
  if (!context.provider.email) {
    return;
  }

  const basePayload = basePayloadFromContext(context);
  await queueEmail({
    to: context.provider.email,
    template: EmailTemplate.PAYMENT_RECEIVED_PROVIDER,
    payload: {
      ...basePayload,
      paymentReference: paymentReference ?? undefined,
    },
  });
};

export const queueBookingReceiptEmail = async (
  context: BookingEmailContext,
  paymentDetails?: {
    reference?: string | null;
    method?: string | null;
  }
) => {
  if (!context.customer.email) {
    return;
  }

  const basePayload = basePayloadFromContext(context);
  await queueEmail({
    to: context.customer.email,
    template: EmailTemplate.BOOKING_RECEIPT_CUSTOMER,
    payload: {
      ...basePayload,
      paymentReference: paymentDetails?.reference ?? undefined,
      paymentMethod: paymentDetails?.method ?? undefined,
    },
  });
};

const composeDateWithTime = (dateValue: Date | string, time: string) => {
  const base = dateValue instanceof Date ? new Date(dateValue) : new Date(dateValue);
  if (Number.isNaN(base.getTime())) {
    return null;
  }
  const [hours = "0", minutes = "0"] = time.split(":");
  base.setHours(Number(hours), Number(minutes), 0, 0);
  return base;
};

const REMINDER_WINDOWS_HOURS = [24, 2];

const reminderAlreadyQueued = async ({
  template,
  to,
  bookingId,
  hoursBefore,
}: {
  template: EmailTemplate;
  to: string;
  bookingId: number;
  hoursBefore: number;
}) => {
  return prisma.emailJob.findFirst({
    where: {
      template,
      to,
      status: { in: [EmailJobStatus.PENDING, EmailJobStatus.PROCESSING] },
      AND: [
        { payload: { path: ["bookingId"], equals: bookingId } },
        { payload: { path: ["hoursBefore"], equals: hoursBefore } },
      ],
    },
  });
};

export const scheduleBookingReminderEmails = async (context: BookingEmailContext) => {
  const basePayload = basePayloadFromContext(context);
  const startDate = composeDateWithTime(context.bookingDate, context.startTime);
  if (!startDate) {
    return;
  }

  const tasks: Promise<unknown>[] = [];

  for (const hoursBefore of REMINDER_WINDOWS_HOURS) {
    const sendAt = new Date(startDate.getTime() - hoursBefore * 60 * 60 * 1000);
    if (sendAt <= new Date()) {
      continue;
    }

    if (context.customer.email) {
      tasks.push(
        (async () => {
          const exists = await reminderAlreadyQueued({
            template: EmailTemplate.BOOKING_REMINDER_CUSTOMER,
            to: context.customer.email as string,
            bookingId: context.bookingId,
            hoursBefore,
          });
          if (exists) {
            return;
          }

          await queueEmail({
            to: context.customer.email as string,
            template: EmailTemplate.BOOKING_REMINDER_CUSTOMER,
            payload: {
              ...basePayload,
              hoursBefore,
            },
            sendAfter: sendAt,
          });
        })()
      );
    }

    if (context.provider.email) {
      tasks.push(
        (async () => {
          const exists = await reminderAlreadyQueued({
            template: EmailTemplate.BOOKING_REMINDER_PROVIDER,
            to: context.provider.email as string,
            bookingId: context.bookingId,
            hoursBefore,
          });
          if (exists) {
            return;
          }

          await queueEmail({
            to: context.provider.email as string,
            template: EmailTemplate.BOOKING_REMINDER_PROVIDER,
            payload: {
              ...basePayload,
              hoursBefore,
            },
            sendAfter: sendAt,
          });
        })()
      );
    }
  }

  await Promise.all(tasks);
};
