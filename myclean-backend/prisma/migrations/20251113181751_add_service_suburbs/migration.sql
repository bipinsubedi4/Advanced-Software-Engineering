-- AlterTable
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "serviceSuburbs" TEXT[] DEFAULT ARRAY[]::TEXT[];

