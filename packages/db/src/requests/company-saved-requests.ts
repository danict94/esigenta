import type {
  Prisma,
  RequestStatus,
} from "@prisma/client"

import {
  prisma,
} from "../prisma/client"

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

const requestListSelect = {
  id: true,
  requestCode: true,
  status: true,
  interventionSlug: true,
  city: true,
  address: true,
  postalCode: true,
  structuredData: true,
  creditCost: true,
  maxUnlocks: true,
  unlockCount: true,
  createdAt: true,
} satisfies Prisma.RequestSelect

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

export async function listCompanySavedRequests({
  companyId,
}: {
  companyId: string
}): Promise<CompanySavedRequestListItem[]> {
  const normalizedCompanyId =
    normalizeRequiredId(companyId, "companyId")

  if (!normalizedCompanyId.ok) {
    return []
  }

  const savedRequests =
    await prisma.companySavedRequest.findMany({
      where: {
        companyId: normalizedCompanyId.value,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
        request: {
          select: {
            ...requestListSelect,
            unlocks: {
              where: {
                companyId: normalizedCompanyId.value,
              },
              select: {
                id: true,
                createdAt: true,
              },
              take: 1,
            },
          },
        },
      },
    })

  return savedRequests.map((savedRequest) => {
    const unlock =
      savedRequest.request.unlocks[0] ?? null
    const {
      unlocks,
      ...request
    } = savedRequest.request

    void unlocks

    return {
      ...request,
      savedAt: savedRequest.createdAt,
      hasUnlocked: Boolean(unlock),
      requestUnlockId:
        unlock?.id ?? null,
      unlockedAt:
        unlock?.createdAt ?? null,
      isSaved: true,
    }
  })
}

export async function listCompanyUnlockedRequests({
  companyId,
}: {
  companyId: string
}): Promise<CompanyUnlockedRequestListItem[]> {
  const normalizedCompanyId =
    normalizeRequiredId(companyId, "companyId")

  if (!normalizedCompanyId.ok) {
    return []
  }

  const unlocks =
    await prisma.requestUnlock.findMany({
      where: {
        companyId: normalizedCompanyId.value,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        creditCost: true,
        createdAt: true,
        refundedAt: true,
        request: {
          select: {
            ...requestListSelect,
            savedByCompanies: {
              where: {
                companyId: normalizedCompanyId.value,
              },
              select: {
                createdAt: true,
              },
              take: 1,
            },
          },
        },
      },
    })

  return unlocks.map((unlock) => {
    const savedRequest =
      unlock.request.savedByCompanies[0] ?? null
    const {
      savedByCompanies,
      creditCost,
      ...request
    } = unlock.request

    void savedByCompanies

    return {
      ...request,
      creditCost: unlock.creditCost,
      requestCreditCost: creditCost,
      hasUnlocked: true,
      requestUnlockId: unlock.id,
      unlockedAt: unlock.createdAt,
      refundedAt: unlock.refundedAt,
      isSaved: Boolean(savedRequest),
    }
  })
}
