import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  EMAIL_ENABLED = "true",
  USE_HTTP_EMAIL = "false", // Use HTTP API instead of SMTP (for Resend, etc.)
  RESEND_API_KEY, // For Resend HTTP API
} = process.env;

const isEmailEnabled = EMAIL_ENABLED !== "false" && EMAIL_FROM;
const useHttpEmail = USE_HTTP_EMAIL === "true";

let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter | null => {
  if (!isEmailEnabled || useHttpEmail) {
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

// Send email via Resend HTTP API (bypasses SMTP port blocking)
const sendViaResendAPI = async ({ to, subject, html, text }: SendEmailPayload): Promise<void> => {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject,
      html,
      text: text || undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  console.log(`✅ Email sent via Resend HTTP API to ${to} (ID: ${data.id})`);
};

export const deliverEmail = async ({ to, subject, html, text }: SendEmailPayload): Promise<void> => {
  if (!isEmailEnabled) {
    console.warn("Email disabled. Skipping email send.", { subject, to });
    return;
  }

  // Use HTTP API if configured (bypasses SMTP port blocking)
  if (useHttpEmail) {
    try {
      await sendViaResendAPI({ to, subject, html, text });
      return;
    } catch (error) {
      console.error("Failed to send email via HTTP API:", error);
      throw error;
    }
  }

  // Fall back to SMTP
  const activeTransporter = getTransporter();
  if (!activeTransporter) {
    console.warn("Email transporter unavailable. Skipping email send.", { subject, to });
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
