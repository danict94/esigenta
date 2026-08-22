-- FASE 7E — distinguishes "genuinely no attribution" from "attribution
-- capture failed" (see FASE 7A/7D reports on isolating attribution
-- failures from funnel_started itself). Purely additive: one nullable
-- column on the existing FunnelEvent table, no index, no constraint
-- change, no other table touched.
--
-- New migration: 20260822090000_add_request_submission_session_id (FASE
-- 7B) and 20260821120000_add_funnel_event (FASE 6C-6G) are both already
-- applied in production and are not touched here.

-- AlterTable
ALTER TABLE "FunnelEvent" ADD COLUMN "attributionStatus" TEXT;
