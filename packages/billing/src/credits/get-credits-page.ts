import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

type PerfRecorder = (label: string, ms: number) => void

type CreditAccountRow = {
  id: string
  balance: number
  expires_at: Date | null
}

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
  packages: PurchasableCreditPackage[]
}

async function ensureFreshCreditAccount(
  companyId: string,
  now: Date,
): Promise<CompanyCreditAccountSummary> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO "CompanyCreditAccount" ("id", "companyId", "balance", "expiresAt", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${companyId}, 0, NULL, now(), now())
      ON CONFLICT ("companyId") DO NOTHING
    `

    const rows = await tx.$queryRaw<Array<CreditAccountRow>>`
      SELECT "id", "balance", "expiresAt" AS expires_at
      FROM "CompanyCreditAccount"
      WHERE "companyId" = ${companyId}
      FOR UPDATE
    `

    const account = rows[0]
    if (!account) throw new Error("Credit account lock failed after insert.")

    if (account.expires_at !== null && account.expires_at <= now) {
      if (account.balance > 0) {
        await tx.$executeRaw`
          INSERT INTO "CompanyCreditTransaction" (
            "id", "companyId", "accountId", "type", "status",
            "amount", "balanceBefore", "balanceAfter",
            "expiresAtBefore", "expiresAtAfter",
            "idempotencyKey", "reason", "createdAt"
          ) VALUES (
            gen_random_uuid()::text, ${companyId}, ${account.id},
            'CREDIT_EXPIRATION', 'COMPLETED',
            ${-account.balance}, ${account.balance}, 0,
            ${account.expires_at}, NULL,
            ${'credit-expiration:' + companyId + ':' + account.expires_at.toISOString()},
            'Scadenza crediti', now()
          )
          ON CONFLICT ("idempotencyKey") DO NOTHING
        `
      }
      await tx.$executeRaw`
        UPDATE "CompanyCreditAccount"
        SET "balance" = 0, "expiresAt" = NULL, "updatedAt" = now()
        WHERE "id" = ${account.id}
      `
      return { balance: 0, expiresAt: null }
    }

    return { balance: account.balance, expiresAt: account.expires_at }
  })
}

export async function getCompanyCreditsPage(
  actor: CompanyActor,
  recordPerf?: PerfRecorder,
): Promise<GetCompanyCreditsPageResult> {
  const t0 = performance.now()
  const now = new Date()

  const [account, packageRows] = await Promise.all([
    ensureFreshCreditAccount(actor.company.id, now),

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

  return { account, packages }
}
