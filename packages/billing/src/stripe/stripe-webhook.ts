import type Stripe from "stripe"

import { fulfillCreditOrderFromStripeCheckoutSession } from "./fulfillment"
import { markCreditOrderCheckoutCancelled, markCreditOrderCheckoutFailed } from "./order-status"

import { getStripeServerClient } from "./stripe-client"
import { getStripeCreditOrderId, getStripePaymentIntentId } from "./stripe-events"
import { logStripeDebug, getStripeRuntimeDebugConfig } from "./stripe-config"

export type WebhookHandleResult = {
  status: number
  body: Record<string, unknown>
}

function ok(body: Record<string, unknown>): WebhookHandleResult {
  return { status: 200, body }
}

function err(body: Record<string, unknown>, status: number): WebhookHandleResult {
  return { status, body }
}

async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
  event: Stripe.Event,
): Promise<WebhookHandleResult> {
  const creditOrderId = getStripeCreditOrderId(session)
  const paymentIntentId = getStripePaymentIntentId(session)
  const idempotencyKey = creditOrderId
    ? `credit-order:${creditOrderId}:package-purchase`
    : null

  if (!creditOrderId) {
    logStripeDebug("webhook.fulfillment_missing_credit_order", {
      eventType: event.type,
      eventId: event.id,
      checkoutSessionId: session.id,
      sessionStatus: session.status,
      paymentStatus: session.payment_status,
      metadataCreditOrderId: session.metadata?.creditOrderId ?? null,
      clientReferenceId: session.client_reference_id,
      paymentIntentId,
    })
    return err({ received: false, error: "missing_credit_order_id" }, 400)
  }

  const result = await fulfillCreditOrderFromStripeCheckoutSession({
    checkoutSessionId: session.id,
    clientReferenceId: session.client_reference_id,
    paymentIntentId,
    paymentStatus: session.payment_status,
    metadata: session.metadata,
    providerEventId: event.id,
    eventType: event.type,
  })

  if (!result.ok) {
    logStripeDebug("webhook.fulfillment_failed", {
      eventType: event.type,
      eventId: event.id,
      checkoutSessionId: session.id,
      sessionStatus: session.status,
      paymentStatus: session.payment_status,
      metadataCreditOrderId: session.metadata?.creditOrderId ?? null,
      clientReferenceId: session.client_reference_id,
      paymentIntentId,
      creditOrderId,
      code: result.code,
      checkoutUpdateOk:
        result.code === "invalid_provider_checkout_id" ? false : null,
      grantCreditsOk: false,
      idempotencyKey,
    })
    return err({ received: false, error: result.code }, 500)
  }

  if (!result.data.fulfilled) {
    logStripeDebug("webhook.fulfillment_pending", {
      eventType: event.type,
      eventId: event.id,
      checkoutSessionId: session.id,
      sessionStatus: session.status,
      creditOrderId,
      metadataCreditOrderId: session.metadata?.creditOrderId ?? null,
      clientReferenceId: session.client_reference_id,
      paymentIntentId,
      paymentStatus: result.data.paymentStatus,
      orderStatus: result.data.orderStatus,
      checkoutUpdateOk: result.data.checkoutUpdateOk,
      grantCreditsOk: result.data.grantCreditsOk,
      idempotencyKey: result.data.idempotencyKey,
    })
    return ok({ received: true, fulfilled: false })
  }

  logStripeDebug("webhook.fulfillment_completed", {
    eventType: event.type,
    eventId: event.id,
    checkoutSessionId: session.id,
    sessionStatus: session.status,
    paymentStatus: session.payment_status,
    metadataCreditOrderId: session.metadata?.creditOrderId ?? null,
    clientReferenceId: session.client_reference_id,
    paymentIntentId,
    creditOrderId,
    companyId: result.data.companyId,
    orderStatus: result.data.orderStatus,
    alreadyFulfilled: result.data.alreadyFulfilled,
    transactionId: result.data.transactionId,
    checkoutUpdateOk: result.data.checkoutUpdateOk,
    grantCreditsOk: result.data.grantCreditsOk,
    idempotencyKey: result.data.idempotencyKey,
  })

  return ok({ received: true, fulfilled: true })
}

async function markCheckoutFailed(
  session: Stripe.Checkout.Session,
  event: Stripe.Event,
): Promise<WebhookHandleResult> {
  const creditOrderId = getStripeCreditOrderId(session)

  if (!creditOrderId) {
    logStripeDebug("webhook.checkout_failed_missing_credit_order", {
      eventType: event.type,
      eventId: event.id,
      checkoutSessionId: session.id,
      sessionStatus: session.status,
      paymentStatus: session.payment_status,
    })
    return err({ received: false, error: "missing_credit_order_id" }, 400)
  }

  const result = await markCreditOrderCheckoutFailed({ creditOrderId })

  if (!result.ok) {
    logStripeDebug("webhook.checkout_failed_update_failed", {
      eventType: event.type,
      eventId: event.id,
      checkoutSessionId: session.id,
      creditOrderId,
      code: result.code,
    })
    return err({ received: false, error: "checkout_failed_update_failed" }, 500)
  }

  logStripeDebug("webhook.checkout_failed_updated", {
    eventType: event.type,
    eventId: event.id,
    checkoutSessionId: session.id,
    creditOrderId,
    updated: result.data.updated,
  })

  return ok({ received: true })
}

async function markCheckoutExpired(
  session: Stripe.Checkout.Session,
  event: Stripe.Event,
): Promise<WebhookHandleResult> {
  const creditOrderId = getStripeCreditOrderId(session)

  if (!creditOrderId) {
    logStripeDebug("webhook.checkout_expired_missing_credit_order", {
      eventType: event.type,
      eventId: event.id,
      checkoutSessionId: session.id,
      sessionStatus: session.status,
      paymentStatus: session.payment_status,
    })
    return err({ received: false, error: "missing_credit_order_id" }, 400)
  }

  const result = await markCreditOrderCheckoutCancelled({ creditOrderId })

  if (!result.ok) {
    logStripeDebug("webhook.checkout_expired_update_failed", {
      eventType: event.type,
      eventId: event.id,
      checkoutSessionId: session.id,
      creditOrderId,
      code: result.code,
    })
    return err({ received: false, error: "checkout_cancel_update_failed" }, 500)
  }

  logStripeDebug("webhook.checkout_expired_updated", {
    eventType: event.type,
    eventId: event.id,
    checkoutSessionId: session.id,
    creditOrderId,
    updated: result.data.updated,
  })

  return ok({ received: true })
}

async function markPaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  event: Stripe.Event,
): Promise<WebhookHandleResult> {
  const creditOrderId = paymentIntent.metadata?.creditOrderId ?? null

  if (!creditOrderId) {
    logStripeDebug("webhook.payment_intent_failed_ignored", {
      eventType: event.type,
      eventId: event.id,
      paymentIntentId: paymentIntent.id,
      reason: "missing_credit_order_id",
    })
    return ok({ received: true, ignored: true })
  }

  const result = await markCreditOrderCheckoutFailed({ creditOrderId })

  if (!result.ok) {
    logStripeDebug("webhook.payment_intent_failed_update_failed", {
      eventType: event.type,
      eventId: event.id,
      paymentIntentId: paymentIntent.id,
      creditOrderId,
      code: result.code,
    })
    return err({ received: false, error: "payment_intent_failed_update_failed" }, 500)
  }

  logStripeDebug("webhook.payment_intent_failed_updated", {
    eventType: event.type,
    eventId: event.id,
    paymentIntentId: paymentIntent.id,
    creditOrderId,
    updated: result.data.updated,
  })

  return ok({ received: true })
}

export async function handleStripeWebhook({
  rawBody,
  signature,
  webhookSecret,
}: {
  rawBody: string
  signature: string
  webhookSecret: string
}): Promise<WebhookHandleResult> {
  logStripeDebug("webhook.request_received", {
    hasStripeSignature: Boolean(signature),
    rawBodyLength: rawBody.length,
    timestamp: new Date().toISOString(),
    ...getStripeRuntimeDebugConfig(),
  })

  if (!signature) {
    return err({ received: false, error: "missing_signature" }, 400)
  }

  if (!webhookSecret) {
    return err({ received: false, error: "webhook_not_configured" }, 500)
  }

  let stripe: Stripe

  try {
    stripe = getStripeServerClient()
  } catch (error) {
    logStripeDebug("webhook.stripe_client_unavailable", {
      hasStripeSignature: true,
      hasStripeWebhookSecret: true,
      rawBodyLength: rawBody.length,
      error: error instanceof Error ? error.message : "unknown_error",
    })
    return err({ received: false, error: "stripe_not_configured" }, 500)
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch {
    logStripeDebug("webhook.invalid_signature", {
      hasStripeSignature: true,
      hasStripeWebhookSecret: true,
      rawBodyLength: rawBody.length,
      timestamp: new Date().toISOString(),
    })
    return err({ received: false, error: "invalid_signature" }, 400)
  }

  logStripeDebug("webhook.event_constructed", {
    hasStripeSignature: true,
    hasStripeWebhookSecret: true,
    rawBodyLength: rawBody.length,
    eventType: event.type,
    eventId: event.id,
    timestamp: event.created,
  })

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
        return ok({ received: true, ignored: true })
    }
  } catch (error) {
    logStripeDebug("webhook.processing_failed", {
      eventType: event.type,
      eventId: event.id,
      error: error instanceof Error ? error.message : "unknown_error",
    })
    return err({ received: false, error: "webhook_processing_failed" }, 500)
  }
}
