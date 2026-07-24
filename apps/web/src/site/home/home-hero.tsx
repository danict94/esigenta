import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { storeFunnelQuery } from "../../richiesta/flow/components/resolve-funnel-query";
import {
  preloadedResults,
  scatterTags,
  type SearchResult,
} from "./home-content";

const MIN_SEARCH_QUERY_LENGTH = 3;
const SEARCH_ERROR_MESSAGE = "Non riesco a caricare i risultati ora";
const SEARCH_VALIDATION_MESSAGE_ID = "home-search-validation";

type ScatterStyle = CSSProperties &
  Record<
    | "--dx"
    | "--dy"
    | "--dr"
    | "--gx"
    | "--gy"
    | "--delay"
    | "--float-x"
    | "--float-y"
    | "--float-r",
    string
  >;

export function HomeHero() {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (trimmed.length < MIN_SEARCH_QUERY_LENGTH) {
      return;
    }

    const controller = new AbortController();

    debounceRef.current = setTimeout(async () => {
      setResults([]);
      setIsLoading(true);
      setHasSearched(false);
      setSearchError(null);

      try {
        const response = await fetch(`/api/taxonomy/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setSearchError(SEARCH_ERROR_MESSAGE);
          setHasSearched(true);
          return;
        }

        setResults((await response.json()) as SearchResult[]);
        setSearchError(null);
        setHasSearched(true);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setSearchError(SEARCH_ERROR_MESSAGE);
        setHasSearched(true);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 180);

    return () => {
      controller.abort();

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;
  const isSearchQueryValid = trimmedQuery.length >= MIN_SEARCH_QUERY_LENGTH;
  const displayedResults = !hasQuery ? preloadedResults : isSearchQueryValid ? results : [];
  const showDropdown =
    isFocused &&
    ((!hasQuery && preloadedResults.length > 0) ||
      (isSearchQueryValid && (isLoading || searchError !== null || hasSearched || displayedResults.length > 0)));

  function resetShortSearch(nextQuery: string) {
    if (nextQuery.trim().length >= MIN_SEARCH_QUERY_LENGTH) {
      return;
    }

    setResults([]);
    setIsLoading(false);
    setHasSearched(false);
    setSearchError(null);
  }

  function keepDropdownInView() {
    const rect = searchRef.current?.getBoundingClientRect();

    if (!rect || rect.bottom + 220 <= window.innerHeight) {
      return;
    }

    searchRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function goToResult(result: SearchResult) {
    // Il testo libero non deve mai finire nella query string dell'URL: passa
    // per sessionStorage (per-scheda, letto una sola volta dal funnel), mai
    // come ?q= visibile o conservato dal browser.
    if (trimmedQuery) {
      storeFunnelQuery(result.slug, trimmedQuery);
    }

    router.push(`/richiesta/${encodeURIComponent(result.slug)}`);
  }

  function focusSearchInput() {
    setIsFocused(true);
    inputRef.current?.focus();
  }

  function selectResult(result: SearchResult) {
    setValidationError(null);
    goToResult(result);
  }

  function submitSearch() {
    focusSearchInput();

    if (!hasQuery) {
      setValidationError('Scrivi cosa devi fare, ad esempio “ristrutturare bagno”.');
      return;
    }

    if (!isSearchQueryValid) {
      setValidationError('Scrivi almeno 3 caratteri, ad esempio “tetto”.');
      return;
    }

    if (isLoading || !hasSearched) {
      setValidationError("Cerco gli interventi disponibili...");
      return;
    }

    if (displayedResults.length > 0) {
      setValidationError("Scegli un intervento tra i risultati per continuare.");
      return;
    }

    setValidationError(
      'Nessun intervento trovato. Prova con “rifare tetto” o “installare fotovoltaico”.',
    );
  }

  return (
    <section
      className="relative z-10 flex min-h-[620px] items-center justify-center bg-eg-brand-strong text-eg-on-brand min-[861px]:min-h-[640px]"
      aria-labelledby="home-title"
    >
      <div className="pointer-events-none absolute inset-0 z-[1] hidden overflow-hidden opacity-70 font-(family-name:--eg-font-ui) min-[601px]:block min-[861px]:opacity-100" aria-hidden="true">
        {scatterTags.map((tag) => (
          <span
            key={tag.label}
            className="absolute left-1/2 top-[47%] border border-eg-on-brand-border bg-transparent px-2.5 py-[7px] text-[10px] uppercase tracking-[0.1em] text-eg-on-brand-muted will-change-transform [animation:eg-home-settle_1100ms_cubic-bezier(0.65,0,0.15,1)_both,eg-home-tag-float_7600ms_ease-in-out_infinite] [animation-delay:var(--delay,0ms),calc(var(--delay,0ms)+1100ms)] [transform:translate(var(--dx),var(--dy))_rotate(var(--dr))] min-[861px]:px-3 min-[861px]:py-2 min-[861px]:text-xs"
            style={
              {
                "--dx": tag.dx,
                "--dy": tag.dy,
                "--dr": tag.dr,
                "--gx": tag.gx,
                "--gy": tag.gy,
                "--delay": tag.delay,
                "--float-x": tag.floatX,
                "--float-y": tag.floatY,
                "--float-r": tag.floatR,
              } as ScatterStyle
            }
          >
            {tag.label}
          </span>
        ))}
      </div>

      <div className="relative z-[2] w-[min(100%,760px)] px-[22px] text-center [animation:eg-home-fade-up_900ms_ease_180ms_both]">
        
        <h1 id="home-title" className="eg-h1 mt-5 text-balance text-[clamp(34px,4.8vw,56px)]">
          Trasformiamo il caos di casa in <strong className="inline-block whitespace-nowrap text-eg-accent font-semibold">un percorso</strong> chiaro e affidabile.
        </h1>
        <p className="mx-auto mt-[22px] max-w-[44ch] text-balance text-base leading-[1.65] text-eg-on-brand-muted">
          Descrivi il lavoro, ricevi e confronta proposte da professionisti qualificati.
        </p>

        <div ref={searchRef} className="relative z-[4] mt-[38px] w-full max-w-[600px] mx-auto text-left">
          <p className="eg-form-eyebrow mb-3 text-eg-on-brand-muted font-semibold min-[601px]:mb-5">Di cosa hai bisogno?</p>
          <form
            className="flex w-full min-h-[60px] items-center gap-2 rounded-eg-sm border border-eg-border bg-eg-surface-muted py-2 pl-4 pr-1.5 transition-colors focus-within:border-eg-brand min-[601px]:pl-5 min-[601px]:pr-2 max-[340px]:flex-col max-[340px]:items-stretch"
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onFocus={() => {
                setIsFocused(true);
                keepDropdownInView();
              }}
              onBlur={() => {
                setTimeout(() => {
                  if (!searchRef.current?.contains(document.activeElement)) {
                    setIsFocused(false);
                  }
                }, 150);
              }}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setQuery(nextQuery);
                setValidationError(null);
                resetShortSearch(nextQuery);
              }}
              aria-label="Di cosa hai bisogno?"
              aria-invalid={validationError !== null}
              aria-describedby={validationError ? SEARCH_VALIDATION_MESSAGE_ID : undefined}
              placeholder="Es. ristrutturare bagno"
              className="min-w-0 flex-1 border-0 bg-transparent text-lg font-medium text-eg-ink outline-none placeholder:text-eg-text-muted placeholder:font-medium max-[860px]:text-base"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 min-h-11 items-center justify-center gap-2 rounded-eg-sm border-0 bg-eg-brand px-4 font-(family-name:--eg-font-ui) text-[13px] font-medium uppercase tracking-[0.16em] text-eg-on-brand transition-colors hover:bg-eg-brand-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eg-brand-strong min-[601px]:px-5 max-[340px]:w-full max-[860px]:text-[11px] max-[860px]:tracking-[0.12em]"
            >
              <span>CERCA</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </form>

          {validationError ? (
            <p
              id={SEARCH_VALIDATION_MESSAGE_ID}
              role="status"
              aria-live="polite"
              className="mt-3 text-left text-sm leading-5 text-eg-on-brand"
            >
              {validationError}
            </p>
          ) : null}

          {showDropdown ? (
            <ul
              className="absolute inset-x-0 top-[calc(100%+10px)] z-20 max-h-[min(20rem,40vh)] overflow-y-auto rounded-eg-sm border border-eg-border bg-eg-surface text-left shadow-eg-slab"
              aria-label="Risultati suggeriti"
            >
              <SearchMenuContent
                hasQuery={hasQuery}
                isLoading={isLoading}
                searchError={searchError}
                hasSearched={hasSearched}
                results={displayedResults}
                onSelect={selectResult}
              />
            </ul>
          ) : null}

          <p className="eg-form-help mx-auto mt-4 max-w-[34ch] text-center text-eg-on-brand-muted">
            Gratuita e senza impegno: decidi tu se accettare una proposta.
          </p>
        </div>
      </div>

      <HomeHeroMotion />
    </section>
  );
}

function HomeHeroMotion() {
  return (
    <style>
      {`
        @keyframes eg-home-settle {
          from {
            opacity: 0;
            transform: translate(var(--gx), var(--gy)) rotate(0deg) scale(0.92);
          }

          to {
            opacity: 1;
            transform: translate(var(--dx), var(--dy)) rotate(var(--dr)) scale(1);
          }
        }

        @keyframes eg-home-tag-float {
          0%,
          100% {
            opacity: 0.74;
            transform: translate(var(--dx), var(--dy)) rotate(var(--dr));
          }

          50% {
            opacity: 1;
            transform: translate(
                calc(var(--dx) + var(--float-x)),
                calc(var(--dy) + var(--float-y))
              )
              rotate(calc(var(--dr) + var(--float-r)));
          }
        }

        @keyframes eg-home-fade-up {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}
    </style>
  );
}

function SearchMenuContent({
  hasQuery,
  isLoading,
  searchError,
  hasSearched,
  results,
  onSelect,
}: {
  hasQuery: boolean;
  isLoading: boolean;
  searchError: string | null;
  hasSearched: boolean;
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
}) {
  if (hasQuery && isLoading) {
    return <SearchMessage>Carico i risultati...</SearchMessage>;
  }

  if (hasQuery && searchError) {
    return <SearchMessage>{searchError}</SearchMessage>;
  }

  if (results.length > 0) {
    return results.map((result) => (
      <li key={result.id} className="border-b border-eg-border last:border-b-0">
        <button
          type="button"
          className="block w-full border-0 bg-transparent px-[15px] py-3 text-left font-sans text-sm text-eg-text-muted transition-colors hover:bg-eg-surface-muted hover:text-eg-ink"
          onMouseDown={() => onSelect(result)}
        >
          {result.name}
        </button>
      </li>
    ));
  }

  if (hasQuery && hasSearched) {
    return <SearchMessage>Nessun risultato trovato</SearchMessage>;
  }

  return null;
}

function SearchMessage({ children }: { children: string }) {
  return (
    <li className="border-b border-eg-border last:border-b-0">
      <span className="block w-full border-0 bg-transparent px-[15px] py-3 text-left font-sans text-sm text-eg-text-muted">
        {children}
      </span>
    </li>
  );
}
