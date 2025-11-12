# MyClean Admin Dashboard

Standalone React + Vite application that gives MyClean administrators a real‑time view of platform activity. The dashboard consumes the secured `/api/admin/*` endpoints that live in `myclean-backend`.

## Available scripts

```bash
# install dependencies
npm install

# start dev server (http://localhost:5173 by default)
npm run dev

# type-check + build production bundle
npm run build

# preview build locally
npm run preview
```

## Environment variables

Create a `.env` file in `myclean-admin` if you need to override the backend URL:

```env
VITE_API_BASE_URL=https://advanced-software-engineering-production.up.railway.app
```

If not provided, the app defaults to `http://localhost:4000`.

## Authentication

The dashboard reuses the existing `/api/auth/login` endpoint. Only accounts with the `ADMIN` role can sign in:

1. Enter admin credentials on the login screen.
2. A JWT is stored in `localStorage` and attached to every subsequent API request.
3. Use the logout button in the top-right corner to clear the session.

## Features

- **Overview metrics** – total users, customers, providers, bookings, live activity, and monthly revenue.
- **Recent bookings** – customer/provider pairs, payment status, totals.
- **User explorer** – email verification + registration status at a glance.
- **Provider explorer** – verification state, booking counts, ratings, service radius.

The layout is intentionally minimal so you can extend it with charts, filters, or moderation flows as requirements evolve.
