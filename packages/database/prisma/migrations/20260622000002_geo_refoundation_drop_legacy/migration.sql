-- GEO REFOUNDATION (docs/geo-refoundation/01_DESIGN.md)
-- Step 2/2: physical cleanup. The backfill
-- (docs/geo-refoundation/02_BACKFILL_AUDIT.md) has already migrated every
-- existing Company/Request row onto GeoLocation via geoLocationId, and
-- every write/read path in the codebase has been cut over to it. There is
-- no remaining reader of these columns — dropping them removes the dual
-- geo architecture entirely. No dual system remains after this migration.

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "postalCode",
DROP COLUMN "province",
DROP COLUMN "street",
DROP COLUMN "streetNo";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "postalCode";
