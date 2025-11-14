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
  EMAIL_TESTING_MODE = "false", // Redirect all emails to one address for testing
  EMAIL_TESTING_RECIPIENT, // The email address to receive all test emails
} = process.env;

const isEmailEnabled = EMAIL_ENABLED !== "false" && EMAIL_FROM;
const useHttpEmail = USE_HTTP_EMAIL === "true";
const isTestingMode = EMAIL_TESTING_MODE === "true";

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

  const data = await response.json() as { id: string };
  console.log(`✅ Email sent via Resend HTTP API to ${to} (ID: ${data.id})`);
};

export const deliverEmail = async ({ to, subject, html, text }: SendEmailPayload): Promise<void> => {
  if (!isEmailEnabled) {
    console.warn("Email disabled. Skipping email send.", { subject, to });
    return;
  }

  // TESTING MODE: Redirect all emails to a single test recipient
  let originalRecipient = to;
  let modifiedSubject = subject;
  let modifiedHtml = html;
  let modifiedText = text;

  if (isTestingMode && EMAIL_TESTING_RECIPIENT) {
    console.log(`🧪 [TEST MODE] Redirecting email from ${to} to ${EMAIL_TESTING_RECIPIENT}`);
    
    // Add testing banner to HTML email
    const testingBanner = `
      <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-family: Arial, sans-serif;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 24px; margin-right: 8px;">🧪</span>
          <strong style="color: #856404; font-size: 16px;">TESTING MODE</strong>
        </div>
        <p style="margin: 8px 0 0 0; color: #856404; font-size: 14px;">
          <strong>Original Recipient:</strong> ${originalRecipient}<br>
          <strong>Test Recipient:</strong> ${EMAIL_TESTING_RECIPIENT}
        </p>
      </div>
    `;
    
    // Add testing note to plain text email
    const testingNote = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Original Recipient: ${originalRecipient}
Test Recipient: ${EMAIL_TESTING_RECIPIENT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    // Inject banner into HTML (after opening body tag)
    modifiedHtml = html.replace(/<body[^>]*>/i, (match) => `${match}${testingBanner}`);
    
    // Prepend note to plain text
    modifiedText = text ? `${testingNote}${text}` : testingNote;
    
    // Add [TEST] prefix to subject
    modifiedSubject = `[TEST → ${originalRecipient}] ${subject}`;
    
    // Redirect to test recipient
    to = EMAIL_TESTING_RECIPIENT;
  }

  // Use HTTP API if configured (bypasses SMTP port blocking)
  if (useHttpEmail) {
    try {
      await sendViaResendAPI({ 
        to, 
        subject: modifiedSubject, 
        html: modifiedHtml, 
        text: modifiedText 
      });
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
    subject: modifiedSubject,
    html: modifiedHtml,
    text: modifiedText,
  });
};
