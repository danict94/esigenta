import type {
  Prisma,
  RequestStatus,
} from "@prisma/client"

import type {
  CompanyActor,
} from "@esigenta/auth"

import {
  prisma,
} from "@esigenta/database"

import {
  getDistanceKm,
} from "@esigenta/shared"

// ─── Public types ────────────────────────────────────────────────────────────

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
  isSaved: boolean
  createdAt: Date
  matchLevel: CompanyRequestMatchLevel
}

export type CompanyRequestsListPageResult =
  | {
      ok: true
      company: RequestDashboardCompanyProfile
      hasSelectedServices: boolean
      filters: RequestDashboardFilterOptions
      requests: AvailableCompanyRequest[]
      page: number
      pageSize: number
      hasNextPage: boolean
      dbFetchedCount: number
      returnedCount: number
      boundingBoxApplied: boolean
    }
  | {
      ok: false
      company?: RequestDashboardCompanyProfile | null
      code:
        | "company_not_approved_for_marketplace"
        | "missing_category"
        | "missing_location"
      message: string
      filters: RequestDashboardFilterOptions
    }

// ─── Internal types ───────────────────────────────────────────────────────────

type RequestRow = {
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
  savedByCompanies: Array<{ createdAt: Date }>
  requiredServices: Array<{
    serviceId: string
    service: { name: string; slug: string }
  }>
}

type CategoryServiceRow = {
  categoryId: string
  serviceId: string
  category: { id: string; name: string }
  service: { id: string; name: string; slug: string }
}

type PerfRecorder = (operation: string, durationMs: number) => void

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50

const visibleRequestStatuses: RequestStatus[] = ["APPROVED", "PUBLISHED"]

const allowedRadiusFilters = new Set([10, 20, 30, 50, 75, 100])
const allowedSortFilters = new Set<RequestDashboardSort>([
  "recommended",
  "newest",
  "nearest",
])

// ─── Perf helpers ─────────────────────────────────────────────────────────────

async function measureAsync<T>(
  operation: string,
  recordPerf: PerfRecorder | undefined,
  task: () => Promise<T>,
): Promise<T> {
  if (!recordPerf) return task()
  const start = performance.now()
  try {
    return await task()
  } finally {
    recordPerf(operation, Math.round(performance.now() - start))
  }
}

function measureSync<T>(
  operation: string,
  recordPerf: PerfRecorder | undefined,
  task: () => T,
): T {
  if (!recordPerf) return task()
  const start = performance.now()
  try {
    return task()
  } finally {
    recordPerf(operation, Math.round(performance.now() - start))
  }
}

// ─── Filter normalization ─────────────────────────────────────────────────────

function normalizeFilters(
  raw?: RequestDashboardFilters,
): RequestDashboardFilterOptions["active"] {
  const q =
    typeof raw?.q === "string" ? raw.q.trim().slice(0, 80) : ""
  const radiusKm =
    typeof raw?.radiusKm === "number" && allowedRadiusFilters.has(raw.radiusKm)
      ? raw.radiusKm
      : null
  const sort =
    raw?.sort && allowedSortFilters.has(raw.sort) ? raw.sort : "recommended"
  const categoryId =
    typeof raw?.categoryId === "string" ? raw.categoryId.trim() : ""
  const serviceId =
    typeof raw?.serviceId === "string" ? raw.serviceId.trim() : ""

  return {
    q: q || null,
    radiusKm,
    categoryId: categoryId || null,
    serviceId: serviceId || null,
    sort,
  }
}

// ─── Geo helpers ──────────────────────────────────────────────────────────────

function hasFiniteNumber(v: number | null): v is number {
  return typeof v === "number" && Number.isFinite(v)
}

function computeBoundingBox(latDeg: number, lngDeg: number, radiusKm: number) {
  const latDelta = radiusKm / 111.32
  const lngDelta = radiusKm / (111.32 * Math.cos((latDeg * Math.PI) / 180))
  return {
    minLat: latDeg - latDelta,
    maxLat: latDeg + latDelta,
    minLng: lngDeg - lngDelta,
    maxLng: lngDeg + lngDelta,
  }
}

// ─── Keyword search ───────────────────────────────────────────────────────────

function normalizeText(v: string) {
  return v
    .toLocaleLowerCase("it")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
}

function collectJsonValues(v: Prisma.JsonValue | null): string[] {
  if (v === null) return []
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    return [String(v)]
  if (Array.isArray(v)) return v.flatMap(collectJsonValues)
  if (typeof v === "object")
    return Object.values(v).flatMap((item) =>
      item === undefined ? [] : collectJsonValues(item),
    )
  return []
}

function matchesKeyword(
  categoryNamesByServiceId: Map<string, string[]>,
  query: string | null,
  request: RequestRow,
): boolean {
  if (!query) return true
  const norm = normalizeText(query)
  const serviceTexts = request.requiredServices.flatMap((rs) => [
    rs.service.name,
    rs.service.slug,
    ...(categoryNamesByServiceId.get(rs.serviceId) ?? []),
  ])
  const searchable = [
    request.requestCode,
    request.interventionSlug,
    request.city,
    request.postalCode,
    request.address,
    ...serviceTexts,
    ...collectJsonValues(request.structuredData),
  ]
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map(normalizeText)
    .join(" ")

  return searchable.includes(norm)
}

// ─── Mapping and sorting ──────────────────────────────────────────────────────

function computeMatchLevel(
  request: RequestRow,
  operationalServiceIds: Set<string>,
  selectedServiceIds: Set<string>,
): CompanyRequestMatchLevel {
  if (
    selectedServiceIds.size > 0 &&
    request.requiredServices.some((rs) => selectedServiceIds.has(rs.serviceId))
  ) {
    return "selected_service"
  }
  if (request.requiredServices.some((rs) => operationalServiceIds.has(rs.serviceId))) {
    return "category"
  }
  return "explore"
}

function sortRequests(
  left: AvailableCompanyRequest & { distanceKm: number },
  right: AvailableCompanyRequest & { distanceKm: number },
  sort: RequestDashboardSort,
): number {
  if (sort === "newest") {
    return right.createdAt.getTime() - left.createdAt.getTime()
  }
  if (sort === "nearest") {
    const d = left.distanceKm - right.distanceKm
    if (d !== 0) return d
  }
  if (left.matchLevel !== right.matchLevel) {
    return left.matchLevel === "selected_service" ? -1 : 1
  }
  return right.createdAt.getTime() - left.createdAt.getTime()
}

// ─── DB query builders ────────────────────────────────────────────────────────

function buildCompanyQuery(companyId: string) {
  return prisma.company.findUnique({
    where: { id: companyId },
    select: {
      onboardingCategorySlug: true,
      name: true,
      city: true,
      postalCode: true,
      province: true,
      latitude: true,
      longitude: true,
      operatingRadiusKm: true,
      // Only selected service IDs — no category join
      services: { select: { serviceId: true } },
    },
  })
}

// Returns category services for this company's categories via relation subquery.
// Independent of company query — runs in parallel with buildCompanyQuery.
function buildCompanyCategoryServicesQuery(companyId: string) {
  return prisma.categoryService.findMany({
    where: {
      category: {
        companies: {
          some: { companyId },
        },
      },
    },
    select: {
      categoryId: true,
      serviceId: true,
      category: { select: { id: true, name: true } },
      service: { select: { id: true, name: true, slug: true } },
    },
  })
}

function buildFallbackCategoryQuery(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    select: { id: true, name: true },
  })
}

function buildFallbackCategoryServicesQuery(categoryId: string) {
  return prisma.categoryService.findMany({
    where: { categoryId },
    select: {
      categoryId: true,
      serviceId: true,
      category: { select: { id: true, name: true } },
      service: { select: { id: true, name: true, slug: true } },
    },
  })
}

function buildRequestsQuery(
  serviceIds: string[],
  companyId: string,
  bbox: ReturnType<typeof computeBoundingBox>,
) {
  return prisma.request.findMany({
    where: {
      status: { in: visibleRequestStatuses },
      latitude: { gte: bbox.minLat, lte: bbox.maxLat },
      longitude: { gte: bbox.minLng, lte: bbox.maxLng },
      requiredServices: { some: { serviceId: { in: serviceIds } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
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
      savedByCompanies: {
        where: { companyId },
        select: { createdAt: true },
        take: 1,
      },
      requiredServices: {
        select: {
          serviceId: true,
          service: { select: { name: true, slug: true } },
        },
      },
    },
  })
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export async function getCompanyRequestsListPage(
  actor: CompanyActor,
  filters?: RequestDashboardFilters,
  page?: number,
  recordPerf?: PerfRecorder,
): Promise<CompanyRequestsListPageResult> {
  const companyId = actor.company.id
  const normalizedPage = Math.max(
    1,
    Number.isFinite(page) ? Math.floor(page ?? 1) : 1,
  )
  const normalizedFilters = normalizeFilters(filters)

  const emptyFilterOptions: RequestDashboardFilterOptions = {
    categories: [],
    services: [],
    activeCategoryIsConfigured: null,
    active: normalizedFilters,
  }

  // ── Batch 1 (truly parallel): lean company + company-scoped category services ─
  //
  // buildCompanyCategoryServicesQuery uses a relation subquery that resolves
  // the company's categories internally — no dependency on company data.
  // On Neon cold, both share one cold-start cost. On warm, both are ~50ms.
  // After Batch 1, we have everything needed to launch Phase C immediately.

  const batch1Start = performance.now()
  const [company, categoryServices] = await Promise.all([
    measureAsync("batch1-company", recordPerf, () =>
      buildCompanyQuery(companyId),
    ),
    measureAsync("batch1-category-services", recordPerf, () =>
      buildCompanyCategoryServicesQuery(companyId),
    ),
  ])
  recordPerf?.("batch1-total", Math.round(performance.now() - batch1Start))

  if (!company) {
    return {
      ok: false,
      company: null,
      code: "missing_category",
      message: "Configura le categorie operative del profilo impresa.",
      filters: emptyFilterOptions,
    }
  }

  if (actor.company.status !== "APPROVED") {
    return {
      ok: false,
      company: {
        name: company.name,
        city: company.city,
        postalCode: company.postalCode,
        province: company.province,
        operatingRadiusKm: company.operatingRadiusKm,
        operationalCategoryCount: 0,
      },
      code: "company_not_approved_for_marketplace",
      message:
        "Il profilo impresa deve essere approvato prima di usare il marketplace.",
      filters: emptyFilterOptions,
    }
  }

  if (
    !hasFiniteNumber(company.latitude) ||
    !hasFiniteNumber(company.longitude) ||
    !Number.isFinite(company.operatingRadiusKm)
  ) {
    return {
      ok: false,
      company: {
        name: company.name,
        city: company.city,
        postalCode: company.postalCode,
        province: company.province,
        operatingRadiusKm: company.operatingRadiusKm,
        operationalCategoryCount: 0,
      },
      code: "missing_location",
      message: "Completa sede operativa e raggio d'azione dell'impresa.",
      filters: emptyFilterOptions,
    }
  }

  const companyLat = company.latitude
  const companyLng = company.longitude
  const operatingRadiusKm = company.operatingRadiusKm
  const selectedServiceIds = new Set(company.services.map((s) => s.serviceId))

  // ── Phase B: fallback category ────────────────────────────────────────────
  //
  // If company has no configured categories (categoryServices empty from Batch 1),
  // fall back to onboardingCategorySlug. This path is rare (onboarding state).

  let resolvedCategoryServices: CategoryServiceRow[] = categoryServices

  if (resolvedCategoryServices.length === 0 && company.onboardingCategorySlug) {
    const fallbackCategory = await measureAsync(
      "phase-b-fallback-category",
      recordPerf,
      () => buildFallbackCategoryQuery(company.onboardingCategorySlug!),
    )
    if (fallbackCategory) {
      resolvedCategoryServices = await measureAsync(
        "phase-b-fallback-services",
        recordPerf,
        () => buildFallbackCategoryServicesQuery(fallbackCategory.id),
      )
    }
  } else {
    recordPerf?.("phase-b-fallback-category", 0)
  }

  const operationalServiceIds = new Set(
    resolvedCategoryServices.map((cs) => cs.serviceId),
  )
  const resolvedCategoryIds = Array.from(
    new Set(resolvedCategoryServices.map((cs) => cs.categoryId)),
  )

  const companyProfile: RequestDashboardCompanyProfile = {
    name: company.name,
    city: company.city,
    postalCode: company.postalCode,
    province: company.province,
    operatingRadiusKm: company.operatingRadiusKm,
    operationalCategoryCount: resolvedCategoryIds.length,
  }

  if (resolvedCategoryIds.length === 0 || operationalServiceIds.size === 0) {
    return {
      ok: false,
      company: companyProfile,
      code: "missing_category",
      message: "Configura le categorie operative del profilo impresa.",
      filters: emptyFilterOptions,
    }
  }

  const resolvedCategoryIdSet = new Set(resolvedCategoryIds)

  // All filter validation uses Batch 1 data — no extra queries needed.
  const activeCategoryId =
    normalizedFilters.categoryId &&
    resolvedCategoryIdSet.has(normalizedFilters.categoryId)
      ? normalizedFilters.categoryId
      : null

  const activeCategoryServiceSet = activeCategoryId
    ? new Set(
        resolvedCategoryServices
          .filter((cs) => cs.categoryId === activeCategoryId)
          .map((cs) => cs.serviceId),
      )
    : operationalServiceIds

  const activeServiceId =
    normalizedFilters.serviceId &&
    activeCategoryId &&
    activeCategoryServiceSet.has(normalizedFilters.serviceId)
      ? normalizedFilters.serviceId
      : null

  const activeFilters = {
    ...normalizedFilters,
    categoryId: activeCategoryId,
    serviceId: activeServiceId,
  }

  const visibilityServiceIds: string[] = activeServiceId
    ? [activeServiceId]
    : activeCategoryId
      ? Array.from(activeCategoryServiceSet)
      : Array.from(operationalServiceIds)

  if (visibilityServiceIds.length === 0) {
    return {
      ok: true,
      company: companyProfile,
      hasSelectedServices: selectedServiceIds.size > 0,
      filters: emptyFilterOptions,
      requests: [],
      page: normalizedPage,
      pageSize: PAGE_SIZE,
      hasNextPage: false,
      dbFetchedCount: 0,
      returnedCount: 0,
      boundingBoxApplied: false,
    }
  }

  const effectiveRadiusKm =
    normalizedFilters.radiusKm === null
      ? operatingRadiusKm
      : Math.min(normalizedFilters.radiusKm, operatingRadiusKm)

  const bbox = computeBoundingBox(companyLat, companyLng, effectiveRadiusKm)

  // ── Phase C: geo-filtered requests ────────────────────────────────────────
  //
  // Uses a warm connection from the Batch 1 pool — no cold-start overhead.
  // Service IDs come from Batch 1 data (no dependency chain).

  const requests = await measureAsync("phase-c-requests-findmany", recordPerf, () =>
    buildRequestsQuery(visibilityServiceIds, companyId, bbox),
  )

  // ── Build filter options from Batch 1 results ─────────────────────────────

  const categoryNamesByServiceId = resolvedCategoryServices.reduce(
    (map, cs) => {
      const current = map.get(cs.serviceId) ?? []
      current.push(cs.category.name)
      map.set(cs.serviceId, current)
      return map
    },
    new Map<string, string[]>(),
  )

  const filterCategories = resolvedCategoryServices
    .reduce(
      (acc, cs) => {
        if (!acc.some((c) => c.id === cs.category.id)) {
          acc.push({ id: cs.category.id, name: cs.category.name, isConfigured: true })
        }
        return acc
      },
      [] as Array<{ id: string; name: string; isConfigured: boolean }>,
    )
    .sort((a, b) => a.name.localeCompare(b.name, "it"))

  const filterServices = resolvedCategoryServices
    .map((cs) => ({
      id: cs.service.id,
      name: cs.service.name,
      categoryId: cs.categoryId,
      isConfigured: selectedServiceIds.has(cs.serviceId),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "it"))

  const filterOptions: RequestDashboardFilterOptions = {
    categories: filterCategories,
    services: filterServices,
    activeCategoryIsConfigured: activeCategoryId ? true : null,
    active: activeFilters,
  }

  // ── Mapping, geo-filter, keyword search, sort, paginate ───────────────────

  const dbFetchedCount = requests.length

  const allVisible = measureSync("mapping-js", recordPerf, () =>
    requests
      .flatMap((request) => {
        if (
          !hasFiniteNumber(request.latitude) ||
          !hasFiniteNumber(request.longitude)
        ) {
          return []
        }
        const distanceKm = getDistanceKm({
          fromLatitude: companyLat,
          fromLongitude: companyLng,
          toLatitude: request.latitude,
          toLongitude: request.longitude,
        })
        if (distanceKm > effectiveRadiusKm) return []

        if (
          !matchesKeyword(categoryNamesByServiceId, activeFilters.q, request)
        ) {
          return []
        }

        if (
          activeServiceId &&
          !request.requiredServices.some(
            (rs) => rs.serviceId === activeServiceId,
          )
        ) {
          return []
        }

        const matchLevel = computeMatchLevel(
          request,
          operationalServiceIds,
          selectedServiceIds,
        )

        const { savedByCompanies, requiredServices: _, ...fields } = request
        void _

        return [
          {
            ...fields,
            isSaved: savedByCompanies.length > 0,
            matchLevel,
            distanceKm,
          },
        ]
      })
      .sort((l, r) => sortRequests(l, r, activeFilters.sort))
      .map(({ distanceKm, ...req }) => {
        void distanceKm
        return req
      }),
  )

  const pageStart = (normalizedPage - 1) * PAGE_SIZE
  const paginatedRequests = allVisible.slice(pageStart, pageStart + PAGE_SIZE)

  return {
    ok: true,
    company: companyProfile,
    hasSelectedServices: selectedServiceIds.size > 0,
    filters: filterOptions,
    requests: paginatedRequests,
    page: normalizedPage,
    pageSize: PAGE_SIZE,
    hasNextPage: allVisible.length > pageStart + PAGE_SIZE,
    dbFetchedCount,
    returnedCount: paginatedRequests.length,
    boundingBoxApplied: true,
  }
}
