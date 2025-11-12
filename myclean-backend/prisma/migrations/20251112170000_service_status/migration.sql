DO $$ BEGIN
  CREATE TYPE "ServiceStatus" AS ENUM ('PENDING','APPROVED','REJECTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "ProviderProfile" ALTER COLUMN "isVerified" SET DEFAULT TRUE;

ALTER TABLE "ProviderService" ADD COLUMN IF NOT EXISTS "status" "ServiceStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "ProviderService" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

UPDATE "ProviderService" SET "status" = 'APPROVED' WHERE "status" IS NULL;

CREATE INDEX IF NOT EXISTS "ProviderService_status_idx" ON "ProviderService"("status");
