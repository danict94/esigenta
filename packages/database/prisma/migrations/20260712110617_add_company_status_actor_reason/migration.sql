-- AlterTable: audit fields for Company approve/suspend/block actions, additive only.
-- Single generic pair (not one per action) — approvedAt/suspendedAt/blockedAt
-- already record *when* each transition last happened; this only answers
-- "who did the current status, and why". Same FK pattern as Request's
-- archivedByAdminUserId/archiveReason.
ALTER TABLE "Company" ADD COLUMN     "statusChangeReason" TEXT,
ADD COLUMN     "statusChangedByAdminUserId" TEXT;

-- CreateIndex
CREATE INDEX "Company_statusChangedByAdminUserId_idx" ON "Company"("statusChangedByAdminUserId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_statusChangedByAdminUserId_fkey" FOREIGN KEY ("statusChangedByAdminUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
