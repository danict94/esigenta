-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "defaultProjectGroupIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Intervention" ADD COLUMN     "projectGroupId" TEXT;

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "interventionId" TEXT;

-- CreateTable
CREATE TABLE "ProjectGroup" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyIntervention" (
    "companyId" TEXT NOT NULL,
    "interventionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyIntervention_pkey" PRIMARY KEY ("companyId","interventionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectGroup_slug_key" ON "ProjectGroup"("slug");

-- CreateIndex
CREATE INDEX "ProjectGroup_name_idx" ON "ProjectGroup"("name");

-- CreateIndex
CREATE INDEX "CompanyIntervention_companyId_idx" ON "CompanyIntervention"("companyId");

-- CreateIndex
CREATE INDEX "CompanyIntervention_interventionId_idx" ON "CompanyIntervention"("interventionId");

-- CreateIndex
CREATE INDEX "Intervention_projectGroupId_idx" ON "Intervention"("projectGroupId");

-- CreateIndex
CREATE INDEX "Request_interventionId_idx" ON "Request"("interventionId");

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_projectGroupId_fkey" FOREIGN KEY ("projectGroupId") REFERENCES "ProjectGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyIntervention" ADD CONSTRAINT "CompanyIntervention_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyIntervention" ADD CONSTRAINT "CompanyIntervention_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "Intervention"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "Intervention"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
