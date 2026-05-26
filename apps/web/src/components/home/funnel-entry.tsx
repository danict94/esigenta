'use client'

import {
  useState,
} from 'react'

import {
  useRouter,
} from 'next/navigation'

import {
  Button,
  Card,
} from '@fixpro/ui'

import {
  SearchBar,
} from './search-bar'

import type {
  SearchBarSelection,
} from './search-bar'

type DiscoveryIntervention = {
  id: string
  slug: string
  name: string
  description: string | null
}

type CategoryDiscoveryState = {
  categoryName: string
  categorySlug: string
  query: string
  interventions: DiscoveryIntervention[]
  isLoading: boolean
  error: string | null
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value),
  )
}

function readDiscoveryInterventions(
  value: unknown,
): DiscoveryIntervention[] {
  if (!isRecord(value)) {
    return []
  }

  const interventions =
    value.interventions

  if (!Array.isArray(interventions)) {
    return []
  }

  return interventions.flatMap(
    (intervention) => {
      if (!isRecord(intervention)) {
        return []
      }

      if (
        typeof intervention.id !== 'string' ||
        typeof intervention.slug !== 'string' ||
        typeof intervention.name !== 'string'
      ) {
        return []
      }

      return [
        {
          id: intervention.id,
          slug: intervention.slug,
          name: intervention.name,
          description:
            typeof intervention.description ===
            'string'
              ? intervention.description
              : null,
        },
      ]
    },
  )
}

function CategoryDiscoveryPanel({
  discovery,
  onReset,
  onSelectIntervention,
}: {
  discovery: CategoryDiscoveryState
  onReset: () => void
  onSelectIntervention: (
    intervention: DiscoveryIntervention,
  ) => void
}) {
  const hasInterventions =
    discovery.interventions.length > 0

  return (
    <Card className="p-4 shadow-surface md:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-primary">
              {discovery.categoryName}
            </p>

            <h2 className="text-xl font-semibold text-text-primary">
              Che tipo di intervento ti serve?
            </h2>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={onReset}
            className="w-full justify-center sm:w-auto"
          >
            Cambia ricerca
          </Button>
        </div>

        {discovery.isLoading ? (
          <p className="text-sm text-text-secondary">
            Carichiamo gli interventi disponibili.
          </p>
        ) : null}

        {discovery.error ? (
          <p className="text-sm text-brand-primary">
            {discovery.error}
          </p>
        ) : null}

        {!discovery.isLoading &&
        !discovery.error &&
        !hasInterventions ? (
          <p className="text-sm text-text-secondary">
            Non abbiamo trovato interventi disponibili
            per questa categoria.
          </p>
        ) : null}

        {hasInterventions ? (
          <div className="max-h-[min(55vh,360px)] overflow-y-auto border border-border-primary">
            <div className="flex flex-col divide-y divide-border-primary">
              {discovery.interventions.map(
                (intervention) => (
                  <Button
                    key={intervention.id}
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      onSelectIntervention(
                        intervention,
                      )
                    }}
                    className="h-auto w-full flex-col items-start justify-start gap-1 px-4 py-3 text-left"
                  >
                    <span className="text-sm text-text-primary">
                      {intervention.name}
                    </span>

                    {intervention.description ? (
                      <span className="text-xs text-text-muted">
                        {
                          intervention.description
                        }
                      </span>
                    ) : null}
                  </Button>
                ),
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}

export function FunnelEntry() {
  const router = useRouter()
  const [
    categoryDiscovery,
    setCategoryDiscovery,
  ] =
    useState<CategoryDiscoveryState | null>(
      null,
    )

  function openInterventionFunnel({
    slug,
    query,
  }: {
    slug: string
    query: string
  }) {
    const searchParams =
      new URLSearchParams()

    if (query.trim()) {
      searchParams.set(
        'q',
        query.trim(),
      )
    }

    const queryString =
      searchParams.toString()

    router.push(
      `/richiesta/${encodeURIComponent(
        slug,
      )}${
        queryString
          ? `?${queryString}`
          : ''
      }`,
    )
  }

  async function openCategoryDiscovery({
    result,
    query,
  }: SearchBarSelection) {
    const categoryQuery =
      query.trim() || result.name

    setCategoryDiscovery({
      categoryName: result.name,
      categorySlug: result.slug,
      query: categoryQuery,
      interventions: [],
      isLoading: true,
      error: null,
    })

    try {
      const response = await fetch(
        `/api/taxonomy/category/${encodeURIComponent(
          result.slug,
        )}/interventions`,
      )

      const responseBody =
        (await response
          .json()
          .catch(() => null)) as unknown

      if (!response.ok) {
        throw new Error(
          'Category discovery request failed',
        )
      }

      const interventions =
        readDiscoveryInterventions(
          responseBody,
        )

      setCategoryDiscovery(
        (current) => {
          if (
            current?.categorySlug !==
            result.slug
          ) {
            return current
          }

          return {
            ...current,
            interventions,
            isLoading: false,
            error: null,
          }
        },
      )
    } catch {
      setCategoryDiscovery(
        (current) => {
          if (
            current?.categorySlug !==
            result.slug
          ) {
            return current
          }

          return {
            ...current,
            interventions: [],
            isLoading: false,
            error:
              'Non siamo riusciti a caricare gli interventi. Riprova tra poco.',
          }
        },
      )
    }
  }

  function handleSearchSelect(
    selection: SearchBarSelection,
  ) {
    if (
      selection.result.type ===
      'INTERVENTION'
    ) {
      openInterventionFunnel({
        slug: selection.result.slug,
        query: selection.query,
      })

      return
    }

    void openCategoryDiscovery(selection)
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchBar
        onSelect={handleSearchSelect}
      />

      {categoryDiscovery ? (
        <CategoryDiscoveryPanel
          discovery={categoryDiscovery}
          onReset={() => {
            setCategoryDiscovery(null)
          }}
          onSelectIntervention={(
            intervention,
          ) => {
            openInterventionFunnel({
              slug: intervention.slug,
              query:
                categoryDiscovery.query ||
                intervention.name,
            })
          }}
        />
      ) : null}
    </div>
  )
}
