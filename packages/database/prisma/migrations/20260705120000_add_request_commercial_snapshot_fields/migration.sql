-- AlterTable: commercial snapshot + admin override attribution for Request, additive only.
-- `commercialSnapshot` is the monetization snapshot from deriveLeadValue (kept
-- separate from `structuredData`). The override columns follow the same flat
-- attribution pattern as archive / soft-delete (…At / …ByAdminUserId / …Reason).
ALTER TABLE "Request"
ADD COLUMN "commercialSnapshot" JSONB,
ADD COLUMN "commercialOverriddenAt" TIMESTAMP(3),
ADD COLUMN "commercialOverriddenByAdminUserId" TEXT,
ADD COLUMN "commercialOverrideReason" TEXT;

-- CreateIndex
CREATE INDEX "Request_commercialOverriddenByAdminUserId_idx" ON "Request"("commercialOverriddenByAdminUserId");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_commercialOverriddenByAdminUserId_fkey" FOREIGN KEY ("commercialOverriddenByAdminUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
