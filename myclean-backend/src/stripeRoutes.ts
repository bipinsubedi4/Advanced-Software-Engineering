import { Router } from "express";
import Stripe from "stripe";
import { prisma } from "./prisma";
import { z } from "zod";

const router = Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.warn("⚠️ STRIPE_SECRET_KEY is not defined. Stripe routes will fail.");
}

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" })
  : null;

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

export default router;
