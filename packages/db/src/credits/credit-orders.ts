import type {
  CreditPackageStatus,
} from "@prisma/client"

import {
  prisma,
} from "../prisma/client"

import type {
  CreditLedgerResult,
} from "./credit-ledger"

export type PurchasableCreditPackage = {
  id: string
  name: string
  description: string | null
  credits: number
  priceCents: number
  currency: string
  validityDays: number
  status: CreditPackageStatus
  sortOrder: number
}

export type CreatePendingCreditOrderInput = {
  companyId: string
  packageId: string
}

export type PendingCreditOrderCheckoutData = {
  orderId: string
  packageId: string
  name: string
  credits: number
  priceCents: number
  currency: string
  validityDays: number
}

export type MarkCreditOrderCheckoutCreatedInput = {
  creditOrderId: string
  providerCheckoutId: string
  providerPaymentIntentId?: string | null
}

export type MarkCreditOrderCheckoutTerminalInput = {
  creditOrderId: string
}

export type MarkCreditOrderCheckoutCreatedData = {
  orderId: string
  providerCheckoutId: string
  providerPaymentIntentId: string | null
}

export type MarkCreditOrderCheckoutTerminalData = {
  orderId: string
  updated: boolean
}

function normalizeRequiredText(
  value: string,
): string | null {
  const trimmed =
    value.trim()

  return trimmed
    ? trimmed
    : null
}

export async function listActiveCreditPackagesForPurchase(): Promise<
  PurchasableCreditPackage[]
> {
  return prisma.creditPackage.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      name: true,
      description: true,
      credits: true,
      priceCents: true,
      currency: true,
      validityDays: true,
      status: true,
      sortOrder: true,
    },
  })
}

export async function createPendingCreditOrder({
  companyId,
  packageId,
}: CreatePendingCreditOrderInput): Promise<
  CreditLedgerResult<PendingCreditOrderCheckoutData>
> {
  const normalizedCompanyId =
    normalizeRequiredText(companyId)
  const normalizedPackageId =
    normalizeRequiredText(packageId)

  if (!normalizedCompanyId) {
    return {
      ok: false,
      code: "invalid_company_id",
      message: "Impresa non valida.",
    }
  }

  if (!normalizedPackageId) {
    return {
      ok: false,
      code: "invalid_credit_package_id",
      message: "Pacchetto crediti non valido.",
    }
  }

  const creditPackage =
    await prisma.creditPackage.findFirst({
      where: {
        id: normalizedPackageId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        credits: true,
        priceCents: true,
        currency: true,
        validityDays: true,
      },
    })

  if (!creditPackage) {
    return {
      ok: false,
      code: "credit_package_not_found",
      message:
        "Pacchetto crediti non trovato o non attivo.",
    }
  }

  const order =
    await prisma.creditOrder.create({
      data: {
        companyId: normalizedCompanyId,
        packageId: creditPackage.id,
        status: "PENDING",
        credits: creditPackage.credits,
        amountCents:
          creditPackage.priceCents,
        currency: creditPackage.currency,
        provider: "stripe",
      },
      select: {
        id: true,
      },
    })

  return {
    ok: true,
    data: {
      orderId: order.id,
      packageId: creditPackage.id,
      name: creditPackage.name,
      credits: creditPackage.credits,
      priceCents:
        creditPackage.priceCents,
      currency: creditPackage.currency,
      validityDays:
        creditPackage.validityDays,
    },
  }
}

export async function markCreditOrderCheckoutCreated({
  creditOrderId,
  providerCheckoutId,
  providerPaymentIntentId,
}: MarkCreditOrderCheckoutCreatedInput): Promise<
  CreditLedgerResult<MarkCreditOrderCheckoutCreatedData>
> {
  const normalizedCreditOrderId =
    normalizeRequiredText(creditOrderId)
  const normalizedProviderCheckoutId =
    normalizeRequiredText(providerCheckoutId)
  const normalizedPaymentIntentId =
    providerPaymentIntentId
      ? normalizeRequiredText(
          providerPaymentIntentId,
        )
      : null

  if (!normalizedCreditOrderId) {
    return {
      ok: false,
      code: "invalid_credit_order_id",
      message: "Ordine crediti non valido.",
    }
  }

  if (!normalizedProviderCheckoutId) {
    return {
      ok: false,
      code: "invalid_provider_checkout_id",
      message:
        "Sessione Stripe Checkout non valida.",
    }
  }

  const updated =
    await prisma.creditOrder.update({
      where: {
        id: normalizedCreditOrderId,
      },
      data: {
        providerCheckoutId:
          normalizedProviderCheckoutId,
        ...(normalizedPaymentIntentId
          ? {
              providerPaymentIntentId:
                normalizedPaymentIntentId,
            }
          : {}),
      },
      select: {
        id: true,
        providerCheckoutId: true,
        providerPaymentIntentId: true,
      },
    })

  return {
    ok: true,
    data: {
      orderId: updated.id,
      providerCheckoutId:
        normalizedProviderCheckoutId,
      providerPaymentIntentId:
        updated.providerPaymentIntentId,
    },
  }
}

async function markPendingCreditOrderStatus({
  creditOrderId,
  status,
}: {
  creditOrderId: string
  status: "FAILED" | "CANCELLED"
}): Promise<
  CreditLedgerResult<MarkCreditOrderCheckoutTerminalData>
> {
  const normalizedCreditOrderId =
    normalizeRequiredText(creditOrderId)

  if (!normalizedCreditOrderId) {
    return {
      ok: false,
      code: "invalid_credit_order_id",
      message: "Ordine crediti non valido.",
    }
  }

  const result =
    await prisma.creditOrder.updateMany({
      where: {
        id: normalizedCreditOrderId,
        status: "PENDING",
      },
      data: {
        status,
      },
    })

  return {
    ok: true,
    data: {
      orderId:
        normalizedCreditOrderId,
      updated:
        result.count > 0,
    },
  }
}

export async function markCreditOrderCheckoutFailed(
  input: MarkCreditOrderCheckoutTerminalInput,
) {
  return markPendingCreditOrderStatus({
    creditOrderId:
      input.creditOrderId,
    status: "FAILED",
  })
}

export async function markCreditOrderCheckoutCancelled(
  input: MarkCreditOrderCheckoutTerminalInput,
) {
  return markPendingCreditOrderStatus({
    creditOrderId:
      input.creditOrderId,
    status: "CANCELLED",
  })
}
