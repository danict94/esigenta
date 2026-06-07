import type Stripe from "stripe"

import {
  NextResponse,
} from "next/server"

import {
  fulfillCreditOrderFromStripeCheckoutSession,
} from "@esigenta/db"

import {
  requireDefaultCompanyMembership,
} from "../../../../auth/server"

import {
  getStripeServerClient,
} from "../../../../lib/stripe/server"

import {
  logStripeDebug,
} from "../../../../lib/stripe/debug"

type CheckoutStatus =
  | "pending"
  | "fulfilled"
  | "failed"
  | "cancelled"
  | "expired"
  | "error"

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(body, {
    status,
  })
}

function normalizeRequiredText(
  value: string | null | undefined,
) {
  const trimmed =
    value?.trim()

  return trimmed
    ? trimmed
    : null
}

function getPaymentIntentId(
  session: Stripe.Checkout.Session,
) {
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : null
}

function mapCheckoutStatus({
  fulfilled,
  orderStatus,
  sessionStatus,
}: {
  fulfilled: boolean
  orderStatus: string
  sessionStatus: Stripe.Checkout.Session["status"]
}): CheckoutStatus {
  if (fulfilled) {
    return "fulfilled"
  }

  if (orderStatus === "FAILED") {
    return "failed"
  }

  if (sessionStatus === "expired") {
    return "expired"
  }

  if (orderStatus === "CANCELLED") {
    return "cancelled"
  }

  return "pending"
}

function getHttpStatusForDomainError(
  code: string,
) {
  if (
    code === "credit_order_not_found" ||
    code === "credit_order_company_mismatch"
  ) {
    return 404
  }

  if (
    code === "invalid_checkout_session_id" ||
    code === "missing_credit_order_id"
  ) {
    return 400
  }

  return 500
}

export async function GET(request: Request) {
  let membership: Awaited<
    ReturnType<
      typeof requireDefaultCompanyMembership
    >
  >

  try {
    membership =
      await requireDefaultCompanyMembership()
  } catch {
    return jsonResponse(
      {
        status: "error",
        error: "unauthorized",
      },
      401,
    )
  }

  const url = new URL(request.url)
  const sessionId =
    normalizeRequiredText(
      url.searchParams.get("session_id"),
    )

  logStripeDebug(
    "checkout_status.request_received",
    {
      hasSessionId:
        Boolean(sessionId),
      companyId:
        membership.companyId,
    },
  )

  if (!sessionId) {
    return jsonResponse(
      {
        status: "error",
        error: "missing_session_id",
      },
      400,
    )
  }

  let stripe: ReturnType<
    typeof getStripeServerClient
  >

  try {
    stripe =
      getStripeServerClient()
  } catch (error) {
    logStripeDebug(
      "checkout_status.stripe_client_unavailable",
      {
        companyId:
          membership.companyId,
        error:
          error instanceof Error
            ? error.message
            : "unknown_error",
      },
    )

    return jsonResponse(
      {
        status: "error",
        error: "stripe_not_configured",
      },
      500,
    )
  }

  let session: Stripe.Checkout.Session

  try {
    session =
      await stripe.checkout.sessions.retrieve(
        sessionId,
      )
  } catch (error) {
    logStripeDebug(
      "checkout_status.session_retrieve_failed",
      {
        companyId:
          membership.companyId,
        checkoutSessionId:
          sessionId,
        error:
          error instanceof Error
            ? error.message
            : "unknown_error",
      },
    )

    return jsonResponse(
      {
        status: "error",
        error: "checkout_session_not_found",
      },
      404,
    )
  }

  const creditOrderId =
    session.metadata?.creditOrderId ??
    session.client_reference_id ??
    null

  const result =
    await fulfillCreditOrderFromStripeCheckoutSession({
      checkoutSessionId: session.id,
      clientReferenceId:
        session.client_reference_id,
      paymentIntentId:
        getPaymentIntentId(session),
      paymentStatus:
        session.payment_status,
      metadata: session.metadata,
      expectedCompanyId:
        membership.companyId,
      eventType:
        "checkout-status",
    })

  if (!result.ok) {
    logStripeDebug(
      "checkout_status.reconcile_failed",
      {
        companyId:
          membership.companyId,
        checkoutSessionId:
          session.id,
        creditOrderId,
        stripeSessionStatus:
          session.status,
        stripePaymentStatus:
          session.payment_status,
        code: result.code,
      },
    )

    return jsonResponse(
      {
        status: "error",
        error: result.code,
      },
      getHttpStatusForDomainError(
        result.code,
      ),
    )
  }

  const status =
    mapCheckoutStatus({
      fulfilled:
        result.data.fulfilled,
      orderStatus:
        result.data.orderStatus,
      sessionStatus:
        session.status,
    })

  logStripeDebug(
    "checkout_status.resolved",
    {
      companyId:
        membership.companyId,
      creditOrderId:
        result.data.creditOrderId,
      checkoutSessionId:
        session.id,
      stripeSessionStatus:
        session.status,
      status,
      paymentStatus:
        result.data.paymentStatus,
      orderStatus:
        result.data.orderStatus,
      reconciled:
        result.data.reconciled,
      fulfilled:
        result.data.fulfilled,
      idempotencyKey:
        result.data.idempotencyKey,
    },
  )

  return jsonResponse({
    status,
    creditOrderId:
      result.data.creditOrderId,
    orderStatus:
      result.data.orderStatus,
    paymentStatus:
      result.data.paymentStatus,
  })
}
