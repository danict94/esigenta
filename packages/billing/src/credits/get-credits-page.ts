import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

import { getActiveCreditLotsReadModel, type CreditLotListItem } from "./lot-ledger"

type PerfRecorder = (label: string, ms: number) => void

type CreditPackageRow = {
  id: string
  name: string
  description: string | null
  credits: number
  price_cents: number
  currency: string
  validity_days: number
  sort_order: number
}

export type CompanyCreditAccountSummary = {
  balance: number
  expiresAt: Date | null
}

export type CreditLotSummary = CreditLotListItem

export type PurchasableCreditPackage = {
  id: string
  name: string
  description: string | null
  credits: number
  priceCents: number
  currency: string
  validityDays: number
  sortOrder: number
}

export type GetCompanyCreditsPageResult = {
  account: CompanyCreditAccountSummary
  /**
   * Per-lot breakdown (FEFO, D-011): each purchase/refund is its own lot
   * with its own expiry. account.balance is the sum of these lots'
   * remaining credits.
   */
  lots: CreditLotSummary[]
  nearestLotExpiresAt: Date | null
  packages: PurchasableCreditPackage[]
}

export async function getCompanyCreditsPage(
  actor: CompanyActor,
  recordPerf?: PerfRecorder,
): Promise<GetCompanyCreditsPageResult> {
  const t0 = performance.now()
  const now = new Date()

  const [creditState, packageRows] = await Promise.all([
    getActiveCreditLotsReadModel(actor.company.id, now),

    prisma.$queryRaw<Array<CreditPackageRow>>`
      SELECT
        "id",
        "name",
        "description",
        "credits",
        "priceCents"    AS price_cents,
        "currency",
        "validityDays"  AS validity_days,
        "sortOrder"     AS sort_order
      FROM "CreditPackage"
      WHERE "status" = 'ACTIVE'
      ORDER BY "sortOrder" ASC, "createdAt" DESC
    `,
  ])

  recordPerf?.("credits-queries", Math.round(performance.now() - t0))

  const packages: PurchasableCreditPackage[] = packageRows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    credits: Number(row.credits),
    priceCents: Number(row.price_cents),
    currency: row.currency,
    validityDays: Number(row.validity_days),
    sortOrder: Number(row.sort_order),
  }))

  return {
    account: { balance: creditState.balance, expiresAt: creditState.nearestExpiresAt },
    lots: creditState.lots,
    nearestLotExpiresAt: creditState.nearestExpiresAt,
    packages,
  }
}
