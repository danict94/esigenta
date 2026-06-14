import { Prisma } from "@prisma/client"

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

type AccountRow = {
  id: string
  balance: bigint
  expires_at: Date | null
}

type TxRow = {
  id: string
  account_id: string
  balance_after: bigint
  expires_at_after: Date | null
}

async function findIdempotentTx(
  tx: CreditTxClient,
  idempotencyKey: string,
): Promise<TxRow | null> {
  const rows = await tx.$queryRaw<Array<TxRow>>`
    SELECT "id", "accountId" AS account_id, "balanceAfter" AS balance_after, "expiresAtAfter" AS expires_at_after
    FROM "CompanyCreditTransaction"
    WHERE "idempotencyKey" = ${idempotencyKey}
    LIMIT 1
  `
  return rows[0] ?? null
}

async function lockFreshAccount(
  tx: CreditTxClient,
  companyId: string,
  now: Date,
): Promise<AccountRow> {
  await tx.$executeRaw`
    INSERT INTO "CompanyCreditAccount" ("id", "companyId", "balance", "expiresAt", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, ${companyId}, 0, NULL, now(), now())
    ON CONFLICT ("companyId") DO NOTHING
  `

  const rows = await tx.$queryRaw<Array<AccountRow>>`
    SELECT "id", "balance", "expiresAt" AS expires_at
    FROM "CompanyCreditAccount"
    WHERE "companyId" = ${companyId}
    FOR UPDATE
  `

  const account = rows[0]
  if (!account) throw new Error("Credit account lock failed after insert.")

  if (account.expires_at !== null && account.expires_at <= now) {
    const balance = Number(account.balance)
    if (balance > 0) {
      const expKey = `credit-expiration:${companyId}:${account.expires_at.toISOString()}`
      await tx.$executeRaw`
        INSERT INTO "CompanyCreditTransaction" (
          "id", "companyId", "accountId", "type", "status",
          "amount", "balanceBefore", "balanceAfter",
          "expiresAtBefore", "expiresAtAfter",
          "idempotencyKey", "reason", "createdAt"
        ) VALUES (
          gen_random_uuid()::text, ${companyId}, ${account.id},
          'CREDIT_EXPIRATION', 'COMPLETED',
          ${-balance}, ${balance}, 0,
          ${account.expires_at}, NULL,
          ${expKey},
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
    return { id: account.id, balance: 0n, expires_at: null }
  }

  return account
}

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

  const account = await lockFreshAccount(tx, companyId, now)
  const balanceBefore = Number(account.balance)

  if (balanceBefore < amount) {
    return { ok: false, code: "insufficient_credits", message: "Crediti insufficienti." }
  }

  const balanceAfter = balanceBefore - amount
  const expiresAtAfter = account.expires_at

  const txRows = await tx.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "CompanyCreditTransaction" (
      "id", "companyId", "accountId", "type", "status",
      "amount", "balanceBefore", "balanceAfter",
      "expiresAtBefore", "expiresAtAfter",
      "requestId", "idempotencyKey", "reason",
      "createdAt"
    ) VALUES (
      gen_random_uuid()::text, ${companyId}, ${account.id},
      'REQUEST_UNLOCK', 'COMPLETED',
      ${-amount}, ${balanceBefore}, ${balanceAfter},
      ${account.expires_at}, ${expiresAtAfter},
      ${requestId}, ${idempotencyKey}, ${reason},
      now()
    )
    RETURNING "id"
  `

  const txId = txRows[0]!.id

  await tx.$executeRaw`
    UPDATE "CompanyCreditAccount"
    SET "balance" = ${balanceAfter}, "updatedAt" = now()
    WHERE "id" = ${account.id}
  `

  return {
    ok: true,
    data: {
      accountId: account.id,
      transactionId: txId,
      balanceAfter,
      expiresAtAfter,
    },
  }
}
