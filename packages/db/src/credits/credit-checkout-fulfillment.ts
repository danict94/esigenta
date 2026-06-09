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
  grantCreditsFromCreditOrder,
} from "./credit-ledger"

import type {
  CreditLedgerResult,
} from "./credit-result"

import {
  normalizeRequiredText,
} from "./credit-result"

import {
  markCreditOrderCheckoutCreated,
} from "./credit-orders"

import {
  logStripeDebug,
} from "./stripe-debug"

export type FulfillCreditOrderFromStripeCheckoutSessionInput = {
  checkoutSessionId: string
  clientReferenceId?: string | null
  paymentIntentId?: string | null
  paymentStatus?: string | null
  metadata?: Record<
    string,
    string | null | undefined
  > | null
  expectedCompanyId?: string | null
  providerEventId?: string | null
  eventType?: string | null
  now?: Date
}

export type FulfillCreditOrderFromStripeCheckoutSessionData = {
  creditOrderId: string
  companyId: string
  orderStatus: CreditOrderStatus
  paymentStatus: string | null
  fulfilled: boolean
  alreadyFulfilled: boolean
  checkoutUpdateOk: boolean | null
  grantCreditsOk: boolean | null
  reconciled: boolean
  transactionId: string | null
  balanceAfter: number | null
  expiresAtAfter: Date | null
  idempotencyKey: string
}

async function getOrderFulfillmentSnapshot(
  creditOrderId: string,
) {
  return prisma.creditOrder.findUnique({
    where: {
      id: creditOrderId,
    },
    select: {
      id: true,
      companyId: true,
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
          balanceAfter: true,
          expiresAtAfter: true,
        },
      },
    },
  })
}

function mapFulfillmentData({
  creditOrderId,
  companyId,
  orderStatus,
  paymentStatus,
  transaction,
  idempotencyKey,
  checkoutUpdateOk,
  grantCreditsOk,
  reconciled,
}: {
  creditOrderId: string
  companyId: string
  orderStatus: CreditOrderStatus
  paymentStatus: string | null
  transaction: {
    id: string
    balanceAfter: number
    expiresAtAfter: Date | null
  } | null
  idempotencyKey: string
  checkoutUpdateOk: boolean | null
  grantCreditsOk: boolean | null
  reconciled: boolean
}): FulfillCreditOrderFromStripeCheckoutSessionData {
  return {
    creditOrderId,
    companyId,
    orderStatus,
    paymentStatus,
    fulfilled: Boolean(transaction),
    alreadyFulfilled: Boolean(transaction),
    checkoutUpdateOk,
    grantCreditsOk,
    reconciled,
    transactionId:
      transaction?.id ?? null,
    balanceAfter:
      transaction?.balanceAfter ?? null,
    expiresAtAfter:
      transaction?.expiresAtAfter ?? null,
    idempotencyKey,
  }
}

export async function fulfillCreditOrderFromStripeCheckoutSession({
  checkoutSessionId,
  clientReferenceId,
  paymentIntentId,
  paymentStatus,
  metadata,
  expectedCompanyId,
  providerEventId,
  eventType,
  now = new Date(),
}: FulfillCreditOrderFromStripeCheckoutSessionInput): Promise<
  CreditLedgerResult<FulfillCreditOrderFromStripeCheckoutSessionData>
> {
  const normalizedCheckoutSessionId =
    normalizeRequiredText(checkoutSessionId)
  const creditOrderId =
    getCreditOrderIdFromCheckoutSessionData({
      clientReferenceId,
      metadata,
    })
  const normalizedExpectedCompanyId =
    normalizeRequiredText(expectedCompanyId)

  if (!normalizedCheckoutSessionId) {
    logStripeDebug(
      "fulfillment.invalid_checkout_session_id",
      {
        checkoutSessionId:
          checkoutSessionId || null,
        paymentStatus:
          paymentStatus ?? null,
        eventType:
          eventType ?? null,
      },
    )

    return {
      ok: false,
      code: "invalid_checkout_session_id",
      message:
        "Sessione Stripe Checkout non valida.",
    }
  }

  if (!creditOrderId) {
    logStripeDebug(
      "fulfillment.missing_credit_order_id",
      {
        checkoutSessionId:
          normalizedCheckoutSessionId,
        clientReferenceId:
          clientReferenceId ?? null,
        paymentStatus:
          paymentStatus ?? null,
        eventType:
          eventType ?? null,
      },
    )

    return {
      ok: false,
      code: "missing_credit_order_id",
      message:
        "Ordine crediti mancante nella sessione Stripe.",
    }
  }

  const idempotencyKey =
    `credit-order:${creditOrderId}:package-purchase`

  logStripeDebug(
    "fulfillment.start",
    {
      checkoutSessionId:
        normalizedCheckoutSessionId,
      creditOrderId,
      expectedCompanyId:
        normalizedExpectedCompanyId,
      paymentIntentId:
        paymentIntentId ?? null,
      paymentStatus:
        paymentStatus ?? null,
      providerEventId:
        providerEventId ?? null,
      eventType:
        eventType ?? null,
      idempotencyKey,
    },
  )

  const order =
    await getOrderFulfillmentSnapshot(
      creditOrderId,
    )

  if (!order) {
    logStripeDebug(
      "fulfillment.order_not_found",
      {
        checkoutSessionId:
          normalizedCheckoutSessionId,
        creditOrderId,
        idempotencyKey,
        eventType:
          eventType ?? null,
      },
    )

    return {
      ok: false,
      code: "credit_order_not_found",
      message: "Ordine crediti non trovato.",
    }
  }

  if (
    normalizedExpectedCompanyId &&
    order.companyId !== normalizedExpectedCompanyId
  ) {
    logStripeDebug(
      "fulfillment.company_mismatch",
      {
        checkoutSessionId:
          normalizedCheckoutSessionId,
        creditOrderId:
          order.id,
        companyId:
          order.companyId,
        expectedCompanyId:
          normalizedExpectedCompanyId,
        idempotencyKey,
        eventType:
          eventType ?? null,
      },
    )

    return {
      ok: false,
      code: "credit_order_company_mismatch",
      message:
        "Ordine crediti non valido per questa impresa.",
    }
  }

  const existingTransaction =
    order.transactions[0] ?? null

  if (existingTransaction) {
    return {
      ok: true,
      data: mapFulfillmentData({
        creditOrderId: order.id,
        companyId: order.companyId,
        orderStatus: order.status,
        paymentStatus:
          paymentStatus ?? null,
        transaction:
          existingTransaction,
        idempotencyKey,
        checkoutUpdateOk: null,
        grantCreditsOk: true,
        reconciled: false,
      }),
    }
  }

  if (paymentStatus !== "paid") {
    logStripeDebug(
      "fulfillment.not_paid",
      {
        checkoutSessionId:
          normalizedCheckoutSessionId,
        creditOrderId:
          order.id,
        companyId:
          order.companyId,
        orderStatus:
          order.status,
        paymentStatus:
          paymentStatus ?? null,
        idempotencyKey,
        eventType:
          eventType ?? null,
      },
    )

    return {
      ok: true,
      data: {
        ...mapFulfillmentData({
          creditOrderId: order.id,
          companyId: order.companyId,
          orderStatus: order.status,
          paymentStatus:
            paymentStatus ?? null,
          transaction: null,
          idempotencyKey,
          checkoutUpdateOk: null,
          grantCreditsOk: false,
          reconciled: false,
        }),
        alreadyFulfilled: false,
      },
    }
  }

  const attachResult =
    await markCreditOrderCheckoutCreated({
      creditOrderId: order.id,
      providerCheckoutId:
        normalizedCheckoutSessionId,
      providerPaymentIntentId:
        paymentIntentId ?? null,
      providerEventId:
        providerEventId ?? null,
    })

  if (!attachResult.ok) {
    logStripeDebug(
      "fulfillment.checkout_update_failed",
      {
        checkoutSessionId:
          normalizedCheckoutSessionId,
        creditOrderId:
          order.id,
        companyId:
          order.companyId,
        code: attachResult.code,
        checkoutUpdateOk: false,
        grantCreditsOk: null,
        idempotencyKey,
        eventType:
          eventType ?? null,
      },
    )

    return attachResult
  }

  const grantResult =
    await grantCreditsFromCreditOrder({
      creditOrderId: order.id,
      idempotencyKey,
      now,
    })

  if (!grantResult.ok) {
    logStripeDebug(
      "fulfillment.grant_failed",
      {
        checkoutSessionId:
          normalizedCheckoutSessionId,
        creditOrderId:
          order.id,
        companyId:
          order.companyId,
        code: grantResult.code,
        checkoutUpdateOk: true,
        grantCreditsOk: false,
        idempotencyKey,
        eventType:
          eventType ?? null,
      },
    )

    return grantResult
  }

  logStripeDebug(
    "fulfillment.completed",
    {
      checkoutSessionId:
        normalizedCheckoutSessionId,
      creditOrderId:
        order.id,
      companyId:
        order.companyId,
      orderStatus: "PAID",
      paymentStatus:
        paymentStatus ?? null,
      checkoutUpdateOk: true,
      grantCreditsOk: true,
      transactionId:
        grantResult.data.transactionId,
      idempotencyKey,
      eventType:
        eventType ?? null,
    },
  )

  return {
    ok: true,
    data: {
      creditOrderId: order.id,
      companyId: order.companyId,
      orderStatus: "PAID",
      paymentStatus:
        paymentStatus ?? null,
      fulfilled: true,
      alreadyFulfilled: false,
      checkoutUpdateOk: true,
      grantCreditsOk: true,
      reconciled: true,
      transactionId:
        grantResult.data.transactionId,
      balanceAfter:
        grantResult.data.balanceAfter,
      expiresAtAfter:
        grantResult.data.expiresAtAfter,
      idempotencyKey,
    },
  }
}