-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'SUSPENDED', 'BLOCKED');

-- AddColumns
ALTER TABLE "Company"
  ADD COLUMN "status" "CompanyStatus",
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "suspendedAt" TIMESTAMP(3),
  ADD COLUMN "blockedAt" TIMESTAMP(3);

-- Backfill existing companies as already approved because they were previously
-- able to buy credits and use marketplace flows without an approval gate.
UPDATE "Company"
SET
  "status" = 'APPROVED',
  "approvedAt" = COALESCE("approvedAt", "createdAt")
WHERE "status" IS NULL;

-- Future companies enter review until an admin approves them.
ALTER TABLE "Company"
  ALTER COLUMN "status" SET DEFAULT 'PENDING_REVIEW',
  ALTER COLUMN "status" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Company_status_idx" ON "Company"("status");
