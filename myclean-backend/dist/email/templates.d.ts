import { EmailTemplate } from "@prisma/client";
type BaseBookingPayload = {
    bookingId: number;
    bookingDateISO: string;
    startTime: string;
    endTime: string;
    serviceName: string;
    address: string;
    city: string;
    state: string;
    zipCode?: string | null;
    totalPriceCents?: number | null;
    customerName: string;
    providerName: string;
    specialInstructions?: string | null;
    timezone?: string;
};
export type TemplatePayloads = {
    WELCOME: {
        userName: string;
        role: string;
    };
    BOOKING_CONFIRM_CUSTOMER: BaseBookingPayload & {
        bookingStatus: string;
    };
    BOOKING_CONFIRM_PROVIDER: BaseBookingPayload & {
        customerEmail?: string | null;
        customerPhone?: string | null;
    };
    BOOKING_REMINDER_CUSTOMER: BaseBookingPayload & {
        hoursBefore: number;
    };
    BOOKING_REMINDER_PROVIDER: BaseBookingPayload & {
        hoursBefore: number;
    };
    BOOKING_RECEIPT_CUSTOMER: BaseBookingPayload & {
        paymentReference?: string | null;
        paymentMethod?: string | null;
    };
    PAYMENT_REMINDER_CUSTOMER: BaseBookingPayload & {
        paymentLink: string;
    };
    PAYMENT_RECEIVED_PROVIDER: BaseBookingPayload & {
        paymentReference?: string | null;
    };
};
export declare const buildEmailContent: <TTemplate extends EmailTemplate>(template: TTemplate, payload: TemplatePayloads[TTemplate]) => {
    subject: string;
    html: string;
    text: string;
};
export declare const getTemplateSubject: <TTemplate extends EmailTemplate>(template: TTemplate, payload: TemplatePayloads[TTemplate]) => string;
export {};
//# sourceMappingURL=templates.d.ts.map