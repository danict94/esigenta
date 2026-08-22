-- FASE 7B — Request creation idempotency (see FASE 7A audit, BLOCKER §3).
--
-- Purely additive, new migration: 20260821120000_add_funnel_event is
-- already applied in production (FASE 6G) and is not touched here.
--
-- Adds a single nullable column with a UNIQUE constraint. Postgres allows
-- unlimited NULLs in a unique index/constraint, so this never affects any
-- existing Request row (all currently NULL) and never collides across
-- Requests that don't carry a funnelSessionId (legacy/admin-created
-- requests, or any future entry point that doesn't pass one) — see the
-- column comment on Request.submissionSessionId in schema.prisma for the
-- full rationale, including why this is a separate column from
-- structuredData.funnelSessionId and FunnelEvent.funnelSessionId.
--
-- No DROP, no data migration, no change to any other table/column.

-- AlterTable
ALTER TABLE "Request" ADD COLUMN "submissionSessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Request_submissionSessionId_key" ON "Request"("submissionSessionId");
