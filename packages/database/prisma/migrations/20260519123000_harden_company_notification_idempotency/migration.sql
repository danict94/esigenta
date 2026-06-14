-- Partial unique index for CompanyNotification dispatch idempotency.
-- Prisma schema cannot represent partial unique indexes directly.
CREATE UNIQUE INDEX "CompanyNotification_dispatch_type_unique_idx"
ON "CompanyNotification"("requestDispatchId", "type")
WHERE "requestDispatchId" IS NOT NULL;
