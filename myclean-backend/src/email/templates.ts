import { EmailTemplate } from "@prisma/client";

const BRAND_NAME = process.env.BRAND_NAME ?? "MyClean";
const APP_BASE_URL = process.env.APP_BASE_URL ?? "https://myclean.app";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "support@myclean.app";
const DEFAULT_TIMEZONE = process.env.APP_TIMEZONE ?? "UTC";
const DEFAULT_CURRENCY = process.env.APP_CURRENCY ?? "USD";

type DetailRow = {
  label: string;
  value: string;
};

type LayoutOptions = {
  title: string;
  previewText?: string;
  intro?: string;
  sections?: string[];
  detailRows?: DetailRow[];
  highlight?: string;
  cta?: {
    label: string;
    url: string;
  };
  footerNote?: string;
};

const brand = {
  background: "#f3f4f6",
  card: "#ffffff",
  text: "#111827",
  muted: "#6b7280",
  accent: "#2563eb",
  border: "#e5e7eb",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: DEFAULT_CURRENCY,
});

const formatCurrency = (valueInCents?: number | null): string => {
  return currencyFormatter.format((valueInCents ?? 0) / 100);
};

const formatAddress = ({
  address,
  city,
  state,
  zipCode,
}: {
  address: string;
  city: string;
  state: string;
  zipCode?: string | null;
}): string => {
  const location = [city, state].filter(Boolean).join(", ");
  const zipPart = zipCode ? ` ${zipCode}` : "";
  return `${address}, ${location}${zipPart}`;
};

const composeDateWithTime = (dateISO: string, time: string): Date => {
  const base = new Date(dateISO);
  if (Number.isNaN(base.getTime())) {
    return new Date();
  }
  const [hours = "0", minutes = "0"] = time.split(":");
  base.setHours(Number(hours), Number(minutes), 0, 0);
  return base;
};

const formatSchedule = ({
  bookingDateISO,
  startTime,
  endTime,
  timezone,
}: {
  bookingDateISO: string;
  startTime: string;
  endTime: string;
  timezone?: string;
}): { dateLabel: string; timeLabel: string } => {
  const tz = timezone ?? DEFAULT_TIMEZONE;
  const start = composeDateWithTime(bookingDateISO, startTime);
  const end = composeDateWithTime(bookingDateISO, endTime);

  try {
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: tz,
    });

    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: tz,
    });

    return {
      dateLabel: dateFormatter.format(start),
      timeLabel: `${timeFormatter.format(start)} – ${timeFormatter.format(end)} ${tz}`,
    };
  } catch {
    return {
      dateLabel: start.toDateString(),
      timeLabel: `${start.toLocaleTimeString()} – ${end.toLocaleTimeString()}`,
    };
  }
};

const renderDetailsTable = (rows: DetailRow[]): string => {
  if (!rows.length) {
    return "";
  }

  const cells = rows
    .map(
      (row) => `
      <tr>
        <td style="padding:8px 0;color:${brand.muted};font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">${row.label}</td>
        <td style="padding:8px 0;color:${brand.text};font-size:15px;font-weight:500;text-align:right;">${row.value}</td>
      </tr>
    `
    )
    .join("");

  return `
    <table role="presentation" style="width:100%;margin:24px 0;border-collapse:collapse;">
      <tbody>${cells}</tbody>
    </table>
  `;
};

const renderLayout = ({
  title,
  previewText,
  intro,
  sections = [],
  detailRows = [],
  highlight,
  cta,
  footerNote,
}: LayoutOptions): string => {
  const detailsHtml = renderDetailsTable(detailRows);
  const sectionHtml = sections
    .map((section) => `<p style="margin:0 0 16px 0;line-height:1.5;color:${brand.text};">${section}</p>`)
    .join("");
  const highlightHtml = highlight
    ? `<div style="margin:24px 0;padding:16px;border-radius:8px;background:${brand.background};color:${brand.text};font-weight:500;">${highlight}</div>`
    : "";
  const ctaHtml = cta
    ? `<div style="margin-top:24px;">
        <a href="${cta.url}" style="display:inline-block;padding:12px 24px;background:${brand.accent};color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">${cta.label}</a>
      </div>`
    : "";

  const footerHtml = footerNote
    ? `<p style="margin-top:24px;color:${brand.muted};font-size:13px;line-height:1.4;">${footerNote}</p>`
    : "";

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background:${brand.background};font-family:'Inter','Segoe UI',Helvetica,Arial,sans-serif;color:${brand.text};">
      <span style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${previewText ?? ""}</span>
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        <tr>
          <td align="center" style="padding:24px;">
            <table role="presentation" style="width:100%;max-width:600px;border-collapse:collapse;background:${brand.card};padding:32px;border-radius:16px;border:1px solid ${brand.border};box-shadow:0 8px 32px rgba(15,23,42,0.06);">
              <tr>
                <td>
                  <p style="margin:0 0 12px 0;color:${brand.accent};font-size:14px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">${BRAND_NAME}</p>
                  <h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.2;">${title}</h1>
                  ${intro ? `<p style="margin:0 0 16px 0;line-height:1.6;color:${brand.text};">${intro}</p>` : ""}
                  ${detailsHtml}
                  ${highlightHtml}
                  ${sectionHtml}
                  ${ctaHtml}
                  ${footerHtml}
                  <p style="margin-top:32px;color:${brand.muted};font-size:12px;">You are receiving this email because you are a ${BRAND_NAME} customer. Need help? Contact <a href="mailto:${SUPPORT_EMAIL}" style="color:${brand.accent};text-decoration:none;">${SUPPORT_EMAIL}</a>.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};

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

type TemplateDefinition<TPayload> = {
  subject: (payload: TPayload) => string;
  preview?: (payload: TPayload) => string;
  build: (payload: TPayload) => LayoutOptions;
  text: (payload: TPayload) => string;
};

const getBookingRows = (payload: BaseBookingPayload): DetailRow[] => {
  const schedule = formatSchedule({
    bookingDateISO: payload.bookingDateISO,
    startTime: payload.startTime,
    endTime: payload.endTime,
    timezone: payload.timezone,
  });

  return [
    { label: "Service", value: payload.serviceName },
    { label: "Date", value: schedule.dateLabel },
    { label: "Time", value: schedule.timeLabel },
    { label: "Location", value: formatAddress(payload) },
  ];
};

const bookingSummaryText = (payload: BaseBookingPayload): string => {
  const rows = getBookingRows(payload);
  return rows.map((row) => `${row.label}: ${row.value}`).join("\n");
};

const templateDefinitions: Record<EmailTemplate, TemplateDefinition<any>> = {
  WELCOME: {
    subject: ({ userName }) => `Welcome to ${BRAND_NAME}! Let's make your first booking ✨`,
    preview: () => `You're ready to start with ${BRAND_NAME}`,
    build: ({ userName, role }) => {
      // Extract first name from full name
      const firstName = userName.split(" ")[0];
      
      if (role === "CUSTOMER") {
        return {
          title: `Welcome, ${firstName}!`,
          previewText: `Your ${BRAND_NAME} account is ready.`,
          intro: `Welcome to ${BRAND_NAME} — your trusted platform for booking reliable cleaning services!`,
          sections: [
            "You can start by finding local cleaning professionals and booking services that fit your schedule.",
            "We're glad to have you on board!",
          ],
          cta: {
            label: "Find a Cleaner",
            url: `${APP_BASE_URL}/search`,
          },
          footerNote: "Thank you for choosing MyClean. We look forward to serving you!",
        };
      } else {
        // Provider welcome email
        return {
          title: `Welcome, ${firstName}!`,
          previewText: `Your ${BRAND_NAME} account is ready.`,
          intro: `Thanks for joining ${BRAND_NAME}. We're excited to help you grow your cleaning business.`,
          sections: [
            "Finish your profile and add services so customers can book you in minutes.",
            "Need a hand? Our support team is always one message away.",
          ],
          cta: {
            label: "Complete Your Profile",
            url: `${APP_BASE_URL}/provider/dashboard`,
          },
          footerNote: "Keep this email for your records.",
        };
      }
    },
    text: ({ userName, role }) => {
      const firstName = userName.split(" ")[0];
      if (role === "CUSTOMER") {
        return `Hi ${firstName},\n\nWelcome to ${BRAND_NAME} — your trusted platform for booking reliable cleaning services!\n\nYou can start by finding local cleaning professionals here:\n👉 ${APP_BASE_URL}/search\n\nWe're glad to have you on board!\n\n— The ${BRAND_NAME} Team`;
      } else {
        return `Hi ${firstName},\n\nWelcome to ${BRAND_NAME}! Set up your profile to start receiving bookings.\n\nLog in: ${APP_BASE_URL}/provider/dashboard\n\nNeed help? Contact ${SUPPORT_EMAIL}.\n\n— The ${BRAND_NAME} team`;
      }
    },
  },
  BOOKING_CONFIRM_CUSTOMER: {
    subject: () => `Your ${BRAND_NAME} Booking is Confirmed! 🧼`,
    preview: ({ bookingDateISO, startTime }) => {
      const schedule = formatSchedule({ bookingDateISO, startTime, endTime: startTime });
      return `Scheduled for ${schedule.dateLabel}`;
    },
    build: (payload) => {
      const firstName = payload.customerName.split(" ")[0];
      const schedule = formatSchedule({
        bookingDateISO: payload.bookingDateISO,
        startTime: payload.startTime,
        endTime: payload.endTime,
        timezone: payload.timezone,
      });
      
      return {
        title: "Your cleaning booking is confirmed! 🎉",
        previewText: `Scheduled with ${payload.providerName}`,
        intro: `Hi ${firstName},\n\nYour cleaning booking is confirmed! 🎉\n\nHere are the details:`,
        detailRows: [
          { label: "Cleaner", value: payload.providerName },
          { label: "Service", value: payload.serviceName },
          { label: "Date", value: schedule.dateLabel },
          { label: "Time", value: schedule.timeLabel },
          { label: "Price", value: formatCurrency(payload.totalPriceCents) },
          { label: "Location", value: formatAddress(payload) },
          { label: "Booking ID", value: `#${payload.bookingId}` },
        ],
        sections: [
          "Thank you for choosing MyClean!",
          "We'll send a reminder before your scheduled time.",
        ],
        cta: {
          label: "View Booking Details",
          url: `${APP_BASE_URL}/my-bookings?bookingId=${payload.bookingId}`,
        },
        footerNote: "Keep this confirmation for your records.",
      };
    },
    text: (payload) => {
      const firstName = payload.customerName.split(" ")[0];
      const schedule = formatSchedule({
        bookingDateISO: payload.bookingDateISO,
        startTime: payload.startTime,
        endTime: payload.endTime,
        timezone: payload.timezone,
      });
      return `Hi ${firstName},\n\nYour cleaning booking is confirmed! 🎉\n\nHere are the details:\n\n- Cleaner: ${payload.providerName}\n- Service: ${payload.serviceName}\n- Date & Time: ${schedule.dateLabel} at ${schedule.timeLabel}\n- Price: ${formatCurrency(payload.totalPriceCents)}\n\nThank you for choosing ${BRAND_NAME}!\n\nWe'll send a reminder before your scheduled time.\n\n— The ${BRAND_NAME} Team\n\nView booking: ${APP_BASE_URL}/my-bookings?bookingId=${payload.bookingId}`;
    },
  },
  BOOKING_CONFIRM_PROVIDER: {
    subject: ({ customerName }) => `New booking request from ${customerName}`,
    preview: ({ serviceName }) => `${serviceName} request waiting for your review`,
    build: (payload) => ({
      title: "You have a new booking request",
      previewText: `${payload.customerName} requested ${payload.serviceName}`,
      intro: `${payload.customerName} would like to book you for ${payload.serviceName}. Confirm to lock it in.`,
      detailRows: [
        ...getBookingRows(payload),
        { label: "Client", value: payload.customerName },
        { label: "Booking #", value: `#${payload.bookingId}` },
      ],
      sections: [
        payload.specialInstructions ? `<strong>Notes:</strong> ${payload.specialInstructions}` : "",
        payload.customerPhone ? `Client contact: ${payload.customerPhone}` : "",
      ].filter(Boolean) as string[],
      cta: {
        label: "Review request",
        url: `${APP_BASE_URL}/provider/dashboard?bookingId=${payload.bookingId}`,
      },
      footerNote: "Please respond within 24 hours to keep your response rate high.",
    }),
    text: (payload) =>
      `New booking from ${payload.customerName}.\n${bookingSummaryText(payload)}\nBooking #${payload.bookingId}\nLog in to confirm: ${APP_BASE_URL}/provider/dashboard?bookingId=${payload.bookingId}`,
  },
  BOOKING_REMINDER_CUSTOMER: {
    subject: ({ serviceName, hoursBefore }) => `${serviceName} starts in ${hoursBefore} hour${hoursBefore === 1 ? "" : "s"}`,
    preview: ({ providerName }) => `Get ready for ${providerName}`,
    build: (payload) => ({
      title: `Reminder: ${payload.serviceName} is coming up`,
      previewText: `${payload.providerName} arrives soon.`,
      intro: `Hi ${payload.customerName}, just a friendly heads up that ${payload.providerName} arrives in ${payload.hoursBefore} hour${
        payload.hoursBefore === 1 ? "" : "s"
      }.`,
      detailRows: [
        ...getBookingRows(payload),
        { label: "Cleaner", value: payload.providerName },
      ],
      sections: ["Please make sure entry instructions and pets are accounted for. Need to reschedule? Visit your dashboard."],
      cta: {
        label: "Manage booking",
        url: `${APP_BASE_URL}/my-bookings?bookingId=${payload.bookingId}`,
      },
      footerNote: "Questions? Reply to this email and we'll help.",
    }),
    text: (payload) =>
      `Reminder: ${payload.serviceName} with ${payload.providerName} starts in ${payload.hoursBefore} hour${
        payload.hoursBefore === 1 ? "" : "s"
      }.\n${bookingSummaryText(payload)}\nManage booking: ${APP_BASE_URL}/my-bookings?bookingId=${payload.bookingId}`,
  },
  BOOKING_REMINDER_PROVIDER: {
    subject: ({ serviceName, hoursBefore }) => `${serviceName} with ${BRAND_NAME} client in ${hoursBefore}h`,
    preview: ({ customerName }) => `Upcoming visit for ${customerName}`,
    build: (payload) => ({
      title: `Upcoming job in ${payload.hoursBefore} hour${payload.hoursBefore === 1 ? "" : "s"}`,
      previewText: `Stay ready for ${payload.customerName}.`,
      intro: `You've got ${payload.serviceName} with ${payload.customerName} soon.`,
      detailRows: [
        ...getBookingRows(payload),
        { label: "Client", value: payload.customerName },
        { label: "Booking #", value: `#${payload.bookingId}` },
      ],
      sections: [
        payload.specialInstructions ? `<strong>Client notes:</strong> ${payload.specialInstructions}` : "",
        "Arrive a few minutes early and mark the job complete once finished.",
      ].filter(Boolean) as string[],
      cta: {
        label: "Open schedule",
        url: `${APP_BASE_URL}/provider/dashboard?bookingId=${payload.bookingId}`,
      },
    }),
    text: (payload) =>
      `Reminder: ${payload.serviceName} for ${payload.customerName} begins in ${payload.hoursBefore} hour${
        payload.hoursBefore === 1 ? "" : "s"
      }.\n${bookingSummaryText(payload)}\nDashboard: ${APP_BASE_URL}/provider/dashboard?bookingId=${payload.bookingId}`,
  },
  BOOKING_RECEIPT_CUSTOMER: {
    subject: ({ serviceName }) => `Receipt for your ${serviceName} booking`,
    preview: ({ providerName }) => `Payment confirmed for ${providerName}`,
    build: (payload) => ({
      title: "Payment confirmed — thank you!",
      previewText: `You're confirmed with ${payload.providerName}.`,
      intro: `We've processed your payment for ${payload.serviceName}.`,
      detailRows: [
        ...getBookingRows(payload),
        { label: "Cleaner", value: payload.providerName },
        { label: "Receipt #", value: `MC-${payload.bookingId}` },
        { label: "Total Paid", value: formatCurrency(payload.totalPriceCents) },
      ],
      sections: [
        payload.paymentMethod ? `Payment method: ${payload.paymentMethod}` : "",
        payload.paymentReference ? `Transaction ID: ${payload.paymentReference}` : "",
        "We'll remind you again before the service begins. Enjoy the spotless space!",
      ].filter(Boolean) as string[],
      cta: {
        label: "View receipt",
        url: `${APP_BASE_URL}/my-bookings?bookingId=${payload.bookingId}`,
      },
    }),
    text: (payload) =>
      `Hi ${payload.customerName},\n\nPayment received for ${payload.serviceName} with ${payload.providerName}.\n${bookingSummaryText(
        payload
      )}\nTotal Paid: ${formatCurrency(payload.totalPriceCents)}\nReceipt #: MC-${payload.bookingId}\n\nView receipt: ${
        APP_BASE_URL
      }/my-bookings?bookingId=${payload.bookingId}`,
  },
  PAYMENT_REMINDER_CUSTOMER: {
    subject: ({ providerName }) => `Complete payment so ${providerName} can get started`,
    preview: ({ serviceName }) => `${serviceName} is waiting for payment`,
    build: (payload) => ({
      title: "Action needed: finish payment",
      previewText: `${payload.providerName} accepted your booking.`,
      intro: `${payload.providerName} accepted your ${payload.serviceName} request. Pay now to confirm.`,
      detailRows: [
        ...getBookingRows(payload),
        { label: "Total Due", value: formatCurrency(payload.totalPriceCents) },
      ],
      sections: ["We secure your payment until the job is done. This keeps everyone protected."],
      cta: {
        label: "Pay for booking",
        url: payload.paymentLink,
      },
      footerNote: "If you've already paid, you can ignore this reminder.",
    }),
    text: (payload) =>
      `Hi ${payload.customerName},\n\n${payload.providerName} accepted your request. Complete payment here: ${payload.paymentLink}\n${bookingSummaryText(
        payload
      )}\n\nThanks,\n${BRAND_NAME}`,
  },
  PAYMENT_RECEIVED_PROVIDER: {
    subject: ({ customerName }) => `Payment received from ${customerName}`,
    preview: ({ serviceName }) => `${serviceName} is fully paid`,
    build: (payload) => ({
      title: "You're good to go!",
      previewText: `${payload.customerName} completed payment.`,
      intro: `${payload.customerName} paid for ${payload.serviceName}. You can focus on delivering a 5-star experience.`,
      detailRows: [
        ...getBookingRows(payload),
        { label: "Client", value: payload.customerName },
        { label: "Total", value: formatCurrency(payload.totalPriceCents) },
      ],
      sections: [
        payload.paymentReference ? `Transaction ID: ${payload.paymentReference}` : "",
        "Remember to mark the job complete so the customer can leave a review.",
      ].filter(Boolean) as string[],
      cta: {
        label: "View job details",
        url: `${APP_BASE_URL}/provider/dashboard?bookingId=${payload.bookingId}`,
      },
    }),
    text: (payload) =>
      `${payload.customerName} finished paying for ${payload.serviceName}.\n${bookingSummaryText(payload)}\nTotal: ${formatCurrency(
        payload.totalPriceCents
      )}\nDashboard: ${APP_BASE_URL}/provider/dashboard?bookingId=${payload.bookingId}`,
  },
};

export const buildEmailContent = <TTemplate extends EmailTemplate>(
  template: TTemplate,
  payload: TemplatePayloads[TTemplate]
) => {
  const definition = templateDefinitions[template];
  if (!definition) {
    throw new Error(`Email template ${template} is not implemented`);
  }

  const layout = definition.build(payload);
  const html = renderLayout({
    ...layout,
    previewText: layout.previewText ?? definition.preview?.(payload),
  });
  const subject = definition.subject(payload);
  const text = definition.text(payload);

  return { subject, html, text };
};

export const getTemplateSubject = <TTemplate extends EmailTemplate>(
  template: TTemplate,
  payload: TemplatePayloads[TTemplate]
) => templateDefinitions[template]?.subject(payload);
