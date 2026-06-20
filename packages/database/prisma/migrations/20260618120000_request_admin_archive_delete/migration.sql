-- AlterTable: D-020 — admin archive / soft-delete for Request, additive only
ALTER TABLE "Request"
ADD COLUMN "archivedAt" TIMESTAMP(3),
ADD COLUMN "archivedByAdminUserId" TEXT,
ADD COLUMN "archiveReason" TEXT,
ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "deletedByAdminUserId" TEXT,
ADD COLUMN "deleteReason" TEXT;

-- CreateIndex
CREATE INDEX "Request_archivedAt_idx" ON "Request"("archivedAt");

-- CreateIndex
CREATE INDEX "Request_deletedAt_idx" ON "Request"("deletedAt");

-- CreateIndex
CREATE INDEX "Request_archivedByAdminUserId_idx" ON "Request"("archivedByAdminUserId");

-- CreateIndex
CREATE INDEX "Request_deletedByAdminUserId_idx" ON "Request"("deletedByAdminUserId");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_archivedByAdminUserId_fkey" FOREIGN KEY ("archivedByAdminUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_deletedByAdminUserId_fkey" FOREIGN KEY ("deletedByAdminUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
