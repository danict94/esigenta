import {
  normalizeRequiredText,
} from "./credit-result"

export type CreditCheckoutSessionMetadata = Record<
  string,
  string | null | undefined
>

export function getCreditOrderIdFromCheckoutSessionData({
  clientReferenceId,
  metadata,
}: {
  clientReferenceId?: string | null | undefined
  metadata?: CreditCheckoutSessionMetadata | null | undefined
}) {
  return (
    normalizeRequiredText(
      metadata?.creditOrderId,
    ) ??
    normalizeRequiredText(clientReferenceId)
  )
}