-- Add company profile foundation fields.
-- Existing legacy companies receive technical placeholders so the new
-- required profile fields can be enforced without deleting data.

ALTER TABLE "Company" ADD COLUMN "name" TEXT;
ALTER TABLE "Company" ADD COLUMN "vatNumber" TEXT;
ALTER TABLE "Company" ADD COLUMN "phone" TEXT;
ALTER TABLE "Company" ADD COLUMN "website" TEXT;
ALTER TABLE "Company" ADD COLUMN "address" TEXT;
ALTER TABLE "Company" ADD COLUMN "street" TEXT;
ALTER TABLE "Company" ADD COLUMN "streetNo" TEXT;
ALTER TABLE "Company" ADD COLUMN "city" TEXT;
ALTER TABLE "Company" ADD COLUMN "postalCode" TEXT;
ALTER TABLE "Company" ADD COLUMN "province" TEXT;
ALTER TABLE "Company" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "Company" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "Company" ADD COLUMN "operatingRadiusKm" INTEGER NOT NULL DEFAULT 30;

UPDATE "Company"
SET
  "name" = COALESCE("name", 'Impresa legacy ' || substr("id", 1, 8)),
  "vatNumber" = COALESCE("vatNumber", 'LEGACY-' || "id"),
  "phone" = COALESCE("phone", 'N/D');

ALTER TABLE "Company" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "Company" ALTER COLUMN "vatNumber" SET NOT NULL;
ALTER TABLE "Company" ALTER COLUMN "phone" SET NOT NULL;

CREATE UNIQUE INDEX "Company_vatNumber_key" ON "Company"("vatNumber");
CREATE INDEX "Company_vatNumber_idx" ON "Company"("vatNumber");
CREATE INDEX "Company_city_idx" ON "Company"("city");
CREATE INDEX "Company_postalCode_idx" ON "Company"("postalCode");
CREATE INDEX "Company_latitude_longitude_idx" ON "Company"("latitude", "longitude");
