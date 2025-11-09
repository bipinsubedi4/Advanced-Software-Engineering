-- CreateEnum
CREATE TYPE "PublicJobStatus" AS ENUM ('BIDDING', 'CLOSED');

-- CreateEnum
CREATE TYPE "PublicJobBidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RecurringFrequency" AS ENUM ('ONE_TIME', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paymentCaptured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentIntentId" TEXT,
ADD COLUMN     "publicJobId" INTEGER,
ADD COLUMN     "recurringJobId" INTEGER;

-- AlterTable
ALTER TABLE "ProviderProfile" ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeChargesEnabledAt" TIMESTAMP(3),
ADD COLUMN     "verificationDocumentUrl" TEXT,
ADD COLUMN     "verificationReviewedAt" TIMESTAMP(3),
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
ADD COLUMN     "verificationSubmittedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PublicJob" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3),
    "preferredStartTime" TEXT,
    "preferredEndTime" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "status" "PublicJobStatus" NOT NULL DEFAULT 'BIDDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicJobBid" (
    "id" SERIAL NOT NULL,
    "publicJobId" INTEGER NOT NULL,
    "cleanerId" INTEGER NOT NULL,
    "message" TEXT,
    "proposedPrice" INTEGER,
    "status" "PublicJobBidStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicJobBid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringJob" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "frequency" "RecurringFrequency" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "notes" TEXT,
    "nextOccurrence" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CleanerAvailability" (
    "id" SERIAL NOT NULL,
    "cleanerId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CleanerAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CleanerAvailability_cleanerId_dayOfWeek_idx" ON "CleanerAvailability"("cleanerId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_publicJobId_fkey" FOREIGN KEY ("publicJobId") REFERENCES "PublicJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_recurringJobId_fkey" FOREIGN KEY ("recurringJobId") REFERENCES "RecurringJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicJob" ADD CONSTRAINT "PublicJob_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicJobBid" ADD CONSTRAINT "PublicJobBid_publicJobId_fkey" FOREIGN KEY ("publicJobId") REFERENCES "PublicJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicJobBid" ADD CONSTRAINT "PublicJobBid_cleanerId_fkey" FOREIGN KEY ("cleanerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringJob" ADD CONSTRAINT "RecurringJob_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringJob" ADD CONSTRAINT "RecurringJob_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringJob" ADD CONSTRAINT "RecurringJob_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ProviderService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleanerAvailability" ADD CONSTRAINT "CleanerAvailability_cleanerId_fkey" FOREIGN KEY ("cleanerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

