-- DropIndex
DROP INDEX "public"."EmailJob_status_idx";

-- AlterTable
ALTER TABLE "EmailJob" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProviderProfile" ALTER COLUMN "averageRating" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasCustomerAccount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasProviderAccount" BOOLEAN NOT NULL DEFAULT false;
