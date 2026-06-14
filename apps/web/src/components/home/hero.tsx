"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button, Container, Input, tokens } from "@esigenta/ui";
import type { TaxonomySearchResult } from "@esigenta/taxonomy";

import { Navbar } from "../navigation/navbar";

const heroSearchResultsId = "home-hero-search-results";

type HeroSearchSelection = {
  result: TaxonomySearchResult;
  query: string;
};

export function Hero() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectionRef = useRef<HeroSearchSelection | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TaxonomySearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selection, setSelection] = useState<HeroSearchSelection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFocused || selection) {
      return;
    }

    const trimmedQuery = query.trim();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const controller = new AbortController();
    const debounceDelay = trimmedQuery ? 180 : 0;

    setIsSearching(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/taxonomy/search?q=${encodeURIComponent(trimmedQuery)}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          setResults([]);
          setIsSearching(false);
          return;
        }

        const data = (await response.json()) as TaxonomySearchResult[];

        setResults(
          data
            .filter((result) => result.type === "INTERVENTION")
            .slice(0, 10),
        );
        setIsSearching(false);
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setIsSearching(false);
        }
      }
    }, debounceDelay);

    return () => {
      controller.abort();

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [isFocused, query, selection]);

  const hasQuery = query.trim().length > 0;
  const showSuggestions =
    isFocused &&
    !selection &&
    (hasQuery || results.length > 0 || isSearching);

  function createSelection(result: TaxonomySearchResult) {
    return {
      result,
      query: query.trim() || result.name,
    };
  }

  function selectResult(result: TaxonomySearchResult) {
    const nextSelection = createSelection(result);

    selectionRef.current = nextSelection;
    setSelection(nextSelection);
    setQuery(result.name);
    setError(null);
    setIsFocused(false);
  }

  function openRequest(nextSelection: HeroSearchSelection) {
    const searchParams = new URLSearchParams();

    if (nextSelection.query.trim()) {
      searchParams.set("q", nextSelection.query.trim());
    }

    const queryString = searchParams.toString();

    router.push(
      `/richiesta/${encodeURIComponent(nextSelection.result.slug)}${
        queryString ? `?${queryString}` : ""
      }`,
    );
  }

  function submitSearch() {
    const currentSelection = selection ?? selectionRef.current;

    if (currentSelection) {
      openRequest(currentSelection);
      return;
    }

    const firstResult = results[0];

    if (!query.trim()) {
      setError("Seleziona un suggerimento prima di proseguire.");
      setIsFocused(true);
      inputRef.current?.focus();
      return;
    }

    if (firstResult) {
      openRequest(createSelection(firstResult));
      return;
    }

    setError("Seleziona un suggerimento prima di proseguire.");
    setIsFocused(true);
    inputRef.current?.focus();
  }

  return (
    <>
      <Navbar />

      <section id="richiedi-preventivo" className={tokens.home.hero.root}>
        <Container size="lg" gutter="md" className={tokens.home.hero.container}>
          <h1 className={tokens.home.hero.title}>
            Trova le migliori offerte
            <br />
            da{" "}
            <span className={tokens.home.hero.titleAccent}>
              professionisti
            </span>{" "}
            nella tua zona
          </h1>

          <p className={tokens.home.hero.question}>
            Di quale intervento hai bisogno?
          </p>

          <div className={tokens.home.hero.searchWrap}>
            <div className={tokens.home.hero.searchForm}>
              <Input
                ref={inputRef}
                type="text"
                value={query}
                placeholder="Es: tinteggiatura pareti, ripristino frontalino"
                role="combobox"
                aria-label="Intervento da cercare"
                aria-autocomplete="list"
                aria-expanded={showSuggestions}
                aria-controls={heroSearchResultsId}
                className={tokens.home.hero.searchInput}
                onFocus={() => {
                  setIsFocused(true);
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setIsFocused(false);
                  }, 150);
                }}
                onChange={(event) => {
                  const nextQuery = event.target.value;

                  setQuery(nextQuery);
                  selectionRef.current = null;
                  setSelection(null);
                  setError(null);

                  setIsSearching(true);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") {
                    return;
                  }

                  event.preventDefault();
                  submitSearch();
                }}
              />

              <Button
                type="button"
                variant="warm"
                size="sm"
                aria-label="Cerca intervento"
                className={tokens.home.hero.searchSubmit}
                onClick={submitSearch}
              >
                <ArrowRight
                  aria-hidden="true"
                  className={tokens.home.hero.searchSubmitIcon}
                />
              </Button>
            </div>

            {showSuggestions ? (
              <div
                id={heroSearchResultsId}
                role="listbox"
                className={tokens.home.hero.suggestions}
              >
                <div className={tokens.home.hero.suggestionsList}>
                  <div className={tokens.home.hero.suggestionsLabel}>
                    Interventi
                  </div>

                  {results.map((result) => (
                    <Button
                      key={`${result.type}-${result.id}`}
                      type="button"
                      variant="ghost"
                      role="option"
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                      onClick={() => {
                        selectResult(result);
                      }}
                      className={tokens.home.hero.suggestionAction}
                    >
                      <span className={tokens.home.hero.suggestionTitle}>
                        {result.name}
                      </span>

                      {result.description ? (
                        <span className={tokens.home.hero.suggestionDescription}>
                          {result.description}
                        </span>
                      ) : null}
                    </Button>
                  ))}

                  {isSearching ? (
                    <p className={tokens.home.hero.suggestionsState}>
                      Cerchiamo gli interventi disponibili.
                    </p>
                  ) : null}

                  {!isSearching && results.length === 0 ? (
                    <p className={tokens.home.hero.suggestionsState}>
                      Nessun intervento trovato. Prova con un termine piu
                      specifico.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {error && !showSuggestions ? (
              <p className={tokens.home.hero.searchError}>{error}</p>
            ) : null}
          </div>
        </Container>
      </section>
    </>
  );
}
