-- CreateEnum
CREATE TYPE "CreditRefundRequestStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CreditRefundRequestReason" AS ENUM ('CUSTOMER_NOT_RESPONDING', 'INVALID_CONTACTS', 'REQUEST_ALREADY_RESOLVED', 'INVALID_OR_SPAM_REQUEST', 'DUPLICATE_REQUEST', 'OTHER');

-- CreateTable
CREATE TABLE "CreditRefundRequest" (
    "id" TEXT NOT NULL,
    "requestUnlockId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "creditTransactionId" TEXT NOT NULL,
    "status" "CreditRefundRequestStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reason" "CreditRefundRequestReason" NOT NULL,
    "description" TEXT NOT NULL,
    "companyContactAttempted" BOOLEAN NOT NULL DEFAULT false,
    "lastContactAttemptAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedByAdminUserId" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditRefundRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditRefundRequest_requestUnlockId_key" ON "CreditRefundRequest"("requestUnlockId");

-- CreateIndex
CREATE INDEX "CreditRefundRequest_status_createdAt_idx" ON "CreditRefundRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CreditRefundRequest_companyId_createdAt_idx" ON "CreditRefundRequest"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "CreditRefundRequest_requestId_idx" ON "CreditRefundRequest"("requestId");

-- CreateIndex
CREATE INDEX "CreditRefundRequest_reviewedByAdminUserId_idx" ON "CreditRefundRequest"("reviewedByAdminUserId");

-- AddForeignKey
ALTER TABLE "CreditRefundRequest" ADD CONSTRAINT "CreditRefundRequest_requestUnlockId_fkey" FOREIGN KEY ("requestUnlockId") REFERENCES "RequestUnlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditRefundRequest" ADD CONSTRAINT "CreditRefundRequest_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditRefundRequest" ADD CONSTRAINT "CreditRefundRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditRefundRequest" ADD CONSTRAINT "CreditRefundRequest_creditTransactionId_fkey" FOREIGN KEY ("creditTransactionId") REFERENCES "CompanyCreditTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditRefundRequest" ADD CONSTRAINT "CreditRefundRequest_reviewedByAdminUserId_fkey" FOREIGN KEY ("reviewedByAdminUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
