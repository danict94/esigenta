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

export type RequestDashboardSort =
  | "recommended"
  | "newest"
  | "nearest"

export type RequestDashboardFilters = {
  q?: string | null
  radiusKm?: number | null
  categoryId?: string | null
  serviceId?: string | null
  sort?: RequestDashboardSort
}

export type RequestDashboardFilterOptions = {
  categories: Array<{
    id: string
    name: string
  }>
  services: Array<{
    id: string
    name: string
    categoryId: string
  }>
  active: {
    q: string | null
    radiusKm: number | null
    categoryId: string | null
    serviceId: string | null
    sort: RequestDashboardSort
  }
}

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
      filters: RequestDashboardFilterOptions
      requests: AvailableCompanyRequest[]
    }
  | {
      ok: false
      code:
        | "missing_category"
        | "missing_location"
      message: string
      filters: RequestDashboardFilterOptions
    }

export type GetAvailableRequestForCompanyResult =
  | {
      ok: true
      hasSelectedServices: boolean
      filters: RequestDashboardFilterOptions
      request: AvailableCompanyRequest | null
    }
  | {
      ok: false
      code:
        | "missing_category"
        | "missing_location"
      message: string
      filters: RequestDashboardFilterOptions
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

const allowedRadiusFilters = new Set([
  10,
  25,
  50,
])

const allowedSortFilters =
  new Set<RequestDashboardSort>([
    "recommended",
    "newest",
    "nearest",
  ])

function normalizeReadModelFilters(
  filters?: RequestDashboardFilters,
): RequestDashboardFilterOptions["active"] {
  const q =
    typeof filters?.q === "string"
      ? filters.q.trim().slice(0, 80)
      : ""
  const radiusKm =
    typeof filters?.radiusKm === "number" &&
    allowedRadiusFilters.has(
      filters.radiusKm,
    )
      ? filters.radiusKm
      : null
  const sort =
    filters?.sort &&
    allowedSortFilters.has(filters.sort)
      ? filters.sort
      : "recommended"
  const categoryId =
    typeof filters?.categoryId === "string"
      ? filters.categoryId.trim()
      : ""
  const serviceId =
    typeof filters?.serviceId === "string"
      ? filters.serviceId.trim()
      : ""

  return {
    q: q || null,
    radiusKm,
    categoryId: categoryId || null,
    serviceId: serviceId || null,
    sort,
  }
}

function createFilterOptions({
  categories = [],
  services = [],
  active,
}: {
  categories?: RequestDashboardFilterOptions["categories"]
  services?: RequestDashboardFilterOptions["services"]
  active: RequestDashboardFilterOptions["active"]
}): RequestDashboardFilterOptions {
  return {
    categories,
    services,
    active,
  }
}

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
  categoryServiceIds,
  selectedServiceIds,
}: {
  request: RequestWithServices
  categoryServiceIds: Set<string>
  selectedServiceIds: Set<string>
}): AvailableCompanyRequest {
  const hasSelectedServiceMatch =
    selectedServiceIds.size > 0 &&
    request.requiredServices.some(
      (requiredService) =>
        selectedServiceIds.has(
          requiredService.serviceId,
        ),
    )
  const hasCategoryServiceMatch =
    request.requiredServices.some(
      (requiredService) =>
        categoryServiceIds.has(
          requiredService.serviceId,
        ),
    )
  let matchLevel: CompanyRequestMatchLevel =
    "category"

  if (hasSelectedServiceMatch) {
    matchLevel = "selected_service"
  } else if (hasCategoryServiceMatch) {
    matchLevel = "category"
  }

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

type SortableAvailableCompanyRequest =
  AvailableCompanyRequest & {
    distanceKm: number
  }

function compareRecommendedRequests(
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

function sortVisibleRequests(
  left: SortableAvailableCompanyRequest,
  right: SortableAvailableCompanyRequest,
  sort: RequestDashboardSort,
) {
  if (sort === "newest") {
    return (
      right.createdAt.getTime() -
      left.createdAt.getTime()
    )
  }

  if (sort === "nearest") {
    const distanceDelta =
      left.distanceKm - right.distanceKm

    if (distanceDelta !== 0) {
      return distanceDelta
    }
  }

  return compareRecommendedRequests(left, right)
}

async function loadAvailableRequestsForCompany({
  companyId,
  requestId,
  filters,
}: {
  companyId: string
  requestId?: string
  filters?: RequestDashboardFilters | undefined
}): Promise<ListAvailableRequestsForCompanyResult> {
  const normalizedFilters =
    normalizeReadModelFilters(filters)
  const emptyFilterOptions =
    createFilterOptions({
      active: normalizedFilters,
    })
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
        categories: {
          select: {
            categoryId: true,
          },
        },
        services: {
          select: {
            serviceId: true,
          },
        },
      },
    })

  if (!company) {
    return {
      ok: false,
      code: "missing_category",
      message:
        "Configura le categorie operative del profilo impresa.",
      filters: emptyFilterOptions,
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
      filters: emptyFilterOptions,
    }
  }

  const companyLatitude =
    company.latitude
  const companyLongitude =
    company.longitude
  const operatingRadiusKm =
    company.operatingRadiusKm

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
      ok: false,
      code: "missing_category",
      message:
        "Configura le categorie operative del profilo impresa.",
      filters: emptyFilterOptions,
    }
  }

  const operationalCategoryIdSet =
    new Set(operationalCategoryIds)
  const operationalCategories =
    await prisma.category.findMany({
      where: {
        id: {
          in: operationalCategoryIds,
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    })

  const categoryServices =
    await prisma.categoryService.findMany({
      where: {
        categoryId: {
          in: operationalCategoryIds,
        },
      },
      select: {
        categoryId: true,
        serviceId: true,
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

  const categoryServiceIds =
    Array.from(
      new Set(
        categoryServices.map(
          (service) =>
            service.serviceId,
        ),
      ),
    )
  const categoryServiceIdSet =
    new Set(categoryServiceIds)
  const filterServices =
    categoryServices
      .map((categoryService) => ({
        id: categoryService.service.id,
        name: categoryService.service.name,
        categoryId:
          categoryService.categoryId,
      }))
      .sort((left, right) =>
        left.name.localeCompare(
          right.name,
          "it",
        ),
      )
  const activeCategoryId =
    normalizedFilters.categoryId &&
    operationalCategoryIdSet.has(
      normalizedFilters.categoryId,
    )
      ? normalizedFilters.categoryId
      : null
  const activeServiceId =
    normalizedFilters.serviceId &&
    categoryServiceIdSet.has(
      normalizedFilters.serviceId,
    )
      ? normalizedFilters.serviceId
      : null
  const activeFilters = {
    ...normalizedFilters,
    categoryId: activeCategoryId,
    serviceId: activeServiceId,
  }
  const filterOptions =
    createFilterOptions({
      categories:
        operationalCategories,
      services: filterServices,
      active: activeFilters,
    })

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
      filters: filterOptions,
      requests: [],
    }
  }

  const categoryFilteredServiceIds =
    activeCategoryId
      ? categoryServices
          .filter(
            (categoryService) =>
              categoryService.categoryId ===
              activeCategoryId,
          )
          .map(
            (categoryService) =>
              categoryService.serviceId,
          )
      : categoryServiceIds
  const visibilityServiceIds =
    activeServiceId
      ? categoryFilteredServiceIds.includes(
          activeServiceId,
        )
        ? [activeServiceId]
        : []
      : categoryFilteredServiceIds
  const effectiveRadiusKm =
    activeFilters.radiusKm === null
      ? operatingRadiusKm
      : Math.min(
          activeFilters.radiusKm,
          operatingRadiusKm,
        )
  const searchWhere: Prisma.RequestWhereInput =
    activeFilters.q
      ? {
          OR: [
            {
              city: {
                contains: activeFilters.q,
                mode: "insensitive",
              },
            },
            {
              postalCode: {
                contains: activeFilters.q,
                mode: "insensitive",
              },
            },
            {
              address: {
                contains: activeFilters.q,
                mode: "insensitive",
              },
            },
            {
              interventionSlug: {
                contains: activeFilters.q,
                mode: "insensitive",
              },
            },
            {
              requestCode: {
                contains: activeFilters.q,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}

  if (visibilityServiceIds.length === 0) {
    return {
      ok: true,
      hasSelectedServices:
        selectedServiceIds.size > 0,
      filters: filterOptions,
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
        ...searchWhere,
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
        requiredServices: {
          some: {
            serviceId: {
              in: visibilityServiceIds,
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
      .flatMap((request) => {
        if (
          !hasValidNumber(
            request.latitude,
          ) ||
          !hasValidNumber(
            request.longitude,
          )
        ) {
          return []
        }

        const distanceKm =
          getDistanceKm({
            fromLatitude:
              companyLatitude,
            fromLongitude:
              companyLongitude,
            toLatitude:
              request.latitude,
            toLongitude:
              request.longitude,
          })

        return distanceKm <=
          effectiveRadiusKm
          ? [
              {
                request,
                distanceKm,
              },
            ]
          : []
      })
      .map(
        ({
          request,
          distanceKm,
        }) => ({
          ...mapRequest({
            request,
            categoryServiceIds:
              categoryServiceIdSet,
            selectedServiceIds,
          }),
          distanceKm,
        }),
      )
      .sort((left, right) =>
        sortVisibleRequests(
          left,
          right,
          activeFilters.sort,
        ),
      )
      .map(({ distanceKm, ...request }) => {
        void distanceKm

        return request
      })

  return {
    ok: true,
    hasSelectedServices:
      selectedServiceIds.size > 0,
    filters: filterOptions,
    requests: visibleRequests,
  }
}

export async function listAvailableRequestsForCompany({
  companyId,
  filters,
}: {
  companyId: string
  filters?: RequestDashboardFilters | undefined
}): Promise<ListAvailableRequestsForCompanyResult> {
  return loadAvailableRequestsForCompany({
    companyId,
    filters,
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
    filters: result.filters,
    request:
      result.requests[0] ?? null,
  }
}
