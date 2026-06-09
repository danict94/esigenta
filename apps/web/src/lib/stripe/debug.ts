export {
  STRIPE_DEBUG_PREFIX,
  isStripeDebugEnabled,
  logStripeDebug,
} from "@esigenta/db"

export const STRIPE_EXPECTED_WEBHOOK_ENDPOINT =
  "https://esigenta-web.vercel.app/api/stripe/webhook"

export const STRIPE_REQUIRED_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "payment_intent.payment_failed",
] as const

export function getUrlHost(
  value: string,
) {
  try {
    return new URL(value).host
  } catch {
    return null
  }
}

export function getStripeRuntimeDebugConfig() {
  return {
    hasStripeSecretKey:
      Boolean(process.env.STRIPE_SECRET_KEY),
    hasStripeWebhookSecret:
      Boolean(
        process.env.STRIPE_WEBHOOK_SECRET,
      ),
    hasEsigentaWebUrl:
      Boolean(process.env.ESIGENTA_WEB_URL),
    hasEsigentaAppUrl:
      Boolean(process.env.ESIGENTA_APP_URL),
    hasNextPublicAppUrl:
      Boolean(
        process.env.NEXT_PUBLIC_APP_URL,
      ),
    hasBetterAuthUrl:
      Boolean(process.env.BETTER_AUTH_URL),
    nodeEnv:
      process.env.NODE_ENV ?? null,
    vercel:
      process.env.VERCEL === "1" ||
      process.env.VERCEL === "true",
    hasVercelUrl:
      Boolean(process.env.VERCEL_URL),
    hasVercelProjectProductionUrl:
      Boolean(
        process.env
          .VERCEL_PROJECT_PRODUCTION_URL,
      ),
  }
}