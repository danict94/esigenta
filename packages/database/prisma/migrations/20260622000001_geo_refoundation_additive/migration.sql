-- GEO REFOUNDATION (docs/geo-refoundation/01_DESIGN.md)
-- Step 1/2: additive only. Adds GeoLocation + nullable geoLocationId FKs.
-- The legacy scalar geo columns on Company/Request are intentionally left
-- in place here so the backfill (docs/geo-refoundation/02_BACKFILL_AUDIT.md)
-- has a source to read from; they are dropped in the next migration in
-- this same refoundation (20260622000002_geo_refoundation_drop_legacy).

-- CreateEnum
CREATE TYPE "GeoSource" AS ENUM ('GOOGLE_PLACES', 'LEGACY_BACKFILL');

-- DropIndex (superseded by GeoLocation's own indexes)
DROP INDEX "Company_city_idx";

-- DropIndex
DROP INDEX "Company_latitude_longitude_idx";

-- DropIndex
DROP INDEX "Company_postalCode_idx";

-- DropIndex
DROP INDEX "Request_city_idx";

-- DropIndex
DROP INDEX "Request_latitude_longitude_idx";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "geoLocationId" TEXT;

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "geoLocationId" TEXT;

-- CreateTable
CREATE TABLE "GeoLocation" (
    "id" TEXT NOT NULL,
    "placeId" TEXT,
    "formattedAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT,
    "province" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "source" "GeoSource" NOT NULL DEFAULT 'GOOGLE_PLACES',
    "resolvedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeoLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeoLocation_city_idx" ON "GeoLocation"("city");

-- CreateIndex
CREATE INDEX "GeoLocation_latitude_longitude_idx" ON "GeoLocation"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "GeoLocation_placeId_idx" ON "GeoLocation"("placeId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_geoLocationId_key" ON "Company"("geoLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "Request_geoLocationId_key" ON "Request"("geoLocationId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_geoLocationId_fkey" FOREIGN KEY ("geoLocationId") REFERENCES "GeoLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_geoLocationId_fkey" FOREIGN KEY ("geoLocationId") REFERENCES "GeoLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Matching performance (docs/geo-refoundation/01_DESIGN.md §5/§6): PostgreSQL
-- native earthdistance/cube, not PostGIS — sufficient for circle/radius
-- queries at this domain's scale, no superuser-only extension required.
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- GiST index accelerating "within radiusKm of (lat,lng)" via
-- earth_box(...) @> ll_to_earth(...). Replaces the JS-side full-table
-- haversine scan in resolveCandidates() — see
-- packages/domain/src/internal/request/dispatch/resolve-request-dispatch-candidates.ts.
CREATE INDEX "GeoLocation_earth_point_gist_idx"
  ON "GeoLocation"
  USING gist (ll_to_earth("latitude", "longitude"));
