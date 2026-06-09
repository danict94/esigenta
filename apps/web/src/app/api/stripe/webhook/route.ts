import type Stripe from "stripe"

import {
  NextResponse,
} from "next/server"

import {
  fulfillCreditOrderFromStripeCheckoutSession,
  markCreditOrderCheckoutCancelled,
  markCreditOrderCheckoutFailed,
} from "@esigenta/db"

import {
  getStripeRuntimeDebugConfig,
  logStripeDebug,
} from "../../../../lib/stripe/debug"

import {
  getStripeServerClient,
} from "../../../../lib/stripe/server"

import {
  getStripeCreditOrderId,
  getStripePaymentIntentId,
} from "../../../../lib/stripe/credit-checkout"

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(body, {
    status,
  })
}

async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
  event: Stripe.Event,
) {
  const creditOrderId =
    getStripeCreditOrderId(session)
  const paymentIntentId =
    getStripePaymentIntentId(session)
  const idempotencyKey =
    creditOrderId
      ? `credit-order:${creditOrderId}:package-purchase`
      : null

  if (!creditOrderId) {
    logStripeDebug(
      "webhook.fulfillment_missing_credit_order",
      {
        eventType: event.type,
        eventId: event.id,
        checkoutSessionId: session.id,
        sessionStatus: session.status,
        paymentStatus: session.payment_status,
        metadataCreditOrderId:
          session.metadata?.creditOrderId ?? null,
        clientReferenceId:
          session.client_reference_id,
        paymentIntentId,
      },
    )

    return jsonResponse(
      {
        received: false,
        error: "missing_credit_order_id",
      },
      400,
    )
  }

  const result =
    await fulfillCreditOrderFromStripeCheckoutSession({
      checkoutSessionId: session.id,
      clientReferenceId:
        session.client_reference_id,
      paymentIntentId,
      paymentStatus:
        session.payment_status,
      metadata: session.metadata,
      providerEventId: event.id,
      eventType: event.type,
    })

  if (!result.ok) {
    logStripeDebug(
      "webhook.fulfillment_failed",
      {
        eventType: event.type,
        eventId: event.id,
        checkoutSessionId: session.id,
        sessionStatus: session.status,
        paymentStatus: session.payment_status,
        metadataCreditOrderId:
          session.metadata?.creditOrderId ?? null,
        clientReferenceId:
          session.client_reference_id,
        paymentIntentId,
        creditOrderId,
        code: result.code,
        checkoutUpdateOk:
          result.code ===
          "invalid_provider_checkout_id"
            ? false
            : null,
        grantCreditsOk: false,
        idempotencyKey,
      },
    )

    return jsonResponse(
      {
        received: false,
        error: result.code,
      },
      500,
    )
  }

  if (!result.data.fulfilled) {
    logStripeDebug(
      "webhook.fulfillment_pending",
      {
        eventType: event.type,
        eventId: event.id,
        checkoutSessionId: session.id,
        sessionStatus: session.status,
        creditOrderId,
        metadataCreditOrderId:
          session.metadata?.creditOrderId ?? null,
        clientReferenceId:
          session.client_reference_id,
        paymentIntentId,
        paymentStatus:
          result.data.paymentStatus,
        orderStatus:
          result.data.orderStatus,
        checkoutUpdateOk:
          result.data.checkoutUpdateOk,
        grantCreditsOk:
          result.data.grantCreditsOk,
        idempotencyKey:
          result.data.idempotencyKey,
      },
    )

    return jsonResponse({
      received: true,
      fulfilled: false,
    })
  }

  logStripeDebug(
    "webhook.fulfillment_completed",
    {
      eventType: event.type,
      eventId: event.id,
      checkoutSessionId: session.id,
      sessionStatus: session.status,
      paymentStatus: session.payment_status,
      metadataCreditOrderId:
        session.metadata?.creditOrderId ?? null,
      clientReferenceId:
        session.client_reference_id,
      paymentIntentId,
      creditOrderId,
      companyId: result.data.companyId,
      orderStatus:
        result.data.orderStatus,
      alreadyFulfilled:
        result.data.alreadyFulfilled,
      transactionId:
        result.data.transactionId,
      checkoutUpdateOk:
        result.data.checkoutUpdateOk,
      grantCreditsOk:
        result.data.grantCreditsOk,
      idempotencyKey:
        result.data.idempotencyKey,
    },
  )

  return jsonResponse({
    received: true,
    fulfilled: true,
  })
}

async function markCheckoutFailed(
  session: Stripe.Checkout.Session,
  event: Stripe.Event,
) {
  const creditOrderId =
    getStripeCreditOrderId(session)

  if (!creditOrderId) {
    logStripeDebug(
      "webhook.checkout_failed_missing_credit_order",
      {
        eventType: event.type,
        eventId: event.id,
        checkoutSessionId: session.id,
        sessionStatus: session.status,
        paymentStatus: session.payment_status,
      },
    )

    return jsonResponse(
      {
        received: false,
        error: "missing_credit_order_id",
      },
      400,
    )
  }

  const result =
    await markCreditOrderCheckoutFailed({
      creditOrderId,
    })

  if (!result.ok) {
    logStripeDebug(
      "webhook.checkout_failed_update_failed",
      {
        eventType: event.type,
        eventId: event.id,
        checkoutSessionId: session.id,
        creditOrderId,
        code: result.code,
      },
    )

    return jsonResponse(
      {
        received: false,
        error:
          "checkout_failed_update_failed",
      },
      500,
    )
  }

  logStripeDebug(
    "webhook.checkout_failed_updated",
    {
      eventType: event.type,
      eventId: event.id,
      checkoutSessionId: session.id,
      creditOrderId,
      updated: result.data.updated,
    },
  )

  return jsonResponse({
    received: true,
  })
}

async function markCheckoutExpired(
  session: Stripe.Checkout.Session,
  event: Stripe.Event,
) {
  const creditOrderId =
    getStripeCreditOrderId(session)

  if (!creditOrderId) {
    logStripeDebug(
      "webhook.checkout_expired_missing_credit_order",
      {
        eventType: event.type,
        eventId: event.id,
        checkoutSessionId: session.id,
        sessionStatus: session.status,
        paymentStatus: session.payment_status,
      },
    )

    return jsonResponse(
      {
        received: false,
        error: "missing_credit_order_id",
      },
      400,
    )
  }

  const result =
    await markCreditOrderCheckoutCancelled({
      creditOrderId,
    })

  if (!result.ok) {
    logStripeDebug(
      "webhook.checkout_expired_update_failed",
      {
        eventType: event.type,
        eventId: event.id,
        checkoutSessionId: session.id,
        creditOrderId,
        code: result.code,
      },
    )

    return jsonResponse(
      {
        received: false,
        error:
          "checkout_cancel_update_failed",
      },
      500,
    )
  }

  logStripeDebug(
    "webhook.checkout_expired_updated",
    {
      eventType: event.type,
      eventId: event.id,
      checkoutSessionId: session.id,
      creditOrderId,
      updated: result.data.updated,
    },
  )

  return jsonResponse({
    received: true,
  })
}

async function markPaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  event: Stripe.Event,
) {
  const creditOrderId =
    paymentIntent.metadata?.creditOrderId ?? null

  if (!creditOrderId) {
    logStripeDebug(
      "webhook.payment_intent_failed_ignored",
      {
        eventType: event.type,
        eventId: event.id,
        paymentIntentId: paymentIntent.id,
        reason: "missing_credit_order_id",
      },
    )

    return jsonResponse({
      received: true,
      ignored: true,
    })
  }

  const result =
    await markCreditOrderCheckoutFailed({
      creditOrderId,
    })

  if (!result.ok) {
    logStripeDebug(
      "webhook.payment_intent_failed_update_failed",
      {
        eventType: event.type,
        eventId: event.id,
        paymentIntentId: paymentIntent.id,
        creditOrderId,
        code: result.code,
      },
    )

    return jsonResponse(
      {
        received: false,
        error:
          "payment_intent_failed_update_failed",
      },
      500,
    )
  }

  logStripeDebug(
    "webhook.payment_intent_failed_updated",
    {
      eventType: event.type,
      eventId: event.id,
      paymentIntentId: paymentIntent.id,
      creditOrderId,
      updated: result.data.updated,
    },
  )

  return jsonResponse({
    received: true,
  })
}

export async function POST(request: Request) {
  const signature =
    request.headers.get("stripe-signature")
  const rawBody = await request.text()
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET

  logStripeDebug(
    "webhook.request_received",
    {
      method: request.method,
      hasStripeSignature:
        Boolean(signature),
      rawBodyLength: rawBody.length,
      timestamp:
        new Date().toISOString(),
      ...getStripeRuntimeDebugConfig(),
    },
  )

  if (!signature) {
    return jsonResponse(
      {
        received: false,
        error: "missing_signature",
      },
      400,
    )
  }

  if (!webhookSecret) {
    return jsonResponse(
      {
        received: false,
        error: "webhook_not_configured",
      },
      500,
    )
  }

  let stripe: ReturnType<
    typeof getStripeServerClient
  >

  try {
    stripe = getStripeServerClient()
  } catch (error) {
    logStripeDebug(
      "webhook.stripe_client_unavailable",
      {
        method: request.method,
        hasStripeSignature: true,
        hasStripeWebhookSecret: true,
        rawBodyLength: rawBody.length,
        error:
          error instanceof Error
            ? error.message
            : "unknown_error",
      },
    )

    return jsonResponse(
      {
        received: false,
        error: "stripe_not_configured",
      },
      500,
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    )
  } catch {
    logStripeDebug(
      "webhook.invalid_signature",
      {
        method: request.method,
        hasStripeSignature: true,
        hasStripeWebhookSecret: true,
        rawBodyLength: rawBody.length,
        timestamp:
          new Date().toISOString(),
      },
    )

    return jsonResponse(
      {
        received: false,
        error: "invalid_signature",
      },
      400,
    )
  }

  logStripeDebug(
    "webhook.event_constructed",
    {
      method: request.method,
      hasStripeSignature: true,
      hasStripeWebhookSecret: true,
      rawBodyLength: rawBody.length,
      eventType: event.type,
      eventId: event.id,
      timestamp: event.created,
    },
  )

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        return fulfillCheckoutSession(
          event.data.object as Stripe.Checkout.Session,
          event,
        )

      case "checkout.session.async_payment_failed":
        return markCheckoutFailed(
          event.data.object as Stripe.Checkout.Session,
          event,
        )

      case "checkout.session.expired":
        return markCheckoutExpired(
          event.data.object as Stripe.Checkout.Session,
          event,
        )

      case "payment_intent.payment_failed":
        return markPaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
          event,
        )

      default:
        return jsonResponse({
          received: true,
          ignored: true,
        })
    }
  } catch (error) {
    logStripeDebug(
      "webhook.processing_failed",
      {
        eventType: event.type,
        eventId: event.id,
        error:
          error instanceof Error
            ? error.message
            : "unknown_error",
      },
    )

    return jsonResponse(
      {
        received: false,
        error:
          "webhook_processing_failed",
      },
      500,
    )
  }
}