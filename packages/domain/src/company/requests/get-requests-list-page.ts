import {
  Prisma,
} from "@prisma/client"
import type {
  RequestStatus,
} from "@prisma/client"

import type {
  CompanyActor,
} from "@esigenta/auth"

import {
  prisma,
} from "@esigenta/database"

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

type CategoryServiceRow = {
  categoryId: string
  serviceId: string
  category: { id: string; name: string }
  service: { id: string; name: string; slug: string }
}

type RequestListRow = {
  id: string
  request_code: string | null
  status: RequestStatus
  intervention_slug: string | null
  city: string | null
  address: string | null
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  structured_data: Prisma.JsonValue | null
  credit_cost: number | null
  max_unlocks: number | null
  unlock_count: number
  created_at: Date
  is_saved: boolean
  match_level: CompanyRequestMatchLevel
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

// ─── Keyword search escaping ───────────────────────────────────────────────────

// Escapes ILIKE special characters so a literal "%"/"_" typed by the company
// is matched literally instead of being treated as a SQL wildcard.
function escapeLikeTerm(term: string): string {
  return term.replace(/[\\%_]/g, (char) => `\\${char}`)
}

// ─── DB query builders (Batch 1 + Phase B — unchanged) ────────────────────────

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

function buildTaxonomyCategoriesQuery() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })
}

// ─── DB-side filtered + sorted + paginated requests query (P0) ────────────────
//
// Replaces the previous approach (findMany take:100, then JS-side precise
// distance filter, keyword search, sort and slice). All of that now happens
// in a single SQL statement:
// - status + bounding box filter, EXISTS service visibility filter (DB, uses
//   existing indexes on status/createdAt and [latitude, longitude])
// - precise haversine distance (computed in SQL, same formula as
//   @esigenta/shared getDistanceKm, filtered in the outer WHERE)
// - keyword search across request fields, structuredData (as text), service
//   name/slug and category name (DB, ILIKE with escaped wildcards)
// - match level (selected_service / category / explore) computed once as a
//   numeric rank, reused for both sorting and the returned label
// - sort (recommended / newest / nearest) and pagination (LIMIT pageSize+1 /
//   OFFSET) fully in SQL — no fixed upstream cap, no JS slice.

function buildOrderByClause(sort: RequestDashboardSort) {
  if (sort === "newest") {
    return Prisma.sql`ORDER BY created_at DESC`
  }
  if (sort === "nearest") {
    return Prisma.sql`ORDER BY distance_km ASC, match_rank ASC, created_at DESC`
  }
  return Prisma.sql`ORDER BY match_rank ASC, created_at DESC`
}

async function queryPaginatedRequests({
  companyId,
  visibilityServiceIds,
  selectedServiceIds,
  operationalServiceIds,
  companyLat,
  companyLng,
  effectiveRadiusKm,
  bbox,
  q,
  sort,
  page,
}: {
  companyId: string
  visibilityServiceIds: string[]
  selectedServiceIds: string[]
  operationalServiceIds: string[]
  companyLat: number
  companyLng: number
  effectiveRadiusKm: number
  bbox: ReturnType<typeof computeBoundingBox>
  q: string | null
  sort: RequestDashboardSort
  page: number
}): Promise<{ rows: RequestListRow[]; hasNextPage: boolean }> {
  const offset = (page - 1) * PAGE_SIZE
  const likeTerm = q ? `%${escapeLikeTerm(q)}%` : null
  const orderByClause = buildOrderByClause(sort)

  const rows = await prisma.$queryRaw<RequestListRow[]>`
    WITH scoped AS (
      SELECT
        r."id"               AS id,
        r."requestCode"      AS request_code,
        r."status"           AS status,
        r."interventionSlug" AS intervention_slug,
        r."city"             AS city,
        r."address"          AS address,
        r."postalCode"       AS postal_code,
        r."latitude"         AS latitude,
        r."longitude"        AS longitude,
        r."structuredData"   AS structured_data,
        r."creditCost"       AS credit_cost,
        r."maxUnlocks"       AS max_unlocks,
        r."unlockCount"      AS unlock_count,
        r."createdAt"        AS created_at,
        (csr."companyId" IS NOT NULL) AS is_saved,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM "RequestRequiredService" mrs
            WHERE mrs."requestId" = r."id"
              AND mrs."serviceId" = ANY(${selectedServiceIds}::text[])
          ) THEN 0
          WHEN EXISTS (
            SELECT 1 FROM "RequestRequiredService" mrs
            WHERE mrs."requestId" = r."id"
              AND mrs."serviceId" = ANY(${operationalServiceIds}::text[])
          ) THEN 1
          ELSE 2
        END AS match_rank,
        (
          2 * 6371 * asin(sqrt(
            power(sin(radians(r."latitude" - ${companyLat}) / 2), 2) +
            cos(radians(${companyLat})) * cos(radians(r."latitude")) *
            power(sin(radians(r."longitude" - ${companyLng}) / 2), 2)
          ))
        ) AS distance_km
      FROM "Request" r
      LEFT JOIN "CompanySavedRequest" csr
        ON csr."requestId" = r."id" AND csr."companyId" = ${companyId}
      WHERE r."status" IN ('APPROVED', 'PUBLISHED')
        AND r."archivedAt" IS NULL
        AND r."deletedAt" IS NULL
        AND r."latitude" IS NOT NULL
        AND r."longitude" IS NOT NULL
        AND r."latitude" BETWEEN ${bbox.minLat} AND ${bbox.maxLat}
        AND r."longitude" BETWEEN ${bbox.minLng} AND ${bbox.maxLng}
        AND EXISTS (
          SELECT 1 FROM "RequestRequiredService" vrs
          WHERE vrs."requestId" = r."id"
            AND vrs."serviceId" = ANY(${visibilityServiceIds}::text[])
        )
        AND (
          ${likeTerm}::text IS NULL
          OR r."requestCode" ILIKE ${likeTerm}
          OR r."interventionSlug" ILIKE ${likeTerm}
          OR r."city" ILIKE ${likeTerm}
          OR r."postalCode" ILIKE ${likeTerm}
          OR r."address" ILIKE ${likeTerm}
          OR r."structuredData"::text ILIKE ${likeTerm}
          OR EXISTS (
            SELECT 1 FROM "RequestRequiredService" srs
            JOIN "Service" sv ON sv."id" = srs."serviceId"
            WHERE srs."requestId" = r."id"
              AND (sv."name" ILIKE ${likeTerm} OR sv."slug" ILIKE ${likeTerm})
          )
          OR EXISTS (
            SELECT 1 FROM "RequestRequiredService" crs
            JOIN "CategoryService" cs ON cs."serviceId" = crs."serviceId"
            JOIN "Category" c ON c."id" = cs."categoryId"
            WHERE crs."requestId" = r."id"
              AND c."name" ILIKE ${likeTerm}
          )
        )
    )
    SELECT
      id, request_code, status, intervention_slug, city, address, postal_code,
      latitude, longitude, structured_data, credit_cost, max_unlocks,
      unlock_count, created_at, is_saved,
      CASE match_rank
        WHEN 0 THEN 'selected_service'
        WHEN 1 THEN 'category'
        ELSE 'explore'
      END AS match_level
    FROM scoped
    WHERE distance_km <= ${effectiveRadiusKm}
    ${orderByClause}
    LIMIT ${PAGE_SIZE + 1}
    OFFSET ${offset}
  `

  const hasNextPage = rows.length > PAGE_SIZE

  return {
    rows: hasNextPage ? rows.slice(0, PAGE_SIZE) : rows,
    hasNextPage,
  }
}

function mapRowToAvailableRequest(row: RequestListRow): AvailableCompanyRequest {
  return {
    id: row.id,
    requestCode: row.request_code,
    status: row.status,
    interventionSlug: row.intervention_slug,
    city: row.city,
    address: row.address,
    postalCode: row.postal_code,
    latitude: row.latitude,
    longitude: row.longitude,
    structuredData: row.structured_data,
    creditCost: row.credit_cost !== null ? Number(row.credit_cost) : null,
    maxUnlocks: row.max_unlocks !== null ? Number(row.max_unlocks) : null,
    unlockCount: Number(row.unlock_count),
    isSaved: row.is_saved,
    createdAt: row.created_at,
    matchLevel: row.match_level,
  }
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

  // ── Batch 1 (truly parallel): company + category services + taxonomy filter data ─
  //
  // All four queries are independent and run in parallel:
  // - company: profile, location, selected services
  // - companyCategoryServices: resolves operational service IDs for request matching
  // - taxonomyCategories: all marketplace categories for filter dropdown (lean, stable)
  // - taxonomyCategoryServices: services for the URL-selected category (null if none selected)
  //
  // Same 2 round-trips as before. Taxonomy queries are lightweight (no joins beyond select).

  const batch1Start = performance.now()
  const [company, categoryServices, allTaxonomyCategories, categoryServicesForFilter] =
    await Promise.all([
      measureAsync("batch1-company", recordPerf, () =>
        buildCompanyQuery(companyId),
      ),
      measureAsync("batch1-category-services", recordPerf, () =>
        buildCompanyCategoryServicesQuery(companyId),
      ),
      measureAsync("batch1-taxonomy-categories", recordPerf, () =>
        buildTaxonomyCategoriesQuery(),
      ),
      normalizedFilters.categoryId
        ? measureAsync("batch1-taxonomy-category-services", recordPerf, () =>
            buildFallbackCategoryServicesQuery(normalizedFilters.categoryId!),
          )
        : (Promise.resolve(null) as Promise<CategoryServiceRow[] | null>),
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
  const allCategoryIdSet = new Set(allTaxonomyCategories.map((c) => c.id))

  // Category filter validated against ALL taxonomy categories (not just company ones).
  // Companies can filter by any category, including ones not yet in their profile.
  const activeCategoryId =
    normalizedFilters.categoryId &&
    allCategoryIdSet.has(normalizedFilters.categoryId)
      ? normalizedFilters.categoryId
      : null

  // Services for the active category come from the taxonomy fetch (parallel with Batch 1).
  // This covers both configured and unconfigured categories without extra queries.
  const activeCategoryServiceSet = activeCategoryId
    ? new Set((categoryServicesForFilter ?? []).map((cs) => cs.serviceId))
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

  // ── Build filter options ──────────────────────────────────────────────────
  //
  // filterCategories: ALL taxonomy categories (from Batch 1), marked isConfigured
  //   based on whether the company has that category in its profile.
  //   Already sorted by name from the query (orderBy: { name: "asc" }).
  //
  // filterServices: only services for the SELECTED category (from Batch 1 taxonomy fetch).
  //   Empty when no category is selected — services dropdown is disabled in that state.
  //   Sending all services upfront is wasteful; this sends exactly what the UI needs.

  const filterCategories = allTaxonomyCategories.map((c) => ({
    id: c.id,
    name: c.name,
    isConfigured: resolvedCategoryIdSet.has(c.id),
  }))

  const filterServices =
    activeCategoryId && categoryServicesForFilter
      ? categoryServicesForFilter
          .map((cs) => ({
            id: cs.service.id,
            name: cs.service.name,
            categoryId: cs.categoryId,
            isConfigured: selectedServiceIds.has(cs.serviceId),
          }))
          .sort((a, b) => a.name.localeCompare(b.name, "it"))
      : []

  const filterOptions: RequestDashboardFilterOptions = {
    categories: filterCategories,
    services: filterServices,
    activeCategoryIsConfigured: activeCategoryId
      ? resolvedCategoryIdSet.has(activeCategoryId)
      : null,
    active: activeFilters,
  }

  // ── Phase C: DB-side filtered, sorted, paginated requests (P0) ─────────────

  const { rows, hasNextPage } = await measureAsync(
    "phase-c-requests-query",
    recordPerf,
    () =>
      queryPaginatedRequests({
        companyId,
        visibilityServiceIds,
        selectedServiceIds: Array.from(selectedServiceIds),
        operationalServiceIds: Array.from(operationalServiceIds),
        companyLat,
        companyLng,
        effectiveRadiusKm,
        bbox,
        q: activeFilters.q,
        sort: activeFilters.sort,
        page: normalizedPage,
      }),
  )

  const paginatedRequests = measureSync("mapping-rows", recordPerf, () =>
    rows.map(mapRowToAvailableRequest),
  )

  return {
    ok: true,
    company: companyProfile,
    hasSelectedServices: selectedServiceIds.size > 0,
    filters: filterOptions,
    requests: paginatedRequests,
    page: normalizedPage,
    pageSize: PAGE_SIZE,
    hasNextPage,
    dbFetchedCount: paginatedRequests.length,
    returnedCount: paginatedRequests.length,
    boundingBoxApplied: true,
  }
}
