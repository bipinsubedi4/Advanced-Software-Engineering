"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliverEmail = void 0;
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
const deliverEmail = async ({ to, subject, html, text }) => {
    const activeTransporter = getTransporter();
    if (!activeTransporter || !EMAIL_FROM) {
        console.warn("Email disabled or transporter unavailable. Skipping email send.", { subject, to });
        return;
    }
    await activeTransporter.sendMail({
        from: EMAIL_FROM,
        to,
        subject,
        html,
        text,
    });
};
exports.deliverEmail = deliverEmail;
//# sourceMappingURL=mailer.js.map