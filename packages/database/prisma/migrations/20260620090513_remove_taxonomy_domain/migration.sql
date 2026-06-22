/*
  Warnings:

  - You are about to drop the `Domain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DomainAlias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DomainIntervention` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DomainAlias" DROP CONSTRAINT "DomainAlias_domainId_fkey";

-- DropForeignKey
ALTER TABLE "DomainIntervention" DROP CONSTRAINT "DomainIntervention_domainId_fkey";

-- DropForeignKey
ALTER TABLE "DomainIntervention" DROP CONSTRAINT "DomainIntervention_interventionId_fkey";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "Domain";

-- DropTable
DROP TABLE "DomainAlias";

-- DropTable
DROP TABLE "DomainIntervention";

-- CreateIndex
CREATE INDEX "idx_company_membership_user_company_s6b" ON "CompanyMembership"("userId", "companyId");

-- CreateIndex
CREATE INDEX "idx_conversation_participant_conversation_actor_s6b" ON "ConversationParticipant"("conversationId", "actorType");

-- CreateIndex
CREATE INDEX "idx_conversation_participant_company_actor_conversation_s6b" ON "ConversationParticipant"("companyId", "actorType", "conversationId");

-- CreateIndex
CREATE INDEX "idx_conversation_participant_customer_actor_conversation_s6b" ON "ConversationParticipant"("customerId", "actorType", "conversationId");

-- CreateIndex
CREATE INDEX "idx_request_unlock_company_request_s6b" ON "RequestUnlock"("companyId", "requestId");
