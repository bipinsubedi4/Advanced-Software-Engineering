# Mock Payment Gateway

Because this is a university project, the production Stripe integration was replaced with a lightweight mock gateway. It keeps the same end-to-end booking behaviour (providers only start work once payment is marked as complete) without needing real API keys.

## How it works

1. **Provider accepts a booking** – the backend sets the booking to `ACCEPTED` and sends the usual in-app notification plus an optional email reminder that payment is required.
2. **Customer opens `/payment?bookingId=<id>`** – the UI displays a simple card form explaining that it is for demonstration only.
3. **Customer submits the form** – the frontend calls `POST /api/stripe/mock/checkout` with the booking id. The backend:
   - validates the booking is still `ACCEPTED`
   - sets `paymentStatus` to `PAID`
   - notifies the provider (and emails them if SMTP is configured)
4. **Provider dashboard updates** – the “Mark as Complete” button becomes active once payment is marked as `PAID`.

No real card data is sent anywhere; everything stays inside the app.

## Testing locally

1. Ensure the backend is running on port 4000 and the frontend on 3000.
2. Log in as a customer, create a booking request, then accept it from a provider account (or use the seed users).
3. Visit `/payment?bookingId=<id>` as the customer, keep the default mock card values, and click **Mark as paid**.
4. Return to **My Bookings** or the provider dashboard to see the updated payment status.

## Optional email setup

If you want mock payments to trigger real emails, populate the following env vars in `myclean-backend/.env`:

```
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="MyClean <notifications@myclean.app>"
APP_BASE_URL=http://localhost:3000
```

Without SMTP credentials the backend simply logs a warning and skips the email step, while in-app notifications still fire.
