-- CreateEnum
CREATE TYPE "CreditLotSource" AS ENUM ('PACKAGE_PURCHASE', 'REFUND', 'ADMIN_ADJUSTMENT', 'LEGACY_MIGRATION');

-- CreateEnum
CREATE TYPE "CreditLotStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CONSUMED');

-- CreateTable
CREATE TABLE "CreditLot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "creditOrderId" TEXT,
    "source" "CreditLotSource" NOT NULL,
    "quantityInitial" INTEGER NOT NULL,
    "quantityRemaining" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "CreditLotStatus" NOT NULL DEFAULT 'ACTIVE',
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditLotConsumption" (
    "id" TEXT NOT NULL,
    "creditLotId" TEXT NOT NULL,
    "creditTransactionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditLotConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditLot_idempotencyKey_key" ON "CreditLot"("idempotencyKey");

-- CreateIndex
CREATE INDEX "CreditLot_companyId_status_expiresAt_idx" ON "CreditLot"("companyId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "CreditLot_creditOrderId_idx" ON "CreditLot"("creditOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditLotConsumption_creditLotId_creditTransactionId_key" ON "CreditLotConsumption"("creditLotId", "creditTransactionId");

-- CreateIndex
CREATE INDEX "CreditLotConsumption_creditLotId_idx" ON "CreditLotConsumption"("creditLotId");

-- CreateIndex
CREATE INDEX "CreditLotConsumption_creditTransactionId_idx" ON "CreditLotConsumption"("creditTransactionId");

-- AddForeignKey
ALTER TABLE "CreditLot" ADD CONSTRAINT "CreditLot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLot" ADD CONSTRAINT "CreditLot_creditOrderId_fkey" FOREIGN KEY ("creditOrderId") REFERENCES "CreditOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLotConsumption" ADD CONSTRAINT "CreditLotConsumption_creditLotId_fkey" FOREIGN KEY ("creditLotId") REFERENCES "CreditLot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLotConsumption" ADD CONSTRAINT "CreditLotConsumption_creditTransactionId_fkey" FOREIGN KEY ("creditTransactionId") REFERENCES "CompanyCreditTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: backfill pre-FEFO pooled balances into individual credit lots
-- Only companies with a positive, non-expired balance get an ACTIVE lot.
-- creditOrderId is intentionally NULL: the old pooled balance was never
-- attributable to a single purchase, so LEGACY_MIGRATION lots are honest
-- about not having one.
INSERT INTO "CreditLot" (
    "id", "companyId", "creditOrderId", "source",
    "quantityInitial", "quantityRemaining", "expiresAt", "status",
    "idempotencyKey", "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid()::text,
    a."companyId",
    NULL,
    'LEGACY_MIGRATION',
    a."balance",
    a."balance",
    a."expiresAt",
    'ACTIVE',
    'credit-lot:legacy-migration:' || a."companyId",
    now(),
    now()
FROM "CompanyCreditAccount" a
WHERE a."balance" > 0
  AND a."expiresAt" IS NOT NULL
  AND a."expiresAt" > now()
ON CONFLICT ("idempotencyKey") DO NOTHING;

-- DataMigration: defensive cleanup for accounts with a positive balance but a
-- missing/already-past expiresAt (should not exist under app invariants, but
-- the existing lazy-expiration code would have zeroed these on next read
-- anyway). No lot is created for genuinely expired balances.
UPDATE "CompanyCreditAccount"
SET "balance" = 0, "expiresAt" = NULL, "updatedAt" = now()
WHERE "balance" > 0
  AND ("expiresAt" IS NULL OR "expiresAt" <= now());

-- DataMigration: re-sync the now-cached CompanyCreditAccount.balance/expiresAt
-- columns from the freshly created lots. From this point on these two columns
-- are a maintained read cache (kept in sync by packages/billing on every
-- lot-mutating operation), not the source of truth. expiresAt is the MAX
-- (latest) active lot expiry, not the nearest one: this guarantees that any
-- code outside packages/billing still doing a naive
-- "expiresAt <= now => balance is 0" check (see packages/domain
-- get-profile-page.ts) only fires once ALL lots have genuinely expired.
UPDATE "CompanyCreditAccount" a
SET
    "balance" = COALESCE(lot_summary.total_remaining, 0),
    "expiresAt" = lot_summary.max_expires_at,
    "updatedAt" = now()
FROM (
    SELECT
        "companyId",
        SUM("quantityRemaining") AS total_remaining,
        MAX("expiresAt") AS max_expires_at
    FROM "CreditLot"
    WHERE "status" = 'ACTIVE'
    GROUP BY "companyId"
) AS lot_summary
WHERE a."companyId" = lot_summary."companyId";
