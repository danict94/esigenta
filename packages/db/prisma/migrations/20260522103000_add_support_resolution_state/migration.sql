-- Add minimal resolution state to the shared conversation backbone.
ALTER TABLE "Conversation"
  ADD COLUMN "isResolved" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "resolvedAt" TIMESTAMP(3),
  ADD COLUMN "resolvedById" TEXT;

ALTER TABLE "Conversation"
  ADD CONSTRAINT "Conversation_resolvedById_fkey"
  FOREIGN KEY ("resolvedById")
  REFERENCES "User"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

CREATE INDEX "Conversation_type_isResolved_updatedAt_idx"
  ON "Conversation"("type", "isResolved", "updatedAt");

CREATE INDEX "Conversation_resolvedById_idx"
  ON "Conversation"("resolvedById");
