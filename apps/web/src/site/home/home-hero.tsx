import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  preloadedResults,
  scatterTags,
  type SearchResult,
} from "./home-content";

const MIN_SEARCH_QUERY_LENGTH = 3;
const SEARCH_ERROR_MESSAGE = "Non riesco a caricare i risultati ora";

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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
    const params = new URLSearchParams();

    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    }

    const qs = params.toString();
    router.push(`/richiesta/${encodeURIComponent(result.slug)}${qs ? `?${qs}` : ""}`);
  }

  function submitSearch() {
    const firstResult = displayedResults[0];

    if (firstResult) {
      goToResult(firstResult);
      return;
    }

    router.push(trimmedQuery ? `/servizi?q=${encodeURIComponent(trimmedQuery)}` : "/servizi");
  }

  return (
    <section
      className="relative z-10 flex h-screen min-h-[680px] items-center justify-center bg-eg-calce"
      aria-labelledby="home-title"
    >
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden opacity-70 min-[861px]:opacity-100" aria-hidden="true">
        {scatterTags.map((tag) => (
          <span
            key={tag.label}
            className="absolute left-1/2 top-[47%] border border-eg-hairline bg-transparent px-2.5 py-[7px] font-mono text-[10px] uppercase tracking-[0.1em] text-eg-ardesia will-change-transform [animation:eg-home-settle_1100ms_cubic-bezier(0.65,0,0.15,1)_both,eg-home-tag-float_7600ms_ease-in-out_infinite] [animation-delay:var(--delay,0ms),calc(var(--delay,0ms)+1100ms)] [transform:translate(var(--dx),var(--dy))_rotate(var(--dr))] min-[861px]:px-3 min-[861px]:py-2 min-[861px]:text-xs"
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
        <p className="eg-eyebrow">Metodo Esigenta</p>
        <h1 id="home-title" className="eg-h1 mt-5">
          Trasformiamo il caos di casa in <strong>un percorso</strong> chiaro e affidabile.
        </h1>
        <p className="mx-auto mt-[22px] max-w-[44ch] text-base leading-[1.65] text-eg-ardesia">
          Non un elenco infinito di preventivi. Un percorso che puoi seguire, passo dopo passo,
          fino alla scelta giusta.
        </p>

        <div ref={searchRef} className="relative z-[4] mt-[38px] inline-block w-[min(100%,42ch)] max-[860px]:w-[min(100%,200px)]">
          <p className="eg-mono-label mb-3">Di cosa hai bisogno?</p>
          <form
            className="inline-flex w-[min(100%,42ch)] items-center gap-3.5 border-b-[1.5px] border-eg-terra bg-transparent pb-2.5 max-[860px]:w-[min(100%,200px)] max-[860px]:gap-2.5"
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
          >
            <input
              type="text"
              value={query}
              onFocus={() => {
                setIsFocused(true);
                keepDropdownInView();
              }}
              onBlur={() => {
                setTimeout(() => setIsFocused(false), 150);
              }}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setQuery(nextQuery);
                resetShortSearch(nextQuery);
              }}
              aria-label="Di cosa hai bisogno?"
              placeholder="ad esempio: bagno"
              className="min-w-0 flex-1 border-0 bg-transparent text-lg leading-8 text-eg-terra outline-none placeholder:text-eg-ardesia-2 max-[860px]:text-base"
            />
            <button
              type="submit"
              className="shrink-0 border-0 bg-transparent font-mono text-[13px] font-medium uppercase tracking-[0.16em] text-eg-cotto-dark transition-colors hover:text-eg-cotto max-[860px]:text-[11px] max-[860px]:tracking-[0.12em]"
            >
              AVVIA <span aria-hidden="true">&rarr;</span>
            </button>
          </form>

          {showDropdown ? (
            <ul
              className="absolute inset-x-0 top-[calc(100%+10px)] z-20 max-h-[min(20rem,40vh)] overflow-y-auto rounded-eg-sm border border-eg-hairline bg-eg-calce text-left shadow-eg-slab"
              aria-label="Risultati suggeriti"
            >
              <SearchMenuContent
                hasQuery={hasQuery}
                isLoading={isLoading}
                searchError={searchError}
                hasSearched={hasSearched}
                results={displayedResults}
                onSelect={goToResult}
              />
            </ul>
          ) : null}
        </div>
      </div>

      <a
        href="#processo"
        className="absolute bottom-8 left-1/2 z-[3] inline-flex -translate-x-1/2 flex-col items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-eg-ardesia-2 after:block after:h-[34px] after:w-px after:bg-eg-ardesia-2 after:content-[''] after:[animation:eg-home-drip_1500ms_ease-in-out_infinite]"
      >
        Scorri
      </a>
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

        @keyframes eg-home-drip {
          0% {
            transform: scaleY(0);
            transform-origin: top;
            opacity: 0;
          }

          35% {
            transform: scaleY(1);
            transform-origin: top;
            opacity: 1;
          }

          70%,
          100% {
            transform: scaleY(0);
            transform-origin: bottom;
            opacity: 0;
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
      <li key={result.id} className="border-b border-eg-hairline last:border-b-0">
        <button
          type="button"
          className="block w-full border-0 bg-transparent px-[15px] py-3 text-left font-sans text-sm text-eg-ardesia transition-colors hover:bg-eg-calce-2 hover:text-eg-terra"
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
    <li className="border-b border-eg-hairline last:border-b-0">
      <span className="block w-full border-0 bg-transparent px-[15px] py-3 text-left font-sans text-sm text-eg-ardesia">
        {children}
      </span>
    </li>
  );
}
