-- Remove the obsolete second company email source.
-- Official company email is User.email through the OWNER membership.

ALTER TABLE "Company"
DROP COLUMN IF EXISTS "publicContactEmail";

-- PostgreSQL cannot remove enum values directly.
-- The audit confirmed there are no CompanyContactChangeRequest rows
-- with field = 'PUBLIC_CONTACT_EMAIL', so the enum can be rebuilt safely.

ALTER TABLE "CompanyContactChangeRequest"
ALTER COLUMN "field" TYPE TEXT
USING "field"::TEXT;

DROP TYPE "CompanyContactChangeField";

CREATE TYPE "CompanyContactChangeField" AS ENUM ('PHONE');

ALTER TABLE "CompanyContactChangeRequest"
ALTER COLUMN "field" TYPE "CompanyContactChangeField"
USING "field"::"CompanyContactChangeField";
