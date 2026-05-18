import Link from "next/link"

import {
  Badge,
  Button,
  Card,
  Input,
  PageShell,
} from "@fixpro/ui"

import {
  listAvailableRequestsForCompany,
  type RequestDashboardFilters,
  type RequestDashboardSort,
} from "@fixpro/db"

import { requireDefaultCompanyMembership } from "../../../../auth/server"

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
  "25",
  "50",
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
  const q = readSearchParam(
    searchParams.q,
  )
    ?.trim()
    .slice(0, 80)
  const radiusValue = readSearchParam(
    searchParams.radiusKm,
  )
  const sortValue = readSearchParam(
    searchParams.sort,
  )
  const categoryId = readSearchParam(
    searchParams.categoryId,
  )?.trim()
  const serviceId = readSearchParam(
    searchParams.serviceId,
  )?.trim()

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

function getMatchLabel(matchLevel: "selected_service" | "category") {
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

function hasActiveFilters(active: ActiveFilters) {
  return Boolean(
    active.q ||
      active.radiusKm ||
      active.categoryId ||
      active.serviceId ||
      active.sort !== "recommended",
  )
}

function buildFilterHref(
  active: ActiveFilters,
  updates: Partial<ActiveFilters>,
) {
  const next = {
    ...active,
    ...updates,
  }
  const params = new URLSearchParams()

  if (next.q) {
    params.set("q", next.q)
  }

  if (next.radiusKm) {
    params.set(
      "radiusKm",
      String(next.radiusKm),
    )
  }

  if (next.categoryId) {
    params.set(
      "categoryId",
      next.categoryId,
    )
  }

  if (next.serviceId) {
    params.set(
      "serviceId",
      next.serviceId,
    )
  }

  if (next.sort !== "recommended") {
    params.set("sort", next.sort)
  }

  const query = params.toString()

  return query
    ? `/area-impresa/richieste?${query}`
    : "/area-impresa/richieste"
}

function PreservedFilterInputs({
  active,
  except,
}: {
  active: ActiveFilters
  except: Array<keyof ActiveFilters>
}) {
  return (
    <>
      {active.q && !except.includes("q") ? (
        <Input
          type="hidden"
          name="q"
          defaultValue={active.q}
        />
      ) : null}

      {active.radiusKm &&
      !except.includes("radiusKm") ? (
        <Input
          type="hidden"
          name="radiusKm"
          defaultValue={active.radiusKm}
        />
      ) : null}

      {active.categoryId &&
      !except.includes("categoryId") ? (
        <Input
          type="hidden"
          name="categoryId"
          defaultValue={active.categoryId}
        />
      ) : null}

      {active.serviceId &&
      !except.includes("serviceId") ? (
        <Input
          type="hidden"
          name="serviceId"
          defaultValue={active.serviceId}
        />
      ) : null}

      {active.sort !== "recommended" &&
      !except.includes("sort") ? (
        <Input
          type="hidden"
          name="sort"
          defaultValue={active.sort}
        />
      ) : null}
    </>
  )
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: string
}) {
  return (
    <Link href={href} className="inline-flex">
      <Badge
        variant={active ? "success" : "neutral"}
        size="sm"
      >
        {children}
      </Badge>
    </Link>
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

  const result = await listAvailableRequestsForCompany({
    companyId: membership.companyId,
    filters,
  })
  const activeFilters =
    result.filters.active
  const activeFilterCount =
    hasActiveFilters(activeFilters)
  const serviceFilterOptions =
    activeFilters.categoryId
      ? result.filters.services.filter(
          (service) =>
            service.categoryId ===
            activeFilters.categoryId,
        )
      : result.filters.services

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <section className="space-y-7">
        <div className="flex items-center justify-between gap-4 pt-4">
          <div>
            <p className="text-sm font-medium text-text-secondary">
              Dashboard impresa
            </p>

            <h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
              Nuove richieste disponibili
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              {result.ok ? result.requests.length : 0} richieste
            </p>
          </div>

          {activeFilterCount ? (
            <Link
              href="/area-impresa/richieste"
              className="text-sm font-medium text-brand-primary"
            >
              Reset filtri
            </Link>
          ) : null}
        </div>

        {result.ok ? (
          <Card className="space-y-5 p-5">
            <form
              action="/area-impresa/richieste"
              method="get"
              className="flex flex-col gap-3 md:flex-row"
            >
              <PreservedFilterInputs
                active={activeFilters}
                except={["q"]}
              />

              <div className="relative flex-1">
                <span
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-brand-primary"
                  aria-hidden="true"
                >
                  ⌕
                </span>

                <Input
                  type="search"
                  name="q"
                  defaultValue={
                    activeFilters.q ?? ""
                  }
                  placeholder="Cerca per parola chiave, posizione, materiale..."
                  className="h-12 pl-14 pr-5"
                />
              </div>

              <Button type="submit">
                Cerca
              </Button>
            </form>

            {activeFilterCount ? (
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Filtri attivi
              </p>
            ) : null}

            <div className="grid gap-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-text-primary">
                  Raggio
                </p>

                <div className="flex flex-wrap gap-2">
                  <FilterLink
                    href={buildFilterHref(
                      activeFilters,
                      {
                        radiusKm: null,
                      },
                    )}
                    active={
                      activeFilters.radiusKm ===
                      null
                    }
                  >
                    Raggio profilo
                  </FilterLink>

                  {[10, 25, 50].map(
                    (radiusKm) => (
                      <FilterLink
                        key={radiusKm}
                        href={buildFilterHref(
                          activeFilters,
                          {
                            radiusKm,
                          },
                        )}
                        active={
                          activeFilters.radiusKm ===
                          radiusKm
                        }
                      >
                        {`${radiusKm} km`}
                      </FilterLink>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-text-primary">
                  Categorie
                </p>

                <div className="flex flex-wrap gap-2">
                  <FilterLink
                    href={buildFilterHref(
                      activeFilters,
                      {
                        categoryId: null,
                        serviceId: null,
                      },
                    )}
                    active={
                      activeFilters.categoryId ===
                      null
                    }
                  >
                    Tutte
                  </FilterLink>

                  {result.filters.categories.map(
                    (category) => (
                      <FilterLink
                        key={category.id}
                        href={buildFilterHref(
                          activeFilters,
                          {
                            categoryId:
                              category.id,
                            serviceId: null,
                          },
                        )}
                        active={
                          activeFilters.categoryId ===
                          category.id
                        }
                      >
                        {category.name}
                      </FilterLink>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-text-primary">
                  Servizi
                </p>

                <div className="flex flex-wrap gap-2">
                  <FilterLink
                    href={buildFilterHref(
                      activeFilters,
                      {
                        serviceId: null,
                      },
                    )}
                    active={
                      activeFilters.serviceId ===
                      null
                    }
                  >
                    Tutti
                  </FilterLink>

                  {serviceFilterOptions.map(
                    (service) => (
                      <FilterLink
                        key={`${service.categoryId}-${service.id}`}
                        href={buildFilterHref(
                          activeFilters,
                          {
                            serviceId: service.id,
                          },
                        )}
                        active={
                          activeFilters.serviceId ===
                          service.id
                        }
                      >
                        {service.name}
                      </FilterLink>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-text-primary">
                  Ordinamento
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      value: "recommended",
                      label: "Consigliate",
                    },
                    {
                      value: "newest",
                      label: "Più recenti",
                    },
                    {
                      value: "nearest",
                      label: "Più vicine",
                    },
                  ].map((sortOption) => (
                    <FilterLink
                      key={sortOption.value}
                      href={buildFilterHref(
                        activeFilters,
                        {
                          sort:
                            sortOption.value as RequestDashboardSort,
                        },
                      )}
                      active={
                        activeFilters.sort ===
                        sortOption.value
                      }
                    >
                      {sortOption.label}
                    </FilterLink>
                  ))}
                </div>
              </div>
            </div>
          </Card>
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
                  : "/area-impresa/richieste"
              }
              className="mt-5 inline-flex text-sm font-medium text-brand-primary"
            >
              {result.code === "missing_category"
                ? "Vai alla configurazione servizi"
                : "Torna alla dashboard"}
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
                  const structuredData = getStructuredData(
                    request.structuredData,
                  )
                  const description = getDescription(structuredData)
                  const surfaceArea = getSurfaceArea(structuredData)

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
