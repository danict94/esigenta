-- CreateTable
CREATE TABLE "CompanySavedRequest" (
    "companyId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanySavedRequest_pkey" PRIMARY KEY ("companyId","requestId")
);

-- CreateIndex
CREATE INDEX "CompanySavedRequest_requestId_idx" ON "CompanySavedRequest"("requestId");

-- CreateIndex
CREATE INDEX "CompanySavedRequest_companyId_createdAt_idx" ON "CompanySavedRequest"("companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "CompanySavedRequest" ADD CONSTRAINT "CompanySavedRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanySavedRequest" ADD CONSTRAINT "CompanySavedRequest_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
