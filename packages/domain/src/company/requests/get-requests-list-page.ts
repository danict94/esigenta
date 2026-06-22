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
  isCompanyMarketplaceReady,
} from "@esigenta/auth"

import {
  prisma,
} from "@esigenta/database"

import {
  getDefaultVisibilityInterventionIds,
  loadInterventionsForCategoryIds,
  resolveCompanyRequestEligibility,
  type EligibilityInterventionRow,
} from "./company-request-eligibility"

// ─── Public types ────────────────────────────────────────────────────────────

export type CompanyRequestMatchLevel =
  | "selected_intervention"
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
  interventionId?: string | null
  sort?: RequestDashboardSort
}

export type RequestDashboardFilterOptions = {
  categories: Array<{
    id: string
    name: string
    isConfigured: boolean
  }>
  interventions: Array<{
    id: string
    name: string
    isConfigured: boolean
  }>
  activeCategoryIsConfigured: boolean | null
  active: {
    q: string | null
    radiusKm: number | null
    categoryId: string | null
    interventionId: string | null
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
      hasSelectedInterventions: boolean
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
  const interventionId =
    typeof raw?.interventionId === "string" ? raw.interventionId.trim() : ""

  return {
    q: q || null,
    radiusKm,
    categoryId: categoryId || null,
    interventionId: interventionId || null,
    sort,
  }
}

// ─── Geo helpers ──────────────────────────────────────────────────────────────

function hasFiniteNumber(v: number | null): v is number {
  return typeof v === "number" && Number.isFinite(v)
}

// ─── Keyword search escaping ───────────────────────────────────────────────────

// Escapes ILIKE special characters so a literal "%"/"_" typed by the company
// is matched literally instead of being treated as a SQL wildcard.
function escapeLikeTerm(term: string): string {
  return term.replace(/[\\%_]/g, (char) => `\\${char}`)
}

// ─── DB query builders ─────────────────────────────────────────────────────────
//
// Marketplace visibility/ranking is Intervention-only (Phase 14): no
// Service, CategoryService, CompanyService, or RequestRequiredService
// anywhere in this file. Category still has no direct relation to
// Intervention — the only path is Category.projectGroupIds (a plain
// string[] column, no join) -> Intervention.projectGroupId.

function buildCompanyQuery(companyId: string) {
  return prisma.company.findUnique({
    where: { id: companyId },
    select: {
      name: true,
      operatingRadiusKm: true,
      geoLocation: {
        select: {
          city: true,
          postalCode: true,
          province: true,
          latitude: true,
          longitude: true,
        },
      },
      // selectedInterventionIds/operationalInterventionIds now come from
      // resolveCompanyRequestEligibility (company-request-eligibility.ts)
      // — the same canonical computation request-detail uses, see
      // docs/domain-invariants/03_REQUEST_VISIBILITY.md.
    },
  })
}

function buildTaxonomyCategoriesQuery() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })
}

// ─── DB-side filtered + sorted + paginated requests query ─────────────────────
//
// Single SQL statement: status filter, intervention visibility filter
// (direct Request.interventionId comparison — no junction table), radius
// filter via the GiST-indexed earthdistance extension (cube/earthdistance —
// see docs/geo-refoundation/01_DESIGN.md §5/§6; not a JS-side haversine scan
// and not a manually-computed bounding box — earth_box() is itself the
// index-accelerated pre-filter, earth_distance() the exact circle check),
// keyword search (request fields, structuredData, intervention name/slug,
// category name via Category.projectGroupIds -> Intervention.projectGroupId),
// match level (selected_intervention / category / explore) computed once as
// a numeric rank, sort and pagination fully in SQL.

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
  visibilityInterventionIds,
  selectedInterventionIds,
  operationalInterventionIds,
  companyLat,
  companyLng,
  effectiveRadiusKm,
  q,
  sort,
  page,
}: {
  companyId: string
  visibilityInterventionIds: string[]
  selectedInterventionIds: string[]
  operationalInterventionIds: string[]
  companyLat: number
  companyLng: number
  effectiveRadiusKm: number
  q: string | null
  sort: RequestDashboardSort
  page: number
}): Promise<{ rows: RequestListRow[]; hasNextPage: boolean }> {
  const offset = (page - 1) * PAGE_SIZE
  const likeTerm = q ? `%${escapeLikeTerm(q)}%` : null
  const orderByClause = buildOrderByClause(sort)
  const radiusMeters = effectiveRadiusKm * 1000

  const rows = await prisma.$queryRaw<RequestListRow[]>`
    WITH scoped AS (
      SELECT
        r."id"               AS id,
        r."requestCode"      AS request_code,
        r."status"           AS status,
        r."interventionSlug" AS intervention_slug,
        rg."city"             AS city,
        rg."formattedAddress" AS address,
        rg."postalCode"       AS postal_code,
        rg."latitude"         AS latitude,
        rg."longitude"        AS longitude,
        r."structuredData"   AS structured_data,
        r."creditCost"       AS credit_cost,
        r."maxUnlocks"       AS max_unlocks,
        r."unlockCount"      AS unlock_count,
        r."createdAt"        AS created_at,
        (csr."companyId" IS NOT NULL) AS is_saved,
        CASE
          WHEN r."interventionId" = ANY(${selectedInterventionIds}::text[]) THEN 0
          WHEN r."interventionId" = ANY(${operationalInterventionIds}::text[]) THEN 1
          ELSE 2
        END AS match_rank,
        (
          earth_distance(
            ll_to_earth(${companyLat}, ${companyLng}),
            ll_to_earth(rg."latitude", rg."longitude")
          ) / 1000
        ) AS distance_km
      FROM "Request" r
      JOIN "GeoLocation" rg ON rg."id" = r."geoLocationId"
      LEFT JOIN "CompanySavedRequest" csr
        ON csr."requestId" = r."id" AND csr."companyId" = ${companyId}
      WHERE r."status" IN ('APPROVED', 'PUBLISHED')
        AND r."archivedAt" IS NULL
        AND r."deletedAt" IS NULL
        AND earth_box(
          ll_to_earth(${companyLat}, ${companyLng}),
          ${radiusMeters}
        ) @> ll_to_earth(rg."latitude", rg."longitude")
        AND r."interventionId" = ANY(${visibilityInterventionIds}::text[])
        AND (
          ${likeTerm}::text IS NULL
          OR r."requestCode" ILIKE ${likeTerm}
          OR r."interventionSlug" ILIKE ${likeTerm}
          OR rg."city" ILIKE ${likeTerm}
          OR rg."postalCode" ILIKE ${likeTerm}
          OR rg."formattedAddress" ILIKE ${likeTerm}
          OR r."structuredData"::text ILIKE ${likeTerm}
          OR EXISTS (
            SELECT 1 FROM "Intervention" iv
            WHERE iv."id" = r."interventionId"
              AND iv."name" ILIKE ${likeTerm}
          )
          OR EXISTS (
            SELECT 1 FROM "Intervention" iv
            JOIN "Category" c ON iv."projectGroupId" = ANY(c."projectGroupIds")
            WHERE iv."id" = r."interventionId"
              AND c."name" ILIKE ${likeTerm}
          )
        )
    )
    SELECT
      id, request_code, status, intervention_slug, city, address, postal_code,
      latitude, longitude, structured_data, credit_cost, max_unlocks,
      unlock_count, created_at, is_saved,
      CASE match_rank
        WHEN 0 THEN 'selected_intervention'
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
    interventions: [],
    activeCategoryIsConfigured: null,
    active: normalizedFilters,
  }

  // ── Batch 1 (truly parallel): company + operational interventions + taxonomy filter data ─
  //
  // All independent, run in parallel:
  // - company: profile, location, selected interventions (CompanyIntervention)
  // - operationalInterventions: Category.projectGroupIds -> Intervention for
  //   this company's CompanyCategory rows (the "broad net" set)
  // - taxonomyCategories: all marketplace categories for filter dropdown
  // - filterCategoryInterventions: interventions for the URL-selected
  //   category (null if none selected)

  const [
    company,
    eligibility,
    allTaxonomyCategories,
  ] = await Promise.all([
    measureAsync("batch1-company", recordPerf, () =>
      buildCompanyQuery(companyId),
    ),
    measureAsync("batch1-eligibility", recordPerf, () =>
      resolveCompanyRequestEligibility(companyId),
    ),
    measureAsync("batch1-taxonomy-categories", recordPerf, () =>
      buildTaxonomyCategoriesQuery(),
    ),
  ])

  if (!company) {
    return {
      ok: false,
      company: null,
      code: "missing_category",
      message: "Configura le categorie operative del profilo impresa.",
      filters: emptyFilterOptions,
    }
  }

  const companyProfileBase = {
    name: company.name,
    city: company.geoLocation?.city ?? null,
    postalCode: company.geoLocation?.postalCode ?? null,
    province: company.geoLocation?.province ?? null,
    operatingRadiusKm: company.operatingRadiusKm,
    operationalCategoryCount: 0,
  }

  if (!isCompanyMarketplaceReady(actor.company)) {
    return {
      ok: false,
      company: companyProfileBase,
      code: "company_not_approved_for_marketplace",
      message:
        "Il profilo impresa deve essere approvato prima di usare il marketplace.",
      filters: emptyFilterOptions,
    }
  }

  const companyLatCandidate = company.geoLocation?.latitude ?? null
  const companyLngCandidate = company.geoLocation?.longitude ?? null

  if (
    !hasFiniteNumber(companyLatCandidate) ||
    !hasFiniteNumber(companyLngCandidate) ||
    !Number.isFinite(company.operatingRadiusKm)
  ) {
    return {
      ok: false,
      company: companyProfileBase,
      code: "missing_location",
      message: "Completa sede operativa e raggio d'azione dell'impresa.",
      filters: emptyFilterOptions,
    }
  }

  const companyLat = companyLatCandidate
  const companyLng = companyLngCandidate
  const operatingRadiusKm = company.operatingRadiusKm

  // Canonical eligibility (docs/domain-invariants/03_REQUEST_VISIBILITY.md)
  // — the same computation request-detail uses. No onboardingCategorySlug
  // fallback (docs/domain-invariants/01_CONFIGURATION_CONSOLIDATION.md): an
  // unconfigured company correctly falls through to the missing_category
  // empty state below, the same one matching/dispatch implicitly enforces.
  const {
    resolvedCategoryIds,
    selectedInterventionIds,
    operationalInterventionIds,
    isConfigured,
  } = eligibility

  const companyProfile: RequestDashboardCompanyProfile = {
    ...companyProfileBase,
    operationalCategoryCount: resolvedCategoryIds.length,
  }

  if (!isConfigured) {
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

  // Interventions for the active category — only fetched when a category
  // filter is active, scoped to exactly that category's ProjectGroups.
  const { interventions: filterCategoryInterventions } = activeCategoryId
    ? await measureAsync(
        "filter-category-interventions",
        recordPerf,
        () => loadInterventionsForCategoryIds([activeCategoryId]),
      )
    : { interventions: [] as EligibilityInterventionRow[] }

  const activeCategoryInterventionSet = activeCategoryId
    ? new Set(filterCategoryInterventions.map((iv) => iv.id))
    : operationalInterventionIds

  const activeInterventionId =
    normalizedFilters.interventionId &&
    activeCategoryId &&
    activeCategoryInterventionSet.has(normalizedFilters.interventionId)
      ? normalizedFilters.interventionId
      : null

  const activeFilters = {
    ...normalizedFilters,
    categoryId: activeCategoryId,
    interventionId: activeInterventionId,
  }

  // Default (no filter) visibility is the UNION of directly-selected and
  // category-derived interventions, not just the category-derived set.
  // In the legacy model these were always the same set by construction
  // (CompanyService was validated against the selected categories'
  // CategoryService rows at write time). The frozen model deliberately
  // dropped that cross-validation (Category must never gate Intervention
  // selection, confirmed in Phase 9) — a company can select an
  // intervention outside its own categories' ProjectGroups, and dispatch
  // (CompanyIntervention-only) already notifies them for it. The
  // dashboard must not be stricter than dispatch, or a company stops
  // seeing requests it's actually being notified about.
  const visibilityInterventionIds: string[] = activeInterventionId
    ? [activeInterventionId]
    : activeCategoryId
      ? Array.from(activeCategoryInterventionSet)
      : Array.from(getDefaultVisibilityInterventionIds(eligibility))

  if (visibilityInterventionIds.length === 0) {
    return {
      ok: true,
      company: companyProfile,
      hasSelectedInterventions: selectedInterventionIds.size > 0,
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

  // ── Build filter options ──────────────────────────────────────────────────

  const filterCategories = allTaxonomyCategories.map((c) => ({
    id: c.id,
    name: c.name,
    isConfigured: resolvedCategoryIdSet.has(c.id),
  }))

  const filterInterventions = activeCategoryId
    ? filterCategoryInterventions
        .map((iv) => ({
          id: iv.id,
          name: iv.name,
          isConfigured: selectedInterventionIds.has(iv.id),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "it"))
    : []

  const filterOptions: RequestDashboardFilterOptions = {
    categories: filterCategories,
    interventions: filterInterventions,
    activeCategoryIsConfigured: activeCategoryId
      ? resolvedCategoryIdSet.has(activeCategoryId)
      : null,
    active: activeFilters,
  }

  // ── DB-side filtered, sorted, paginated requests ────────────────────────────

  const { rows, hasNextPage } = await measureAsync(
    "phase-c-requests-query",
    recordPerf,
    () =>
      queryPaginatedRequests({
        companyId,
        visibilityInterventionIds,
        selectedInterventionIds: Array.from(selectedInterventionIds),
        operationalInterventionIds: Array.from(operationalInterventionIds),
        companyLat,
        companyLng,
        effectiveRadiusKm,
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
    hasSelectedInterventions: selectedInterventionIds.size > 0,
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
