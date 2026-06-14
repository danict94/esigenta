-- Extend the existing notification foundation for conversation message notifications.
ALTER TYPE "CompanyNotificationType" ADD VALUE IF NOT EXISTS 'CONVERSATION_MESSAGE';

ALTER TABLE "CompanyNotification"
ADD COLUMN "conversationId" TEXT,
ADD COLUMN "messageId" TEXT;

CREATE INDEX "CompanyNotification_conversationId_idx"
ON "CompanyNotification"("conversationId");

CREATE INDEX "CompanyNotification_messageId_idx"
ON "CompanyNotification"("messageId");

CREATE UNIQUE INDEX "CompanyNotification_message_company_type_unique_idx"
ON "CompanyNotification"("messageId", "companyId", "type")
WHERE "messageId" IS NOT NULL;

ALTER TABLE "CompanyNotification"
ADD CONSTRAINT "CompanyNotification_conversationId_fkey"
FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyNotification"
ADD CONSTRAINT "CompanyNotification_messageId_fkey"
FOREIGN KEY ("messageId") REFERENCES "Message"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
