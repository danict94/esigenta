import type {
  CompanyCreditAccount,
  Prisma,
} from "@prisma/client"

import {
  prisma,
} from "../prisma/client"

export type CreditLedgerResult<T> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      code: string
      message: string
    }

export type CompanyCreditAccountSummary = {
  accountId: string
  companyId: string
  balance: number
  expiresAt: Date | null
}

export type EnsureCompanyCreditAccountFreshInput = {
  companyId: string
  now?: Date
}

export type GetCompanyCreditAccountSummaryInput = {
  companyId: string
}

export type GrantCreditsFromCreditOrderInput = {
  creditOrderId: string
  now?: Date
  idempotencyKey?: string
}

export type GrantCreditsFromCreditOrderData = {
  accountId: string
  transactionId: string
  balanceAfter: number
  expiresAtAfter: Date
}

export type DebitCompanyCreditsInput = {
  companyId: string
  amount: number
  requestId?: string | null
  idempotencyKey: string
  reason?: string | null
  now?: Date
}

export type DebitCompanyCreditsData = {
  accountId: string
  transactionId: string
  balanceAfter: number
  expiresAtAfter: Date | null
}

type CreditTransactionClient =
  Prisma.TransactionClient

type LockedCompanyCreditAccount =
  Pick<
    CompanyCreditAccount,
    "id" | "companyId" | "balance" | "expiresAt"
  >

function normalizeRequiredText(
  value: string,
): string | null {
  const trimmed =
    value.trim()

  return trimmed
    ? trimmed
    : null
}

function addDays(
  date: Date,
  days: number,
) {
  return new Date(
    date.getTime() +
      days * 24 * 60 * 60 * 1000,
  )
}

function mapAccountSummary(
  account: LockedCompanyCreditAccount,
): CompanyCreditAccountSummary {
  return {
    accountId: account.id,
    companyId: account.companyId,
    balance: account.balance,
    expiresAt: account.expiresAt,
  }
}

async function findTransactionByIdempotencyKey(
  tx: CreditTransactionClient,
  idempotencyKey: string,
) {
  return tx.companyCreditTransaction.findUnique({
    where: {
      idempotencyKey,
    },
    select: {
      id: true,
      accountId: true,
      balanceAfter: true,
      expiresAtAfter: true,
    },
  })
}

async function getOrCreateCompanyCreditAccount(
  tx: CreditTransactionClient,
  companyId: string,
): Promise<LockedCompanyCreditAccount> {
  const existing =
    await tx.companyCreditAccount.findUnique({
      where: {
        companyId,
      },
      select: {
        id: true,
        companyId: true,
        balance: true,
        expiresAt: true,
      },
    })

  if (existing) {
    return existing
  }

  return tx.companyCreditAccount.create({
    data: {
      companyId,
      balance: 0,
      expiresAt: null,
    },
    select: {
      id: true,
      companyId: true,
      balance: true,
      expiresAt: true,
    },
  })
}

async function lockCompanyCreditAccountForUpdate(
  tx: CreditTransactionClient,
  companyId: string,
): Promise<LockedCompanyCreditAccount> {
  await tx.$queryRaw<Array<{ id: string }>>`
    SELECT "id"
    FROM "CompanyCreditAccount"
    WHERE "companyId" = ${companyId}
    FOR UPDATE
  `

  const account =
    await tx.companyCreditAccount.findUnique({
      where: {
        companyId,
      },
      select: {
        id: true,
        companyId: true,
        balance: true,
        expiresAt: true,
      },
    })

  if (!account) {
    throw new Error(
      "Company credit account lock failed.",
    )
  }

  return account
}

async function lockFreshCompanyCreditAccount(
  tx: CreditTransactionClient,
  companyId: string,
) {
  await getOrCreateCompanyCreditAccount(
    tx,
    companyId,
  )

  return lockCompanyCreditAccountForUpdate(
    tx,
    companyId,
  )
}

async function ensureCreditAccountFreshInTransaction(
  tx: CreditTransactionClient,
  {
    companyId,
    now,
  }: {
    companyId: string
    now: Date
  },
): Promise<LockedCompanyCreditAccount> {
  const account =
    await lockFreshCompanyCreditAccount(
      tx,
      companyId,
    )

  if (
    account.expiresAt === null ||
    account.expiresAt > now
  ) {
    return account
  }

  if (account.balance > 0) {
    await tx.companyCreditTransaction.create({
      data: {
        companyId,
        accountId: account.id,
        type: "CREDIT_EXPIRATION",
        status: "COMPLETED",
        amount: -account.balance,
        balanceBefore: account.balance,
        balanceAfter: 0,
        expiresAtBefore:
          account.expiresAt,
        expiresAtAfter: null,
        idempotencyKey:
          `credit-expiration:${companyId}:${account.expiresAt.toISOString()}`,
        reason: "Scadenza crediti",
      },
    })
  }

  return tx.companyCreditAccount.update({
    where: {
      id: account.id,
    },
    data: {
      balance: 0,
      expiresAt: null,
    },
    select: {
      id: true,
      companyId: true,
      balance: true,
      expiresAt: true,
    },
  })
}

export async function ensureCompanyCreditAccountFresh({
  companyId,
  now = new Date(),
}: EnsureCompanyCreditAccountFreshInput): Promise<
  CreditLedgerResult<CompanyCreditAccountSummary>
> {
  const normalizedCompanyId =
    normalizeRequiredText(companyId)

  if (!normalizedCompanyId) {
    return {
      ok: false,
      code: "invalid_company_id",
      message: "Impresa non valida.",
    }
  }

  const account =
    await prisma.$transaction((tx) =>
      ensureCreditAccountFreshInTransaction(
        tx,
        {
          companyId:
            normalizedCompanyId,
          now,
        },
      ),
    )

  return {
    ok: true,
    data: mapAccountSummary(account),
  }
}

export async function getCompanyCreditAccountSummary({
  companyId,
}: GetCompanyCreditAccountSummaryInput): Promise<
  CreditLedgerResult<CompanyCreditAccountSummary>
> {
  return ensureCompanyCreditAccountFresh({
    companyId,
  })
}

export async function grantCreditsFromCreditOrder({
  creditOrderId,
  now = new Date(),
  idempotencyKey,
}: GrantCreditsFromCreditOrderInput): Promise<
  CreditLedgerResult<GrantCreditsFromCreditOrderData>
> {
  const normalizedCreditOrderId =
    normalizeRequiredText(creditOrderId)

  if (!normalizedCreditOrderId) {
    return {
      ok: false,
      code: "invalid_credit_order_id",
      message: "Ordine crediti non valido.",
    }
  }

  const ledgerIdempotencyKey =
    normalizeRequiredText(
      idempotencyKey ??
        `credit-order:${normalizedCreditOrderId}:package-purchase`,
    )

  if (!ledgerIdempotencyKey) {
    return {
      ok: false,
      code: "invalid_idempotency_key",
      message:
        "Chiave di idempotenza non valida.",
    }
  }

  const existingTransaction =
    await findTransactionByIdempotencyKey(
      prisma,
      ledgerIdempotencyKey,
    )

  if (existingTransaction) {
    return {
      ok: true,
      data: {
        accountId:
          existingTransaction.accountId,
        transactionId:
          existingTransaction.id,
        balanceAfter:
          existingTransaction.balanceAfter,
        expiresAtAfter:
          existingTransaction.expiresAtAfter ??
          now,
      },
    }
  }

  const order =
    await prisma.creditOrder.findUnique({
      where: {
        id: normalizedCreditOrderId,
      },
      select: {
        id: true,
        companyId: true,
        packageId: true,
        credits: true,
        status: true,
        paidAt: true,
        package: {
          select: {
            id: true,
            validityDays: true,
          },
        },
      },
    })

  if (!order) {
    return {
      ok: false,
      code: "credit_order_not_found",
      message: "Ordine crediti non trovato.",
    }
  }

  if (!order.package) {
    return {
      ok: false,
      code: "credit_package_not_found",
      message:
        "Pacchetto crediti non trovato per questo ordine.",
    }
  }

  if (
    order.status === "FAILED" ||
    order.status === "CANCELLED" ||
    order.status === "REFUNDED"
  ) {
    return {
      ok: false,
      code: "credit_order_not_grantable",
      message:
        "Questo ordine crediti non può essere applicato.",
    }
  }

  const packageValidityDays =
    order.package.validityDays

  const result =
    await prisma.$transaction(async (tx) => {
      const transactionAlreadyCreated =
        await findTransactionByIdempotencyKey(
          tx,
          ledgerIdempotencyKey,
        )

      if (transactionAlreadyCreated) {
        return {
          accountId:
            transactionAlreadyCreated.accountId,
          transactionId:
            transactionAlreadyCreated.id,
          balanceAfter:
            transactionAlreadyCreated.balanceAfter,
          expiresAtAfter:
            transactionAlreadyCreated.expiresAtAfter ??
            now,
        }
      }

      const freshAccount =
        await ensureCreditAccountFreshInTransaction(
          tx,
          {
            companyId: order.companyId,
            now,
          },
        )

      const balanceBefore =
        freshAccount.balance
      const balanceAfter =
        balanceBefore + order.credits
      const expiresAtBefore =
        freshAccount.expiresAt
      const expirationBase =
        expiresAtBefore && expiresAtBefore > now
          ? expiresAtBefore
          : now
      const expiresAtAfter =
        addDays(
          expirationBase,
          packageValidityDays,
        )

      const transaction =
        await tx.companyCreditTransaction.create({
          data: {
            companyId: order.companyId,
            accountId: freshAccount.id,
            type: "PACKAGE_PURCHASE",
            status: "COMPLETED",
            amount: order.credits,
            balanceBefore,
            balanceAfter,
            expiresAtBefore,
            expiresAtAfter,
            creditOrderId: order.id,
            idempotencyKey:
              ledgerIdempotencyKey,
          },
          select: {
            id: true,
          },
        })

      await tx.companyCreditAccount.update({
        where: {
          id: freshAccount.id,
        },
        data: {
          balance: balanceAfter,
          expiresAt: expiresAtAfter,
        },
      })

      await tx.creditOrder.update({
        where: {
          id: order.id,
        },
        data: {
          status: "PAID",
          paidAt:
            order.paidAt ?? now,
          validFrom:
            expirationBase,
          validUntil:
            expiresAtAfter,
        },
      })

      return {
        accountId: freshAccount.id,
        transactionId: transaction.id,
        balanceAfter,
        expiresAtAfter,
      }
    })

  return {
    ok: true,
    data: result,
  }
}

export async function debitCompanyCredits({
  companyId,
  amount,
  requestId,
  idempotencyKey,
  reason,
  now = new Date(),
}: DebitCompanyCreditsInput): Promise<
  CreditLedgerResult<DebitCompanyCreditsData>
> {
  const normalizedCompanyId =
    normalizeRequiredText(companyId)

  if (!normalizedCompanyId) {
    return {
      ok: false,
      code: "invalid_company_id",
      message: "Impresa non valida.",
    }
  }

  if (!Number.isInteger(amount) || amount < 1) {
    return {
      ok: false,
      code: "invalid_credit_amount",
      message:
        "L'importo crediti deve essere un intero positivo.",
    }
  }

  const normalizedIdempotencyKey =
    normalizeRequiredText(idempotencyKey)

  if (!normalizedIdempotencyKey) {
    return {
      ok: false,
      code: "invalid_idempotency_key",
      message:
        "Chiave di idempotenza obbligatoria.",
    }
  }

  const existingTransaction =
    await findTransactionByIdempotencyKey(
      prisma,
      normalizedIdempotencyKey,
    )

  if (existingTransaction) {
    return {
      ok: true,
      data: {
        accountId:
          existingTransaction.accountId,
        transactionId:
          existingTransaction.id,
        balanceAfter:
          existingTransaction.balanceAfter,
        expiresAtAfter:
          existingTransaction.expiresAtAfter,
      },
    }
  }

  const result =
    await prisma.$transaction(async (tx) => {
      const transactionAlreadyCreated =
        await findTransactionByIdempotencyKey(
          tx,
          normalizedIdempotencyKey,
        )

      if (transactionAlreadyCreated) {
        return {
          ok: true as const,
          data: {
            accountId:
              transactionAlreadyCreated.accountId,
            transactionId:
              transactionAlreadyCreated.id,
            balanceAfter:
              transactionAlreadyCreated.balanceAfter,
            expiresAtAfter:
              transactionAlreadyCreated.expiresAtAfter,
          },
        }
      }

      const freshAccount =
        await ensureCreditAccountFreshInTransaction(
          tx,
          {
            companyId:
              normalizedCompanyId,
            now,
          },
        )

      if (freshAccount.balance < amount) {
        return {
          ok: false as const,
          code: "insufficient_credits",
          message: "Crediti insufficienti.",
        }
      }

      const balanceBefore =
        freshAccount.balance
      const balanceAfter =
        balanceBefore - amount
      const expiresAtBefore =
        freshAccount.expiresAt

      const transaction =
        await tx.companyCreditTransaction.create({
          data: {
            companyId:
              normalizedCompanyId,
            accountId: freshAccount.id,
            type: "REQUEST_UNLOCK",
            status: "COMPLETED",
            amount: -amount,
            balanceBefore,
            balanceAfter,
            expiresAtBefore,
            expiresAtAfter:
              expiresAtBefore,
            requestId:
              requestId || null,
            idempotencyKey:
              normalizedIdempotencyKey,
            reason:
              reason || null,
          },
          select: {
            id: true,
          },
        })

      await tx.companyCreditAccount.update({
        where: {
          id: freshAccount.id,
        },
        data: {
          balance: balanceAfter,
        },
      })

      return {
        ok: true as const,
        data: {
          accountId: freshAccount.id,
          transactionId:
            transaction.id,
          balanceAfter,
          expiresAtAfter:
            expiresAtBefore,
        },
      }
    })

  return result
}
