-- FASE 9A — funnel_opened/funnel_started split (see the FunnelEvent model
-- comment in schema.prisma). Purely additive: one nullable column on the
-- existing FunnelEvent table, no index, no constraint change, no other
-- table touched, no backfill (legacy rows stay NULL by design — see the
-- trackingVersion doc comment on the model).
--
-- Every migration up to and including 20260822200000_add_geo_source_manual_resolved
-- is already applied in production and is not touched here.

-- AlterTable
ALTER TABLE "FunnelEvent" ADD COLUMN "trackingVersion" TEXT;
