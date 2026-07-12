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
  deriveCompanyRequestAccess,
  getCompanyRequestsListPage,
  listCompanyRequestPreviews,
  type ListCompanyRequestPreviewsResult,
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
  CompanyRequestPreviewList,
} from "../components/company-request-preview-list"
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
    interventionId?: string | string[]
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

  const interventionId =
    readSearchParam(searchParams.interventionId)
      ?.trim()

  return {
    q: q || null,
    radiusKm:
      radiusValue &&
      allowedRadiusKm.has(radiusValue)
        ? Number(radiusValue)
        : null,
    categoryId: categoryId || null,
    interventionId: interventionId || null,
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
  interventionId: string | null
  sort: RequestDashboardSort
}

function hasActiveFilters(
  active: ActiveFilters,
) {
  return Boolean(
    active.q ||
      active.radiusKm ||
      active.categoryId ||
      active.interventionId ||
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

function PendingReviewRequestsPreview({
  result,
}: {
  result: ListCompanyRequestPreviewsResult
}) {
  const company = result.ok
    ? result.company
    : null
  const companyLocation = [
    company?.city,
    company?.province,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <section className="space-y-7">
        <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-eg-terra md:text-4xl">
              Richieste disponibili
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-eg-ardesia md:text-base">
              Scopri in anteprima le opportunità compatibili con i servizi
              della tua impresa.
            </p>

            {company ? (
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-eg-ardesia">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4" aria-hidden="true" />
                  {companyLocation || "Sede operativa configurata"}
                </span>
                {company.operatingRadiusKm ? (
                  <span className="inline-flex items-center gap-2">
                    <BriefcaseBusiness
                      className="size-4"
                      aria-hidden="true"
                    />
                    Raggio {company.operatingRadiusKm} km
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="text-sm font-medium text-eg-ardesia">
            {result.ok ? result.requests.length : 0} anteprime
          </div>
        </div>

        <Card className="border-eg-cotto bg-eg-calce-2 p-5">
          <p className="text-sm font-semibold text-eg-terra">
            Il tuo profilo è in revisione
          </p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-eg-ardesia">
            Intanto puoi vedere alcune richieste compatibili con la tua
            impresa. Dettagli, contatti e azioni saranno disponibili dopo
            l’approvazione.
          </p>
        </Card>

        {result.ok ? (
          <>
            <CompanyRequestPreviewList requests={result.requests} />
            {result.hasMore ? (
              <p className="text-center text-sm text-eg-ardesia">
                Altre richieste compatibili saranno disponibili dopo
                l’approvazione del profilo.
              </p>
            ) : null}
          </>
        ) : (
          <Card className="p-8">
            <p className="text-base font-semibold text-eg-terra">
              Preview non disponibile
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-eg-ardesia">
              {result.message}
            </p>
            {result.code === "missing_category" ? (
              <Link
                href="/area-impresa/configura-servizi"
                className="mt-5 inline-flex text-sm font-medium text-eg-cotto"
                prefetch={false}
              >
                Configura servizi
              </Link>
            ) : result.code === "missing_location" ? (
              <Link
                href="/area-impresa/profilo"
                className="mt-5 inline-flex text-sm font-medium text-eg-cotto"
                prefetch={false}
              >
                Completa il profilo
              </Link>
            ) : null}
          </Card>
        )}
      </section>
    </PageShell>
  )
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

  const requestAccess =
    deriveCompanyRequestAccess(actor.company)

  if (requestAccess.mode === "preview_locked") {
    const previewResult =
      await listCompanyRequestPreviews(actor)

    if (monitored) {
      areaLog("area.model.requestsList.end", {
        durationMs: Math.round(
          areaTimestamp() - pageStart,
        ),
        result: previewResult.ok
          ? "preview-locked"
          : previewResult.code,
        dbFetchedCount: previewResult.ok
          ? previewResult.requests.length
          : 0,
        returnedCount: previewResult.ok
          ? previewResult.requests.length
          : 0,
        previewLocked: true,
      })
    }

    return (
      <PendingReviewRequestsPreview
        result={previewResult}
      />
    )
  }

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
    if (active.interventionId)
      params.set("interventionId", active.interventionId)
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
      ? actor.company.status === "SUSPENDED"
        ? "Profilo impresa sospeso"
        : actor.company.status === "BLOCKED"
          ? "Profilo impresa bloccato"
          : "Marketplace non disponibile"
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
            <h1 className="text-3xl font-semibold tracking-tight text-eg-terra md:text-4xl">
              Richieste disponibili
            </h1>

            <p className="mt-2 text-base text-eg-terra">
              richieste compatibili con il tuo profilo
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-eg-ardesia">
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

          <div className="text-sm font-medium text-eg-ardesia">
            {requestCount} richieste
          </div>
        </div>

        {result.ok ? (
          <RequestFiltersPanel
            active={activeFilters}
            categories={result.filters.categories}
            interventions={result.filters.interventions}
            activeCategoryIsConfigured={
              result.filters.activeCategoryIsConfigured
            }
            activeFilterCount={activeFilterCount}
          />
        ) : null}

        {!result.ok ? (
          <Card className="p-8">
            <p className="text-base font-semibold text-eg-terra">
              {unavailableTitle}
            </p>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-eg-ardesia">
              {result.message}
            </p>

            {unavailableHref ? (
              <Link
                href={unavailableHref}
                className="mt-5 inline-flex text-sm font-medium text-eg-cotto"
                prefetch={false}
              >
                {unavailableCta}
              </Link>
            ) : null}
          </Card>
        ) : (
          <>
            {!result.hasSelectedInterventions ? (
              <Card className="bg-eg-calce-2 p-5">
                <p className="text-sm font-semibold text-eg-terra">
                  Seleziona gli interventi che offri per vedere prima le
                  richieste più adatte.
                </p>

                <Link
                  href="/area-impresa/configura-servizi"
                  className="mt-3 inline-flex text-sm font-medium text-eg-cotto"
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
                      className="text-sm font-medium text-eg-cotto"
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
                      className="text-sm font-medium text-eg-cotto"
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
