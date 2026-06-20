import { Prisma } from "@prisma/client"
import { prisma } from "@esigenta/database"

export type CreditTxClient = Prisma.TransactionClient

export type CompanyCreditSummary = {
  balance: number
  expiresAt: Date | null
}

export type CreditLotListItem = {
  id: string
  creditsRemaining: number
  expiresAt: Date
}

export type CreditLotSourceValue =
  | "PACKAGE_PURCHASE"
  | "REFUND"
  | "ADMIN_ADJUSTMENT"

type CreditLotRow = {
  id: string
  quantity_remaining: number
  expires_at: Date
}

const EXPIRATION_REASON = "Scadenza crediti"

function expirationIdempotencyKey(lotId: string): string {
  return `credit-lot-expiration:${lotId}`
}

/**
 * Ensures the (legacy, now cache-only) CompanyCreditAccount row exists and
 * returns its id. CreditLot is the source of truth for balance/expiry;
 * CompanyCreditAccount.balance/expiresAt are kept in sync by
 * syncCompanyCreditAccountCache for consumers outside packages/billing that
 * still read the global account row directly.
 */
export async function ensureCreditAccountRowInTransaction(
  tx: CreditTxClient,
  companyId: string,
): Promise<string> {
  await tx.$executeRaw`
    INSERT INTO "CompanyCreditAccount" ("id", "companyId", "balance", "expiresAt", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, ${companyId}, 0, NULL, now(), now())
    ON CONFLICT ("companyId") DO NOTHING
  `

  const rows = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT "id" FROM "CompanyCreditAccount" WHERE "companyId" = ${companyId} LIMIT 1
  `

  const id = rows[0]?.id
  if (!id) throw new Error("ensureCreditAccountRowInTransaction: account row missing after insert.")
  return id
}

/**
 * Flips any ACTIVE lot past its own expiresAt to EXPIRED, zeroing its
 * quantityRemaining and recording one CREDIT_EXPIRATION ledger transaction
 * per lot (so the ledger always explains every quantityRemaining change).
 * Each lot expires independently — a new purchase never resurrects or
 * extends an already-expired lot (D-011).
 */
export async function expireStaleLotsInTransaction(
  tx: CreditTxClient,
  companyId: string,
  now: Date,
): Promise<void> {
  const activeLots = await tx.$queryRaw<Array<CreditLotRow & { is_stale: boolean }>>`
    SELECT "id", "quantityRemaining" AS quantity_remaining, "expiresAt" AS expires_at,
           ("expiresAt" <= ${now}) AS is_stale
    FROM "CreditLot"
    WHERE "companyId" = ${companyId} AND "status" = 'ACTIVE'
    ORDER BY "expiresAt" ASC
    FOR UPDATE
  `

  const staleLots = activeLots.filter((lot) => lot.is_stale)
  if (staleLots.length === 0) return

  const accountId = await ensureCreditAccountRowInTransaction(tx, companyId)

  let runningBalance = activeLots.reduce((sum, lot) => sum + Number(lot.quantity_remaining), 0)

  for (const lot of staleLots) {
    const remaining = Number(lot.quantity_remaining)
    const balanceBefore = runningBalance
    runningBalance -= remaining
    const balanceAfter = runningBalance

    if (remaining > 0) {
      const idempotencyKey = expirationIdempotencyKey(lot.id)

      const txRows = await tx.$queryRaw<Array<{ id: string }>>`
        INSERT INTO "CompanyCreditTransaction" (
          "id", "companyId", "accountId", "type", "status",
          "amount", "balanceBefore", "balanceAfter",
          "idempotencyKey", "reason", "createdAt"
        ) VALUES (
          gen_random_uuid()::text, ${companyId}, ${accountId},
          'CREDIT_EXPIRATION', 'COMPLETED',
          ${-remaining}, ${balanceBefore}, ${balanceAfter},
          ${idempotencyKey}, ${EXPIRATION_REASON}, now()
        )
        ON CONFLICT ("idempotencyKey") DO NOTHING
        RETURNING "id"
      `

      const txId = txRows[0]?.id
      if (txId) {
        await tx.$executeRaw`
          INSERT INTO "CreditLotConsumption" ("id", "creditLotId", "creditTransactionId", "amount", "createdAt")
          VALUES (gen_random_uuid()::text, ${lot.id}, ${txId}, ${remaining}, now())
        `
      }
    }

    await tx.$executeRaw`
      UPDATE "CreditLot"
      SET "quantityRemaining" = 0, "status" = 'EXPIRED', "updatedAt" = now()
      WHERE "id" = ${lot.id}
    `
  }
}

export type FefoConsumptionPlanEntry = {
  lotId: string
  amount: number
  remainingAfter: number
}

/**
 * Locks every ACTIVE lot for the company (FOR UPDATE) and computes a FEFO
 * (first expiring, first out) consumption plan without writing anything.
 * Splitting "lock + plan" from "apply" lets the caller create the
 * CompanyCreditTransaction row (required by CreditLotConsumption's foreign
 * key) only once it knows the debit will actually succeed, while the row
 * locks held here keep the plan valid until applyFefoConsumptionPlan runs in
 * the same transaction. Caller must run expireStaleLotsInTransaction first.
 */
export async function lockAndPlanFefoConsumptionInTransaction(
  tx: CreditTxClient,
  companyId: string,
  amount: number,
): Promise<{ ok: true; plan: FefoConsumptionPlanEntry[] } | { ok: false }> {
  const activeLots = await tx.$queryRaw<Array<CreditLotRow>>`
    SELECT "id", "quantityRemaining" AS quantity_remaining, "expiresAt" AS expires_at
    FROM "CreditLot"
    WHERE "companyId" = ${companyId} AND "status" = 'ACTIVE'
    ORDER BY "expiresAt" ASC
    FOR UPDATE
  `

  const totalAvailable = activeLots.reduce((sum, lot) => sum + Number(lot.quantity_remaining), 0)
  if (totalAvailable < amount) {
    return { ok: false }
  }

  let remainingToConsume = amount
  const plan: FefoConsumptionPlanEntry[] = []

  for (const lot of activeLots) {
    if (remainingToConsume <= 0) break

    const lotRemaining = Number(lot.quantity_remaining)
    if (lotRemaining <= 0) continue

    const consumeAmount = Math.min(lotRemaining, remainingToConsume)
    plan.push({ lotId: lot.id, amount: consumeAmount, remainingAfter: lotRemaining - consumeAmount })
    remainingToConsume -= consumeAmount
  }

  return { ok: true, plan }
}

/**
 * Applies a previously-locked FEFO consumption plan: decrements each lot's
 * quantityRemaining and records one CreditLotConsumption row per lot,
 * pointing at the now-existing creditTransactionId.
 */
export async function applyFefoConsumptionPlanInTransaction(
  tx: CreditTxClient,
  plan: FefoConsumptionPlanEntry[],
  creditTransactionId: string,
): Promise<void> {
  for (const entry of plan) {
    await tx.$executeRaw`
      UPDATE "CreditLot"
      SET "quantityRemaining" = ${entry.remainingAfter},
          "status" = ${entry.remainingAfter === 0 ? "CONSUMED" : "ACTIVE"}::"CreditLotStatus",
          "updatedAt" = now()
      WHERE "id" = ${entry.lotId}
    `

    await tx.$executeRaw`
      INSERT INTO "CreditLotConsumption" ("id", "creditLotId", "creditTransactionId", "amount", "createdAt")
      VALUES (gen_random_uuid()::text, ${entry.lotId}, ${creditTransactionId}, ${entry.amount}, now())
    `
  }
}

/**
 * Creates a new credit lot, idempotent on idempotencyKey. Each lot owns its
 * own expiresAt: granting a new lot never extends or touches any other
 * lot's expiry (D-011 — "nessun acquisto estende la scadenza dei lotti
 * precedenti").
 */
export async function createCreditLotInTransaction(
  tx: CreditTxClient,
  input: {
    companyId: string
    creditOrderId: string | null
    source: CreditLotSourceValue
    credits: number
    expiresAt: Date
    idempotencyKey: string
  },
): Promise<{ id: string; alreadyExisted: boolean }> {
  const existing = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT "id" FROM "CreditLot" WHERE "idempotencyKey" = ${input.idempotencyKey} LIMIT 1
  `
  if (existing[0]) {
    return { id: existing[0].id, alreadyExisted: true }
  }

  const rows = await tx.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "CreditLot" (
      "id", "companyId", "creditOrderId", "source",
      "quantityInitial", "quantityRemaining", "expiresAt", "status",
      "idempotencyKey", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text, ${input.companyId}, ${input.creditOrderId},
      ${input.source}::"CreditLotSource",
      ${input.credits}, ${input.credits}, ${input.expiresAt}, 'ACTIVE',
      ${input.idempotencyKey}, now(), now()
    )
    ON CONFLICT ("idempotencyKey") DO NOTHING
    RETURNING "id"
  `

  if (rows[0]) {
    return { id: rows[0].id, alreadyExisted: false }
  }

  const retry = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT "id" FROM "CreditLot" WHERE "idempotencyKey" = ${input.idempotencyKey} LIMIT 1
  `
  const retryId = retry[0]?.id
  if (!retryId) throw new Error("createCreditLotInTransaction: insert and idempotency retry both failed.")
  return { id: retryId, alreadyExisted: true }
}

/**
 * Derives the true balance/expiry from ACTIVE lots. expiresAt here is the
 * MAX (latest) active lot expiry — used for the CompanyCreditAccount cache
 * so that legacy global-balance readers outside packages/billing only ever
 * see "expired" once every lot has genuinely expired. For the user-facing
 * "next expiration" indicator, use nearestExpiresAt instead.
 */
export async function deriveCreditSummaryInTransaction(
  tx: CreditTxClient,
  companyId: string,
): Promise<CompanyCreditSummary & { nearestExpiresAt: Date | null }> {
  const rows = await tx.$queryRaw<
    Array<{ total: bigint | null; max_expires_at: Date | null; min_expires_at: Date | null }>
  >`
    SELECT SUM("quantityRemaining") AS total, MAX("expiresAt") AS max_expires_at, MIN("expiresAt") AS min_expires_at
    FROM "CreditLot"
    WHERE "companyId" = ${companyId} AND "status" = 'ACTIVE'
  `

  return {
    balance: Number(rows[0]?.total ?? 0),
    expiresAt: rows[0]?.max_expires_at ?? null,
    nearestExpiresAt: rows[0]?.min_expires_at ?? null,
  }
}

/**
 * Re-syncs the CompanyCreditAccount cache row from CreditLot. Must be called
 * at the end of every operation that mutates CreditLot rows (debit, grant,
 * refund, expiration) so consumers outside packages/billing (which still
 * read the global account row, e.g. packages/domain get-profile-page.ts)
 * never observe a balance that diverges from the lots for longer than the
 * current transaction.
 */
export async function syncCompanyCreditAccountCacheInTransaction(
  tx: CreditTxClient,
  companyId: string,
): Promise<CompanyCreditSummary> {
  const { balance, expiresAt } = await deriveCreditSummaryInTransaction(tx, companyId)

  await tx.$executeRaw`
    INSERT INTO "CompanyCreditAccount" ("id", "companyId", "balance", "expiresAt", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, ${companyId}, ${balance}, ${expiresAt}, now(), now())
    ON CONFLICT ("companyId") DO UPDATE
    SET "balance" = ${balance}, "expiresAt" = ${expiresAt}, "updatedAt" = now()
  `

  return { balance, expiresAt }
}

export type CreditLotReadModel = {
  balance: number
  nearestExpiresAt: Date | null
  lots: CreditLotListItem[]
}

/**
 * Read-only credits view for page renders: one plain query, no transaction,
 * no row locks, no writes. Lots whose expiresAt has already passed are
 * excluded directly in the WHERE clause (not by flipping status), so the
 * page is always correct even before the lazy expiration sweep — which only
 * runs inside write-path transactions (grant/debit/refund/admin adjustment,
 * see expireStaleLotsInTransaction) — has processed this company.
 * Phase 17 (credits runtime stabilization): the page used to call
 * refreshCompanyCreditState on every render, which opened a transaction and
 * took FOR UPDATE locks purely to read — that is what produced P2028 under
 * concurrent page loads, checkout polling, and webhook fulfillment. Never
 * add $transaction/FOR UPDATE/writes to this function.
 */
export async function getActiveCreditLotsReadModel(
  companyId: string,
  now: Date,
): Promise<CreditLotReadModel> {
  const rows = await prisma.$queryRaw<Array<CreditLotRow>>`
    SELECT "id", "quantityRemaining" AS quantity_remaining, "expiresAt" AS expires_at
    FROM "CreditLot"
    WHERE "companyId" = ${companyId} AND "status" = 'ACTIVE' AND "expiresAt" > ${now}
    ORDER BY "expiresAt" ASC
  `

  const lots: CreditLotListItem[] = rows.map((row) => ({
    id: row.id,
    creditsRemaining: Number(row.quantity_remaining),
    expiresAt: row.expires_at,
  }))

  const balance = lots.reduce((sum, lot) => sum + lot.creditsRemaining, 0)
  const nearestExpiresAt = lots[0]?.expiresAt ?? null

  return { balance, nearestExpiresAt, lots }
}

export type CompanyCreditSummaryView = {
  balance: number
  nearestExpiresAt: Date | null
}

/**
 * Lightweight public summary (balance + next expiry, no per-lot breakdown)
 * for read-only callers outside the credits page that only need the
 * headline numbers — e.g. packages/domain company profile summary. Backed
 * by getActiveCreditLotsReadModel: a plain query, no transaction, no FOR
 * UPDATE, no CompanyCreditAccount write. Phase 17.1: this used to call
 * refreshCompanyCreditState (transactional, row-locking) on every profile
 * page view — the same P2028-causing pattern fixed on the credits page in
 * Phase 17. Never route this back through refreshCompanyCreditState.
 */
export async function getCompanyCreditSummary(
  companyId: string,
  now: Date = new Date(),
): Promise<CompanyCreditSummaryView> {
  const { balance, nearestExpiresAt } = await getActiveCreditLotsReadModel(companyId, now)
  return { balance, nearestExpiresAt }
}
