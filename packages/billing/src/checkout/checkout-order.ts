import type { CompanyActor } from "@esigenta/auth"
import { isCompanyMarketplaceReady } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

export type CheckoutOrderErrorCode =
  | "COMPANY_NOT_APPROVED_FOR_CREDITS"
  | "invalid_credit_package_id"
  | "credit_package_not_found"

export type CheckoutOrderData = {
  orderId: string
  packageId: string
  name: string
  credits: number
  priceCents: number
  currency: string
  validityDays: number
}

export type MarkCheckoutCreatedInput = {
  creditOrderId: string
  providerCheckoutId: string
  providerPaymentIntentId?: string | null
}

export type MarkCheckoutCreatedData = {
  orderId: string
  providerCheckoutId: string
  providerPaymentIntentId: string | null
}

export type CreateCheckoutOrderResult =
  | { ok: true; data: CheckoutOrderData }
  | { ok: false; code: CheckoutOrderErrorCode; message: string }

export type MarkCheckoutCreatedResult =
  | { ok: true; data: MarkCheckoutCreatedData }
  | { ok: false; code: string; message: string }

type PerfRecorder = (label: string, ms: number) => void

export async function createCreditPackageCheckoutOrder(
  actor: CompanyActor,
  packageId: string,
  recordPerf?: PerfRecorder,
): Promise<CreateCheckoutOrderResult> {
  if (!isCompanyMarketplaceReady(actor.company)) {
    return {
      ok: false,
      code: "COMPANY_NOT_APPROVED_FOR_CREDITS",
      message: "Il profilo impresa deve essere approvato prima di acquistare crediti.",
    }
  }

  const normalizedPackageId = packageId.trim()
  if (!normalizedPackageId) {
    return { ok: false, code: "invalid_credit_package_id", message: "Pacchetto crediti non valido." }
  }

  const t0 = performance.now()

  const rows = await prisma.$queryRaw<
    Array<{
      id: string
      name: string
      credits: number
      price_cents: number
      currency: string
      validity_days: number
    }>
  >`
    SELECT "id", "name", "credits", "priceCents" AS price_cents, "currency", "validityDays" AS validity_days
    FROM "CreditPackage"
    WHERE "id" = ${normalizedPackageId} AND "status" = 'ACTIVE'
    LIMIT 1
  `

  const pkg = rows[0]
  if (!pkg) {
    recordPerf?.("checkout-order", Math.round(performance.now() - t0))
    return { ok: false, code: "credit_package_not_found", message: "Pacchetto crediti non trovato o non attivo." }
  }

  const orderRows = await prisma.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "CreditOrder" ("id", "companyId", "packageId", "status", "credits", "amountCents", "currency", "provider", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, ${actor.company.id}, ${pkg.id}, 'PENDING', ${pkg.credits}, ${pkg.price_cents}, ${pkg.currency}, 'stripe', now(), now())
    RETURNING "id"
  `

  recordPerf?.("checkout-order", Math.round(performance.now() - t0))

  return {
    ok: true,
    data: {
      orderId: orderRows[0]!.id,
      packageId: pkg.id,
      name: pkg.name,
      credits: Number(pkg.credits),
      priceCents: Number(pkg.price_cents),
      currency: pkg.currency,
      validityDays: Number(pkg.validity_days),
    },
  }
}

export async function markCreditCheckoutCreated(
  input: MarkCheckoutCreatedInput,
  recordPerf?: PerfRecorder,
): Promise<MarkCheckoutCreatedResult> {
  const normalizedOrderId = input.creditOrderId.trim()
  const normalizedCheckoutId = input.providerCheckoutId.trim()

  if (!normalizedOrderId) {
    return { ok: false, code: "invalid_credit_order_id", message: "Ordine crediti non valido." }
  }
  if (!normalizedCheckoutId) {
    return { ok: false, code: "invalid_provider_checkout_id", message: "Sessione Stripe Checkout non valida." }
  }

  const t0 = performance.now()
  const normalizedPaymentIntentId = input.providerPaymentIntentId?.trim() || null

  const rows = await prisma.$queryRaw<
    Array<{ id: string; provider_checkout_id: string; provider_payment_intent_id: string | null }>
  >`
    UPDATE "CreditOrder"
    SET
      "providerCheckoutId"      = ${normalizedCheckoutId},
      "providerPaymentIntentId" = ${normalizedPaymentIntentId},
      "updatedAt"               = now()
    WHERE "id" = ${normalizedOrderId}
    RETURNING "id", "providerCheckoutId" AS provider_checkout_id, "providerPaymentIntentId" AS provider_payment_intent_id
  `

  recordPerf?.("checkout-mark-created", Math.round(performance.now() - t0))

  if (rows.length === 0) {
    return { ok: false, code: "credit_order_not_found", message: "Ordine crediti non trovato." }
  }

  return {
    ok: true,
    data: {
      orderId: rows[0]!.id,
      providerCheckoutId: normalizedCheckoutId,
      providerPaymentIntentId: rows[0]!.provider_payment_intent_id,
    },
  }
}
