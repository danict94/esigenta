"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Button, Card, Input, cn, tokens } from "@esigenta/ui";

import type { TaxonomySearchResult } from "@esigenta/taxonomy";

export type SearchBarSelection = {
  result: TaxonomySearchResult;
  query: string;
};

type SearchBarProps = {
  onSelect?: (selection: SearchBarSelection) => void;
  variant?: SearchBarVariant;
};

export type SearchBarVariant = "default" | "hero";

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
];

export function SearchBar({
  onSelect,
  variant = "default",
}: SearchBarProps = {}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TaxonomySearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      const resetResultsTimeout = window.setTimeout(() => {
        setResults(PRELOADED_RESULTS);
      }, 0);

      return () => {
        window.clearTimeout(resetResultsTimeout);
      };
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const controller = new AbortController();

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/taxonomy/search?q=${encodeURIComponent(trimmedQuery)}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as TaxonomySearchResult[];

        setResults(data);
      } catch {
        // The request is intentionally ignored when it is aborted.
      }
    }, 180);

    return () => {
      controller.abort();

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const groupedResults = useMemo(() => {
    return {
      interventions: results.filter((result) => result.type === "INTERVENTION"),
      categories: results.filter((result) => result.type === "CATEGORY"),
    };
  }, [results]);

  const showDropdown = isFocused && results.length > 0;
  const firstSuggestion =
    groupedResults.interventions[0] ?? groupedResults.categories[0];

  function selectResult(result: TaxonomySearchResult) {
    setQuery(result.name);
    setResults([]);
    setIsFocused(false);

    onSelect?.({
      result,
      query: query.trim() || result.name,
    });
  }

  function submitFirstSuggestion() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Scrivi l'intervento di cui hai bisogno.");

      setTimeout(() => {
        setError(null);
      }, 2200);

      return;
    }

    if (firstSuggestion) {
      selectResult(firstSuggestion);
      return;
    }

    setError("Scegli un intervento dai suggerimenti.");

    setTimeout(() => {
      setError(null);
    }, 2200);
  }

  return (
    <Card
      className={cn(
        "relative overflow-visible rounded-xl border-0 bg-surface-elevated p-1 shadow-card",
        variant === "hero" && tokens.home.hero.searchCard,
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center md:h-16",
          variant === "hero" && tokens.home.hero.searchInner,
        )}
      >
        <div className="relative flex min-w-0 flex-1 items-center">
          <Input
            type="text"
            size="lg"
            value={query}
            onFocus={() => {
              setIsFocused(true);

              if (query.trim() === "") {
                setResults(PRELOADED_RESULTS);
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                setIsFocused(false);
              }, 150);
            }}
            onChange={(event) => {
              setError(null);
              setQuery(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter") {
                return;
              }

              event.preventDefault();
              submitFirstSuggestion();
            }}
            placeholder="ad esempio: tinteggiatura"
            className={cn(
              "h-full border-transparent bg-transparent pl-4 pr-3 text-base text-text-primary placeholder:text-text-muted focus:border-transparent md:pl-5 lg:pl-6",
              variant === "hero" && tokens.home.hero.searchInput,
            )}
          />

          {error ? (
            <div className="pointer-events-none absolute bottom-full left-4 z-[60] mb-3">
              <div className="relative max-w-xs border border-border-primary bg-surface-elevated px-3 py-2 shadow-surface backdrop-blur">
                <div className="absolute left-5 top-full h- w-3 rotate-45 border-b border-r border-border-primary bg-surface-elevated" />

                <p className="text-sm text-text-primary">{error}</p>
              </div>
            </div>
          ) : null}

          {showDropdown ? (
            <Card className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden">
              <div className="max-h-[min(60vh,420px)] overflow-y-auto">
                {groupedResults.interventions.length > 0 ? (
                  <SuggestionGroup
                    label="Interventi"
                    results={groupedResults.interventions}
                    onSelect={selectResult}
                  />
                ) : null}

                {groupedResults.categories.length > 0 ? (
                  <SuggestionGroup
                    label="Categorie"
                    results={groupedResults.categories}
                    onSelect={selectResult}
                  />
                ) : null}
              </div>
            </Card>
          ) : null}
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          aria-label="Avvia ricerca"
          onClick={submitFirstSuggestion}
          className={cn(
            "h-12 w-12 shrink-0 rounded-lg px-0 md:h-14 md:w-14",
            variant === "hero" && tokens.home.hero.searchButton,
          )}
        >
          <ArrowRight
            className={cn(
              "size-5 md:size-6",
              variant === "hero" && tokens.home.hero.searchIcon,
            )}
            aria-hidden="true"
          />
        </Button>
      </div>
    </Card>
  );
}

type SuggestionGroupProps = {
  label: string;
  onSelect: (result: TaxonomySearchResult) => void;
  results: TaxonomySearchResult[];
};

function SuggestionGroup({ label, onSelect, results }: SuggestionGroupProps) {
  return (
    <div className="border-b border-border-primary last:border-b-0">
      <div className="px-4 py-2 text-xs font-medium uppercase tracking-widest text-text-muted">
        {label}
      </div>

      <div className="flex flex-col">
        {results.map((result) => (
          <Button
            key={`${result.type}-${result.id}`}
            type="button"
            variant="ghost"
            onClick={() => {
              onSelect(result);
            }}
            className="h-auto w-full flex-col items-start justify-start gap-1 px-4 py-3 text-left"
          >
            <span className="text-sm text-text-primary">{result.name}</span>

            {result.description ? (
              <span className="text-xs text-text-muted">
                {result.description}
              </span>
            ) : null}
          </Button>
        ))}
      </div>
    </div>
  );
}
