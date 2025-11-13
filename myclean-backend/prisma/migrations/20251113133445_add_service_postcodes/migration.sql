-- AlterTable
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "servicePostcodes" TEXT[] DEFAULT ARRAY[]::TEXT[];

