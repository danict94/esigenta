import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { storeFunnelQuery } from "../../richiesta/flow/components/resolve-funnel-query";
import { preloadedResults, type SearchResult } from "./home-content";

const MIN_SEARCH_QUERY_LENGTH = 3;
const SEARCH_ERROR_MESSAGE = "Non riesco a caricare i risultati ora";
const SEARCH_VALIDATION_MESSAGE_ID = "home-search-validation";

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
  // Ref = guardia sincrona letta dentro selectResult (mousedown e click dello
  // stesso click fisico arrivano come due eventi nativi separati; una guardia
  // via useState non è garantita committata tra l'uno e l'altro). Lo state
  // gemello serve solo a far ri-renderizzare il bottone con "Apertura...".
  const pendingResultSlugRef = useRef<string | null>(null);
  const [pendingResultSlug, setPendingResultSlug] = useState<string | null>(null);

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

  // Handler centrale per mouse (onMouseDown), touch (mousedown sintetico) e
  // tastiera (onClick da Enter/Space su un button focalizzato): un solo
  // punto che decide se la navigazione parte. La guardia sul ref blocca sia
  // il doppio invio dello stesso click fisico (mousedown poi click sullo
  // stesso bottone) sia click concorrenti su risultati diversi durante una
  // navigazione già in corso.
  function selectResult(result: SearchResult) {
    if (pendingResultSlugRef.current) {
      return;
    }

    pendingResultSlugRef.current = result.slug;
    setPendingResultSlug(result.slug);
    setValidationError(null);

    try {
      goToResult(result);
    } catch {
      // router.push (o storeFunnelQuery) ha lanciato in modo sincrono prima
      // che una navigazione fosse davvero iniziata: sblocca subito, non
      // lasciare la search bloccata in attesa di una navigazione che non
      // partirà mai. router.push non espone una Promise (Next 16: `push():
      // void`), quindi non c'è un segnale asincrono di completamento da
      // attendere qui — il caso di successo si risolve da sé quando questo
      // componente viene smontato dal cambio di route.
      pendingResultSlugRef.current = null;
      setPendingResultSlug(null);
    }
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
      className="eg-theme-hero relative z-10 pt-[132px] pb-[60px] text-eg-on-brand min-[861px]:pt-[152px] min-[861px]:pb-[80px]"
      style={
        {
          backgroundColor: "var(--eg-color-brand-strong)",
          backgroundImage: "url('/assets/images/home/hero.webp')",
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }
      }
      aria-labelledby="home-title"
    >
      <div className="relative z-[2] mx-auto w-full max-w-[1180px] px-[22px] min-[861px]:px-12">
        <div className="relative isolate w-full max-w-[800px] text-left">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-y-10 -left-[22px] right-[-22px] z-0 min-[861px]:-left-10 min-[861px]:right-[-2rem]"
            style={{
              background:
                "radial-gradient(ellipse at 28% 48%, color-mix(in srgb, var(--eg-color-ink) 66%, transparent) 0%, color-mix(in srgb, var(--eg-color-ink) 42%, transparent) 52%, transparent 78%)",
            }}
          />
          {/* H1 fuori dal wrapper animato: e' il testo piu' grande sopra la
              piega (candidato LCP) e non deve dipendere da opacity:0 ne' da
              un animation-delay per essere dipinto. Paragrafo e form restano
              nel blocco che si anima. */}
          <h1 id="home-title" className="eg-h1 relative z-1 max-w-[18ch] text-balance text-[clamp(32px,5vw,54px)] leading-[1.1] tracking-[-0.02em]">
            Trasformiamo il caos di casa in <strong className="eg-hero-emphasis inline-block whitespace-nowrap">un percorso</strong> chiaro e affidabile.
          </h1>

          <div className="relative z-1 [animation:eg-home-fade-up_900ms_ease_180ms_both]">
          <p className="mt-[22px] max-w-[44ch] text-balance text-lg leading-[1.6] text-eg-on-brand-muted">
            Domande mirate per far arrivare la tua richiesta ai professionisti più adatti.
          </p>

          <div ref={searchRef} className="relative z-[4] mt-[38px] w-full max-w-[600px] text-left">
            <p className="eg-form-eyebrow mb-3 text-eg-on-brand-muted font-semibold min-[601px]:mb-5">Di cosa hai bisogno?</p>

            {/* Contesto di posizionamento STRETTO per il dropdown: solo
                form+validazione, non l'intero blocco (che include anche la
                lista "Gratuita/Senza impegno/Decidi tu" sotto). Altrimenti
                top:100% si calcola sull'altezza dell'intero contenitore,
                comprese le voci sotto il form, e il dropdown appare molto
                piu' in basso di quanto dovrebbe — e piu' in basso vuol dire
                anche piu' vicino al bordo della Hero, che lo tronca. */}
            <div className="relative">
          <form
            className="flex w-full min-h-[60px] items-center gap-2 rounded-eg-sm border border-transparent bg-eg-surface py-2 pl-4 pr-1.5 shadow-eg-slab transition-colors focus-within:border-eg-brand min-[601px]:pl-5 min-[601px]:pr-2 max-[340px]:flex-col max-[340px]:items-stretch"
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
              className="eg-button-primary eg-button-arrow shrink-0 max-[340px]:w-full"
            >
              Cerca
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
                pendingResultSlug={pendingResultSlug}
                onSelect={selectResult}
              />
            </ul>
          ) : null}
            </div>

            <p className="eg-form-help mt-4 max-w-[52ch] text-left text-eg-on-brand-muted">
              Richiedere &egrave; gratuito e senza impegno. Decidi tu se e con chi proseguire.
            </p>
          </div>
          </div>
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
  pendingResultSlug,
  onSelect,
}: {
  hasQuery: boolean;
  isLoading: boolean;
  searchError: string | null;
  hasSearched: boolean;
  results: SearchResult[];
  pendingResultSlug: string | null;
  onSelect: (result: SearchResult) => void;
}) {
  if (hasQuery && isLoading) {
    return <SearchMessage>Carico i risultati...</SearchMessage>;
  }

  if (hasQuery && searchError) {
    return <SearchMessage>{searchError}</SearchMessage>;
  }

  if (results.length > 0) {
    return results.map((result) => {
      const isPending = result.slug === pendingResultSlug;

      return (
        <li key={result.id} className="border-b border-eg-border last:border-b-0">
          <button
            type="button"
            aria-disabled={isPending ? true : undefined}
            className="block w-full border-0 bg-transparent px-[15px] py-3 text-left font-sans text-sm text-eg-text-muted transition-colors hover:bg-eg-surface-muted hover:text-eg-ink"
            onMouseDown={(event) => {
              // Solo il pulsante sinistro deve avviare la navigazione: il
              // browser invia mousedown anche per destro/centrale (menu
              // contestuale, apertura in nuova scheda via rotellina), che
              // non devono innescare selectResult.
              if (event.button !== 0) return;
              onSelect(result);
            }}
            onClick={() => onSelect(result)}
          >
            {result.name}
            {isPending ? <span className="ml-2 text-xs">Apertura...</span> : null}
          </button>
        </li>
      );
    });
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
