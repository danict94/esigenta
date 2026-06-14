-- Ensure only one pending contact-change request exists per company and field.
-- Prisma schema does not model PostgreSQL partial unique indexes directly.

CREATE UNIQUE INDEX "CompanyContactChangeRequest_pending_company_field_unique_idx"
ON "CompanyContactChangeRequest"("companyId", "field")
WHERE "status" = 'PENDING_REVIEW';
