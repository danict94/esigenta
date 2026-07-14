import type { Prisma } from "@prisma/client"

type WriteClient = Prisma.TransactionClient

export type WriteCompanyServiceConfigurationInput = {
  companyId: string
  categoryIds: string[]
  interventionIds: string[]
}

/**
 * THE ONLY WRITE PATH for CompanyCategory/CompanyIntervention (mirrors
 * setCompanyLocationWithClient's role for geo). Lives here, not
 * @esigenta/domain, because @esigenta/auth's onboarding bootstrap must
 * also call it and cannot depend on @esigenta/domain (which itself
 * depends on @esigenta/auth) — same reason as setCompanyLocationWithClient
 * and getAdminNotificationRecipientEmails above.
 *
 * Purely infrastructural: one atomic, idempotent replace-set
 * (DELETE + INSERT ... ON CONFLICT DO NOTHING in a single statement, both
 * tables in one round trip). No validation and no product rules here (max
 * categories, empty-set rejection, etc.) — those stay in the two callers:
 * @esigenta/domain's update-services-configuration.ts (manual save) and
 * @esigenta/auth's onboarding.ts (initial bootstrap).
 */
export async function writeCompanyServiceConfigurationWithClient(
  client: WriteClient,
  { companyId, categoryIds, interventionIds }: WriteCompanyServiceConfigurationInput,
): Promise<void> {
  await client.$executeRaw`
    WITH
      _del_cat AS (
        DELETE FROM "CompanyCategory"
        WHERE "companyId" = ${companyId}
          AND "categoryId" != ALL(${categoryIds}::text[])
      ),
      _ins_cat AS (
        INSERT INTO "CompanyCategory" ("companyId", "categoryId")
        SELECT ${companyId}, id FROM unnest(${categoryIds}::text[]) AS id
        ON CONFLICT ("companyId", "categoryId") DO NOTHING
      ),
      _del_iv AS (
        DELETE FROM "CompanyIntervention"
        WHERE "companyId" = ${companyId}
          AND "interventionId" != ALL(${interventionIds}::text[])
      ),
      _ins_iv AS (
        INSERT INTO "CompanyIntervention" ("companyId", "interventionId")
        SELECT ${companyId}, id FROM unnest(${interventionIds}::text[]) AS id
        ON CONFLICT ("companyId", "interventionId") DO NOTHING
      )
    SELECT 1
  `
}
