"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleBookingReminderEmails = exports.queueBookingReceiptEmail = exports.queuePaymentReceivedEmail = exports.queuePaymentReminderEmail = exports.queueBookingConfirmationEmails = exports.queueWelcomeEmail = exports.startEmailQueueWorker = exports.processEmailQueue = exports.queueEmail = exports.buildBookingEmailContextFromModel = exports.buildBookingEmailContext = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../prisma");
const mailer_1 = require("../mailer");
const templates_1 = require("./templates");
const APP_BASE_URL = process.env.APP_BASE_URL ?? "https://myclean.app";
const DEFAULT_MAX_ATTEMPTS = Number(process.env.EMAIL_QUEUE_MAX_ATTEMPTS ?? "4");
const DEFAULT_BATCH_SIZE = Number(process.env.EMAIL_QUEUE_BATCH_SIZE ?? "20");
const WORKER_INTERVAL_MS = Number(process.env.EMAIL_QUEUE_INTERVAL_MS ?? "15000");
const RETRY_MINUTES = (process.env.EMAIL_QUEUE_RETRY_MINUTES ?? "5,15,60")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => !Number.isNaN(value) && value > 0);
const RETRY_DELAYS_MS = (RETRY_MINUTES.length ? RETRY_MINUTES : [5, 15, 60]).map((value) => value * 60 * 1000);
const ensureISODate = (value) => {
    if (value instanceof Date) {
        return value.toISOString();
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return new Date().toISOString();
    }
    return parsed.toISOString();
};
const basePayloadFromContext = (context) => ({
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
const buildBookingEmailContext = (booking) => ({
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
exports.buildBookingEmailContext = buildBookingEmailContext;
const buildBookingEmailContextFromModel = (booking) => (0, exports.buildBookingEmailContext)({
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
exports.buildBookingEmailContextFromModel = buildBookingEmailContextFromModel;
const queueEmail = async ({ to, template, payload, sendAfter, maxAttempts, }) => {
    const subject = (0, templates_1.getTemplateSubject)(template, payload) ?? `${process.env.BRAND_NAME ?? "MyClean"} notification`;
    return prisma_1.prisma.emailJob.create({
        data: {
            to,
            template,
            payload: payload,
            subject,
            scheduledFor: sendAfter ?? new Date(),
            maxAttempts: maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
        },
    });
};
exports.queueEmail = queueEmail;
const getRetryDelayMs = (attemptNumber) => {
    const index = Math.min(Math.max(attemptNumber - 1, 0), RETRY_DELAYS_MS.length - 1);
    return RETRY_DELAYS_MS[index] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
};
const processEmailQueue = async (batchSize = DEFAULT_BATCH_SIZE) => {
    const jobs = await prisma_1.prisma.emailJob.findMany({
        where: {
            status: client_1.EmailJobStatus.PENDING,
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
        const claimed = await prisma_1.prisma.emailJob.updateMany({
            where: { id: job.id, status: client_1.EmailJobStatus.PENDING },
            data: { status: client_1.EmailJobStatus.PROCESSING },
        });
        if (claimed.count === 0) {
            continue;
        }
        const attemptNumber = job.attemptCount + 1;
        try {
            const content = (0, templates_1.buildEmailContent)(job.template, job.payload);
            await (0, mailer_1.deliverEmail)({
                to: job.to,
                subject: content.subject,
                html: content.html,
                text: content.text,
            });
            await prisma_1.prisma.emailJob.update({
                where: { id: job.id },
                data: {
                    status: client_1.EmailJobStatus.SENT,
                    sentAt: new Date(),
                    attemptCount: attemptNumber,
                    lastError: null,
                },
            });
        }
        catch (error) {
            console.error("Failed to deliver email", { jobId: job.id, error });
            const hasAttemptsLeft = attemptNumber < job.maxAttempts;
            await prisma_1.prisma.emailJob.update({
                where: { id: job.id },
                data: {
                    status: hasAttemptsLeft ? client_1.EmailJobStatus.PENDING : client_1.EmailJobStatus.FAILED,
                    attemptCount: attemptNumber,
                    lastError: error instanceof Error ? error.message : "Unknown email send failure",
                    scheduledFor: hasAttemptsLeft ? new Date(Date.now() + getRetryDelayMs(attemptNumber)) : job.scheduledFor,
                },
            });
        }
    }
};
exports.processEmailQueue = processEmailQueue;
let workerHandle = null;
const startEmailQueueWorker = () => {
    if (process.env.DISABLE_EMAIL_QUEUE === "true") {
        console.log("⏸ Email queue worker disabled via env toggle");
        return;
    }
    if (workerHandle) {
        return;
    }
    console.log(`📧 Email queue worker started (interval ${WORKER_INTERVAL_MS}ms)`);
    const runWorker = () => (0, exports.processEmailQueue)().catch((error) => {
        console.error("Email queue worker iteration failed", error);
    });
    runWorker();
    workerHandle = setInterval(runWorker, WORKER_INTERVAL_MS);
};
exports.startEmailQueueWorker = startEmailQueueWorker;
const queueWelcomeEmail = async ({ email, name, role, }) => {
    if (!email) {
        return;
    }
    await (0, exports.queueEmail)({
        to: email,
        template: client_1.EmailTemplate.WELCOME,
        payload: {
            userName: name,
            role,
        },
    });
};
exports.queueWelcomeEmail = queueWelcomeEmail;
const queueBookingConfirmationEmails = async (context, bookingStatus) => {
    const basePayload = basePayloadFromContext(context);
    const tasks = [];
    if (context.customer.email) {
        tasks.push((0, exports.queueEmail)({
            to: context.customer.email,
            template: client_1.EmailTemplate.BOOKING_CONFIRM_CUSTOMER,
            payload: {
                ...basePayload,
                bookingStatus,
            },
        }));
    }
    if (context.provider.email) {
        tasks.push((0, exports.queueEmail)({
            to: context.provider.email,
            template: client_1.EmailTemplate.BOOKING_CONFIRM_PROVIDER,
            payload: {
                ...basePayload,
                customerEmail: context.customer.email ?? undefined,
                customerPhone: context.customer.phone ?? undefined,
            },
        }));
    }
    await Promise.all(tasks);
};
exports.queueBookingConfirmationEmails = queueBookingConfirmationEmails;
const queuePaymentReminderEmail = async (context) => {
    if (!context.customer.email) {
        return;
    }
    const basePayload = basePayloadFromContext(context);
    const paymentLink = `${APP_BASE_URL}/payment?bookingId=${context.bookingId}`;
    await (0, exports.queueEmail)({
        to: context.customer.email,
        template: client_1.EmailTemplate.PAYMENT_REMINDER_CUSTOMER,
        payload: {
            ...basePayload,
            paymentLink,
        },
    });
};
exports.queuePaymentReminderEmail = queuePaymentReminderEmail;
const queuePaymentReceivedEmail = async (context, paymentReference) => {
    if (!context.provider.email) {
        return;
    }
    const basePayload = basePayloadFromContext(context);
    await (0, exports.queueEmail)({
        to: context.provider.email,
        template: client_1.EmailTemplate.PAYMENT_RECEIVED_PROVIDER,
        payload: {
            ...basePayload,
            paymentReference: paymentReference ?? undefined,
        },
    });
};
exports.queuePaymentReceivedEmail = queuePaymentReceivedEmail;
const queueBookingReceiptEmail = async (context, paymentDetails) => {
    if (!context.customer.email) {
        return;
    }
    const basePayload = basePayloadFromContext(context);
    await (0, exports.queueEmail)({
        to: context.customer.email,
        template: client_1.EmailTemplate.BOOKING_RECEIPT_CUSTOMER,
        payload: {
            ...basePayload,
            paymentReference: paymentDetails?.reference ?? undefined,
            paymentMethod: paymentDetails?.method ?? undefined,
        },
    });
};
exports.queueBookingReceiptEmail = queueBookingReceiptEmail;
const composeDateWithTime = (dateValue, time) => {
    const base = dateValue instanceof Date ? new Date(dateValue) : new Date(dateValue);
    if (Number.isNaN(base.getTime())) {
        return null;
    }
    const [hours = "0", minutes = "0"] = time.split(":");
    base.setHours(Number(hours), Number(minutes), 0, 0);
    return base;
};
const REMINDER_WINDOWS_HOURS = [24, 2];
const reminderAlreadyQueued = async ({ template, to, bookingId, hoursBefore, }) => {
    return prisma_1.prisma.emailJob.findFirst({
        where: {
            template,
            to,
            status: { in: [client_1.EmailJobStatus.PENDING, client_1.EmailJobStatus.PROCESSING] },
            AND: [
                { payload: { path: ["bookingId"], equals: bookingId } },
                { payload: { path: ["hoursBefore"], equals: hoursBefore } },
            ],
        },
    });
};
const scheduleBookingReminderEmails = async (context) => {
    const basePayload = basePayloadFromContext(context);
    const startDate = composeDateWithTime(context.bookingDate, context.startTime);
    if (!startDate) {
        return;
    }
    const tasks = [];
    for (const hoursBefore of REMINDER_WINDOWS_HOURS) {
        const sendAt = new Date(startDate.getTime() - hoursBefore * 60 * 60 * 1000);
        if (sendAt <= new Date()) {
            continue;
        }
        if (context.customer.email) {
            tasks.push((async () => {
                const exists = await reminderAlreadyQueued({
                    template: client_1.EmailTemplate.BOOKING_REMINDER_CUSTOMER,
                    to: context.customer.email,
                    bookingId: context.bookingId,
                    hoursBefore,
                });
                if (exists) {
                    return;
                }
                await (0, exports.queueEmail)({
                    to: context.customer.email,
                    template: client_1.EmailTemplate.BOOKING_REMINDER_CUSTOMER,
                    payload: {
                        ...basePayload,
                        hoursBefore,
                    },
                    sendAfter: sendAt,
                });
            })());
        }
        if (context.provider.email) {
            tasks.push((async () => {
                const exists = await reminderAlreadyQueued({
                    template: client_1.EmailTemplate.BOOKING_REMINDER_PROVIDER,
                    to: context.provider.email,
                    bookingId: context.bookingId,
                    hoursBefore,
                });
                if (exists) {
                    return;
                }
                await (0, exports.queueEmail)({
                    to: context.provider.email,
                    template: client_1.EmailTemplate.BOOKING_REMINDER_PROVIDER,
                    payload: {
                        ...basePayload,
                        hoursBefore,
                    },
                    sendAfter: sendAt,
                });
            })());
        }
    }
    await Promise.all(tasks);
};
exports.scheduleBookingReminderEmails = scheduleBookingReminderEmails;
//# sourceMappingURL=emailService.js.map