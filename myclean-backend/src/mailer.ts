import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  EMAIL_ENABLED = "true",
} = process.env;

const isEmailEnabled = EMAIL_ENABLED !== "false" && SMTP_HOST && SMTP_USER && SMTP_PASS && EMAIL_FROM;

let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter | null => {
  if (!isEmailEnabled) {
    return null;
  }

  if (transporter) {
    return transporter;
  }

  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    return transporter;
  } catch (error) {
    console.error("Failed to initialize mail transporter", error);
    return null;
  }
};

export type SendEmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export const deliverEmail = async ({ to, subject, html, text }: SendEmailPayload): Promise<void> => {
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
