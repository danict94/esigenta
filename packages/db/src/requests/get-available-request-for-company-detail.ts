import type {
  CompanyStatus,
  Prisma,
  RequestStatus,
} from "@prisma/client"

import {
  isCompanyMarketplaceApproved,
} from "../identity"
import {
  prisma,
} from "../prisma/client"

import {
  getDistanceKm,
} from "./distance"

export type AvailableCompanyRequestDetail = {
  id: string
  requestCode: string | null
  status: RequestStatus
  interventionSlug: string | null
  city: string | null
  address: string | null
  postalCode: string | null
  latitude: number | null
  longitude: number | null
  structuredData: Prisma.JsonValue | null
  creditCost: number | null
  maxUnlocks: number | null
  unlockCount: number
  hasUnlocked: boolean
  requestUnlockId: string | null
  unlockedAt: Date | null
  conversationId: string | null
  customerContact: {
    name: string | null
    email: string | null
    phone: string | null
  } | null
  requestUnlockRefund: {
    refundedAt: Date | null
    refundTransactionId: string | null
    refundRequest: {
      id: string
      status: string
      createdAt: Date
    } | null
  } | null
  isSaved: boolean
  createdAt: Date
}

export type GetAvailableRequestForCompanyDetailResult =
  | {
      ok: true
      request: AvailableCompanyRequestDetail | null
    }
  | {
      ok: false
      code:
        | "company_not_approved_for_marketplace"
        | "missing_category"
        | "missing_location"
      message: string
    }

type RequestDetailPerfRecorder = (
  operation: string,
  durationMs: number,
) => void

async function measurePerf<T>(
  operation: string,
  recordPerf: RequestDetailPerfRecorder | undefined,
  task: () => Promise<T>,
): Promise<T> {
  const startedAt =
    performance.now()

  try {
    return await task()
  } finally {
    recordPerf?.(
      operation,
      performance.now() - startedAt,
    )
  }
}

function measureSyncPerf<T>(
  operation: string,
  recordPerf: RequestDetailPerfRecorder | undefined,
  task: () => T,
): T {
  const startedAt =
    performance.now()

  try {
    return task()
  } finally {
    recordPerf?.(
      operation,
      performance.now() - startedAt,
    )
  }
}

const visibleRequestStatuses: RequestStatus[] = [
  "APPROVED",
  "PUBLISHED",
]

function normalizeRequiredText(
  value: string,
) {
  const normalized =
    value.trim()

  return normalized
    ? normalized
    : null
}

function hasValidNumber(
  value: number | null,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  )
}

type ParallelCompanyData = {
  isActive: boolean
  deletedAt: Date | null
  status: CompanyStatus
  onboardingCategorySlug: string | null
  latitude: number | null
  longitude: number | null
  operatingRadiusKm: number | null
  categories: Array<{ categoryId: string }>
}

type ParallelRequestData = {
  id: string
  requestCode: string | null
  status: RequestStatus
  interventionSlug: string | null
  city: string | null
  address: string | null
  postalCode: string | null
  latitude: number | null
  longitude: number | null
  structuredData: Prisma.JsonValue | null
  creditCost: number | null
  maxUnlocks: number | null
  unlockCount: number
  createdAt: Date
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  savedByCompanies: Array<{ createdAt: Date }>
}

type ParallelUnlockData = {
  id: string
  createdAt: Date
  refundedAt: Date | null
  refundTransactionId: string | null
  refundRequest: {
    id: string
    status: string
    createdAt: Date
  } | null
  conversations: Array<{ id: string }>
} | null

function mapRequestDetail({
  request,
  unlock,
}: {
  request: ParallelRequestData
  unlock: ParallelUnlockData
}): AvailableCompanyRequestDetail {
  const savedRequest =
    request.savedByCompanies[0] ?? null

  return {
    id: request.id,
    requestCode: request.requestCode,
    status: request.status,
    interventionSlug: request.interventionSlug,
    city: request.city,
    address: request.address,
    postalCode: request.postalCode,
    latitude: request.latitude,
    longitude: request.longitude,
    structuredData: request.structuredData,
    creditCost: request.creditCost,
    maxUnlocks: request.maxUnlocks,
    unlockCount: request.unlockCount,
    createdAt: request.createdAt,
    hasUnlocked: Boolean(unlock),
    requestUnlockId:
      unlock?.id ?? null,
    unlockedAt:
      unlock?.createdAt ?? null,
    conversationId:
      unlock?.conversations[0]?.id ?? null,
    customerContact: unlock
      ? {
          name: request.customerName,
          email: request.customerEmail,
          phone: request.customerPhone,
        }
      : null,
    requestUnlockRefund: unlock
      ? {
          refundedAt: unlock.refundedAt,
          refundTransactionId: unlock.refundTransactionId,
          refundRequest: unlock.refundRequest,
        }
      : null,
    isSaved: Boolean(savedRequest),
  }
}

export async function getAvailableRequestForCompanyDetail({
  companyId,
  requestId,
  recordPerf,
}: {
  companyId: string
  requestId: string
  recordPerf?: RequestDetailPerfRecorder
}): Promise<GetAvailableRequestForCompanyDetailResult> {
  const normalizedCompanyId =
    normalizeRequiredText(companyId)
  const normalizedRequestId =
    normalizeRequiredText(requestId)

  if (!normalizedCompanyId || !normalizedRequestId) {
    return {
      ok: true,
      request: null,
    }
  }

  const parallelStart =
    performance.now()

  const [company, request, unlock] =
    await Promise.all([
      prisma.company.findUnique({
        where: {
          id: normalizedCompanyId,
        },
        select: {
          isActive: true,
          deletedAt: true,
          status: true,
          onboardingCategorySlug: true,
          latitude: true,
          longitude: true,
          operatingRadiusKm: true,
          categories: {
            select: {
              categoryId: true,
            },
          },
        },
      }) as Promise<ParallelCompanyData | null>,
      prisma.request.findFirst({
        where: {
          id: normalizedRequestId,
          status: {
            in: visibleRequestStatuses,
          },
          latitude: {
            not: null,
          },
          longitude: {
            not: null,
          },
        },
        select: {
          id: true,
          requestCode: true,
          status: true,
          interventionSlug: true,
          city: true,
          address: true,
          postalCode: true,
          latitude: true,
          longitude: true,
          structuredData: true,
          creditCost: true,
          maxUnlocks: true,
          unlockCount: true,
          createdAt: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          savedByCompanies: {
            where: {
              companyId: normalizedCompanyId,
            },
            select: {
              createdAt: true,
            },
            take: 1,
          },
        },
      }) as Promise<ParallelRequestData | null>,
      prisma.requestUnlock.findFirst({
        where: {
          requestId: normalizedRequestId,
          companyId: normalizedCompanyId,
        },
        select: {
          id: true,
          createdAt: true,
          refundedAt: true,
          refundTransactionId: true,
          refundRequest: {
            select: {
              id: true,
              status: true,
              createdAt: true,
            },
          },
          conversations: {
            where: {
              type: "COMPANY_CUSTOMER",
            },
            select: {
              id: true,
            },
            take: 1,
          },
        },
      }) as Promise<ParallelUnlockData>,
    ])

  recordPerf?.(
    "visibility-check",
    performance.now() - parallelStart,
  )

  if (!company) {
    return {
      ok: false,
      code: "missing_category",
      message:
        "Configura le categorie operative del profilo impresa.",
    }
  }

  if (!isCompanyMarketplaceApproved(company)) {
    return {
      ok: false,
      code: "company_not_approved_for_marketplace",
      message:
        "Il profilo impresa deve essere approvato prima di usare il marketplace.",
    }
  }

  if (
    !hasValidNumber(company.latitude) ||
    !hasValidNumber(company.longitude) ||
    !hasValidNumber(company.operatingRadiusKm)
  ) {
    return {
      ok: false,
      code: "missing_location",
      message:
        "Completa sede operativa e raggio d'azione dell'impresa.",
    }
  }

  recordPerf?.(
    "request-query",
    performance.now() - parallelStart,
  )

  if (
    !request ||
    !hasValidNumber(request.latitude) ||
    !hasValidNumber(request.longitude)
  ) {
    return {
      ok: true,
      request: null,
    }
  }

  const distanceKm =
    measureSyncPerf(
      "visibility-distance",
      recordPerf,
      () =>
        getDistanceKm({
          fromLatitude: company.latitude as number,
          fromLongitude: company.longitude as number,
          toLatitude: request.latitude as number,
          toLongitude: request.longitude as number,
        }),
    )

  if (distanceKm > (company.operatingRadiusKm as number)) {
    return {
      ok: true,
      request: null,
    }
  }

  return {
    ok: true,
    request: mapRequestDetail({ request, unlock }),
  }
}
