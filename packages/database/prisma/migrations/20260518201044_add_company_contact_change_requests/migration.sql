-- CreateEnum
CREATE TYPE "CompanyContactChangeField" AS ENUM ('PHONE', 'PUBLIC_CONTACT_EMAIL');

-- CreateEnum
CREATE TYPE "CompanyContactChangeStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "publicContactEmail" TEXT;

-- CreateTable
CREATE TABLE "CompanyContactChangeRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "requestedByUserId" TEXT NOT NULL,
    "field" "CompanyContactChangeField" NOT NULL,
    "currentValue" TEXT,
    "requestedValue" TEXT NOT NULL,
    "status" "CompanyContactChangeStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewedAt" TIMESTAMP(3),
    "reviewedByAdminUserId" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyContactChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyContactChangeRequest_companyId_createdAt_idx" ON "CompanyContactChangeRequest"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "CompanyContactChangeRequest_status_createdAt_idx" ON "CompanyContactChangeRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CompanyContactChangeRequest_reviewedByAdminUserId_idx" ON "CompanyContactChangeRequest"("reviewedByAdminUserId");

-- AddForeignKey
ALTER TABLE "CompanyContactChangeRequest" ADD CONSTRAINT "CompanyContactChangeRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyContactChangeRequest" ADD CONSTRAINT "CompanyContactChangeRequest_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyContactChangeRequest" ADD CONSTRAINT "CompanyContactChangeRequest_reviewedByAdminUserId_fkey" FOREIGN KEY ("reviewedByAdminUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
