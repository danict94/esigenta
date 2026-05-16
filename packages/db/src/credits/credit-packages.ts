import type {
  CreditPackageStatus,
} from "@prisma/client"

import {
  prisma,
} from "../prisma/client"

export type CreditPackageFormInput = {
  id?: string
  name: string
  description?: string | null
  credits: number
  priceCents: number
  currency?: string | null
  status?: CreditPackageStatus
  sortOrder?: number
}

export type CreditPackageMutationResult =
  | {
      ok: true
      id: string
    }
  | {
      ok: false
      code: string
      message: string
    }

function normalizeText(
  value: string | null | undefined,
): string | null {
  const trimmed =
    value?.trim()

  return trimmed
    ? trimmed
    : null
}

function normalizeRequiredText(
  value: string | null | undefined,
): string | null {
  return normalizeText(value)
}

function normalizePositiveInt(
  value: number,
): number | null {
  if (!Number.isInteger(value) || value <= 0) {
    return null
  }

  return value
}

function normalizeNonNegativeInt(
  value: number | undefined,
  fallback: number,
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0
  ) {
    return fallback
  }

  return value
}

function normalizeCurrency(
  value: string | null | undefined,
): string {
  const currency =
    normalizeText(value)?.toUpperCase() ?? "EUR"

  return /^[A-Z]{3}$/.test(currency)
    ? currency
    : "EUR"
}

function normalizeStatus(
  value: CreditPackageStatus | undefined,
): CreditPackageStatus {
  return value === "INACTIVE"
    ? "INACTIVE"
    : "ACTIVE"
}

function normalizePackageInput(
  input: CreditPackageFormInput,
):
  | {
      ok: true
      value: {
        name: string
        description: string | null
        credits: number
        priceCents: number
        currency: string
        status: CreditPackageStatus
        sortOrder: number
      }
    }
  | {
      ok: false
      code: string
      message: string
    } {
  const name =
    normalizeRequiredText(input.name)

  if (!name) {
    return {
      ok: false,
      code: "invalid_credit_package_name",
      message:
        "Il nome del pacchetto è obbligatorio.",
    }
  }

  const credits =
    normalizePositiveInt(input.credits)

  if (!credits) {
    return {
      ok: false,
      code: "invalid_credit_amount",
      message:
        "Il numero di crediti deve essere maggiore di zero.",
    }
  }

  const priceCents =
    normalizePositiveInt(input.priceCents)

  if (!priceCents) {
    return {
      ok: false,
      code: "invalid_credit_price",
      message:
        "Il prezzo deve essere maggiore di zero.",
    }
  }

  return {
    ok: true,
    value: {
      name,
      description:
        normalizeText(input.description),
      credits,
      priceCents,
      currency:
        normalizeCurrency(input.currency),
      status:
        normalizeStatus(input.status),
      sortOrder:
        normalizeNonNegativeInt(
          input.sortOrder,
          0,
        ),
    },
  }
}

export async function listCreditPackages() {
  return prisma.creditPackage.findMany({
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
      status: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function createCreditPackage(
  input: CreditPackageFormInput,
): Promise<CreditPackageMutationResult> {
  const normalized =
    normalizePackageInput(input)

  if (!normalized.ok) {
    return normalized
  }

  const created =
    await prisma.creditPackage.create({
      data: normalized.value,
      select: {
        id: true,
      },
    })

  return {
    ok: true,
    id: created.id,
  }
}

export async function updateCreditPackage(
  input: CreditPackageFormInput & {
    id: string
  },
): Promise<CreditPackageMutationResult> {
  const id =
    normalizeRequiredText(input.id)

  if (!id) {
    return {
      ok: false,
      code: "invalid_credit_package_id",
      message:
        "Pacchetto crediti non valido.",
    }
  }

  const normalized =
    normalizePackageInput(input)

  if (!normalized.ok) {
    return normalized
  }

  const updated =
    await prisma.creditPackage.update({
      where: {
        id,
      },
      data: normalized.value,
      select: {
        id: true,
      },
    })

  return {
    ok: true,
    id: updated.id,
  }
}