import { prisma } from "@esigenta/database"

import { getStripeServerClient } from "../stripe/stripe-client"
import { getStripeCreditOrderId, mapCreditCheckoutStatus } from "../stripe/stripe-events"
import { logStripeDebug } from "../stripe/stripe-config"
import type { StripeCreditCheckoutStatus } from "../stripe/stripe-events"

type CreditOrderStatusRow = {
  id: string
  company_id: string
  provider_checkout_id: string | null
  status: string
  transaction_id: string | null
}

type CreditOrderCheckoutStatusInput = {
  companyId: string
  checkoutSessionId: string
  clientReferenceId?: string | null
  metadata?: Record<string, string | null | undefined> | null
}

type CreditOrderCheckoutStatusData = {
  creditOrderId: string
  companyId: string
  providerCheckoutId: string | null
  orderStatus: string
  fulfilled: boolean
  transactionId: string | null
}

type CreditOrderCheckoutStatusResult =
  | { ok: true; data: CreditOrderCheckoutStatusData }
  | { ok: false; code: string; message: string }

async function getCreditOrderCheckoutStatus({
  companyId,
  checkoutSessionId,
  clientReferenceId,
  metadata,
}: CreditOrderCheckoutStatusInput): Promise<CreditOrderCheckoutStatusResult> {
  const normalizedCompanyId = companyId.trim()
  const normalizedSessionId = checkoutSessionId.trim()

  if (!normalizedCompanyId) {
    return { ok: false, code: "invalid_company_id", message: "Impresa non valida." }
  }
  if (!normalizedSessionId) {
    return { ok: false, code: "invalid_checkout_session_id", message: "Sessione Stripe Checkout non valida." }
  }

  const creditOrderId =
    metadata?.creditOrderId?.trim() || clientReferenceId?.trim() || null

  const rows = await prisma.$queryRaw<Array<CreditOrderStatusRow>>`
    SELECT
      co.id,
      co."companyId"          AS company_id,
      co."providerCheckoutId" AS provider_checkout_id,
      co.status::text,
      tx.id                   AS transaction_id
    FROM "CreditOrder" co
    LEFT JOIN "CompanyCreditTransaction" tx
      ON tx."creditOrderId" = co.id
      AND tx.type = 'PACKAGE_PURCHASE'
      AND tx.status = 'COMPLETED'
    WHERE co."companyId" = ${normalizedCompanyId}
      AND (co."providerCheckoutId" = ${normalizedSessionId} OR co.id = ${creditOrderId})
    ORDER BY tx."createdAt" ASC NULLS LAST
    LIMIT 1
  `

  const order = rows[0]
  if (!order) {
    return { ok: false, code: "credit_order_not_found", message: "Ordine crediti non trovato." }
  }

  if (
    order.provider_checkout_id &&
    order.provider_checkout_id !== normalizedSessionId
  ) {
    return {
      ok: false,
      code: "invalid_checkout_session_id",
      message: "Sessione Stripe Checkout non valida per questo ordine.",
    }
  }

  return {
    ok: true,
    data: {
      creditOrderId: order.id,
      companyId: order.company_id,
      providerCheckoutId: order.provider_checkout_id,
      orderStatus: order.status,
      fulfilled: order.transaction_id !== null,
      transactionId: order.transaction_id,
    },
  }
}

export type CheckoutStatusResult =
  | {
      ok: true
      data: {
        status: StripeCreditCheckoutStatus
        creditOrderId: string
        orderStatus: string
        paymentStatus: string | null
      }
    }
  | { ok: false; code: string; message: string; httpStatus: number }

export async function getCheckoutSessionStatus({
  sessionId,
  companyId,
}: {
  sessionId: string
  companyId: string
}): Promise<CheckoutStatusResult> {
  // DB-first: resolve terminal states without calling Stripe when the webhook
  // has already fulfilled or cancelled the order. This avoids a Stripe API call
  // on every poll after the webhook fires.
  const dbResult = await getCreditOrderCheckoutStatus({
    companyId,
    checkoutSessionId: sessionId,
    clientReferenceId: null,
    metadata: null,
  })

  if (dbResult.ok) {
    const { fulfilled, orderStatus, creditOrderId } = dbResult.data

    if (fulfilled) {
      return {
        ok: true,
        data: { status: "fulfilled", creditOrderId, orderStatus, paymentStatus: null },
      }
    }
    if (orderStatus === "FAILED") {
      return {
        ok: true,
        data: { status: "failed", creditOrderId, orderStatus, paymentStatus: null },
      }
    }
    if (orderStatus === "CANCELLED") {
      return {
        ok: true,
        data: { status: "cancelled", creditOrderId, orderStatus, paymentStatus: null },
      }
    }
    // PENDING: fall through to Stripe for authoritative status
  }

  // Stripe fallback: order is PENDING or not yet linked to this session in DB
  let stripe: ReturnType<typeof getStripeServerClient>

  try {
    stripe = getStripeServerClient()
  } catch (error) {
    logStripeDebug("checkout_status.stripe_client_unavailable", {
      companyId,
      error: error instanceof Error ? error.message : "unknown_error",
    })
    return {
      ok: false,
      code: "stripe_not_configured",
      message: "Stripe non configurato.",
      httpStatus: 500,
    }
  }

  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (error) {
    logStripeDebug("checkout_status.session_retrieve_failed", {
      companyId,
      checkoutSessionId: sessionId,
      error: error instanceof Error ? error.message : "unknown_error",
    })
    return {
      ok: false,
      code: "checkout_session_not_found",
      message: "Sessione checkout non trovata.",
      httpStatus: 404,
    }
  }

  const result = await getCreditOrderCheckoutStatus({
    companyId,
    checkoutSessionId: session.id,
    clientReferenceId: session.client_reference_id,
    metadata: session.metadata,
  })

  if (!result.ok) {
    logStripeDebug("checkout_status.lookup_failed", {
      companyId,
      checkoutSessionId: session.id,
      creditOrderId: getStripeCreditOrderId(session),
      stripeSessionStatus: session.status,
      stripePaymentStatus: session.payment_status,
      code: result.code,
    })

    const httpStatus =
      result.code === "credit_order_not_found" ||
      result.code === "credit_order_company_mismatch"
        ? 404
        : result.code === "invalid_checkout_session_id" ||
            result.code === "missing_credit_order_id" ||
            result.code === "invalid_company_id"
          ? 400
          : 500

    return { ok: false, code: result.code, message: result.message, httpStatus }
  }

  const status = mapCreditCheckoutStatus({
    fulfilled: result.data.fulfilled,
    orderStatus: result.data.orderStatus,
    sessionStatus: session.status,
  })

  logStripeDebug("checkout_status.resolved", {
    companyId,
    creditOrderId: result.data.creditOrderId,
    checkoutSessionId: session.id,
    stripeSessionStatus: session.status,
    stripePaymentStatus: session.payment_status,
    status,
    orderStatus: result.data.orderStatus,
    fulfilled: result.data.fulfilled,
    transactionId: result.data.transactionId,
  })

  return {
    ok: true,
    data: {
      status,
      creditOrderId: result.data.creditOrderId,
      orderStatus: result.data.orderStatus,
      paymentStatus: session.payment_status,
    },
  }
}
