import type {
  Prisma,
} from "@prisma/client"

import { prisma } from "@esigenta/database"

export type UpdateRequestCommercialSettingsInput = {
  requestId: string
  creditCost?: number | null
  maxUnlocks?: number | null
}

export type UpdateRequestCommercialSettingsResult =
  | {
      ok: true
      requestId: string
    }
  | {
      ok: false
      code: string
      message: string
    }

function normalizePositiveInteger(
  value: number | null | undefined,
  fieldName: string,
):
  | {
      ok: true
      value: number | null | undefined
    }
  | {
      ok: false
      code: string
      message: string
    } {
  if (value === undefined || value === null) {
    return {
      ok: true,
      value,
    }
  }

  if (!Number.isInteger(value) || value < 1) {
    return {
      ok: false,
      code:
        fieldName === "creditCost"
          ? "CREDIT_COST_INVALID"
          : "MAX_UNLOCKS_INVALID",
      message:
        fieldName === "creditCost"
          ? "Il costo in crediti deve essere un intero positivo."
          : "Il limite massimo di sblocchi deve essere un intero positivo.",
    }
  }

  return {
    ok: true,
    value,
  }
}

export async function updateRequestCommercialSettings({
  requestId,
  creditCost,
  maxUnlocks,
}: UpdateRequestCommercialSettingsInput): Promise<UpdateRequestCommercialSettingsResult> {
  const normalizedRequestId =
    requestId.trim()

  if (!normalizedRequestId) {
    return {
      ok: false,
      code: "REQUEST_ID_REQUIRED",
      message: "ID richiesta obbligatorio.",
    }
  }

  const normalizedCreditCost =
    normalizePositiveInteger(
      creditCost,
      "creditCost",
    )

  if (!normalizedCreditCost.ok) {
    return normalizedCreditCost
  }

  const normalizedMaxUnlocks =
    normalizePositiveInteger(
      maxUnlocks,
      "maxUnlocks",
    )

  if (!normalizedMaxUnlocks.ok) {
    return normalizedMaxUnlocks
  }

  const request =
    await prisma.request.findUnique({
      where: {
        id: normalizedRequestId,
      },
      select: {
        id: true,
        unlockCount: true,
      },
    })

  if (!request) {
    return {
      ok: false,
      code: "REQUEST_NOT_FOUND",
      message: "Richiesta non trovata.",
    }
  }

  if (
    normalizedMaxUnlocks.value !== undefined &&
    normalizedMaxUnlocks.value !== null &&
    normalizedMaxUnlocks.value < request.unlockCount
  ) {
    return {
      ok: false,
      code: "MAX_UNLOCKS_BELOW_UNLOCK_COUNT",
      message:
        "Il limite massimo di sblocchi non puo essere inferiore agli sblocchi gia effettuati.",
    }
  }

  const data: Prisma.RequestUpdateInput = {}

  if (normalizedCreditCost.value !== undefined) {
    data.creditCost =
      normalizedCreditCost.value
  }

  if (normalizedMaxUnlocks.value !== undefined) {
    data.maxUnlocks =
      normalizedMaxUnlocks.value
  }

  await prisma.request.update({
    where: {
      id: normalizedRequestId,
    },
    data,
    select: {
      id: true,
    },
  })

  return {
    ok: true,
    requestId:
      normalizedRequestId,
  }
}
