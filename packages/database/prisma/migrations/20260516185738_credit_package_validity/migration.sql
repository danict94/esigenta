-- AlterEnum
ALTER TYPE "CreditTransactionType" ADD VALUE 'CREDIT_EXPIRATION';

-- AlterTable
ALTER TABLE "CompanyCreditAccount" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CompanyCreditTransaction" ADD COLUMN     "balanceBefore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "expiresAtAfter" TIMESTAMP(3),
ADD COLUMN     "expiresAtBefore" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CreditOrder" ADD COLUMN     "validFrom" TIMESTAMP(3),
ADD COLUMN     "validUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CreditPackage" ADD COLUMN     "validityDays" INTEGER NOT NULL DEFAULT 30;

-- CreateIndex
CREATE INDEX "CompanyCreditAccount_expiresAt_idx" ON "CompanyCreditAccount"("expiresAt");

-- CreateIndex
CREATE INDEX "CreditOrder_validUntil_idx" ON "CreditOrder"("validUntil");

-- CreateIndex
CREATE INDEX "CreditPackage_status_validityDays_idx" ON "CreditPackage"("status", "validityDays");
