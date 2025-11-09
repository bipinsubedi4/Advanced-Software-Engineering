-- Create EmailJobStatus enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmailJobStatus') THEN
        CREATE TYPE "EmailJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');
    END IF;
END$$;

-- Create EmailTemplate enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmailTemplate') THEN
        CREATE TYPE "EmailTemplate" AS ENUM (
            'WELCOME',
            'BOOKING_CONFIRM_CUSTOMER',
            'BOOKING_CONFIRM_PROVIDER',
            'BOOKING_REMINDER_CUSTOMER',
            'BOOKING_REMINDER_PROVIDER',
            'BOOKING_RECEIPT_CUSTOMER',
            'PAYMENT_REMINDER_CUSTOMER',
            'PAYMENT_RECEIVED_PROVIDER'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS "EmailJob" (
    "id" SERIAL PRIMARY KEY,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" "EmailTemplate" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "EmailJobStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "lastError" TEXT,
    "scheduledFor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "EmailJob_status_idx" ON "EmailJob" ("status", "scheduledFor");
