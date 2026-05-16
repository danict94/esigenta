-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'PENDING_VERIFICATION', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED', 'CLOSED');

-- CreateTable
CREATE TABLE "Sector" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sectorId" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intervention" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intervention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterventionAlias" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "interventionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterventionAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceAlias" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryAlias" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainAlias" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DomainAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryService" (
    "categoryId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "CategoryService_pkey" PRIMARY KEY ("categoryId","serviceId")
);

-- CreateTable
CREATE TABLE "InterventionService" (
    "interventionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "InterventionService_pkey" PRIMARY KEY ("interventionId","serviceId")
);

-- CreateTable
CREATE TABLE "DomainIntervention" (
    "domainId" TEXT NOT NULL,
    "interventionId" TEXT NOT NULL,

    CONSTRAINT "DomainIntervention_pkey" PRIMARY KEY ("domainId","interventionId")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyService" (
    "companyId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyService_pkey" PRIMARY KEY ("companyId","serviceId")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'DRAFT',
    "interventionSlug" TEXT,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "city" TEXT,
    "address" TEXT,
    "postalCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "structuredData" JSONB,
    "moderationNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "customerId" TEXT,
    "creditCost" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestRequiredService" (
    "requestId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestRequiredService_pkey" PRIMARY KEY ("requestId","serviceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sector_slug_key" ON "Sector"("slug");

-- CreateIndex
CREATE INDEX "Sector_slug_idx" ON "Sector"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_sectorId_idx" ON "Category"("sectorId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_slug_idx" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_name_idx" ON "Service"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Intervention_slug_key" ON "Intervention"("slug");

-- CreateIndex
CREATE INDEX "Intervention_slug_idx" ON "Intervention"("slug");

-- CreateIndex
CREATE INDEX "Intervention_name_idx" ON "Intervention"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_slug_key" ON "Domain"("slug");

-- CreateIndex
CREATE INDEX "Domain_slug_idx" ON "Domain"("slug");

-- CreateIndex
CREATE INDEX "Domain_name_idx" ON "Domain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InterventionAlias_value_key" ON "InterventionAlias"("value");

-- CreateIndex
CREATE INDEX "InterventionAlias_value_idx" ON "InterventionAlias"("value");

-- CreateIndex
CREATE INDEX "InterventionAlias_interventionId_idx" ON "InterventionAlias"("interventionId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAlias_value_key" ON "ServiceAlias"("value");

-- CreateIndex
CREATE INDEX "ServiceAlias_value_idx" ON "ServiceAlias"("value");

-- CreateIndex
CREATE INDEX "ServiceAlias_serviceId_idx" ON "ServiceAlias"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryAlias_value_key" ON "CategoryAlias"("value");

-- CreateIndex
CREATE INDEX "CategoryAlias_value_idx" ON "CategoryAlias"("value");

-- CreateIndex
CREATE INDEX "CategoryAlias_categoryId_idx" ON "CategoryAlias"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "DomainAlias_value_key" ON "DomainAlias"("value");

-- CreateIndex
CREATE INDEX "DomainAlias_value_idx" ON "DomainAlias"("value");

-- CreateIndex
CREATE INDEX "DomainAlias_domainId_idx" ON "DomainAlias"("domainId");

-- CreateIndex
CREATE INDEX "CategoryService_categoryId_idx" ON "CategoryService"("categoryId");

-- CreateIndex
CREATE INDEX "CategoryService_serviceId_idx" ON "CategoryService"("serviceId");

-- CreateIndex
CREATE INDEX "InterventionService_interventionId_idx" ON "InterventionService"("interventionId");

-- CreateIndex
CREATE INDEX "InterventionService_serviceId_idx" ON "InterventionService"("serviceId");

-- CreateIndex
CREATE INDEX "DomainIntervention_domainId_idx" ON "DomainIntervention"("domainId");

-- CreateIndex
CREATE INDEX "DomainIntervention_interventionId_idx" ON "DomainIntervention"("interventionId");

-- CreateIndex
CREATE INDEX "Company_createdAt_idx" ON "Company"("createdAt");

-- CreateIndex
CREATE INDEX "CompanyService_companyId_idx" ON "CompanyService"("companyId");

-- CreateIndex
CREATE INDEX "CompanyService_serviceId_idx" ON "CompanyService"("serviceId");

-- CreateIndex
CREATE INDEX "Request_status_idx" ON "Request"("status");

-- CreateIndex
CREATE INDEX "Request_createdAt_idx" ON "Request"("createdAt");

-- CreateIndex
CREATE INDEX "Request_customerEmail_idx" ON "Request"("customerEmail");

-- CreateIndex
CREATE INDEX "Request_interventionSlug_idx" ON "Request"("interventionSlug");

-- CreateIndex
CREATE INDEX "Request_city_idx" ON "Request"("city");

-- CreateIndex
CREATE INDEX "RequestRequiredService_requestId_idx" ON "RequestRequiredService"("requestId");

-- CreateIndex
CREATE INDEX "RequestRequiredService_serviceId_idx" ON "RequestRequiredService"("serviceId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionAlias" ADD CONSTRAINT "InterventionAlias_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "Intervention"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAlias" ADD CONSTRAINT "ServiceAlias_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryAlias" ADD CONSTRAINT "CategoryAlias_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainAlias" ADD CONSTRAINT "DomainAlias_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryService" ADD CONSTRAINT "CategoryService_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryService" ADD CONSTRAINT "CategoryService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionService" ADD CONSTRAINT "InterventionService_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "Intervention"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionService" ADD CONSTRAINT "InterventionService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainIntervention" ADD CONSTRAINT "DomainIntervention_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainIntervention" ADD CONSTRAINT "DomainIntervention_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "Intervention"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyService" ADD CONSTRAINT "CompanyService_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyService" ADD CONSTRAINT "CompanyService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestRequiredService" ADD CONSTRAINT "RequestRequiredService_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestRequiredService" ADD CONSTRAINT "RequestRequiredService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
