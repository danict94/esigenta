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

import { getCompanyMarketplaceCapabilitySnapshot } from "./company-marketplace-capability-snapshot"
import {
  loadDashboardCategoryFilterInterventions,
  type DashboardCategoryFilterIntervention,
} from "./load-dashboard-category-filter-interventions"

// ─── Public types ────────────────────────────────────────────────────────────

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
  activeInterventionCount: number
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
  matchLevel: "selected_intervention"
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
  match_level: "selected_intervention"
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
// Intervention. Category is identity/filter metadata and never broadens
// ordinary marketplace visibility beyond CompanyIntervention.

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
      // Matching capability comes from the canonical company snapshot.
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
// see docs/archive-legacy/refoundation/geo-refoundation/01_DESIGN.md §5/§6; not a JS-side haversine scan
// and not a manually-computed bounding box — earth_box() is itself the
// index-accelerated pre-filter, earth_distance() the exact circle check),
// keyword search (request fields, structuredData, intervention name/slug,
// category name via DB grouping; this is search metadata only and never an
// eligibility or visibility decision),
// Every returned row is an explicit selected-intervention match.

function buildOrderByClause(sort: RequestDashboardSort) {
  if (sort === "newest") {
    return Prisma.sql`ORDER BY created_at DESC`
  }
  if (sort === "nearest") {
    return Prisma.sql`ORDER BY distance_km ASC, created_at DESC`
  }
  return Prisma.sql`ORDER BY created_at DESC`
}

async function queryPaginatedRequests({
  companyId,
  visibilityInterventionIds,
  companyLat,
  companyLng,
  effectiveRadiusKm,
  q,
  sort,
  page,
}: {
  companyId: string
  visibilityInterventionIds: string[]
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
        (
          earth_distance(
            ll_to_earth(${companyLat}, ${companyLng}),
            ll_to_earth(rg."latitude", rg."longitude")
          ) / 1000
        ) AS distance_km
      FROM "Request" r
      JOIN "GeoLocation" rg ON rg."id" = r."geoLocationId"
      JOIN "Intervention" iv ON iv."id" = r."interventionId"
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
      'selected_intervention'::text AS match_level
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

  // ── Batch 1 (truly parallel): company profile + capability snapshot + filter data ─
  //
  // All independent, run in parallel:
  // - company: profile and location
  // - capabilitySnapshot: CompanyCategory identity and explicitly selected
  //   CompanyIntervention capabilities
  // - taxonomyCategories: all marketplace categories for filter dropdown
  // - filterCategoryInterventions: interventions for the URL-selected
  //   category (null if none selected)

  const [
    company,
    capabilitySnapshot,
    allTaxonomyCategories,
  ] = await Promise.all([
    measureAsync("batch1-company", recordPerf, () =>
      buildCompanyQuery(companyId),
    ),
    measureAsync("batch1-eligibility", recordPerf, () =>
      getCompanyMarketplaceCapabilitySnapshot(companyId),
    ),
    measureAsync("batch1-taxonomy-categories", recordPerf, () =>
      buildTaxonomyCategoriesQuery(),
    ),
  ])

  if (!company || !capabilitySnapshot) {
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
    activeInterventionCount:
      capabilitySnapshot.selectedInterventionIds.length,
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
  // — the same computation request-detail uses. No onboarding snapshot
  // fallback (docs/domain-invariants/01_CONFIGURATION_CONSOLIDATION.md): an
  // unconfigured company correctly falls through to the missing_category
  // empty state below, the same one matching/dispatch implicitly enforces.
  const resolvedCategoryIds = capabilitySnapshot.enabledCategoryIds
  const selectedInterventionIds = new Set(
    capabilitySnapshot.selectedInterventionIds,
  )
  const isConfigured = capabilitySnapshot.isConfigured

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

  // Effective canonical membership for the active category — fetched only
  // when that explicit dashboard filter is active.
  const { interventions: filterCategoryInterventions } = activeCategoryId
    ? await measureAsync(
        "filter-category-interventions",
        recordPerf,
        () => loadDashboardCategoryFilterInterventions([activeCategoryId]),
      )
    : { interventions: [] as DashboardCategoryFilterIntervention[] }

  const activeCategoryInterventionSet = activeCategoryId
    ? new Set(filterCategoryInterventions.map((iv) => iv.id))
    : new Set<string>()

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

  // CompanyIntervention is the only ordinary marketplace capability.
  // Category can narrow the dashboard filter, but never broadens visibility.
  const visibilityInterventionIds: string[] = activeInterventionId
    ? selectedInterventionIds.has(activeInterventionId)
      ? [activeInterventionId]
      : []
    : activeCategoryId
      ? Array.from(selectedInterventionIds).filter((interventionId) =>
          activeCategoryInterventionSet.has(interventionId),
        )
      : Array.from(selectedInterventionIds)

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
