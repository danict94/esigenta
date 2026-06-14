import type Stripe from "stripe"

export type StripeCreditCheckoutStatus =
  | "pending"
  | "fulfilled"
  | "failed"
  | "cancelled"
  | "expired"
  | "error"

export function getStripeCreditOrderId(
  session: Stripe.Checkout.Session,
): string | null {
  return session.metadata?.creditOrderId ?? session.client_reference_id ?? null
}

export function getStripePaymentIntentId(
  session: Stripe.Checkout.Session,
): string | null {
  return typeof session.payment_intent === "string" ? session.payment_intent : null
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
  if (fulfilled) return "fulfilled"
  if (orderStatus === "FAILED") return "failed"
  if (sessionStatus === "expired") return "expired"
  if (orderStatus === "CANCELLED") return "cancelled"
  return "pending"
}
