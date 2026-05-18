import type {
  Prisma,
  RequestStatus,
} from "@prisma/client"

import {
  prisma,
} from "../prisma/client"

export type CompanyRequestMatchLevel =
  | "selected_service"
  | "category"

export type AvailableCompanyRequest = {
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
  isSaved: boolean
  createdAt: Date
  matchLevel: CompanyRequestMatchLevel
}

export type ListAvailableRequestsForCompanyResult =
  | {
      ok: true
      hasSelectedServices: boolean
      requests: AvailableCompanyRequest[]
    }
  | {
      ok: false
      code:
        | "missing_category"
        | "missing_location"
      message: string
    }

export type GetAvailableRequestForCompanyResult =
  | {
      ok: true
      hasSelectedServices: boolean
      request: AvailableCompanyRequest | null
    }
  | {
      ok: false
      code:
        | "missing_category"
        | "missing_location"
      message: string
    }

type RequestWithServices =
  Omit<
    AvailableCompanyRequest,
    | "matchLevel"
    | "hasUnlocked"
    | "requestUnlockId"
    | "unlockedAt"
    | "isSaved"
  > & {
    requiredServices: Array<{
      serviceId: string
    }>
    unlocks: Array<{
      id: string
      createdAt: Date
    }>
    savedByCompanies: Array<{
      createdAt: Date
    }>
  }

const visibleRequestStatuses: RequestStatus[] = [
  "APPROVED",
  "PUBLISHED",
]

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function getDistanceKm({
  fromLatitude,
  fromLongitude,
  toLatitude,
  toLongitude,
}: {
  fromLatitude: number
  fromLongitude: number
  toLatitude: number
  toLongitude: number
}) {
  const earthRadiusKm = 6371

  const latitudeDelta =
    toRadians(toLatitude - fromLatitude)
  const longitudeDelta =
    toRadians(toLongitude - fromLongitude)

  const fromLatitudeRadians =
    toRadians(fromLatitude)
  const toLatitudeRadians =
    toRadians(toLatitude)

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitudeRadians) *
      Math.cos(toLatitudeRadians) *
      Math.sin(longitudeDelta / 2) ** 2

  return (
    2 *
    earthRadiusKm *
    Math.asin(Math.sqrt(haversine))
  )
}

function hasValidNumber(
  value: number | null,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  )
}

function mapRequest({
  request,
  selectedServiceIds,
}: {
  request: RequestWithServices
  selectedServiceIds: Set<string>
}): AvailableCompanyRequest {
  const matchLevel =
    selectedServiceIds.size > 0 &&
    request.requiredServices.some(
      (requiredService) =>
        selectedServiceIds.has(
          requiredService.serviceId,
        ),
    )
      ? "selected_service"
      : "category"

  const {
    requiredServices,
    unlocks,
    savedByCompanies,
    ...requestFields
  } = request

  void requiredServices

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
    isSaved: Boolean(savedRequest),
    matchLevel,
  }
}

function sortVisibleRequests(
  left: AvailableCompanyRequest,
  right: AvailableCompanyRequest,
) {
  if (
    left.matchLevel !== right.matchLevel
  ) {
    return left.matchLevel ===
      "selected_service"
      ? -1
      : 1
  }

  return (
    right.createdAt.getTime() -
    left.createdAt.getTime()
  )
}

async function loadAvailableRequestsForCompany({
  companyId,
  requestId,
}: {
  companyId: string
  requestId?: string
}): Promise<ListAvailableRequestsForCompanyResult> {
  const company =
    await prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        onboardingCategorySlug: true,
        latitude: true,
        longitude: true,
        operatingRadiusKm: true,
        services: {
          select: {
            serviceId: true,
          },
        },
      },
    })

  if (!company?.onboardingCategorySlug) {
    return {
      ok: false,
      code: "missing_category",
      message:
        "Configura la categoria iniziale del profilo impresa.",
    }
  }

  if (
    !hasValidNumber(company.latitude) ||
    !hasValidNumber(company.longitude) ||
    !Number.isFinite(
      company.operatingRadiusKm,
    )
  ) {
    return {
      ok: false,
      code: "missing_location",
      message:
        "Completa sede operativa e raggio d'azione dell'impresa.",
    }
  }

  const companyLatitude =
    company.latitude
  const companyLongitude =
    company.longitude
  const operatingRadiusKm =
    company.operatingRadiusKm

  const categoryServices =
    await prisma.categoryService.findMany({
      where: {
        category: {
          slug:
            company.onboardingCategorySlug,
        },
      },
      select: {
        serviceId: true,
      },
    })

  const categoryServiceIds =
    categoryServices.map(
      (service) => service.serviceId,
    )

  const selectedServiceIds =
    new Set(
      company.services.map(
        (service) => service.serviceId,
      ),
    )

  if (categoryServiceIds.length === 0) {
    return {
      ok: true,
      hasSelectedServices:
        selectedServiceIds.size > 0,
      requests: [],
    }
  }

  const requests =
    await prisma.request.findMany({
      where: {
        ...(requestId
          ? {
              id: requestId,
            }
          : {}),
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
            serviceId: {
              in: categoryServiceIds,
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
        unlocks: {
          where: {
            companyId,
          },
          select: {
            id: true,
            createdAt: true,
          },
          take: 1,
        },
        savedByCompanies: {
          where: {
            companyId,
          },
          select: {
            createdAt: true,
          },
          take: 1,
        },
        requiredServices: {
          select: {
            serviceId: true,
          },
        },
      },
    })

  const visibleRequests =
    requests
      .filter((request) => {
        if (
          !hasValidNumber(
            request.latitude,
          ) ||
          !hasValidNumber(
            request.longitude,
          )
        ) {
          return false
        }

        return (
          getDistanceKm({
            fromLatitude:
              companyLatitude,
            fromLongitude:
              companyLongitude,
            toLatitude:
              request.latitude,
            toLongitude:
              request.longitude,
          }) <=
          operatingRadiusKm
        )
      })
      .map((request) =>
        mapRequest({
          request,
          selectedServiceIds,
        }),
      )
      .sort(sortVisibleRequests)

  return {
    ok: true,
    hasSelectedServices:
      selectedServiceIds.size > 0,
    requests: visibleRequests,
  }
}

export async function listAvailableRequestsForCompany({
  companyId,
}: {
  companyId: string
}): Promise<ListAvailableRequestsForCompanyResult> {
  return loadAvailableRequestsForCompany({
    companyId,
  })
}

export async function getAvailableRequestForCompany({
  companyId,
  requestId,
}: {
  companyId: string
  requestId: string
}): Promise<GetAvailableRequestForCompanyResult> {
  const result =
    await loadAvailableRequestsForCompany({
      companyId,
      requestId,
    })

  if (!result.ok) {
    return result
  }

  return {
    ok: true,
    hasSelectedServices:
      result.hasSelectedServices,
    request:
      result.requests[0] ?? null,
  }
}
