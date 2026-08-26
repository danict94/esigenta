-- FASE 9H — exit-feedback data layer (no modal/trigger UI yet, see report).
-- Two independent, unrelated changes bundled in this one migration:
--
-- 1. reasonCode: a new nullable column, closed allow-list enforced ONLY at
--    the application layer (packages/domain/src/public/funnel-events/
--    record-funnel-event.ts, EXIT_FEEDBACK_REASON_CODES) — no Postgres
--    CHECK constraint, consistent with every other "closed allow-list,
--    app-enforced" text field already on this table (errorCode,
--    attributionStatus, trackingVersion). Never free text.
--
-- 2. A PARTIAL unique index enforcing "at most one exit_feedback_submitted
--    row per funnelSessionId", regardless of stepKey/stepIndex — the
--    table's existing @@unique([funnelSessionId, eventType, stepKey,
--    stepIndex]) cannot provide this alone, because exit_feedback_submitted
--    deliberately carries the REAL step the user was on (varying
--    stepKey/stepIndex), unlike the sentinel-based funnel_opened/
--    funnel_started/request_created. Prisma's schema DSL has no WHERE
--    clause for @@unique/@@index, so this partial index is created here in
--    raw SQL and documented only as a comment on the FunnelEvent model in
--    schema.prisma — see that comment for the residual risk this carries
--    (not representable via `prisma db pull`).
--
-- Every migration up to and including 20260825120000_add_funnel_event_tracking_version
-- is already applied in production and is not touched here.

-- AlterTable
ALTER TABLE "FunnelEvent" ADD COLUMN "reasonCode" TEXT;

-- CreateIndex (partial — not representable in schema.prisma's DSL)
CREATE UNIQUE INDEX "FunnelEvent_exitFeedback_funnelSessionId_key"
ON "FunnelEvent" ("funnelSessionId")
WHERE "eventType" = 'exit_feedback_submitted';
