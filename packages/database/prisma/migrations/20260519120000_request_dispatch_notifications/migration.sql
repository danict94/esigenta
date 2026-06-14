-- CreateEnum
CREATE TYPE "RequestDispatchStatus" AS ENUM ('CREATED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CompanyNotificationType" AS ENUM ('NEW_REQUEST_AVAILABLE');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "RequestDispatch" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" "RequestDispatchStatus" NOT NULL DEFAULT 'CREATED',
    "matchedServiceIds" JSONB,
    "distanceKm" DOUBLE PRECISION,
    "matchReason" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyNotification" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "requestId" TEXT,
    "requestDispatchId" TEXT,
    "type" "CompanyNotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDelivery" (
    "id" TEXT NOT NULL,
    "requestDispatchId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "recipient" TEXT,
    "provider" TEXT,
    "providerMessageId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "nextAttemptAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RequestDispatch_requestId_companyId_key" ON "RequestDispatch"("requestId", "companyId");

-- CreateIndex
CREATE INDEX "RequestDispatch_requestId_createdAt_idx" ON "RequestDispatch"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "RequestDispatch_companyId_createdAt_idx" ON "RequestDispatch"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "RequestDispatch_status_createdAt_idx" ON "RequestDispatch"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CompanyNotification_companyId_readAt_createdAt_idx" ON "CompanyNotification"("companyId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "CompanyNotification_requestId_idx" ON "CompanyNotification"("requestId");

-- CreateIndex
CREATE INDEX "CompanyNotification_requestDispatchId_idx" ON "CompanyNotification"("requestDispatchId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDelivery_idempotencyKey_key" ON "NotificationDelivery"("idempotencyKey");

-- CreateIndex
CREATE INDEX "NotificationDelivery_requestDispatchId_idx" ON "NotificationDelivery"("requestDispatchId");

-- CreateIndex
CREATE INDEX "NotificationDelivery_status_nextAttemptAt_idx" ON "NotificationDelivery"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "NotificationDelivery_channel_status_idx" ON "NotificationDelivery"("channel", "status");

-- AddForeignKey
ALTER TABLE "RequestDispatch" ADD CONSTRAINT "RequestDispatch_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDispatch" ADD CONSTRAINT "RequestDispatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyNotification" ADD CONSTRAINT "CompanyNotification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyNotification" ADD CONSTRAINT "CompanyNotification_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyNotification" ADD CONSTRAINT "CompanyNotification_requestDispatchId_fkey" FOREIGN KEY ("requestDispatchId") REFERENCES "RequestDispatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_requestDispatchId_fkey" FOREIGN KEY ("requestDispatchId") REFERENCES "RequestDispatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
