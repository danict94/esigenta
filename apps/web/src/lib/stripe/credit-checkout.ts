import type Stripe from "stripe"

import type {
  PendingCreditOrderCheckoutData,
} from "@esigenta/db"

export type StripeCreditCheckoutStatus =
  | "pending"
  | "fulfilled"
  | "failed"
  | "cancelled"
  | "expired"
  | "error"

type AppUrlCandidate = {
  value: string | undefined
  source: "standard" | "vercel"
}

function normalizeAppUrl({
  source,
  value,
}: AppUrlCandidate) {
  const trimmed =
    value?.trim()

  if (!trimmed) {
    return null
  }

  const withProtocol =
    source === "vercel" &&
    !/^https?:\/\//i.test(trimmed)
      ? `https://${trimmed}`
      : trimmed

  return withProtocol.replace(
    /\/+$/,
    "",
  )
}

export function getAppUrl() {
  const candidates: AppUrlCandidate[] = [
    {
      value:
        process.env.ESIGENTA_WEB_URL,
      source: "standard",
    },
    {
      value:
        process.env.ESIGENTA_APP_URL,
      source: "standard",
    },
    {
      value:
        process.env.NEXT_PUBLIC_APP_URL,
      source: "standard",
    },
    {
      value:
        process.env.BETTER_AUTH_URL,
      source: "standard",
    },
    {
      value:
        process.env
          .VERCEL_PROJECT_PRODUCTION_URL,
      source: "vercel",
    },
    {
      value:
        process.env.VERCEL_URL,
      source: "vercel",
    },
  ]

  for (const candidate of candidates) {
    const normalized =
      normalizeAppUrl(candidate)

    if (normalized) {
      return normalized
    }
  }

  return null
}

export function buildCheckoutReturnUrl({
  appUrl,
  checkout,
  orderId,
  sessionId,
}: {
  appUrl: string
  checkout: "success" | "cancel"
  orderId?: string
  sessionId?: string
}) {
  const url = new URL(
    "/area-impresa/crediti",
    appUrl,
  )

  url.searchParams.set(
    "checkout",
    checkout,
  )

  if (orderId) {
    url.searchParams.set(
      "orderId",
      orderId,
    )
  }

  if (sessionId) {
    url.searchParams.set(
      "session_id",
      sessionId,
    )
  }

  return url
    .toString()
    .replace(
      "%7BCHECKOUT_SESSION_ID%7D",
      "{CHECKOUT_SESSION_ID}",
    )
}

export function getStripeCreditOrderId(
  session: Stripe.Checkout.Session,
) {
  return (
    session.metadata?.creditOrderId ??
    session.client_reference_id ??
    null
  )
}

export function getStripePaymentIntentId(
  session: Stripe.Checkout.Session,
) {
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : null
}

export function mapCreditCheckoutStatus({
  fulfilled,
  orderStatus,
  sessionStatus,
}: {
  fulfilled: boolean
  orderStatus: string | null
  sessionStatus: Stripe.Checkout.Session["status"]
}): StripeCreditCheckoutStatus {
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

export async function createStripeCreditPackageCheckoutSession({
  stripe,
  appUrl,
  companyId,
  order,
}: {
  stripe: Stripe
  appUrl: string
  companyId: string
  order: PendingCreditOrderCheckoutData
}) {
  const idempotencyKey =
    `credit-checkout:${order.orderId}`
  const checkoutMetadata = {
    creditOrderId:
      order.orderId,
    companyId,
    packageId:
      order.packageId,
    credits:
      String(order.credits),
  }
  const successUrl =
    buildCheckoutReturnUrl({
      appUrl,
      checkout: "success",
      sessionId:
        "{CHECKOUT_SESSION_ID}",
    })
  const cancelUrl =
    buildCheckoutReturnUrl({
      appUrl,
      checkout: "cancel",
    })

  const session =
    await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency:
                order.currency,
              unit_amount:
                order.priceCents,
              product_data: {
                name:
                  `Esigenta Crediti - ${order.name}`,
                description:
                  `${order.credits} crediti - validita ${order.validityDays} giorni`,
              },
            },
            quantity: 1,
          },
        ],
        success_url:
          successUrl,
        cancel_url:
          cancelUrl,
        metadata:
          checkoutMetadata,
        payment_intent_data: {
          metadata:
            checkoutMetadata,
        },
        client_reference_id:
          order.orderId,
      },
      {
        idempotencyKey,
      },
    )

  return {
    session,
    successUrl,
    cancelUrl,
    providerPaymentIntentId:
      getStripePaymentIntentId(session),
  }
}