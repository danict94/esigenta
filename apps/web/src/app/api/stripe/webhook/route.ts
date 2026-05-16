import type Stripe from "stripe";
import { NextResponse } from "next/server";

import {
  grantCreditsFromCreditOrder,
  markCreditOrderCheckoutCancelled,
  markCreditOrderCheckoutCreated,
  markCreditOrderCheckoutFailed,
} from "@fixpro/db";

import { getStripeServerClient } from "../../../../lib/stripe/server";

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(body, {
    status,
  });
}

function getCreditOrderId(
  session: Stripe.Checkout.Session,
) {
  return (
    session.metadata?.creditOrderId ??
    session.client_reference_id ??
    null
  );
}

function getPaymentIntentId(
  session: Stripe.Checkout.Session,
) {
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : null;
}

async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
) {
  const creditOrderId = getCreditOrderId(session);

  if (!creditOrderId) {
    return jsonResponse(
      {
        received: false,
        error: "missing_credit_order_id",
      },
      400,
    );
  }

  const attachResult =
    await markCreditOrderCheckoutCreated({
      creditOrderId,
      providerCheckoutId: session.id,
      providerPaymentIntentId:
        getPaymentIntentId(session),
    });

  if (!attachResult.ok) {
    return jsonResponse(
      {
        received: false,
        error: "checkout_metadata_update_failed",
      },
      500,
    );
  }

  const grantResult =
    await grantCreditsFromCreditOrder({
      creditOrderId,
      idempotencyKey: `stripe-checkout:${session.id}:credit-grant`,
    });

  if (!grantResult.ok) {
    return jsonResponse(
      {
        received: false,
        error: "credit_grant_failed",
      },
      500,
    );
  }

  return jsonResponse({
    received: true,
  });
}

async function markCheckoutFailed(
  session: Stripe.Checkout.Session,
) {
  const creditOrderId = getCreditOrderId(session);

  if (!creditOrderId) {
    return jsonResponse(
      {
        received: false,
        error: "missing_credit_order_id",
      },
      400,
    );
  }

  const result =
    await markCreditOrderCheckoutFailed({
      creditOrderId,
    });

  if (!result.ok) {
    return jsonResponse(
      {
        received: false,
        error: "checkout_failed_update_failed",
      },
      500,
    );
  }

  return jsonResponse({
    received: true,
  });
}

async function markCheckoutExpired(
  session: Stripe.Checkout.Session,
) {
  const creditOrderId = getCreditOrderId(session);

  if (!creditOrderId) {
    return jsonResponse(
      {
        received: false,
        error: "missing_credit_order_id",
      },
      400,
    );
  }

  const result =
    await markCreditOrderCheckoutCancelled({
      creditOrderId,
    });

  if (!result.ok) {
    return jsonResponse(
      {
        received: false,
        error: "checkout_cancel_update_failed",
      },
      500,
    );
  }

  return jsonResponse({
    received: true,
  });
}

export async function POST(request: Request) {
  const signature =
    request.headers.get("stripe-signature");

  if (!signature) {
    return jsonResponse(
      {
        received: false,
        error: "missing_signature",
      },
      400,
    );
  }

  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return jsonResponse(
      {
        received: false,
        error: "webhook_not_configured",
      },
      500,
    );
  }

  const rawBody = await request.text();
  const stripe = getStripeServerClient();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch {
    return jsonResponse(
      {
        received: false,
        error: "invalid_signature",
      },
      400,
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        return fulfillCheckoutSession(
          event.data.object as Stripe.Checkout.Session,
        );

      case "checkout.session.async_payment_failed":
        return markCheckoutFailed(
          event.data.object as Stripe.Checkout.Session,
        );

      case "checkout.session.expired":
        return markCheckoutExpired(
          event.data.object as Stripe.Checkout.Session,
        );

      default:
        return jsonResponse({
          received: true,
          ignored: true,
        });
    }
  } catch {
    return jsonResponse(
      {
        received: false,
        error: "webhook_processing_failed",
      },
      500,
    );
  }
}
