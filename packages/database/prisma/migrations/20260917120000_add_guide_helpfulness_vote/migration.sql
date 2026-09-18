-- Guide helpfulness: un voto anonimo per guida e sessione browser.
-- Separato intenzionalmente da FunnelEvent: non è telemetria del funnel.

CREATE TYPE "GuideHelpfulnessResponse" AS ENUM ('yes', 'no');

CREATE TABLE "GuideHelpfulnessVote" (
  "id" TEXT NOT NULL,
  "guideSlug" TEXT NOT NULL,
  "anonymousSessionId" TEXT NOT NULL,
  "response" "GuideHelpfulnessResponse" NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "GuideHelpfulnessVote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GuideHelpfulnessVote_guideSlug_anonymousSessionId_key"
  ON "GuideHelpfulnessVote"("guideSlug", "anonymousSessionId");

CREATE INDEX "GuideHelpfulnessVote_guideSlug_createdAt_idx"
  ON "GuideHelpfulnessVote"("guideSlug", "createdAt");
