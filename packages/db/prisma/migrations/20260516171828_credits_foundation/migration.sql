-- CreateEnum
CREATE TYPE "CreditPackageStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CreditOrderStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('PACKAGE_PURCHASE', 'REQUEST_UNLOCK', 'ADMIN_ADJUSTMENT', 'REFUND');

-- CreateEnum
CREATE TYPE "CreditTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED');

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "maxUnlocks" INTEGER,
ADD COLUMN     "unlockCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CreditPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "credits" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "CreditPackageStatus" NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCreditAccount" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyCreditAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditOrder" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "packageId" TEXT,
    "status" "CreditOrderStatus" NOT NULL DEFAULT 'PENDING',
    "credits" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "provider" TEXT,
    "providerCheckoutId" TEXT,
    "providerPaymentIntentId" TEXT,
    "providerEventId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCreditTransaction" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" "CreditTransactionType" NOT NULL,
    "status" "CreditTransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "requestId" TEXT,
    "creditOrderId" TEXT,
    "relatedTransactionId" TEXT,
    "adminUserId" TEXT,
    "reason" TEXT,
    "metadata" JSONB,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyCreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestUnlock" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "creditCost" INTEGER NOT NULL,
    "creditTransactionId" TEXT NOT NULL,
    "refundedAt" TIMESTAMP(3),
    "refundTransactionId" TEXT,
    "refundReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreditPackage_status_sortOrder_idx" ON "CreditPackage"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "CreditPackage_createdAt_idx" ON "CreditPackage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCreditAccount_companyId_key" ON "CompanyCreditAccount"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditOrder_providerCheckoutId_key" ON "CreditOrder"("providerCheckoutId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditOrder_providerPaymentIntentId_key" ON "CreditOrder"("providerPaymentIntentId");

-- CreateIndex
CREATE INDEX "CreditOrder_companyId_status_idx" ON "CreditOrder"("companyId", "status");

-- CreateIndex
CREATE INDEX "CreditOrder_packageId_idx" ON "CreditOrder"("packageId");

-- CreateIndex
CREATE INDEX "CreditOrder_createdAt_idx" ON "CreditOrder"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCreditTransaction_relatedTransactionId_key" ON "CompanyCreditTransaction"("relatedTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCreditTransaction_idempotencyKey_key" ON "CompanyCreditTransaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "CompanyCreditTransaction_companyId_createdAt_idx" ON "CompanyCreditTransaction"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "CompanyCreditTransaction_accountId_createdAt_idx" ON "CompanyCreditTransaction"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "CompanyCreditTransaction_requestId_idx" ON "CompanyCreditTransaction"("requestId");

-- CreateIndex
CREATE INDEX "CompanyCreditTransaction_creditOrderId_idx" ON "CompanyCreditTransaction"("creditOrderId");

-- CreateIndex
CREATE INDEX "CompanyCreditTransaction_type_status_idx" ON "CompanyCreditTransaction"("type", "status");

-- CreateIndex
CREATE INDEX "CompanyCreditTransaction_adminUserId_idx" ON "CompanyCreditTransaction"("adminUserId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestUnlock_creditTransactionId_key" ON "RequestUnlock"("creditTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestUnlock_refundTransactionId_key" ON "RequestUnlock"("refundTransactionId");

-- CreateIndex
CREATE INDEX "RequestUnlock_requestId_createdAt_idx" ON "RequestUnlock"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "RequestUnlock_companyId_createdAt_idx" ON "RequestUnlock"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "RequestUnlock_refundedAt_idx" ON "RequestUnlock"("refundedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RequestUnlock_requestId_companyId_key" ON "RequestUnlock"("requestId", "companyId");

-- CreateIndex
CREATE INDEX "Request_status_creditCost_idx" ON "Request"("status", "creditCost");

-- CreateIndex
CREATE INDEX "Request_unlockCount_idx" ON "Request"("unlockCount");

-- AddForeignKey
ALTER TABLE "CompanyCreditAccount" ADD CONSTRAINT "CompanyCreditAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditOrder" ADD CONSTRAINT "CreditOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditOrder" ADD CONSTRAINT "CreditOrder_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "CreditPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCreditTransaction" ADD CONSTRAINT "CompanyCreditTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCreditTransaction" ADD CONSTRAINT "CompanyCreditTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CompanyCreditAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCreditTransaction" ADD CONSTRAINT "CompanyCreditTransaction_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCreditTransaction" ADD CONSTRAINT "CompanyCreditTransaction_creditOrderId_fkey" FOREIGN KEY ("creditOrderId") REFERENCES "CreditOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCreditTransaction" ADD CONSTRAINT "CompanyCreditTransaction_relatedTransactionId_fkey" FOREIGN KEY ("relatedTransactionId") REFERENCES "CompanyCreditTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCreditTransaction" ADD CONSTRAINT "CompanyCreditTransaction_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestUnlock" ADD CONSTRAINT "RequestUnlock_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestUnlock" ADD CONSTRAINT "RequestUnlock_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestUnlock" ADD CONSTRAINT "RequestUnlock_creditTransactionId_fkey" FOREIGN KEY ("creditTransactionId") REFERENCES "CompanyCreditTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestUnlock" ADD CONSTRAINT "RequestUnlock_refundTransactionId_fkey" FOREIGN KEY ("refundTransactionId") REFERENCES "CompanyCreditTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
