import type { RequestStatus } from "@prisma/client"
import type { Prisma } from "@prisma/client"
import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

import type { CompanySavedRequestListItem } from "./saved-requests"

type PerfRecorder = (label: string, ms: number) => void

const PAGE_SIZE = 50

type SavedRequestRow = {
  saved_at: Date
  id: string
  request_code: string | null
  status: RequestStatus
  intervention_slug: string | null
  city: string | null
  address: string | null
  postal_code: string | null
  structured_data: Prisma.JsonValue | null
  credit_cost: number | null
  max_unlocks: number | null
  unlock_count: number
  request_created_at: Date
  unlock_id: string | null
  unlocked_at: Date | null
}

export type GetCompanySavedRequestsPageResult = {
  requests: CompanySavedRequestListItem[]
  page: number
  pageSize: number
  hasNextPage: boolean
}

export async function getCompanySavedRequestsPage(
  actor: CompanyActor,
  page?: number,
  recordPerf?: PerfRecorder,
): Promise<GetCompanySavedRequestsPageResult> {
  const normalizedPage = Math.max(
    1,
    Number.isFinite(page) ? Math.floor(page ?? 1) : 1,
  )
  const offset = (normalizedPage - 1) * PAGE_SIZE

  // Single SQL JOIN — replaces 2 ORM queries (findMany + IN for unlocks).
  // LIMIT pageSize+1 / OFFSET: DB-side pagination, no unbounded fetch.
  const t0 = performance.now()
  const rows = await prisma.$queryRaw<Array<SavedRequestRow>>`
    SELECT
      csr."createdAt"       AS saved_at,
      r."id"                AS id,
      r."requestCode"       AS request_code,
      r."status"            AS status,
      r."interventionSlug"  AS intervention_slug,
      r."city"              AS city,
      r."address"           AS address,
      r."postalCode"        AS postal_code,
      r."structuredData"    AS structured_data,
      r."creditCost"        AS credit_cost,
      r."maxUnlocks"        AS max_unlocks,
      r."unlockCount"       AS unlock_count,
      r."createdAt"         AS request_created_at,
      ru."id"               AS unlock_id,
      ru."createdAt"        AS unlocked_at
    FROM "CompanySavedRequest" csr
    JOIN "Request" r ON r."id" = csr."requestId"
    LEFT JOIN LATERAL (
      SELECT "id", "createdAt"
      FROM   "RequestUnlock"
      WHERE  "requestId" = r."id"
        AND  "companyId" = ${actor.company.id}
      LIMIT 1
    ) ru ON true
    WHERE csr."companyId" = ${actor.company.id}
    ORDER BY csr."createdAt" DESC
    LIMIT ${PAGE_SIZE + 1}
    OFFSET ${offset}
  `
  recordPerf?.("saved-requests-query", Math.round(performance.now() - t0))

  const hasNextPage = rows.length > PAGE_SIZE
  const pageRows = hasNextPage ? rows.slice(0, PAGE_SIZE) : rows

  const requests: CompanySavedRequestListItem[] = pageRows.map((row) => ({
    id: row.id,
    requestCode: row.request_code,
    status: row.status,
    interventionSlug: row.intervention_slug,
    city: row.city,
    address: row.address,
    postalCode: row.postal_code,
    structuredData: row.structured_data,
    creditCost: row.credit_cost !== null ? Number(row.credit_cost) : null,
    maxUnlocks: row.max_unlocks !== null ? Number(row.max_unlocks) : null,
    unlockCount: Number(row.unlock_count),
    createdAt: row.request_created_at,
    savedAt: row.saved_at,
    hasUnlocked: row.unlock_id !== null,
    requestUnlockId: row.unlock_id ?? null,
    unlockedAt: row.unlocked_at ?? null,
    isSaved: true,
  }))

  return {
    requests,
    page: normalizedPage,
    pageSize: PAGE_SIZE,
    hasNextPage,
  }
}
