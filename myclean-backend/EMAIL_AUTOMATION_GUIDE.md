# Email Automation System - Implementation Guide

## ✅ What's Already Implemented

Your MyClean platform now has a **complete email automation system** with:

### 1. Welcome Email (Gmail Customers Only)
- ✅ **Trigger**: Automatically sent when a customer signs up with a @gmail.com email
- ✅ **Filtering**: Only sent to customers (not providers/admins) with Gmail addresses
- ✅ **No Duplicate Sends**: Only triggers on signup, never on login
- ✅ **Content**: Personalized greeting with "Find a Cleaner" CTA

**Subject**: `Welcome to MyClean! Let's make your first booking ✨`

**Email Preview**:
```
Hi [FirstName],

Welcome to MyClean — your trusted platform for booking reliable cleaning services!

You can start by finding local cleaning professionals and booking services that fit your schedule.

We're glad to have you on board!

[Find a Cleaner Button] → /search
```

### 2. Booking Confirmation Email
- ✅ **Trigger**: Automatically sent when a customer creates a booking
- ✅ **Content**: Cleaner name, service, date & time, price, booking ID
- ✅ **Both Parties**: Sends separate emails to customer and provider

**Subject**: `Your MyClean Booking is Confirmed! 🧼`

**Email Preview**:
```
Hi [CustomerName],

Your cleaning booking is confirmed! 🎉

Here are the details:

- Cleaner: [CleanerName]
- Service: [ServiceName]
- Date & Time: [BookingDateTime]
- Price: $[Amount]
- Location: [Address]
- Booking ID: #[ID]

Thank you for choosing MyClean!
We'll send a reminder before your scheduled time.

[View Booking Details Button]
```

## 🏗️ System Architecture

### Email Queue System
The platform uses a **job queue** for reliable email delivery:

1. **Queue Email** → Email is added to database queue
2. **Background Worker** → Processes queue every 15 seconds
3. **Retry Logic** → Auto-retries failed emails (5min, 15min, 60min)
4. **Status Tracking** → PENDING → PROCESSING → SENT/FAILED

### Email Templates
All emails use a **professional, responsive HTML template** with:
- Mobile-friendly design
- Brand colors (indigo accent: #2563eb)
- Consistent layout and styling
- Plain text fallback for accessibility

## 🔧 Configuration

### 1. SMTP Setup (Required for Production)

#### Option A: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update `.env`**:
```bash
EMAIL_ENABLED=true
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="xxxx xxxx xxxx xxxx"  # App password from step 2
EMAIL_FROM="MyClean <noreply@myclean.app>"
APP_BASE_URL="https://myclean-project.vercel.app"
```

#### Option B: SendGrid (Recommended for Production)

```bash
EMAIL_ENABLED=true
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
EMAIL_FROM="MyClean <noreply@yourdomain.com>"
```

#### Option C: AWS SES

```bash
EMAIL_ENABLED=true
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT=587
SMTP_USER="your-ses-access-key"
SMTP_PASS="your-ses-secret-key"
EMAIL_FROM="MyClean <noreply@yourdomain.com>"
```

### 2. Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EMAIL_ENABLED` | Yes | `false` | Set to `true` to enable emails |
| `SMTP_HOST` | Yes | - | SMTP server hostname |
| `SMTP_PORT` | Yes | `587` | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_USER` | Yes | - | SMTP username |
| `SMTP_PASS` | Yes | - | SMTP password |
| `EMAIL_FROM` | Yes | - | Sender email address with name |
| `APP_BASE_URL` | Yes | - | Your frontend URL (for email links) |
| `BRAND_NAME` | No | `MyClean` | Your brand name |
| `SUPPORT_EMAIL` | No | `support@myclean.app` | Support email |
| `EMAIL_QUEUE_MAX_ATTEMPTS` | No | `4` | Max retry attempts |
| `EMAIL_QUEUE_INTERVAL_MS` | No | `15000` | Queue check interval (ms) |
| `DISABLE_EMAIL_QUEUE` | No | `false` | Disable background worker |

### 3. Railway Deployment

Add these environment variables in Railway dashboard:

```bash
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=MyClean <noreply@myclean.app>
APP_BASE_URL=https://myclean-project.vercel.app
```

## 🧪 Testing

### Test Welcome Email

```bash
# 1. Sign up with a Gmail address
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "password": "test123",
    "role": "CUSTOMER"
  }'

# ✅ Should receive welcome email
# ❌ Non-Gmail addresses will NOT receive email
```

### Test Booking Confirmation

```bash
# 1. Create a booking
curl -X POST http://localhost:4000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "providerId": 2,
    "serviceId": 5,
    "bookingDate": "2025-01-20",
    "startTime": "10:00",
    "endTime": "12:00",
    "address": "123 Main St",
    "city": "Brisbane",
    "state": "QLD",
    "zipCode": "4000",
    "totalPrice": 8000
  }'

# ✅ Both customer and provider should receive emails
```

### Test Email Queue

```bash
# Check email queue status
SELECT * FROM "EmailJob" ORDER BY "createdAt" DESC;

# Retry failed emails manually
npm run email:process
```

### Enable Debug Logging

```bash
# Add to .env for detailed email logs
DEBUG=nodemailer*
```

## 📊 Database Tables

### EmailJob Table
Tracks all queued and sent emails:

```sql
CREATE TABLE "EmailJob" (
  id SERIAL PRIMARY KEY,
  to VARCHAR NOT NULL,
  template VARCHAR NOT NULL,
  payload JSONB NOT NULL,
  subject VARCHAR NOT NULL,
  status VARCHAR NOT NULL, -- PENDING, PROCESSING, SENT, FAILED
  scheduledFor TIMESTAMP NOT NULL,
  sentAt TIMESTAMP,
  attemptCount INTEGER DEFAULT 0,
  maxAttempts INTEGER DEFAULT 4,
  lastError TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## 🎨 Email Templates Available

| Template | Trigger | Recipients |
|----------|---------|------------|
| `WELCOME` | User signup (Gmail only for customers) | Customer/Provider |
| `BOOKING_CONFIRM_CUSTOMER` | Booking created | Customer |
| `BOOKING_CONFIRM_PROVIDER` | Booking created | Provider |
| `BOOKING_REMINDER_CUSTOMER` | 24h/2h before booking | Customer |
| `BOOKING_REMINDER_PROVIDER` | 24h/2h before booking | Provider |
| `PAYMENT_REMINDER_CUSTOMER` | Payment pending | Customer |
| `PAYMENT_RECEIVED_PROVIDER` | Payment completed | Provider |
| `BOOKING_RECEIPT_CUSTOMER` | Booking completed | Customer |

## 🔐 Security & Safety

### Error Handling
- ✅ All email operations wrapped in try-catch
- ✅ Failures logged but don't crash the API
- ✅ Automatic retry logic for transient failures

### Privacy
- ✅ Emails only sent to verified addresses
- ✅ No sensitive data in email logs
- ✅ Unsubscribe links (can be added later)

### Rate Limiting
- Batch size: 20 emails per cycle (configurable)
- Interval: 15 seconds between batches
- Prevents SMTP rate limit issues

## 📝 Adding New Email Templates

### Step 1: Add Template to Prisma Schema

```prisma
enum EmailTemplate {
  WELCOME
  BOOKING_CONFIRM_CUSTOMER
  BOOKING_CONFIRM_PROVIDER
  YOUR_NEW_TEMPLATE  // Add here
}
```

### Step 2: Define Template Payload

```typescript
// In templates.ts
export type TemplatePayloads = {
  // ... existing
  YOUR_NEW_TEMPLATE: {
    userName: string;
    customField: string;
  };
};
```

### Step 3: Create Template Definition

```typescript
// In templates.ts templateDefinitions
YOUR_NEW_TEMPLATE: {
  subject: ({ userName }) => `Hello ${userName}!`,
  preview: () => 'Preview text here',
  build: (payload) => ({
    title: 'Email Title',
    intro: 'Introduction paragraph...',
    sections: ['Section 1 content', 'Section 2 content'],
    cta: {
      label: 'Call to Action',
      url: `${APP_BASE_URL}/some-page`,
    },
  }),
  text: (payload) => `Plain text version...`,
},
```

### Step 4: Queue the Email

```typescript
// Anywhere in your API
import { queueEmail } from './email/emailService';
import { EmailTemplate } from '@prisma/client';

await queueEmail({
  to: 'user@example.com',
  template: EmailTemplate.YOUR_NEW_TEMPLATE,
  payload: {
    userName: 'John',
    customField: 'value',
  },
});
```

## 🚀 Production Checklist

- [ ] SMTP credentials configured in Railway
- [ ] `EMAIL_ENABLED=true` in production
- [ ] `APP_BASE_URL` points to production frontend
- [ ] Email queue worker is running (check logs)
- [ ] Test signup with Gmail account
- [ ] Test booking creation
- [ ] Monitor email queue for failures
- [ ] Set up domain authentication (SPF/DKIM) for better deliverability
- [ ] Consider upgrading to SendGrid/AWS SES for production

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check `.env` configuration**:
```bash
echo $EMAIL_ENABLED  # Should be 'true'
echo $SMTP_HOST      # Should be your SMTP server
```

2. **Check email queue**:
```sql
SELECT status, COUNT(*) FROM "EmailJob" GROUP BY status;
```

3. **Check logs**:
```bash
# Look for email worker logs
grep "Email queue worker" logs.txt
grep "Failed to deliver email" logs.txt
```

4. **Test SMTP connection**:
```bash
# Install nodemailer-cli
npm install -g nodemailer-cli

# Test connection
nodemailer-send --host smtp.gmail.com --port 587 \
  --user your-email@gmail.com --pass your-app-password \
  --from "Test <test@example.com>" --to your-email@gmail.com \
  --subject "Test" --text "Testing SMTP"
```

### Gmail "Less Secure Apps" Error

✅ **Solution**: Use App Password (not regular password)
1. Enable 2FA on Gmail
2. Generate app-specific password
3. Use that password in SMTP_PASS

### Emails Going to Spam

1. **Set up SPF record**:
```
v=spf1 include:_spf.google.com ~all
```

2. **Set up DKIM** (in Gmail/SendGrid dashboard)

3. **Use custom domain** for EMAIL_FROM instead of Gmail

4. **Warm up your IP** (gradually increase sending volume)

## 📈 Monitoring

### Email Queue Health

```sql
-- Pending emails (should be low)
SELECT COUNT(*) FROM "EmailJob" WHERE status = 'PENDING';

-- Failed emails (investigate these)
SELECT * FROM "EmailJob" WHERE status = 'FAILED' ORDER BY "updatedAt" DESC LIMIT 10;

-- Success rate (last 24h)
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM "EmailJob"
WHERE "createdAt" > NOW() - INTERVAL '24 hours'
GROUP BY status;
```

### Performance Metrics

```sql
-- Average delivery time
SELECT AVG(EXTRACT(EPOCH FROM ("sentAt" - "createdAt"))) as avg_seconds
FROM "EmailJob"
WHERE status = 'SENT' AND "sentAt" IS NOT NULL;
```

## 🆘 Support

For issues or questions:
- Check logs: `docker logs myclean-backend` or Railway logs
- Review EmailJob table for failed emails
- Test SMTP connection manually
- Contact: support@myclean.app

---

**Implementation Status**: ✅ Complete  
**Last Updated**: November 14, 2024  
**Version**: 1.0

