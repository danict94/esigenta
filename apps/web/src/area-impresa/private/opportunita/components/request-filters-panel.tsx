"use client"

import {
  Search,
  SlidersHorizontal,
} from "lucide-react"
import {
  useRouter,
} from "next/navigation"
import type {
  FormEvent,
} from "react"
import {
  useState,
  useTransition,
} from "react"

import {
  Badge,
  Button,
  Input,
  Select,
} from "@esigenta/ui"

import type {
  RequestDashboardSort,
} from "@esigenta/domain"

import {
  PendingRequestLink,
} from "./request-pending-controls"

export type RequestFiltersState = {
  q: string | null
  radiusKm: number | null
  categoryId: string | null
  interventionId: string | null
  sort: RequestDashboardSort
}

export type RequestFilterOption = {
  id: string
  name: string
  isConfigured: boolean
}

export type RequestInterventionFilterOption = {
  id: string
  name: string
  isConfigured: boolean
}

type RequestFiltersPanelProps = {
  active: RequestFiltersState
  categories: RequestFilterOption[]
  interventions: RequestInterventionFilterOption[]
  activeCategoryIsConfigured: boolean | null
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
    label: "Più compatibili",
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

  if (next.interventionId) {
    params.set(
      "interventionId",
      next.interventionId,
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

      {active.interventionId &&
      !except.includes("interventionId") ? (
        <Input
          type="hidden"
          name="interventionId"
          defaultValue={active.interventionId}
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

function getActiveFilterLabels({
  active,
  categories,
  interventions,
}: {
  active: RequestFiltersState
  categories: RequestFilterOption[]
  interventions: RequestInterventionFilterOption[]
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

  const intervention =
    interventions.find(
      (item) => item.id === active.interventionId,
    )

  if (intervention) {
    labels.push(`Intervento: ${intervention.name}`)
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

export function RequestFiltersPanel({
  active,
  categories,
  interventions,
  activeCategoryIsConfigured,
  activeFilterCount,
}: RequestFiltersPanelProps) {
  const router = useRouter()
  const [
    isPending,
    startTransition,
  ] = useTransition()
  const hasAdvancedFilters =
    Boolean(
      active.radiusKm ||
        active.categoryId ||
        active.interventionId ||
        active.sort !== "recommended",
    )
  const [filtersOpen, setFiltersOpen] =
    useState(hasAdvancedFilters)
  // Already scoped server-side to the active category — no client-side
  // filter needed (interventions has no single categoryId to filter by
  // anymore: a ProjectGroup, and therefore its interventions, can be
  // referenced by more than one Category).
  const visibleInterventions = active.categoryId ? interventions : []
  const activeLabels =
    getActiveFilterLabels({
      active,
      categories,
      interventions,
    })
  const selectedCategory =
    categories.find(
      (category) =>
        category.id === active.categoryId,
    )

  function navigateTo(href: string) {
    startTransition(() => {
      router.push(href)
    })
  }

  function handleSearchSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const formData =
      new FormData(event.currentTarget)
    const query =
      String(formData.get("q") ?? "")
        .trim()

    navigateTo(
      buildFilterHref(active, {
        q: query || null,
      }),
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <form
          action="/area-impresa/richieste"
          method="get"
          onSubmit={handleSearchSubmit}
          aria-busy={isPending}
          className="w-full max-w-xl"
        >
          <PreservedFilterInputs
            active={active}
            except={["q"]}
          />

          <label className="grid flex-1 gap-2">
            <span className="text-sm font-medium text-text-primary">
              cerca richiesta con parole chiave.
            </span>

            <span className="relative">
              <Search
                className="absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />

              <Input
                type="search"
                name="q"
                defaultValue={active.q ?? ""}
                placeholder="es. tinteggiatura, bagno"
                disabled={isPending}
                className="pl-12"
              />
            </span>
          </label>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="gap-2 text-brand-primary"
            aria-expanded={filtersOpen}
            onClick={() => {
              setFiltersOpen((value) => !value)
            }}
          >
            <SlidersHorizontal
              className="size-5"
              aria-hidden="true"
            />
            Filtri
          </Button>

          {activeFilterCount ? (
            <PendingRequestLink
              href="/area-impresa/richieste"
              pendingChildren="Reset in corso..."
              className="text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover"
            >
              Reset filtri
            </PendingRequestLink>
          ) : null}

          {active.q ? (
            <PendingRequestLink
              href={buildFilterHref(active, {
                q: null,
              })}
              pendingChildren="Cancellazione..."
              className="text-sm font-semibold text-text-secondary transition-colors hover:text-brand-primary"
            >
              Cancella ricerca
            </PendingRequestLink>
          ) : null}
        </div>
      </div>

      {isPending ? (
        <p
          role="status"
          aria-live="polite"
          className="text-sm font-medium text-text-secondary"
        >
          Aggiornamento risultati...
        </p>
      ) : null}

      {filtersOpen ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-text-primary">
              Categoria
            </span>

            <Select
              value={active.categoryId ?? ""}
              disabled={isPending}
              onChange={(event) => {
                navigateTo(
                  buildFilterHref(active, {
                    categoryId:
                      event.target.value || null,
                    interventionId: null,
                  }),
                )
              }}
            >
              <option value="">
                Tutte le categorie
              </option>
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.isConfigured
                    ? category.name
                    : `${category.name} (non nel profilo)`}
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-text-primary">
              Intervento
            </span>

            <Select
              value={active.interventionId ?? ""}
              disabled={
                isPending || !active.categoryId
              }
              onChange={(event) => {
                navigateTo(
                  buildFilterHref(active, {
                    interventionId:
                      event.target.value || null,
                  }),
                )
              }}
            >
              <option value="">
                {active.categoryId
                  ? "Tutti gli interventi"
                  : "Scegli prima categoria"}
              </option>
              {visibleInterventions.map((intervention) => (
                <option
                  key={intervention.id}
                  value={intervention.id}
                >
                  {intervention.isConfigured
                    ? intervention.name
                    : `${intervention.name} (non configurato)`}
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-text-primary">
              Raggio
            </span>

            <Select
              value={
                active.radiusKm
                  ? String(active.radiusKm)
                  : ""
              }
              disabled={isPending}
              onChange={(event) => {
                navigateTo(
                  buildFilterHref(active, {
                    radiusKm: event.target.value
                      ? Number(event.target.value)
                      : null,
                  }),
                )
              }}
            >
              <option value="">
                Raggio profilo
              </option>
              {radiusOptions.map((radiusKm) => (
                <option
                  key={radiusKm}
                  value={radiusKm}
                >
                  {radiusKm} km
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-text-primary">
              Ordina
            </span>

            <Select
              value={active.sort}
              disabled={isPending}
              onChange={(event) => {
                navigateTo(
                  buildFilterHref(active, {
                    sort: event.target
                      .value as RequestDashboardSort,
                  }),
                )
              }}
            >
              {sortOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
        </div>
      ) : null}

      {filtersOpen ? (
        !active.categoryId ? (
          <p className="text-sm leading-6 text-text-secondary">
            Seleziona una categoria per filtrare gli interventi collegati.
          </p>
        ) : activeCategoryIsConfigured === false ? (
          <p className="max-w-3xl text-sm leading-6 text-text-secondary">
            Questa categoria non è ancora nel tuo profilo. Puoi configurarla
            per ricevere richieste più pertinenti.
          </p>
        ) : visibleInterventions.length === 0 ? (
          <p className="text-sm leading-6 text-text-secondary">
            Nessun intervento collegato a {selectedCategory?.name ?? "questa categoria"}.
          </p>
        ) : null
      ) : null}

      {activeLabels.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {activeLabels.map((label) => (
            <Badge
              key={label}
              variant="neutral"
              size="sm"
            >
              {label}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  )
}
