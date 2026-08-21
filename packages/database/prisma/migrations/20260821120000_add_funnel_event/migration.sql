-- FASE 6C — funnel step-progress telemetry.
-- Additive only: one new, standalone table, no FK to Request (a funnel
-- session that never produces a Request must still be observable).
--
-- FASE 6D update (this migration was still unapplied to any database at
-- that point — see docs/report FASE 6D — so it was edited in place here
-- instead of adding a second, incremental migration for a table nobody
-- has ever deployed yet): added "errorCode", nullable, only ever set for
-- the new submit_failed eventType. No other column, index, or constraint
-- changed — the existing @@unique already covers the new eventTypes
-- (submit_started/submit_failed/request_created) with no schema change,
-- by reusing stepKey/stepIndex with different meanings per eventType (see
-- the FunnelEvent model comment in schema.prisma).
--
-- FASE 6E update (still unapplied to any database at that point — see
-- report FASE 6E, same reasoning as the FASE 6D update above): added the
-- 8 attribution columns (gclid/gbraid/wbraid/utmSource/utmMedium/
-- utmCampaign/utmTerm/utmContent), all nullable, only ever set on the
-- funnel_started row of a session. No index/constraint change — these
-- columns are never part of @@unique and are not queried by it.

-- CreateTable
CREATE TABLE "FunnelEvent" (
    "id" TEXT NOT NULL,
    "funnelSessionId" TEXT NOT NULL,
    "interventionSlug" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "stepKey" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "errorCode" TEXT,
    "gclid" TEXT,
    "gbraid" TEXT,
    "wbraid" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FunnelEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FunnelEvent_funnelSessionId_eventType_stepKey_stepIndex_key" ON "FunnelEvent"("funnelSessionId", "eventType", "stepKey", "stepIndex");
