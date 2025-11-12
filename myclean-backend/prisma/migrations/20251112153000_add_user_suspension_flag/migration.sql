-- Add isSuspended flag to users so admins can disable accounts
ALTER TABLE "User"
ADD COLUMN "isSuspended" BOOLEAN NOT NULL DEFAULT FALSE;
