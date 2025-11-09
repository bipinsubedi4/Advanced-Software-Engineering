export type SendEmailPayload = {
    to: string;
    subject: string;
    html: string;
    text?: string;
};
export declare const deliverEmail: ({ to, subject, html, text }: SendEmailPayload) => Promise<void>;
//# sourceMappingURL=mailer.d.ts.map