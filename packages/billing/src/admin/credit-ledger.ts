import type {
  CompanyCreditAccount,
} from "@prisma/client"
import {
  Prisma,
} from "@prisma/client"

import { prisma } from "@esigenta/database"

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

export type RefundCompanyCreditsForRequestUnlockInput = {
  requestUnlockId: string
  adminUserId: string
  reason: string
  now?: Date
}

export type RefundCompanyCreditsForRequestUnlockData = {
  requestUnlockId: string
  refundTransactionId: string
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

const REFUND_VALIDITY_DAYS = 30

function addDays(
  date: Date,
  days: number,
) {
  return new Date(
    date.getTime() +
      days * 24 * 60 * 60 * 1000,
  )
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

export async function refundCompanyCreditsForRequestUnlockInTransaction(
  tx: CreditTransactionClient,
  {
    requestUnlockId,
    adminUserId,
    reason,
    now = new Date(),
  }: RefundCompanyCreditsForRequestUnlockInput,
): Promise<
  CreditLedgerResult<RefundCompanyCreditsForRequestUnlockData>
> {
  const normalizedRequestUnlockId =
    requestUnlockId.trim()
  const normalizedAdminUserId =
    adminUserId.trim()
  const normalizedReason =
    reason.trim()

  if (!normalizedRequestUnlockId) {
    return {
      ok: false,
      code: "invalid_request_unlock_id",
      message: "Sblocco richiesta non valido.",
    }
  }

  if (!normalizedAdminUserId) {
    return {
      ok: false,
      code: "invalid_admin_user_id",
      message: "Admin non valido.",
    }
  }

  if (
    !normalizedReason ||
    normalizedReason.length < 3
  ) {
    return {
      ok: false,
      code: "invalid_refund_reason",
      message:
        "Il motivo del rimborso deve contenere almeno 3 caratteri.",
    }
  }

  const idempotencyKey =
    `request-unlock-refund:${normalizedRequestUnlockId}`

  await tx.$queryRaw<Array<{ id: string }>>`
    SELECT "id"
    FROM "RequestUnlock"
    WHERE "id" = ${normalizedRequestUnlockId}
    FOR UPDATE
  `

  const requestUnlock =
    await tx.requestUnlock.findUnique({
      where: {
        id: normalizedRequestUnlockId,
      },
      select: {
        id: true,
        companyId: true,
        requestId: true,
        creditCost: true,
        creditTransactionId: true,
        refundTransactionId: true,
        refundedAt: true,
      },
    })

  if (!requestUnlock) {
    return {
      ok: false,
      code: "request_unlock_not_found",
      message: "Sblocco richiesta non trovato.",
    }
  }

  if (
    requestUnlock.refundTransactionId ||
    requestUnlock.refundedAt
  ) {
    return {
      ok: false,
      code: "request_unlock_already_refunded",
      message:
        "Questo sblocco è già stato rimborsato.",
    }
  }

  const originalTransaction =
    await tx.companyCreditTransaction.findUnique({
      where: {
        id: requestUnlock.creditTransactionId,
      },
      select: {
        id: true,
        type: true,
        amount: true,
        companyId: true,
        requestId: true,
      },
    })

  if (
    !originalTransaction ||
    originalTransaction.type !==
      "REQUEST_UNLOCK" ||
    originalTransaction.amount >= 0 ||
    originalTransaction.amount !==
      -requestUnlock.creditCost ||
    originalTransaction.companyId !==
      requestUnlock.companyId ||
    originalTransaction.requestId !==
      requestUnlock.requestId
  ) {
    return {
      ok: false,
      code: "invalid_unlock_transaction",
      message:
        "La transazione originale dello sblocco non è valida.",
    }
  }

  const existingRefundByRelation =
    await tx.companyCreditTransaction.findFirst({
      where: {
        relatedTransactionId:
          originalTransaction.id,
        type: "REFUND",
      },
      select: {
        id: true,
      },
    })

  if (existingRefundByRelation) {
    return {
      ok: false,
      code: "request_unlock_already_refunded",
      message:
        "Questo sblocco è già stato rimborsato.",
    }
  }

  const existingRefundByKey =
    await findTransactionByIdempotencyKey(
      tx,
      idempotencyKey,
    )

  if (existingRefundByKey) {
    return {
      ok: true,
      data: {
        requestUnlockId:
          requestUnlock.id,
        refundTransactionId:
          existingRefundByKey.id,
        balanceAfter:
          existingRefundByKey.balanceAfter,
        expiresAtAfter:
          existingRefundByKey.expiresAtAfter,
      },
    }
  }

  const freshAccount =
    await ensureCreditAccountFreshInTransaction(
      tx,
      {
        companyId:
          requestUnlock.companyId,
        now,
      },
    )

  const balanceBefore =
    freshAccount.balance
  const balanceAfter =
    balanceBefore +
    requestUnlock.creditCost
  const expiresAtBefore =
    freshAccount.expiresAt
  const refundMinimumExpiresAt =
    addDays(
      now,
      REFUND_VALIDITY_DAYS,
    )
  const expiresAtAfter =
    expiresAtBefore &&
    expiresAtBefore >
      refundMinimumExpiresAt
      ? expiresAtBefore
      : refundMinimumExpiresAt

  const refundTransaction =
    await tx.companyCreditTransaction.create({
      data: {
        companyId:
          requestUnlock.companyId,
        accountId: freshAccount.id,
        type: "REFUND",
        status: "COMPLETED",
        amount:
          requestUnlock.creditCost,
        balanceBefore,
        balanceAfter,
        expiresAtBefore,
        expiresAtAfter,
        requestId:
          requestUnlock.requestId,
        relatedTransactionId:
          originalTransaction.id,
        adminUserId:
          normalizedAdminUserId,
        reason:
          normalizedReason,
        idempotencyKey,
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

  await tx.requestUnlock.update({
    where: {
      id: requestUnlock.id,
    },
    data: {
      refundTransactionId:
        refundTransaction.id,
      refundedAt: now,
      refundReason:
        normalizedReason,
    },
  })

  return {
    ok: true,
    data: {
      requestUnlockId:
        requestUnlock.id,
      refundTransactionId:
        refundTransaction.id,
      balanceAfter,
      expiresAtAfter,
    },
  }
}

export async function refundCompanyCreditsForRequestUnlock(
  input: RefundCompanyCreditsForRequestUnlockInput,
): Promise<
  CreditLedgerResult<RefundCompanyCreditsForRequestUnlockData>
> {
  try {
    return await prisma.$transaction((tx) =>
      refundCompanyCreditsForRequestUnlockInTransaction(
        tx,
        input,
      ),
    )
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        ok: false,
        code: "request_unlock_already_refunded",
        message:
          "Questo sblocco è già stato rimborsato.",
      }
    }

    throw error
  }
}
