import type {
  CreditOrderStatus,
} from "@prisma/client"

import {
  prisma,
} from "../prisma/client"

import {
  getCreditOrderIdFromCheckoutSessionData,
} from "./credit-checkout-session"

import {
  normalizeRequiredText,
} from "./credit-result"

import type {
  CreditLedgerResult,
} from "./credit-result"

export type GetCreditOrderCheckoutStatusInput = {
  companyId: string
  checkoutSessionId: string
  clientReferenceId?: string | null
  metadata?: Record<
    string,
    string | null | undefined
  > | null
}

export type CreditOrderCheckoutStatusData = {
  creditOrderId: string
  companyId: string
  providerCheckoutId: string | null
  orderStatus: CreditOrderStatus
  fulfilled: boolean
  transactionId: string | null
}

export async function getCreditOrderCheckoutStatus({
  companyId,
  checkoutSessionId,
  clientReferenceId,
  metadata,
}: GetCreditOrderCheckoutStatusInput): Promise<
  CreditLedgerResult<CreditOrderCheckoutStatusData>
> {
  const normalizedCompanyId =
    normalizeRequiredText(companyId)
  const normalizedCheckoutSessionId =
    normalizeRequiredText(checkoutSessionId)
  const creditOrderId =
    getCreditOrderIdFromCheckoutSessionData({
      clientReferenceId,
      metadata,
    })

  if (!normalizedCompanyId) {
    return {
      ok: false,
      code: "invalid_company_id",
      message: "Impresa non valida.",
    }
  }

  if (!normalizedCheckoutSessionId) {
    return {
      ok: false,
      code: "invalid_checkout_session_id",
      message:
        "Sessione Stripe Checkout non valida.",
    }
  }

  const orderLookup: Array<{
    providerCheckoutId?: string
    id?: string
  }> = [
    {
      providerCheckoutId:
        normalizedCheckoutSessionId,
    },
  ]

  if (creditOrderId) {
    orderLookup.push({
      id: creditOrderId,
    })
  }

  const order =
    await prisma.creditOrder.findFirst({
      where: {
        companyId:
          normalizedCompanyId,
        OR: orderLookup,
      },
      select: {
        id: true,
        companyId: true,
        providerCheckoutId: true,
        status: true,
        transactions: {
          where: {
            type: "PACKAGE_PURCHASE",
            status: "COMPLETED",
          },
          orderBy: {
            createdAt: "asc",
          },
          take: 1,
          select: {
            id: true,
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

  if (
    order.providerCheckoutId &&
    order.providerCheckoutId !==
      normalizedCheckoutSessionId
  ) {
    return {
      ok: false,
      code: "invalid_checkout_session_id",
      message:
        "Sessione Stripe Checkout non valida per questo ordine.",
    }
  }

  const transaction =
    order.transactions[0] ?? null

  return {
    ok: true,
    data: {
      creditOrderId: order.id,
      companyId: order.companyId,
      providerCheckoutId:
        order.providerCheckoutId,
      orderStatus: order.status,
      fulfilled: Boolean(transaction),
      transactionId:
        transaction?.id ?? null,
    },
  }
}