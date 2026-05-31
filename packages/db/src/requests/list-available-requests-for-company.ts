import type {
  Prisma,
  RequestStatus,
} from "@prisma/client"

import {
  prisma,
} from "../prisma/client"

import {
  getDistanceKm,
} from "./distance"

export type CompanyRequestMatchLevel =
  | "selected_service"
  | "category"
  | "explore"

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
    isConfigured: boolean
  }>
  services: Array<{
    id: string
    name: string
    categoryId: string
    isConfigured: boolean
  }>
  activeCategoryIsConfigured: boolean | null
  active: {
    q: string | null
    radiusKm: number | null
    categoryId: string | null
    serviceId: string | null
    sort: RequestDashboardSort
  }
}

export type RequestDashboardCompanyProfile = {
  name: string
  city: string | null
  postalCode: string | null
  province: string | null
  operatingRadiusKm: number | null
  operationalCategoryCount: number
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
  matchLevel: CompanyRequestMatchLevel
}

export type ListAvailableRequestsForCompanyResult =
  | {
      ok: true
      company: RequestDashboardCompanyProfile
      hasSelectedServices: boolean
      filters: RequestDashboardFilterOptions
      requests: AvailableCompanyRequest[]
    }
  | {
      ok: false
      company?: RequestDashboardCompanyProfile | null
      code:
        | "missing_category"
        | "missing_location"
      message: string
      filters: RequestDashboardFilterOptions
    }

export type GetAvailableRequestForCompanyResult =
  | {
      ok: true
      company: RequestDashboardCompanyProfile
      hasSelectedServices: boolean
      filters: RequestDashboardFilterOptions
      request: AvailableCompanyRequest | null
    }
  | {
      ok: false
      company?: RequestDashboardCompanyProfile | null
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
    | "conversationId"
    | "customerContact"
    | "requestUnlockRefund"
    | "isSaved"
  > & {
    customerName: string | null
    customerEmail: string | null
    customerPhone: string | null
    requiredServices: Array<{
      serviceId: string
      service: {
        name: string
        slug: string
      }
    }>
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

const allowedRadiusFilters = new Set([
  10,
  20,
  30,
  50,
  75,
  100,
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
  activeCategoryIsConfigured = null,
  active,
}: {
  categories?: RequestDashboardFilterOptions["categories"]
  services?: RequestDashboardFilterOptions["services"]
  activeCategoryIsConfigured?: boolean | null
  active: RequestDashboardFilterOptions["active"]
}): RequestDashboardFilterOptions {
  return {
    categories,
    services,
    activeCategoryIsConfigured,
    active,
  }
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
  } else {
    matchLevel = "explore"
  }

  const {
    requiredServices,
    unlocks,
    savedByCompanies,
    customerName,
    customerEmail,
    customerPhone,
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

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("it")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
}

function collectStructuredSearchValues(
  value: Prisma.JsonValue | null,
): string[] {
  if (value === null) {
    return []
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return [String(value)]
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) =>
      collectStructuredSearchValues(item),
    )
  }

  if (typeof value === "object") {
    return Object.values(value).flatMap((item) =>
      item === undefined
        ? []
        : collectStructuredSearchValues(item),
    )
  }

  return []
}

function matchesKeyword({
  categoryNamesByServiceId,
  query,
  request,
}: {
  categoryNamesByServiceId: Map<string, string[]>
  query: string | null
  request: RequestWithServices
}) {
  if (!query) {
    return true
  }

  const normalizedQuery =
    normalizeSearchText(query)
  const serviceTexts =
    request.requiredServices.flatMap(
      (requiredService) => [
        requiredService.service.name,
        requiredService.service.slug,
        ...(categoryNamesByServiceId.get(
          requiredService.serviceId,
        ) ?? []),
      ],
    )
  const searchableText = [
    request.requestCode,
    request.interventionSlug,
    request.city,
    request.postalCode,
    request.address,
    ...serviceTexts,
    ...collectStructuredSearchValues(
      request.structuredData,
    ),
  ]
    .filter(
      (value): value is string =>
        typeof value === "string" &&
        value.trim().length > 0,
    )
    .map(normalizeSearchText)
    .join(" ")

  return searchableText.includes(
    normalizedQuery,
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
        name: true,
        city: true,
        postalCode: true,
        province: true,
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
      company: null,
      code: "missing_category",
      message:
        "Configura le categorie operative del profilo impresa.",
      filters: emptyFilterOptions,
    }
  }

  const companyProfile: RequestDashboardCompanyProfile = {
    name: company.name,
    city: company.city,
    postalCode: company.postalCode,
    province: company.province,
    operatingRadiusKm:
      company.operatingRadiusKm,
    operationalCategoryCount: 0,
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
      company: companyProfile,
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
  const operationalCategoryIdSet =
    new Set(operationalCategoryIds)
  const selectedServiceIds =
    new Set(
      company.services.map(
        (service) => service.serviceId,
      ),
    )

  companyProfile.operationalCategoryCount =
    operationalCategoryIds.length

  if (operationalCategoryIds.length === 0) {
    return {
      ok: false,
      company: companyProfile,
      code: "missing_category",
      message:
        "Configura le categorie operative del profilo impresa.",
      filters: emptyFilterOptions,
    }
  }

  const allCategories =
    await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    })
  const allCategoryIdSet =
    new Set(
      allCategories.map(
        (category) => category.id,
      ),
    )

  const categoryServices =
    await prisma.categoryService.findMany({
      select: {
        categoryId: true,
        serviceId: true,
        category: {
          select: {
            name: true,
          },
        },
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
  const operationalCategoryServices =
    categoryServices.filter(
      (categoryService) =>
        operationalCategoryIdSet.has(
          categoryService.categoryId,
        ),
    )
  const operationalCategoryServiceIds =
    Array.from(
      new Set(
        operationalCategoryServices.map(
          (service) =>
            service.serviceId,
        ),
      ),
    )
  const operationalCategoryServiceIdSet =
    new Set(operationalCategoryServiceIds)
  const categoryNamesByServiceId =
    categoryServices.reduce(
      (map, categoryService) => {
        const current =
          map.get(
            categoryService.serviceId,
          ) ?? []

        current.push(
          categoryService.category.name,
        )
        map.set(
          categoryService.serviceId,
          current,
        )

        return map
      },
      new Map<string, string[]>(),
    )
  const filterServices =
    categoryServices
      .map((categoryService) => ({
        id: categoryService.service.id,
        name: categoryService.service.name,
        categoryId:
          categoryService.categoryId,
        isConfigured:
          selectedServiceIds.has(
            categoryService.serviceId,
          ),
      }))
      .sort((left, right) =>
        left.name.localeCompare(
          right.name,
          "it",
        ),
      )
  const activeCategoryId =
    normalizedFilters.categoryId &&
    allCategoryIdSet.has(
      normalizedFilters.categoryId,
    )
      ? normalizedFilters.categoryId
      : null
  const activeCategoryIsConfigured =
    activeCategoryId
      ? operationalCategoryIdSet.has(
          activeCategoryId,
        )
      : null
  const activeCategoryServiceIdSet =
    new Set(
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
        : categoryServiceIds,
    )
  const activeServiceId =
    normalizedFilters.serviceId &&
    activeCategoryId &&
    activeCategoryServiceIdSet.has(
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
        allCategories.map((category) => ({
          ...category,
          isConfigured:
            operationalCategoryIdSet.has(
              category.id,
            ),
        })),
      services: filterServices,
      activeCategoryIsConfigured,
      active: activeFilters,
    })

  if (
    activeCategoryId === null &&
    operationalCategoryServiceIds.length === 0
  ) {
    return {
      ok: true,
      company: companyProfile,
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
      : activeCategoryId
        ? categoryFilteredServiceIds
        : operationalCategoryServiceIds
  const effectiveRadiusKm =
    activeFilters.radiusKm === null
      ? operatingRadiusKm
      : Math.min(
          activeFilters.radiusKm,
          operatingRadiusKm,
        )
  if (visibilityServiceIds.length === 0) {
    return {
      ok: true,
      company: companyProfile,
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
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        unlocks: {
          where: {
            companyId,
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
            service: {
              select: {
                name: true,
                slug: true,
              },
            },
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

        if (
          !matchesKeyword({
            categoryNamesByServiceId,
            query: activeFilters.q,
            request,
          })
        ) {
          return []
        }

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
              operationalCategoryServiceIdSet,
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
    company: companyProfile,
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
    company:
      result.company,
    hasSelectedServices:
      result.hasSelectedServices,
    filters: result.filters,
    request:
      result.requests[0] ?? null,
  }
}
