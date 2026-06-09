import type {
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

type RequestDetailWithRelations =
  Omit<
    AvailableCompanyRequestDetail,
    | "hasUnlocked"
    | "requestUnlockId"
    | "unlockedAt"
    | "conversationId"
    | "customerContact"
    | "requestUnlockRefund"
    | "isSaved"
  > & {
    customerName: string | null
    customerEmail: string | null
    customerPhone: string | null
    unlocks: Array<{
      id: string
      createdAt: Date
      refundedAt: Date | null
      refundTransactionId: string | null
      refundRequest: {
        id: string
        status: string
        createdAt: Date
      } | null
      conversations: Array<{
        id: string
      }>
    }>
    savedByCompanies: Array<{
      createdAt: Date
    }>
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

function mapRequestDetail(
  request: RequestDetailWithRelations,
): AvailableCompanyRequestDetail {
  const {
    unlocks,
    savedByCompanies,
    customerName,
    customerEmail,
    customerPhone,
    ...requestFields
  } = request
  const unlock =
    unlocks[0] ?? null
  const savedRequest =
    savedByCompanies[0] ?? null

  return {
    ...requestFields,
    hasUnlocked: Boolean(unlock),
    requestUnlockId:
      unlock?.id ?? null,
    unlockedAt:
      unlock?.createdAt ?? null,
    conversationId:
      unlock?.conversations[0]?.id ?? null,
    customerContact: unlock
      ? {
          name:
            customerName,
          email:
            customerEmail,
          phone:
            customerPhone,
        }
      : null,
    requestUnlockRefund: unlock
      ? {
          refundedAt:
            unlock.refundedAt,
          refundTransactionId:
            unlock.refundTransactionId,
          refundRequest:
            unlock.refundRequest,
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

  const visibility =
    await measurePerf(
      "visibility-check",
      recordPerf,
      async () => {
        const company =
          await prisma.company.findUnique({
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
          })

        if (!company) {
          return {
            ok: false as const,
            code: "missing_category" as const,
            message:
              "Configura le categorie operative del profilo impresa.",
          }
        }

        if (!isCompanyMarketplaceApproved(company)) {
          return {
            ok: false as const,
            code: "company_not_approved_for_marketplace" as const,
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
            ok: false as const,
            code: "missing_location" as const,
            message:
              "Completa sede operativa e raggio d'azione dell'impresa.",
          }
        }

        const savedCategoryIds =
          company.categories.map(
            (category) => category.categoryId,
          )
        const fallbackCategory =
          savedCategoryIds.length === 0 &&
          company.onboardingCategorySlug
            ? await prisma.category.findUnique({
                where: {
                  slug:
                    company.onboardingCategorySlug,
                },
                select: {
                  id: true,
                },
              })
            : null
        const operationalCategoryIds =
          savedCategoryIds.length > 0
            ? savedCategoryIds
            : fallbackCategory
              ? [fallbackCategory.id]
              : []

        if (operationalCategoryIds.length === 0) {
          return {
            ok: false as const,
            code: "missing_category" as const,
            message:
              "Configura le categorie operative del profilo impresa.",
          }
        }

        return {
          ok: true as const,
          company,
          operationalCategoryIds,
        }
      },
    )

  if (!visibility.ok) {
    return {
      ok: false,
      code: visibility.code,
      message: visibility.message,
    }
  }

  const {
    company,
    operationalCategoryIds,
  } = visibility

  const request =
    await measurePerf(
      "request-query",
      recordPerf,
      async () =>
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
            requiredServices: {
              some: {
                service: {
                  categories: {
                    some: {
                      categoryId: {
                        in: operationalCategoryIds,
                      },
                    },
                  },
                },
              },
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
            unlocks: {
              where: {
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
              take: 1,
            },
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
        }),
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

  const companyLatitude =
    company.latitude
  const companyLongitude =
    company.longitude
  const operatingRadiusKm =
    company.operatingRadiusKm
  const requestLatitude =
    request.latitude
  const requestLongitude =
    request.longitude

  if (
    !hasValidNumber(companyLatitude) ||
    !hasValidNumber(companyLongitude) ||
    !hasValidNumber(operatingRadiusKm) ||
    !hasValidNumber(requestLatitude) ||
    !hasValidNumber(requestLongitude)
  ) {
    return {
      ok: false,
      code: "missing_location",
      message:
        "Completa sede operativa e raggio d'azione dell'impresa.",
    }
  }

  const distanceKm =
    measureSyncPerf(
      "visibility-distance",
      recordPerf,
      () =>
        getDistanceKm({
          fromLatitude:
            companyLatitude,
          fromLongitude:
            companyLongitude,
          toLatitude:
            requestLatitude,
          toLongitude:
            requestLongitude,
        }),
    )

  if (distanceKm > operatingRadiusKm) {
    return {
      ok: true,
      request: null,
    }
  }

  return {
    ok: true,
    request:
      mapRequestDetail(request),
  }
}
