import type {
  RequestStatus,
} from "@prisma/client"

import {
  prisma,
} from "../prisma/client"

import {
  debitCompanyCreditsInTransaction,
} from "../credits/credit-ledger"
import {
  ensureCompanyCustomerConversationForUnlock,
} from "../conversations"
import {
  assertCompanyCanUseMarketplace,
  CompanyMarketplaceAuthorizationError,
} from "../identity"

export type UnlockRequestForCompanyInput = {
  companyId: string
  requestId: string
  now?: Date
}

export type UnlockRequestForCompanyResult =
  | {
      ok: true
      data: {
        requestUnlockId: string
        creditTransactionId: string
        balanceAfter: number
        unlockCount: number
        maxUnlocks: number
        conversationId: string
        customerConversationAccessToken: string
        customerConversationAccessTokenExpiresAt: Date
      }
    }
  | {
      ok: false
      code: string
      message: string
    }

const unlockableRequestStatuses: RequestStatus[] = [
  "APPROVED",
  "PUBLISHED",
]

function normalizeRequiredText(
  value: string,
): string | null {
  const trimmed =
    value.trim()

  return trimmed
    ? trimmed
    : null
}

function isPositiveInteger(
  value: number | null,
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1
  )
}

export async function unlockRequestForCompany({
  companyId,
  requestId,
  now = new Date(),
}: UnlockRequestForCompanyInput): Promise<UnlockRequestForCompanyResult> {
  const normalizedCompanyId =
    normalizeRequiredText(companyId)
  const normalizedRequestId =
    normalizeRequiredText(requestId)

  if (!normalizedCompanyId) {
    return {
      ok: false,
      code: "invalid_company_id",
      message: "Impresa non valida.",
    }
  }

  if (!normalizedRequestId) {
    return {
      ok: false,
      code: "invalid_request_id",
      message: "Richiesta non valida.",
    }
  }

  try {
    await assertCompanyCanUseMarketplace({
      companyId:
        normalizedCompanyId,
    })
  } catch (error) {
    if (
      error instanceof
      CompanyMarketplaceAuthorizationError
    ) {
      return {
        ok: false,
        code: error.code,
        message: error.message,
      }
    }

    throw error
  }

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "Request"
      WHERE "id" = ${normalizedRequestId}
      FOR UPDATE
    `

    const request =
      await tx.request.findUnique({
        where: {
          id: normalizedRequestId,
        },
        select: {
          id: true,
          status: true,
          creditCost: true,
          maxUnlocks: true,
          unlockCount: true,
          customerId: true,
          customerEmail: true,
          customer: {
            select: {
              email: true,
            },
          },
        },
      })

    if (!request) {
      return {
        ok: false,
        code: "request_not_found",
        message: "Richiesta non trovata.",
      }
    }

    if (
      !unlockableRequestStatuses.includes(
        request.status,
      )
    ) {
      return {
        ok: false,
        code: "request_not_available",
        message:
          "Questa richiesta non è disponibile per lo sblocco.",
      }
    }

    if (
      !isPositiveInteger(request.creditCost) ||
      !isPositiveInteger(request.maxUnlocks)
    ) {
      return {
        ok: false,
        code: "request_not_commercially_configured",
        message:
          "Questa richiesta non è ancora pronta per lo sblocco.",
      }
    }

    if (
      !request.customerId ||
      !(
        request.customer?.email ??
        request.customerEmail
      )
    ) {
      return {
        ok: false,
        code: "customer_not_found",
        message:
          "Cliente non disponibile per questo canale messaggi.",
      }
    }

    if (
      request.unlockCount >= request.maxUnlocks
    ) {
      return {
        ok: false,
        code: "request_unlock_limit_reached",
        message:
          "Il limite di imprese per questa richiesta è stato raggiunto.",
      }
    }

    const existingUnlock =
      await tx.requestUnlock.findUnique({
        where: {
          requestId_companyId: {
            requestId: normalizedRequestId,
            companyId: normalizedCompanyId,
          },
        },
        select: {
          id: true,
        },
      })

    if (existingUnlock) {
      return {
        ok: false,
        code: "request_already_unlocked",
        message:
          "Hai già sbloccato questa richiesta.",
      }
    }

    const debitResult =
      await debitCompanyCreditsInTransaction(
        tx,
        {
          companyId:
            normalizedCompanyId,
          amount:
            request.creditCost,
          requestId:
            normalizedRequestId,
          idempotencyKey:
            `request-unlock:${normalizedRequestId}:${normalizedCompanyId}`,
          reason:
            "Sblocco richiesta",
          now,
        },
      )

    if (!debitResult.ok) {
      if (
        debitResult.code ===
        "insufficient_credits"
      ) {
        return {
          ok: false,
          code: "insufficient_credits",
          message:
            "Crediti insufficienti.",
        }
      }

      return {
        ok: false,
        code: debitResult.code,
        message: debitResult.message,
      }
    }

    const requestUnlock =
      await tx.requestUnlock.create({
        data: {
          requestId:
            normalizedRequestId,
          companyId:
            normalizedCompanyId,
          creditCost:
            request.creditCost,
          creditTransactionId:
            debitResult.data.transactionId,
        },
        select: {
          id: true,
        },
      })

    const updatedRequest =
      await tx.request.update({
        where: {
          id: normalizedRequestId,
        },
        data: {
          unlockCount: {
            increment: 1,
          },
        },
        select: {
          unlockCount: true,
        },
      })

    const conversationResult =
      await ensureCompanyCustomerConversationForUnlock({
        tx,
        requestUnlockId:
          requestUnlock.id,
        now,
      })

    if (!conversationResult.ok) {
      return {
        ok: false,
        code: conversationResult.code,
        message:
          conversationResult.message,
      }
    }

    return {
      ok: true,
      data: {
        requestUnlockId:
          requestUnlock.id,
        creditTransactionId:
          debitResult.data.transactionId,
        balanceAfter:
          debitResult.data.balanceAfter,
        unlockCount:
          updatedRequest.unlockCount,
        maxUnlocks:
          request.maxUnlocks,
        conversationId:
          conversationResult.conversationId,
        customerConversationAccessToken:
          conversationResult.customerConversationAccessToken,
        customerConversationAccessTokenExpiresAt:
          conversationResult.customerConversationAccessTokenExpiresAt,
      },
    }
  })
}
