"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaymentReceivedEmail = exports.sendPaymentReminderEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, EMAIL_ENABLED = "true", } = process.env;
const isEmailEnabled = EMAIL_ENABLED !== "false" && SMTP_HOST && SMTP_USER && SMTP_PASS && EMAIL_FROM;
let transporter = null;
const getTransporter = () => {
    if (!isEmailEnabled) {
        return null;
    }
    if (transporter) {
        return transporter;
    }
    try {
        transporter = nodemailer_1.default.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT) || 587,
            secure: Number(SMTP_PORT) === 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });
        return transporter;
    }
    catch (error) {
        console.error("Failed to initialize mail transporter", error);
        return null;
    }
};
const sendEmail = async ({ to, subject, html, text }) => {
    const activeTransporter = getTransporter();
    if (!activeTransporter || !EMAIL_FROM) {
        console.warn("Email disabled or transporter unavailable. Skipping email send.", { subject, to });
        return;
    }
    try {
        await activeTransporter.sendMail({
            from: EMAIL_FROM,
            to,
            subject,
            html,
            text,
        });
    }
    catch (error) {
        console.error("Failed to send email", { to, subject, error });
    }
};
const sendPaymentReminderEmail = async ({ to, customerName, providerName, serviceName, bookingId, }) => {
    await sendEmail({
        to,
        subject: "Complete your MyClean payment",
        text: `Hi ${customerName}, ${providerName} accepted your ${serviceName} booking. Please finish payment here: ${process.env.APP_BASE_URL ?? "https://myclean.app"}/payment?bookingId=${bookingId}.`,
        html: `
      <p>Hi ${customerName},</p>
      <p><strong>${providerName}</strong> just accepted your <strong>${serviceName}</strong> booking.</p>
      <p>Please complete your payment so they can get started:</p>
      <p><a href="${process.env.APP_BASE_URL ?? "https://myclean.app"}/payment?bookingId=${bookingId}" style="display:inline-block;padding:10px 16px;background-color:#2563eb;color:#fff;border-radius:6px;text-decoration:none;">Pay for booking</a></p>
      <p>If you already paid, you can ignore this email.</p>
      <p>— The MyClean team</p>
    `,
    });
};
exports.sendPaymentReminderEmail = sendPaymentReminderEmail;
const sendPaymentReceivedEmail = async ({ to, providerName, customerName, serviceName, }) => {
    await sendEmail({
        to,
        subject: "Payment received",
        text: `Hi ${providerName}, ${customerName} completed payment for ${serviceName}.`,
        html: `
      <p>Hi ${providerName},</p>
      <p><strong>${customerName}</strong> just completed payment for <strong>${serviceName}</strong>.</p>
      <p>You can review the job from your dashboard.</p>
      <p>— The MyClean team</p>
    `,
    });
};
exports.sendPaymentReceivedEmail = sendPaymentReceivedEmail;
//# sourceMappingURL=mailer.js.map