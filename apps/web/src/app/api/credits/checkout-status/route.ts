import type Stripe from "stripe"

import {
  NextResponse,
} from "next/server"

import {
  getCreditOrderCheckoutStatus,
} from "@esigenta/db"

import {
  requireCompanyActor,
} from "../../../../auth/server"

import {
  getStripeServerClient,
} from "../../../../lib/stripe/server"

import {
  logStripeDebug,
} from "../../../../lib/stripe/debug"

import {
  getStripeCreditOrderId,
  mapCreditCheckoutStatus,
} from "../../../../lib/stripe/credit-checkout"

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
    code === "missing_credit_order_id" ||
    code === "invalid_company_id"
  ) {
    return 400
  }

  return 500
}

export async function GET(request: Request) {
  let actor: Awaited<
    ReturnType<
      typeof requireCompanyActor
    >
  >

  try {
    actor =
      await requireCompanyActor()
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
        actor.company.id,
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
          actor.company.id,
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
          actor.company.id,
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

  const result =
    await getCreditOrderCheckoutStatus({
      companyId:
        actor.company.id,
      checkoutSessionId:
        session.id,
      clientReferenceId:
        session.client_reference_id,
      metadata:
        session.metadata,
    })

  if (!result.ok) {
    logStripeDebug(
      "checkout_status.lookup_failed",
      {
        companyId:
          actor.company.id,
        checkoutSessionId:
          session.id,
        creditOrderId:
          getStripeCreditOrderId(session),
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
    mapCreditCheckoutStatus({
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
        actor.company.id,
      creditOrderId:
        result.data.creditOrderId,
      checkoutSessionId:
        session.id,
      stripeSessionStatus:
        session.status,
      stripePaymentStatus:
        session.payment_status,
      status,
      orderStatus:
        result.data.orderStatus,
      fulfilled:
        result.data.fulfilled,
      transactionId:
        result.data.transactionId,
    },
  )

  return jsonResponse({
    status,
    creditOrderId:
      result.data.creditOrderId,
    orderStatus:
      result.data.orderStatus,
    paymentStatus:
      session.payment_status,
  })
}