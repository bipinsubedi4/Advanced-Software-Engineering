import { Booking, EmailTemplate, Prisma } from "@prisma/client";
import { TemplatePayloads } from "./templates";
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
    customer: BookingParticipant & {
        id?: number;
    };
    provider: BookingParticipant & {
        id?: number;
    };
};
export declare const buildBookingEmailContext: (booking: BookingNotificationRecord) => BookingEmailContext;
export declare const buildBookingEmailContextFromModel: (booking: BookingWithRelations) => BookingEmailContext;
export declare const queueEmail: <TTemplate extends EmailTemplate>({ to, template, payload, sendAfter, maxAttempts, }: QueueEmailParams<TTemplate>) => Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.EmailJobStatus;
    to: string;
    subject: string;
    template: import(".prisma/client").$Enums.EmailTemplate;
    payload: Prisma.JsonValue;
    maxAttempts: number;
    attemptCount: number;
    lastError: string | null;
    scheduledFor: Date;
    sentAt: Date | null;
}>;
export declare const processEmailQueue: (batchSize?: number) => Promise<void>;
export declare const startEmailQueueWorker: () => void;
export declare const queueWelcomeEmail: ({ email, name, role, }: {
    email?: string | null;
    name: string;
    role: string;
}) => Promise<void>;
export declare const queueBookingConfirmationEmails: (context: BookingEmailContext, bookingStatus: string) => Promise<void>;
export declare const queuePaymentReminderEmail: (context: BookingEmailContext) => Promise<void>;
export declare const queuePaymentReceivedEmail: (context: BookingEmailContext, paymentReference?: string | null) => Promise<void>;
export declare const queueBookingReceiptEmail: (context: BookingEmailContext, paymentDetails?: {
    reference?: string | null;
    method?: string | null;
}) => Promise<void>;
export declare const scheduleBookingReminderEmails: (context: BookingEmailContext) => Promise<void>;
//# sourceMappingURL=emailService.d.ts.map