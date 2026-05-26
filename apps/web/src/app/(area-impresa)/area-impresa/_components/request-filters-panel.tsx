"use client"

import Link from "next/link"
import {
  Search,
  SlidersHorizontal,
} from "lucide-react"
import {
  type ReactNode,
  useState,
} from "react"

import {
  Badge,
  Button,
  Card,
  Input,
  cn,
} from "@fixpro/ui"

import type {
  RequestDashboardSort,
} from "@fixpro/db"

export type RequestFiltersState = {
  q: string | null
  radiusKm: number | null
  categoryId: string | null
  serviceId: string | null
  sort: RequestDashboardSort
}

export type RequestFilterOption = {
  id: string
  name: string
}

export type RequestServiceFilterOption = {
  id: string
  name: string
  categoryId: string
}

type FilterGroup =
  | "radius"
  | "category"
  | "service"
  | "sort"

type RequestFiltersPanelProps = {
  active: RequestFiltersState
  categories: RequestFilterOption[]
  services: RequestServiceFilterOption[]
  activeFilterCount: boolean
}

const radiusOptions = [
  10,
  20,
  30,
  50,
  75,
  100,
] as const

const sortOptions: Array<{
  value: RequestDashboardSort
  label: string
}> = [
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
]

const filterGroups: Array<{
  id: FilterGroup
  label: string
}> = [
  {
    id: "radius",
    label: "Raggio",
  },
  {
    id: "category",
    label: "Categoria",
  },
  {
    id: "service",
    label: "Servizi",
  },
  {
    id: "sort",
    label: "Ordina",
  },
]

function buildFilterHref(
  active: RequestFiltersState,
  updates: Partial<RequestFiltersState>,
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

  const query =
    params.toString()

  return query
    ? `/area-impresa/richieste?${query}`
    : "/area-impresa/richieste"
}

function PreservedFilterInputs({
  active,
  except,
}: {
  active: RequestFiltersState
  except: Array<keyof RequestFiltersState>
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

function FilterTab({
  active,
  onClick,
  label,
  summary,
}: {
  active: boolean
  onClick: () => void
  label: string
  summary: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-auto justify-start border-b px-0 py-3 text-left",
        active
          ? "border-brand-primary text-brand-primary"
          : "border-border-primary text-text-secondary",
      )}
      onClick={onClick}
    >
      <span className="flex flex-col items-start gap-1">
        <span className="text-sm font-semibold">
          {label}
        </span>

        <span className="max-w-40 truncate text-xs font-normal text-text-muted">
          {summary}
        </span>
      </span>
    </Button>
  )
}

function getActiveFilterLabels({
  active,
  categories,
  services,
}: {
  active: RequestFiltersState
  categories: RequestFilterOption[]
  services: RequestServiceFilterOption[]
}) {
  const labels: string[] = []

  if (active.q) {
    labels.push(`Ricerca: ${active.q}`)
  }

  if (active.radiusKm) {
    labels.push(`Raggio: ${active.radiusKm} km`)
  }

  const category =
    categories.find(
      (item) => item.id === active.categoryId,
    )

  if (category) {
    labels.push(`Categoria: ${category.name}`)
  }

  const service =
    services.find(
      (item) => item.id === active.serviceId,
    )

  if (service) {
    labels.push(`Servizio: ${service.name}`)
  }

  const sort =
    sortOptions.find(
      (item) => item.value === active.sort,
    )

  if (sort && active.sort !== "recommended") {
    labels.push(`Ordine: ${sort.label}`)
  }

  return labels
}

function getGroupSummary({
  group,
  active,
  categories,
  services,
}: {
  group: FilterGroup
  active: RequestFiltersState
  categories: RequestFilterOption[]
  services: RequestServiceFilterOption[]
}) {
  if (group === "radius") {
    return active.radiusKm
      ? `${active.radiusKm} km`
      : "Profilo"
  }

  if (group === "category") {
    return (
      categories.find(
        (category) =>
          category.id === active.categoryId,
      )?.name ?? "Tutte"
    )
  }

  if (group === "service") {
    return (
      services.find(
        (service) =>
          service.id === active.serviceId,
      )?.name ?? "Tutti"
    )
  }

  return (
    sortOptions.find(
      (option) =>
        option.value === active.sort,
    )?.label ?? "Consigliate"
  )
}

function FilterContent({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {children}
    </div>
  )
}

export function RequestFiltersPanel({
  active,
  categories,
  services,
  activeFilterCount,
}: RequestFiltersPanelProps) {
  const [
    isFilterOpen,
    setIsFilterOpen,
  ] = useState(false)

  const [
    activeGroup,
    setActiveGroup,
  ] = useState<FilterGroup>("radius")

  const visibleServices =
    active.categoryId
      ? services.filter(
          (service) =>
            service.categoryId ===
            active.categoryId,
        )
      : services

  const activeLabels =
    getActiveFilterLabels({
      active,
      categories,
      services,
    })

  return (
    <Card className="p-4 md:p-5">
      <div className="flex flex-col gap-3 lg:flex-row">
        <form
          action="/area-impresa/richieste"
          method="get"
          className="flex flex-1 flex-col gap-3 md:flex-row"
        >
          <PreservedFilterInputs
            active={active}
            except={["q"]}
          />

          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />

            <Input
              type="search"
              name="q"
              defaultValue={active.q ?? ""}
              placeholder="Cerca richiesta, città, materiale..."
              className="pl-12"
            />
          </div>

          <Button type="submit">
            Cerca
          </Button>
        </form>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Button
            type="button"
            variant="secondary"
            className="gap-2 lg:w-auto"
            aria-expanded={isFilterOpen}
            onClick={() => {
              setIsFilterOpen((current) => !current)
            }}
          >
            <SlidersHorizontal
              className="size-4"
              aria-hidden="true"
            />
            Filtri
            {activeFilterCount ? (
              <Badge variant="danger" size="sm">
                {activeLabels.length}
              </Badge>
            ) : null}
          </Button>

          {activeFilterCount ? (
            <Link
              href="/area-impresa/richieste"
              className="inline-flex h-10 items-center justify-center text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover"
            >
              Reset filtri
            </Link>
          ) : null}
        </div>
      </div>

      {activeLabels.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeLabels.map((label) => (
            <Badge key={label} variant="neutral" size="sm">
              {label}
            </Badge>
          ))}
        </div>
      ) : null}

      {isFilterOpen ? (
        <div className="mt-5 border-t border-border-primary pt-4">
          <div className="grid gap-3 md:grid-cols-4">
            {filterGroups.map((group) => (
              <FilterTab
                key={group.id}
                active={activeGroup === group.id}
                label={group.label}
                summary={getGroupSummary({
                  group: group.id,
                  active,
                  categories,
                  services,
                })}
                onClick={() => {
                  setActiveGroup(group.id)
                }}
              />
            ))}
          </div>

          <div className="mt-5">
            {activeGroup === "radius" ? (
              <FilterContent>
                <FilterLink
                  href={buildFilterHref(active, {
                    radiusKm: null,
                  })}
                  active={active.radiusKm === null}
                >
                  Raggio profilo
                </FilterLink>

                {radiusOptions.map((radiusKm) => (
                  <FilterLink
                    key={radiusKm}
                    href={buildFilterHref(active, {
                      radiusKm,
                    })}
                    active={active.radiusKm === radiusKm}
                  >
                    {`${radiusKm} km`}
                  </FilterLink>
                ))}
              </FilterContent>
            ) : null}

            {activeGroup === "category" ? (
              <FilterContent>
                <FilterLink
                  href={buildFilterHref(active, {
                    categoryId: null,
                    serviceId: null,
                  })}
                  active={active.categoryId === null}
                >
                  Tutte
                </FilterLink>

                {categories.map((category) => (
                  <FilterLink
                    key={category.id}
                    href={buildFilterHref(active, {
                      categoryId: category.id,
                      serviceId: null,
                    })}
                    active={active.categoryId === category.id}
                  >
                    {category.name}
                  </FilterLink>
                ))}
              </FilterContent>
            ) : null}

            {activeGroup === "service" ? (
              <FilterContent>
                <FilterLink
                  href={buildFilterHref(active, {
                    serviceId: null,
                  })}
                  active={active.serviceId === null}
                >
                  Tutti
                </FilterLink>

                {visibleServices.map((service) => (
                  <FilterLink
                    key={`${service.categoryId}-${service.id}`}
                    href={buildFilterHref(active, {
                      serviceId: service.id,
                    })}
                    active={active.serviceId === service.id}
                  >
                    {service.name}
                  </FilterLink>
                ))}
              </FilterContent>
            ) : null}

            {activeGroup === "sort" ? (
              <FilterContent>
                {sortOptions.map((sortOption) => (
                  <FilterLink
                    key={sortOption.value}
                    href={buildFilterHref(active, {
                      sort: sortOption.value,
                    })}
                    active={active.sort === sortOption.value}
                  >
                    {sortOption.label}
                  </FilterLink>
                ))}
              </FilterContent>
            ) : null}
          </div>
        </div>
      ) : null}
    </Card>
  )
}