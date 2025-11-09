# Stripe Webhook & Email Setup

## 1. Configure the Stripe webhook

1. **Create the webhook endpoint**
   - In the Stripe Dashboard go to *Developers → Webhooks → Add endpoint*.
   - Set the URL to `https://<your-backend-domain>/api/stripe/webhook` (use `http://localhost:4000/api/stripe/webhook` for local testing).
   - Select the following events (minimum):
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Save the endpoint and copy the **Signing secret** value.

2. **Set the signing secret**
   - Add the secret to the backend environment as `STRIPE_WEBHOOK_SECRET`.
   - Example `.env` entry:
     ```env
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```

3. **Local development via Stripe CLI**
   - Install the Stripe CLI and run:
     ```bash
     stripe login
     stripe listen --forward-to http://localhost:4000/api/stripe/webhook
     ```
   - Copy the `webhook signing secret` shown in the CLI output and place it in your `.env` before testing.

## 2. Configure transactional email

1. Provision an SMTP inbox (e.g., SendGrid, Mailgun, Gmail SMTP).
2. Add the following variables to `myclean-backend/.env`:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=<actual-key>
   EMAIL_FROM="MyClean <notifications@myclean.app>"
   APP_BASE_URL=https://myclean.app   # used in email links
   ```
3. Redeploy / restart the backend so the transporter is initialised with the new credentials.
4. Optional: set `EMAIL_ENABLED=false` to disable email sending in environments where SMTP isn’t available.

Once both items are configured, payment reminders and payment status emails will be delivered automatically while the webhook keeps booking records in sync with Stripe.
