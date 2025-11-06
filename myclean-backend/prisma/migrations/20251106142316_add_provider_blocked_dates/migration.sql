-- CreateTable
CREATE TABLE "ProviderBlockedDate" (
    "id" SERIAL PRIMARY KEY,
    "providerId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    CONSTRAINT "ProviderBlockedDate_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProviderProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "idx_provider_blocked_date" ON "ProviderBlockedDate"("providerId", "date");
