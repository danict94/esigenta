import type { RequestStatus } from "@prisma/client"
import type { Prisma } from "@prisma/client"
import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

import type { CompanyUnlockedRequestListItem } from "./saved-requests"

type PerfRecorder = (label: string, ms: number) => void

type PurchasedRequestRow = {
  unlock_id: string
  unlock_credit_cost: number | bigint
  unlocked_at: Date
  refunded_at: Date | null
  id: string
  request_code: string | null
  status: RequestStatus
  intervention_slug: string | null
  city: string | null
  address: string | null
  postal_code: string | null
  structured_data: Prisma.JsonValue | null
  credit_cost: number | bigint | null
  max_unlocks: number | bigint | null
  unlock_count: number | bigint
  request_created_at: Date
  saved_at: Date | null
}

export type GetCompanyPurchasedRequestsPageResult = {
  requests: CompanyUnlockedRequestListItem[]
}

export async function getCompanyPurchasedRequestsPage(
  actor: CompanyActor,
  recordPerf?: PerfRecorder,
): Promise<GetCompanyPurchasedRequestsPageResult> {
  // Single SQL JOIN — replaces 2 ORM queries (findMany RequestUnlock + IN CompanySavedRequest)
  const t0 = performance.now()
  const rows = await prisma.$queryRaw<Array<PurchasedRequestRow>>`
    SELECT
      ru."id"              AS unlock_id,
      ru."creditCost"      AS unlock_credit_cost,
      ru."createdAt"       AS unlocked_at,
      ru."refundedAt"      AS refunded_at,
      r."id"               AS id,
      r."requestCode"      AS request_code,
      r."status"           AS status,
      r."interventionSlug" AS intervention_slug,
      r."city"             AS city,
      r."address"          AS address,
      r."postalCode"       AS postal_code,
      r."structuredData"   AS structured_data,
      r."creditCost"       AS credit_cost,
      r."maxUnlocks"       AS max_unlocks,
      r."unlockCount"      AS unlock_count,
      r."createdAt"        AS request_created_at,
      csr."createdAt"      AS saved_at
    FROM "RequestUnlock" ru
    JOIN "Request" r ON r."id" = ru."requestId"
    LEFT JOIN LATERAL (
      SELECT "createdAt"
      FROM   "CompanySavedRequest"
      WHERE  "requestId" = r."id"
        AND  "companyId" = ${actor.company.id}
      LIMIT 1
    ) csr ON true
    WHERE ru."companyId" = ${actor.company.id}
    ORDER BY ru."createdAt" DESC
  `
  recordPerf?.("purchased-requests-query", Math.round(performance.now() - t0))

  const requests: CompanyUnlockedRequestListItem[] = rows.map((row) => ({
    id: row.id,
    requestCode: row.request_code,
    status: row.status,
    interventionSlug: row.intervention_slug,
    city: row.city,
    address: row.address,
    postalCode: row.postal_code,
    structuredData: row.structured_data,
    creditCost: Number(row.unlock_credit_cost),
    requestCreditCost: row.credit_cost !== null ? Number(row.credit_cost) : null,
    maxUnlocks: row.max_unlocks !== null ? Number(row.max_unlocks) : null,
    unlockCount: Number(row.unlock_count),
    createdAt: row.request_created_at,
    hasUnlocked: true,
    requestUnlockId: row.unlock_id,
    unlockedAt: row.unlocked_at,
    refundedAt: row.refunded_at,
    isSaved: row.saved_at !== null,
  }))

  return { requests }
}
