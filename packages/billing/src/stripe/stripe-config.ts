export const STRIPE_DEBUG_PREFIX = "[esigenta-stripe]"

export function isStripeDebugEnabled(): boolean {
  return process.env.ESIGENTA_DEBUG_STRIPE === "true"
}

export function logStripeDebug(
  event: string,
  payload: Record<string, unknown>,
): void {
  if (!isStripeDebugEnabled()) {
    return
  }

  console.info(`${STRIPE_DEBUG_PREFIX} ${event}`, payload)
}

export const STRIPE_EXPECTED_WEBHOOK_ENDPOINT =
  "https://www.esigenta.it/api/stripe/webhook"

export const STRIPE_REQUIRED_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "payment_intent.payment_failed",
] as const

export function getStripeRuntimeDebugConfig() {
  return {
    hasStripeSecretKey: Boolean(process.env.STRIPE_SECRET_KEY),
    hasStripeWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    hasEsigentaWebUrl: Boolean(process.env.ESIGENTA_WEB_URL),
    hasEsigentaAppUrl: Boolean(process.env.ESIGENTA_APP_URL),
    hasNextPublicAppUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    hasBetterAuthUrl: Boolean(process.env.BETTER_AUTH_URL),
    nodeEnv: process.env.NODE_ENV ?? null,
    vercel: process.env.VERCEL === "1" || process.env.VERCEL === "true",
    hasVercelUrl: Boolean(process.env.VERCEL_URL),
    hasVercelProjectProductionUrl: Boolean(process.env.VERCEL_PROJECT_PRODUCTION_URL),
  }
}

export function getUrlHost(value: string): string | null {
  try {
    return new URL(value).host
  } catch {
    return null
  }
}
