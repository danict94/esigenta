import Link from "next/link"

import {
  Card,
  PageShell,
} from "@fixpro/ui"

import {
  listAvailableRequestsForCompany,
  type RequestDashboardFilters,
  type RequestDashboardSort,
} from "@fixpro/db"

import { requireDefaultCompanyMembership } from "../../../../auth/server"

import {
  RequestFiltersPanel,
} from "../_components/request-filters-panel"
import { RequestListCard } from "../_components/request-list-card"
import {
  formatFreshness,
  formatInterventionLabel,
  formatLocationLabel,
  getDescription,
  getStructuredData,
  getSurfaceArea,
} from "../_components/request-card-format"

import {
  toggleSavedRequestAction,
} from "./actions"

export const dynamic = "force-dynamic"

type RichiestePageProps = {
  searchParams: Promise<{
    q?: string | string[]
    radiusKm?: string | string[]
    categoryId?: string | string[]
    serviceId?: string | string[]
    sort?: string | string[]
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
    RichiestePageProps["searchParams"]
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

function getMatchLabel(
  matchLevel: "selected_service" | "category",
) {
  return matchLevel === "selected_service"
    ? "Molto compatibile"
    : "Nella tua categoria"
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

export default async function RichiestePage({
  searchParams,
}: RichiestePageProps) {
  const [
    resolvedSearchParams,
    membership,
  ] = await Promise.all([
    searchParams,
    requireDefaultCompanyMembership(),
  ])

  const filters =
    normalizeRequestDashboardFilters(
      resolvedSearchParams,
    )

  const result =
    await listAvailableRequestsForCompany({
      companyId: membership.companyId,
      filters,
    })

  const activeFilters =
    result.filters.active

  const activeFilterCount =
    hasActiveFilters(activeFilters)

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <section className="space-y-7">
        <div className="flex flex-col gap-2 pt-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary">
              Dashboard impresa
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
              Nuove richieste disponibili
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              {result.ok ? result.requests.length : 0} richieste compatibili
            </p>
          </div>
        </div>

        {result.ok ? (
          <RequestFiltersPanel
            active={activeFilters}
            categories={result.filters.categories}
            services={result.filters.services}
            activeFilterCount={activeFilterCount}
          />
        ) : null}

        {!result.ok ? (
          <Card className="p-8">
            <p className="text-base font-semibold text-text-primary">
              {result.code === "missing_category"
                ? "Categoria impresa non configurata"
                : "Sede operativa incompleta"}
            </p>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              {result.message}
            </p>

            <Link
              href={
                result.code === "missing_category"
                  ? "/area-impresa/configura-servizi"
                  : "/area-impresa/profilo"
              }
              className="mt-5 inline-flex text-sm font-medium text-brand-primary"
            >
              {result.code === "missing_category"
                ? "Vai alla configurazione servizi"
                : "Completa sede e raggio operativo"}
            </Link>
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
                >
                  Configura servizi
                </Link>
              </Card>
            ) : null}

            {result.requests.length === 0 ? (
              <Card className="p-8">
                <p className="text-sm text-text-secondary">
                  Nessuna richiesta disponibile al momento.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {result.requests.map((request) => {
                  const structuredData =
                    getStructuredData(
                      request.structuredData,
                    )

                  const description =
                    getDescription(structuredData)

                  const surfaceArea =
                    getSurfaceArea(structuredData)

                  return (
                    <RequestListCard
                      key={request.id}
                      id={request.id}
                      intervention={formatInterventionLabel(
                        request.interventionSlug,
                      )}
                      location={formatLocationLabel({
                        city: request.city,
                        postalCode: request.postalCode,
                        address: request.address,
                      })}
                      createdAt={formatFreshness(request.createdAt)}
                      matchLabel={getMatchLabel(request.matchLevel)}
                      description={description}
                      surfaceArea={surfaceArea}
                      creditCost={request.creditCost}
                      maxUnlocks={request.maxUnlocks}
                      unlockCount={request.unlockCount}
                      isSaved={request.isSaved}
                      savedAction={toggleSavedRequestAction}
                    />
                  )
                })}
              </div>
            )}
          </>
        )}
      </section>
    </PageShell>
  )
}