import Link from "next/link"
import {
  BriefcaseBusiness,
  MapPin,
} from "lucide-react"

import {
  Card,
  PageShell,
} from "@esigenta/ui"

import {
  getCompanyRequestsListPage,
  type RequestDashboardFilters,
  type RequestDashboardSort,
} from "@esigenta/domain"

import { requireAreaImpresaAccess } from "../../../../auth/server"

import {
  areaLog,
  areaTimestamp,
  isAreaMonitoringEnabled,
} from "../../../../platform/monitoring/area-monitoring"

import {
  createPerfTrace,
} from "../../../monitoring/area-impresa-perf-trace"

import {
  CompanyRequestList,
} from "../components/company-request-list"
import {
  RequestFiltersPanel,
} from "../components/request-filters-panel"

import {
  toggleSavedRequestAction,
} from "../actions/toggle-saved-request-action"

export type RequestsPageProps = {
  searchParams: Promise<{
    q?: string | string[]
    radiusKm?: string | string[]
    categoryId?: string | string[]
    serviceId?: string | string[]
    sort?: string | string[]
    page?: string | string[]
  }>
}

const allowedRadiusKm = new Set([
  "10",
  "20",
  "30",
  "50",
  "75",
  "100",
])

const allowedSort =
  new Set<RequestDashboardSort>([
    "recommended",
    "newest",
    "nearest",
  ])

function readSearchParam(
  value?: string | string[],
) {
  return Array.isArray(value)
    ? value[0]
    : value
}

function normalizeRequestDashboardFilters(
  searchParams: Awaited<
    RequestsPageProps["searchParams"]
  >,
): RequestDashboardFilters {
  const q =
    readSearchParam(searchParams.q)
      ?.trim()
      .slice(0, 80)

  const radiusValue =
    readSearchParam(searchParams.radiusKm)

  const sortValue =
    readSearchParam(searchParams.sort)

  const categoryId =
    readSearchParam(searchParams.categoryId)
      ?.trim()

  const serviceId =
    readSearchParam(searchParams.serviceId)
      ?.trim()

  return {
    q: q || null,
    radiusKm:
      radiusValue &&
      allowedRadiusKm.has(radiusValue)
        ? Number(radiusValue)
        : null,
    categoryId: categoryId || null,
    serviceId: serviceId || null,
    sort:
      sortValue &&
      allowedSort.has(
        sortValue as RequestDashboardSort,
      )
        ? (sortValue as RequestDashboardSort)
        : "recommended",
  }
}

type ActiveFilters = {
  q: string | null
  radiusKm: number | null
  categoryId: string | null
  serviceId: string | null
  sort: RequestDashboardSort
}

function hasActiveFilters(
  active: ActiveFilters,
) {
  return Boolean(
    active.q ||
      active.radiusKm ||
      active.categoryId ||
      active.serviceId ||
      active.sort !== "recommended",
  )
}

function formatCompanyLocation(
  company:
    | {
        city: string | null
        province: string | null
        postalCode: string | null
      }
    | null
    | undefined,
) {
  if (!company) {
    return "Sede operativa non configurata"
  }

  const cityWithProvince = [
    company.city,
    company.province,
  ]
    .filter(Boolean)
    .join(" ")

  if (cityWithProvince && company.postalCode) {
    return `${cityWithProvince} - ${company.postalCode}`
  }

  return (
    cityWithProvince ||
    company.postalCode ||
    "Sede operativa non configurata"
  )
}

function formatProfileSummary({
  categoryCount,
  radiusKm,
}: {
  categoryCount: number
  radiusKm: number | null | undefined
}) {
  const categories =
    categoryCount === 1
      ? "1 categoria"
      : `${categoryCount} categorie`

  if (!radiusKm) {
    return `${categories} operative`
  }

  return `${categories} operative, raggio ${radiusKm} km`
}

export async function RequestsPage({
  searchParams,
}: RequestsPageProps) {
  const monitored = isAreaMonitoringEnabled()
  const pageStart = areaTimestamp()

  if (monitored) {
    areaLog("area.model.requestsList.start", {})
  }

  const [
    resolvedSearchParams,
    actor,
  ] = await Promise.all([
    searchParams,
    requireAreaImpresaAccess(),
  ])

  const filters =
    normalizeRequestDashboardFilters(
      resolvedSearchParams,
    )

  const pageParam = Number(
    readSearchParam(resolvedSearchParams.page) ?? "1",
  )
  const currentPage =
    Number.isFinite(pageParam) && pageParam >= 1
      ? Math.floor(pageParam)
      : 1

  const requestTrace = monitored
    ? createPerfTrace({ scope: "request-list" })
    : null

  const requestQueryStart = areaTimestamp()
  const result = await getCompanyRequestsListPage(
    actor,
    filters,
    currentPage,
    requestTrace !== null ? requestTrace.add : undefined,
  )
  const requestQueryMs = Math.round(areaTimestamp() - requestQueryStart)

  if (monitored) {
    requestTrace?.finish({
      result: result.ok ? "ok" : result.code,
      dbFetchedCount: result.ok ? result.dbFetchedCount : 0,
      returnedCount: result.ok ? result.returnedCount : 0,
    })
    areaLog("area.model.requestsList.end", {
      durationMs: Math.round(areaTimestamp() - pageStart),
      hasSearch: Boolean(filters.q),
      hasCategory: Boolean(filters.categoryId),
      hasRadius: Boolean(filters.radiusKm),
      sort: filters.sort ?? "recommended",
      page: result.ok ? result.page : currentPage,
      pageSize: result.ok ? result.pageSize : 50,
      dbFetchedCount: result.ok ? result.dbFetchedCount : 0,
      returnedCount: result.ok ? result.returnedCount : 0,
      hasNextPage: result.ok ? result.hasNextPage : false,
      boundingBoxApplied: result.ok ? result.boundingBoxApplied : false,
      result: result.ok ? "ok" : result.code,
      requestQueryMs,
    })
  }

  function buildPageHref(targetPage: number) {
    const params = new URLSearchParams()
    const active = result.filters.active
    if (active.q) params.set("q", active.q)
    if (active.radiusKm !== null)
      params.set("radiusKm", String(active.radiusKm))
    if (active.categoryId)
      params.set("categoryId", active.categoryId)
    if (active.serviceId)
      params.set("serviceId", active.serviceId)
    if (active.sort !== "recommended")
      params.set("sort", active.sort)
    if (targetPage > 1) params.set("page", String(targetPage))
    const qs = params.toString()
    return qs ? `/area-impresa/richieste?${qs}` : "/area-impresa/richieste"
  }

  const activeFilters =
    result.filters.active

  const activeFilterCount =
    hasActiveFilters(activeFilters)
  const requestCount =
    result.ok ? result.requests.length : 0
  const companyProfile =
    result.company ?? null
  const unavailableTitle =
    !result.ok &&
    result.code ===
      "company_not_approved_for_marketplace"
      ? "Profilo impresa in revisione"
      : !result.ok &&
          result.code === "missing_category"
        ? "Categoria impresa non configurata"
        : "Sede operativa incompleta"
  const unavailableHref =
    !result.ok &&
    result.code ===
      "company_not_approved_for_marketplace"
      ? null
      : !result.ok &&
          result.code === "missing_category"
        ? "/area-impresa/configura-servizi"
        : "/area-impresa/profilo"
  const unavailableCta =
    !result.ok &&
    result.code === "missing_category"
      ? "Vai alla configurazione servizi"
      : "Completa sede e raggio operativo"

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <section className="space-y-7">
        <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
              Richieste disponibili
            </h1>

            <p className="mt-2 text-base text-text-primary">
              richieste compatibili con il tuo profilo
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-2">
                <MapPin
                  className="size-4"
                  aria-hidden="true"
                />
                {formatCompanyLocation(
                  companyProfile,
                )}
              </span>

              {result.ok ? (
                <span className="inline-flex items-center gap-2">
                  <BriefcaseBusiness
                    className="size-4"
                    aria-hidden="true"
                  />
                  {formatProfileSummary({
                    categoryCount:
                      companyProfile
                        ?.operationalCategoryCount ?? 0,
                    radiusKm:
                      companyProfile?.operatingRadiusKm,
                  })}
                </span>
              ) : null}
            </div>
          </div>

          <div className="text-sm font-medium text-text-secondary">
            {requestCount} richieste
          </div>
        </div>

        {result.ok ? (
          <RequestFiltersPanel
            active={activeFilters}
            categories={result.filters.categories}
            services={result.filters.services}
            activeCategoryIsConfigured={
              result.filters.activeCategoryIsConfigured
            }
            activeFilterCount={activeFilterCount}
          />
        ) : null}

        {!result.ok ? (
          <Card className="p-8">
            <p className="text-base font-semibold text-text-primary">
              {unavailableTitle}
            </p>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              {result.message}
            </p>

            {unavailableHref ? (
              <Link
                href={unavailableHref}
                className="mt-5 inline-flex text-sm font-medium text-brand-primary"
                prefetch={false}
              >
                {unavailableCta}
              </Link>
            ) : null}
          </Card>
        ) : (
          <>
            {!result.hasSelectedServices ? (
              <Card className="bg-surface-secondary p-5">
                <p className="text-sm font-semibold text-text-primary">
                  Seleziona i servizi che offri per vedere prima le richieste
                  più adatte.
                </p>

                <Link
                  href="/area-impresa/configura-servizi"
                  className="mt-3 inline-flex text-sm font-medium text-brand-primary"
                  prefetch={false}
                >
                  Configura servizi
                </Link>
              </Card>
            ) : null}

            <CompanyRequestList
              requests={result.requests}
              mode="available"
              emptyMessage="Nessuna richiesta disponibile al momento."
              savedAction={toggleSavedRequestAction}
            />

            {(result.page > 1 || result.hasNextPage) ? (
              <div className="flex items-center justify-between gap-4 pt-2">
                <div>
                  {result.page > 1 ? (
                    <Link
                      href={buildPageHref(result.page - 1)}
                      className="text-sm font-medium text-brand-primary"
                      prefetch={false}
                    >
                      &larr; Pagina precedente
                    </Link>
                  ) : null}
                </div>
                <div>
                  {result.hasNextPage ? (
                    <Link
                      href={buildPageHref(result.page + 1)}
                      className="text-sm font-medium text-brand-primary"
                      prefetch={false}
                    >
                      Pagina successiva &rarr;
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </PageShell>
  )
}
