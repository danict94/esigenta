-- CreateEnum: single canonical publication gate for Intervention, mirrored
-- 1:1 from the frozen taxonomy SSOT's publicationStatus on every sync.
-- DRAFT rows exist fully (aliases, projectGroup, funnel/content in
-- development) but must never surface on a public read path.
CREATE TYPE "InterventionPublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable: added nullable first (no default yet), so the backfill below
-- can set an explicit, correct value for every pre-existing row before the
-- column becomes NOT NULL — no row is ever populated by a column default.
ALTER TABLE "Intervention" ADD COLUMN     "publicationStatus" "InterventionPublicationStatus";

-- One-time backfill: every Intervention that already existed before this
-- migration was already live and publicly reachable — it becomes
-- explicitly PUBLISHED here, not via createdAt, not via a fabricated
-- historical date, not via the column default. This UPDATE runs exactly
-- once, at migration time; it is not part of the ongoing sync logic.
UPDATE "Intervention" SET "publicationStatus" = 'PUBLISHED' WHERE "publicationStatus" IS NULL;

-- Enforce NOT NULL now that every row has an explicit value, then set the
-- permanent fail-safe default: DRAFT. From this point forward, any new row
-- created WITHOUT an explicit publicationStatus (a manual insert, a bug, a
-- write that bypasses the frozen->DB sync) is born invisible by default,
-- never accidentally public. The taxonomy sync (sync-catalog-to-database.ts)
-- always writes this field explicitly from frozen and never relies on this
-- default — it only ever matters for a write that bypasses sync entirely.
ALTER TABLE "Intervention" ALTER COLUMN "publicationStatus" SET NOT NULL;
ALTER TABLE "Intervention" ALTER COLUMN "publicationStatus" SET DEFAULT 'DRAFT';
