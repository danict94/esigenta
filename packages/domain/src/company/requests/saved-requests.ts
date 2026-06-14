import type {
  Prisma,
  RequestStatus,
} from "@prisma/client"

import { prisma } from "@esigenta/database"

export type ToggleCompanySavedRequestResult =
  | {
      ok: true
      saved: boolean
    }
  | {
      ok: false
      code: string
      message: string
    }

export type CompanySavedRequestListItem = {
  id: string
  requestCode: string | null
  status: RequestStatus
  interventionSlug: string | null
  city: string | null
  address: string | null
  postalCode: string | null
  structuredData: Prisma.JsonValue | null
  creditCost: number | null
  maxUnlocks: number | null
  unlockCount: number
  createdAt: Date
  savedAt: Date
  hasUnlocked: boolean
  requestUnlockId: string | null
  unlockedAt: Date | null
  isSaved: boolean
}

export type CompanyUnlockedRequestListItem = {
  id: string
  requestCode: string | null
  status: RequestStatus
  interventionSlug: string | null
  city: string | null
  address: string | null
  postalCode: string | null
  structuredData: Prisma.JsonValue | null
  creditCost: number
  requestCreditCost: number | null
  maxUnlocks: number | null
  unlockCount: number
  createdAt: Date
  hasUnlocked: true
  requestUnlockId: string
  unlockedAt: Date
  refundedAt: Date | null
  isSaved: boolean
}

function normalizeRequiredId(value: string, fieldName: string) {
  const normalized = value.trim()

  if (!normalized) {
    return {
      ok: false as const,
      code: `missing_${fieldName}`,
      message:
        fieldName === "companyId"
          ? "Impresa non valida."
          : "Richiesta non valida.",
    }
  }

  return {
    ok: true as const,
    value: normalized,
  }
}

export async function toggleCompanySavedRequest({
  companyId,
  requestId,
}: {
  companyId: string
  requestId: string
}): Promise<ToggleCompanySavedRequestResult> {
  const normalizedCompanyId =
    normalizeRequiredId(companyId, "companyId")

  if (!normalizedCompanyId.ok) {
    return normalizedCompanyId
  }

  const normalizedRequestId =
    normalizeRequiredId(requestId, "requestId")

  if (!normalizedRequestId.ok) {
    return normalizedRequestId
  }

  const request = await prisma.request.findUnique({
    where: {
      id: normalizedRequestId.value,
    },
    select: {
      id: true,
    },
  })

  if (!request) {
    return {
      ok: false,
      code: "request_not_found",
      message: "Richiesta non trovata.",
    }
  }

  const company = await prisma.company.findUnique({
    where: {
      id: normalizedCompanyId.value,
    },
    select: {
      id: true,
    },
  })

  if (!company) {
    return {
      ok: false,
      code: "company_not_found",
      message: "Impresa non trovata.",
    }
  }

  const existing =
    await prisma.companySavedRequest.findUnique({
      where: {
        companyId_requestId: {
          companyId: normalizedCompanyId.value,
          requestId: normalizedRequestId.value,
        },
      },
      select: {
        companyId: true,
      },
    })

  if (existing) {
    await prisma.companySavedRequest.delete({
      where: {
        companyId_requestId: {
          companyId: normalizedCompanyId.value,
          requestId: normalizedRequestId.value,
        },
      },
    })

    return {
      ok: true,
      saved: false,
    }
  }

  await prisma.companySavedRequest.create({
    data: {
      companyId: normalizedCompanyId.value,
      requestId: normalizedRequestId.value,
    },
  })

  return {
    ok: true,
    saved: true,
  }
}

