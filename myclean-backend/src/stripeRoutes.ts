import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { prisma } from "./prisma";
import { z } from "zod";
import { sendPaymentReceivedEmail, sendPaymentFailedEmail } from "./mailer";

const router = Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.warn("⚠️ STRIPE_SECRET_KEY is not defined. Stripe routes will fail.");
}

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" })
  : null;

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const connectSchema = z.object({
  providerId: z.number(),
  refreshUrl: z.string().url().optional(),
  returnUrl: z.string().url().optional(),
});

router.post("/connect", async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  try {
    const payload = connectSchema.parse(req.body);
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: payload.providerId },
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    if (!providerProfile) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    let accountId = providerProfile.stripeAccountId;

    if (!accountId) {
      const onboardingEmail = providerProfile.user?.email;
      const account = await stripe.accounts.create({
        type: "express",
        email: onboardingEmail,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      await prisma.providerProfile.update({
        where: { id: providerProfile.id },
        data: { stripeAccountId: accountId, stripeChargesEnabledAt: account.charges_enabled ? new Date() : null },
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: payload.refreshUrl ?? process.env.STRIPE_CONNECT_REFRESH_URL ?? "https://myclean.app/stripe/refresh",
      return_url: payload.returnUrl ?? process.env.STRIPE_CONNECT_RETURN_URL ?? "https://myclean.app/stripe/return",
      type: "account_onboarding",
    });

    res.json({ success: true, url: accountLink.url });
  } catch (error) {
    console.error("Stripe connect error", error);
    res.status(400).json({ error: "Failed to start onboarding" });
  }
});

const createIntentSchema = z.object({
  bookingId: z.number(),
  applicationFeePercent: z.number().min(0).max(100).optional(),
});

const confirmPaymentSchema = z.object({
  bookingId: z.number(),
});

router.post("/create-payment-intent", async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  try {
    const payload = createIntentSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: payload.bookingId },
      include: {
        provider: {
          include: { providerProfile: true },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status !== "ACCEPTED") {
      return res.status(400).json({ error: "Booking must be accepted before payment" });
    }

    if (booking.paymentStatus === "PAID") {
      return res.status(400).json({ error: "Booking already paid" });
    }

    const providerProfile = booking.provider.providerProfile;
    if (!providerProfile?.stripeAccountId) {
      return res.status(400).json({ error: "Cleaner has not connected Stripe" });
    }

    const amount = booking.totalPrice;
    const feePercent =
      payload.applicationFeePercent ??
      Number(process.env.STRIPE_PLATFORM_FEE_PERCENT ?? "15");
    const applicationFeeAmount = Math.round((amount * feePercent) / 100);

    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "aud",
      customer: undefined,
      automatic_payment_methods: { enabled: true },
      transfer_data: {
        destination: providerProfile.stripeAccountId,
      },
      application_fee_amount: applicationFeeAmount,
      metadata: {
        bookingId: booking.id.toString(),
      },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentIntentId: intent.id, paymentStatus: "PENDING" },
    });

    res.json({ success: true, clientSecret: intent.client_secret });
  } catch (error) {
    console.error("Create payment intent failed", error);
    res.status(400).json({ error: "Unable to create payment intent" });
  }
});

router.post("/confirm-payment", async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  try {
    const payload = confirmPaymentSchema.parse(req.body);
    const booking = await prisma.booking.findUnique({
      where: { id: payload.bookingId },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        service: { select: { serviceName: true } },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.paymentStatus === "PAID") {
      return res.json({ success: true, paymentStatus: "PAID" });
    }

    if (!booking.paymentIntentId) {
      return res.status(400).json({ error: "No payment intent found for booking" });
    }

    const intent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);

    if (intent.status !== "succeeded") {
      return res.status(400).json({ error: "Payment not completed yet", stripeStatus: intent.status });
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: "PAID",
        paymentCaptured: true,
      },
    });

    if (booking.providerId) {
      await prisma.notification.create({
        data: {
          userId: booking.providerId,
          type: "PAYMENT_COMPLETED",
          title: "Payment received",
          message: `${booking.customer?.name ?? "Your client"} completed payment for ${booking.service?.serviceName ?? "a booking"}.`,
          link: "/provider/dashboard",
        },
      });
    }

    if (booking.provider?.email) {
      await sendPaymentReceivedEmail({
        to: booking.provider.email,
        providerName: booking.provider.name,
        customerName: booking.customer?.name ?? "Your client",
        serviceName: booking.service?.serviceName ?? "your service",
      });
    }

    res.json({ success: true, paymentStatus: "PAID" });
  } catch (error) {
    console.error("Confirm payment failed", error);
    res.status(400).json({ error: "Unable to verify payment" });
  }
});

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe webhook secret is not configured");
    return res.status(500).json({ error: "Webhook secret missing" });
  }

  const signature = req.headers["stripe-signature"] as string | undefined;
  if (!signature) {
    return res.status(400).send("Missing Stripe signature");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown webhook error";
    console.error("Stripe webhook signature verification failed", message);
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.bookingId;
        const parsedId = bookingId ? Number(bookingId) : NaN;
        if (!bookingId || Number.isNaN(parsedId)) break;

        const booking = await prisma.booking.findUnique({
          where: { id: parsedId },
          include: {
            customer: { select: { id: true, name: true, email: true } },
            provider: { select: { id: true, name: true, email: true } },
            service: { select: { serviceName: true } },
          },
        });

        if (!booking) break;
        if (booking.paymentStatus === "PAID") break;

        await prisma.booking.update({
          where: { id: booking.id },
          data: { paymentStatus: "PAID", paymentCaptured: true },
        });

        if (booking.providerId) {
          await prisma.notification.create({
            data: {
              userId: booking.providerId,
              type: "PAYMENT_COMPLETED",
              title: "Payment received",
              message: `${booking.customer?.name ?? "Your client"} completed payment for ${booking.service?.serviceName ?? "a booking"}.`,
              link: "/provider/dashboard",
            },
          });
        }

        if (booking.provider?.email) {
          await sendPaymentReceivedEmail({
            to: booking.provider.email,
            providerName: booking.provider.name,
            customerName: booking.customer?.name ?? "Your client",
            serviceName: booking.service?.serviceName ?? "your service",
          });
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.bookingId;
        const parsedId = bookingId ? Number(bookingId) : NaN;
        if (!bookingId || Number.isNaN(parsedId)) break;

        const booking = await prisma.booking.findUnique({
          where: { id: parsedId },
          include: {
            customer: { select: { id: true, name: true, email: true } },
          },
        });
        if (!booking) break;

        await prisma.booking.update({
          where: { id: booking.id },
          data: { paymentStatus: "PENDING" },
        });

        await prisma.notification.create({
          data: {
            userId: booking.customerId,
            type: "PAYMENT_FAILED",
            title: "Payment attempt failed",
            message: "Your recent payment attempt did not succeed. Please try another card.",
            link: `/payment?bookingId=${booking.id}`,
          },
        });

        if (booking.customer?.email) {
          await sendPaymentFailedEmail({
            to: booking.customer.email,
            customerName: booking.customer.name,
          });
        }
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handling failed", error);
    res.status(500).send("Webhook handler error");
  }
};

export default router;
