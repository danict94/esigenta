const STRIPE_DEBUG_PREFIX =
  "[esigenta-stripe]"

export function isStripeDebugEnabled() {
  return (
    process.env.ESIGENTA_DEBUG_STRIPE ===
    "true"
  )
}

export function logStripeDebug(
  event: string,
  payload: Record<string, unknown>,
) {
  if (!isStripeDebugEnabled()) {
    return
  }

  console.info(
    `${STRIPE_DEBUG_PREFIX} ${event}`,
    payload,
  )
}
