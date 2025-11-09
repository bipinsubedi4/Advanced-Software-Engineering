export declare const sendPaymentReminderEmail: ({ to, customerName, providerName, serviceName, bookingId, }: {
    to: string;
    customerName: string;
    providerName: string;
    serviceName: string;
    bookingId: number;
}) => Promise<void>;
export declare const sendPaymentReceivedEmail: ({ to, providerName, customerName, serviceName, }: {
    to: string;
    providerName: string;
    customerName: string;
    serviceName: string;
}) => Promise<void>;
//# sourceMappingURL=mailer.d.ts.map