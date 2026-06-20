import { Prisma } from "@prisma/client"

import {
  ensureCreditAccountRowInTransaction,
  expireStaleLotsInTransaction,
  lockAndPlanFefoConsumptionInTransaction,
  applyFefoConsumptionPlanInTransaction,
  deriveCreditSummaryInTransaction,
  syncCompanyCreditAccountCacheInTransaction,
} from "./lot-ledger"

type CreditTxClient = Prisma.TransactionClient

export type DebitCreditsInput = {
  companyId: string
  amount: number
  requestId: string | null
  idempotencyKey: string
  reason: string | null
  now: Date
}

export type DebitCreditsErrorCode =
  | "invalid_company_id"
  | "invalid_credit_amount"
  | "invalid_idempotency_key"
  | "insufficient_credits"

export type DebitCreditsData = {
  accountId: string
  transactionId: string
  balanceAfter: number
  expiresAtAfter: Date | null
}

export type DebitCreditsResult =
  | { ok: true; data: DebitCreditsData }
  | { ok: false; code: DebitCreditsErrorCode; message: string }

async function findIdempotentTx(
  tx: CreditTxClient,
  idempotencyKey: string,
): Promise<{ id: string; account_id: string; balance_after: number; expires_at_after: Date | null } | null> {
  const rows = await tx.$queryRaw<
    Array<{ id: string; account_id: string; balance_after: number; expires_at_after: Date | null }>
  >`
    SELECT "id", "accountId" AS account_id, "balanceAfter" AS balance_after, "expiresAtAfter" AS expires_at_after
    FROM "CompanyCreditTransaction"
    WHERE "idempotencyKey" = ${idempotencyKey}
    LIMIT 1
  `
  return rows[0] ?? null
}

/**
 * Debits credits FEFO across the company's active credit lots (D-011).
 * Preserves the exact external contract relied on by
 * packages/domain/src/company/requests/unlock-request.ts: same input shape,
 * same error codes ("insufficient_credits" etc.), same success data shape.
 */
export async function debitCompanyCreditsInTransaction(
  tx: CreditTxClient,
  input: DebitCreditsInput,
): Promise<DebitCreditsResult> {
  const { companyId, amount, requestId, idempotencyKey, reason, now } = input

  if (!companyId.trim()) {
    return { ok: false, code: "invalid_company_id", message: "ID azienda obbligatorio." }
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    return { ok: false, code: "invalid_credit_amount", message: "L'importo crediti deve essere un intero positivo." }
  }
  if (!idempotencyKey.trim()) {
    return { ok: false, code: "invalid_idempotency_key", message: "Chiave di idempotenza obbligatoria." }
  }

  const existing = await findIdempotentTx(tx, idempotencyKey)
  if (existing) {
    return {
      ok: true,
      data: {
        accountId: existing.account_id,
        transactionId: existing.id,
        balanceAfter: Number(existing.balance_after),
        expiresAtAfter: existing.expires_at_after,
      },
    }
  }

  const accountId = await ensureCreditAccountRowInTransaction(tx, companyId)
  await expireStaleLotsInTransaction(tx, companyId, now)

  const before = await deriveCreditSummaryInTransaction(tx, companyId)

  const planResult = await lockAndPlanFefoConsumptionInTransaction(tx, companyId, amount)
  if (!planResult.ok) {
    return { ok: false, code: "insufficient_credits", message: "Crediti insufficienti." }
  }

  const txRows = await tx.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "CompanyCreditTransaction" (
      "id", "companyId", "accountId", "type", "status",
      "amount", "balanceBefore", "balanceAfter",
      "expiresAtBefore", "expiresAtAfter",
      "requestId", "idempotencyKey", "reason",
      "createdAt"
    ) VALUES (
      gen_random_uuid()::text, ${companyId}, ${accountId},
      'REQUEST_UNLOCK', 'COMPLETED',
      ${-amount}, ${before.balance}, ${before.balance - amount},
      ${before.expiresAt}, ${before.expiresAt},
      ${requestId}, ${idempotencyKey}, ${reason},
      now()
    )
    RETURNING "id"
  `
  const txId = txRows[0]!.id

  await applyFefoConsumptionPlanInTransaction(tx, planResult.plan, txId)

  const after = await syncCompanyCreditAccountCacheInTransaction(tx, companyId)

  await tx.$executeRaw`
    UPDATE "CompanyCreditTransaction"
    SET "balanceAfter" = ${after.balance}, "expiresAtAfter" = ${after.expiresAt}
    WHERE "id" = ${txId}
  `

  return {
    ok: true,
    data: {
      accountId,
      transactionId: txId,
      balanceAfter: after.balance,
      expiresAtAfter: after.expiresAt,
    },
  }
}
