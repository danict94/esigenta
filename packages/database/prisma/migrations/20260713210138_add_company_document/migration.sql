-- FASE DOCUMENTI 3.A — foundation only, additive. CompanyDocument is a
-- signal for admin badges/reminders, never a marketplace gate — Company.status
-- and its transitions are untouched by this migration.
-- CreateEnum
CREATE TYPE "CompanyDocumentType" AS ENUM ('VISURA_CAMERALE', 'ID_RAPPRESENTANTE', 'DURC', 'ASSICURAZIONE_RC', 'CERTIFICAZIONE');

-- CreateEnum
CREATE TYPE "CompanyDocumentStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "CompanyDocument" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "documentType" "CompanyDocumentType" NOT NULL,
    "status" "CompanyDocumentStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "objectKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedByUserId" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByAdminUserId" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyDocument_companyId_idx" ON "CompanyDocument"("companyId");

-- CreateIndex
CREATE INDEX "CompanyDocument_status_idx" ON "CompanyDocument"("status");

-- CreateIndex
CREATE INDEX "CompanyDocument_reviewedByAdminUserId_idx" ON "CompanyDocument"("reviewedByAdminUserId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyDocument_companyId_documentType_key" ON "CompanyDocument"("companyId", "documentType");

-- AddForeignKey
ALTER TABLE "CompanyDocument" ADD CONSTRAINT "CompanyDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyDocument" ADD CONSTRAINT "CompanyDocument_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyDocument" ADD CONSTRAINT "CompanyDocument_reviewedByAdminUserId_fkey" FOREIGN KEY ("reviewedByAdminUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
