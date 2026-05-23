"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { Search } from "lucide-react"

import {
  Button,
  Card,
  Input,
} from "@fixpro/ui"

import type { TaxonomySearchResult } from "@fixpro/db"

export type SearchBarSelection = {
  result: TaxonomySearchResult
  query: string
}

type SearchBarProps = {
  onInterventionSelect?: (
    selection: SearchBarSelection,
  ) => void
}

const PRELOADED_RESULTS: TaxonomySearchResult[] = [
  {
    id: "preload-1",
    type: "INTERVENTION",
    name: "Rifare bagno",
    slug: "rifare-bagno",
    description: null,
    relevance: 100,
  },
  {
    id: "preload-2",
    type: "INTERVENTION",
    name: "Perdita acqua",
    slug: "perdita-acqua",
    description: null,
    relevance: 100,
  },
  {
    id: "preload-3",
    type: "CATEGORY",
    name: "Impresa edile",
    slug: "impresa-edile",
    description: null,
    relevance: 60,
  },
  {
    id: "preload-4",
    type: "CATEGORY",
    name: "Idraulico",
    slug: "idraulico",
    description: null,
    relevance: 60,
  },
]

export function SearchBar({
  onInterventionSelect,
}: SearchBarProps = {}) {
  const [query, setQuery] =
    useState("")

  const [results, setResults] =
    useState<TaxonomySearchResult[]>([])

  const [isFocused, setIsFocused] =
    useState(false)

  const debounceRef =
    useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const trimmedQuery =
      query.trim()

    if (!trimmedQuery) {
      const resetResultsTimeout =
        window.setTimeout(() => {
          setResults(PRELOADED_RESULTS)
        }, 0)

      return () => {
        window.clearTimeout(resetResultsTimeout)
      }
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    const controller =
      new AbortController()

    debounceRef.current =
      setTimeout(async () => {
        try {
          const response =
            await fetch(
              `/api/taxonomy/search?q=${encodeURIComponent(
                trimmedQuery,
              )}`,
              {
                signal:
                  controller.signal,
              },
            )

          if (!response.ok) {
            return
          }

          const data =
            (await response.json()) as TaxonomySearchResult[]

          setResults(data)
        } catch {
          // aborted
        }
      }, 180)

    return () => {
      controller.abort()

      if (debounceRef.current) {
        clearTimeout(
          debounceRef.current,
        )
      }
    }
  }, [query])

  const groupedResults =
    useMemo(() => {
      return {
        interventions:
          results.filter(
            (result) =>
              result.type ===
              "INTERVENTION",
          ),

        categories:
          results.filter(
            (result) =>
              result.type ===
              "CATEGORY",
          ),
      }
    }, [results])

  const showDropdown =
    isFocused &&
    results.length > 0

  function selectIntervention(
    result: TaxonomySearchResult,
  ) {
    setQuery(result.name)
    setResults([])
    setIsFocused(false)

    onInterventionSelect?.({
      result,
      query:
        query.trim() ||
        result.name,
    })
  }

  const firstIntervention =
    groupedResults.interventions[0]

  return (
    <Card className="p-2 shadow-surface">
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 z-10 size-6 -translate-y-1/2 text-text-muted" />

          <Input
            type="text"
            size="lg"
            value={query}
            onFocus={() => {
              setIsFocused(true)

              if (
                query.trim() === ""
              ) {
                setResults(
                  PRELOADED_RESULTS,
                )
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                setIsFocused(false)
              }, 150)
            }}
            onChange={(event) => {
              setQuery(
                event.target.value,
              )
            }}
            placeholder="Di cosa hai bisogno?"
            className="pl-14"
          />

          {showDropdown ? (
            <Card className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden shadow-lg">
              <div className="max-h-[420px] overflow-y-auto">
                {groupedResults
                  .interventions
                  .length > 0 ? (
                  <div className="border-b border-border-primary">
                    <div className="px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
                      Interventi
                    </div>

                    <div className="flex flex-col">
                      {groupedResults.interventions.map(
                        (
                          result,
                        ) => (
                          <Button
                            key={`INTERVENTION-${result.id}`}
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              selectIntervention(
                                result,
                              )
                            }}
                            className="h-auto w-full flex-col items-start justify-start gap-1 px-4 py-3 text-left"
                          >
                            <span className="text-sm text-text-primary">
                              {
                                result.name
                              }
                            </span>

                            {result.description ? (
                              <span className="text-xs text-text-muted">
                                {
                                  result.description
                                }
                              </span>
                            ) : null}
                          </Button>
                        ),
                      )}
                    </div>
                  </div>
                ) : null}

                {groupedResults
                  .categories.length >
                0 ? (
                  <div>
                    <div className="px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
                      Categorie
                    </div>

                    <div className="flex flex-col">
                      {groupedResults.categories.map(
                        (
                          result,
                        ) => (
                          <Button
                            key={`CATEGORY-${result.id}`}
                            type="button"
                            variant="ghost"
                            className="h-auto w-full flex-col items-start justify-start gap-1 px-4 py-3 text-left"
                          >
                            <span className="text-sm text-text-primary">
                              {
                                result.name
                              }
                            </span>

                            {result.description ? (
                              <span className="text-xs text-text-muted">
                                {
                                  result.description
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
          ) : null}
        </div>

        <Button
          type="button"
          size="xl"
          className="w-full md:w-auto md:min-w-36"
          onClick={() => {
            if (firstIntervention) {
              selectIntervention(
                firstIntervention,
              )
            }
          }}
          disabled={
            !firstIntervention
          }
        >
          Cerca
        </Button>
      </div>
    </Card>
  )
}