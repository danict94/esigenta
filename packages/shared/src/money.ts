/**
 * Single conversion boundary between EUR (the unit every human — admin or
 * company — reasons in) and cents (the unit CreditPackage.priceCents /
 * CreditOrder.amountCents store, and the unit Stripe's unit_amount expects
 * natively). Every place in the app that needs to go from one unit to the
 * other must go through these two functions — never a bare *100 or /100 —
 * so there is exactly one place float-rounding is handled.
 */

export function eurosToCents(euros: number): number {
  if (!Number.isFinite(euros)) {
    return 0
  }

  return Math.round(euros * 100)
}

export function centsToEuros(cents: number): number {
  if (!Number.isFinite(cents)) {
    return 0
  }

  return cents / 100
}

export function formatCentsAsCurrency(
  cents: number,
  currency: string,
  locale = "it-IT",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(centsToEuros(cents))
}
