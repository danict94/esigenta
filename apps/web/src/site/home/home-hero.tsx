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

// Aspetto dei post-it (font a penna, ombra, nastro, animazione pin): estratto
// per leggibilita' del JSX, un solo punto dove ritoccarlo.
const NOTE_BASE_CLASSNAME =
  "absolute text-center font-bold leading-[1.15] font-(family-name:--eg-font-script) text-eg-ink shadow-eg-note opacity-0 will-change-transform [animation:eg-note-pin_550ms_var(--eg-ease-brand)_both] [animation-delay:var(--delay,0ms)] before:absolute before:-top-[9px] before:left-1/2 before:h-[14px] before:w-[38px] before:-translate-x-1/2 before:-rotate-2 before:bg-white/60 before:content-['']";

// Sotto la soglia indicata da ScatterTag.minVisibleWidth il post-it e'
// nascosto (replica le regole responsive del riferimento): solo 2 post-it
// non hanno soglia e restano visibili anche sul telefono piu' stretto.
const NOTE_VISIBILITY_CLASSNAME: Record<601 | 861, string> = {
  601: "hidden min-[601px]:block",
  861: "hidden min-[861px]:block",
};

type ScatterStyle = CSSProperties & Record<"--rot" | "--delay", string>;

// Knob LOCALI della Hero (non token canonici): controllano colore, alone e
// griglia della sola Hero. Cambiare --hero-surface ricolora SOLO la Hero,
// nessun token globale toccato. --eg-heading-emphasis e' l'override locale
// letto da .eg-h1 strong (globals.css); qui vale il corallo Emphasis warm.
type HeroStyle = CSSProperties &
  Record<"--hero-surface" | "--hero-glow" | "--hero-grid" | "--eg-heading-emphasis", string>;

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
      className="relative z-10 min-h-[700px] pt-[132px] pb-[86px] text-eg-on-brand min-[861px]:min-h-[760px] min-[861px]:pt-[152px] min-[861px]:pb-[104px]"
      style={
        {
          // Superficie Hero isolata dal resto della pagina: per ricolorare
          // la Hero basta cambiare --hero-surface qui, senza toccare token
          // globali ne' altre sezioni. Riproduzione 1:1 di docs/index.md:
          // Brand strong (cianotipo) — gia' il nostro token, zero colori
          // nuovi introdotti.
          "--hero-surface": "var(--eg-color-brand-strong)",
          // Alone luminoso in stile blueprint, col NOSTRO blu (token Brand
          // chiaro esistente).
          "--hero-glow": "var(--eg-color-brand)",
          // Griglia sottile: sul fondo scuro serve bianco a bassissima
          // opacita' (come il riferimento), non piu' grafite.
          "--hero-grid": "rgba(255, 255, 255, 0.06)",
          // Corallo Emphasis warm: leggibile sopra il cianotipo scuro (il
          // rosso Action/Accent normale vi si spegnerebbe). Letto da
          // .eg-h1 strong e dai marker della lista sotto.
          "--eg-heading-emphasis": "var(--eg-color-emphasis-warm)",
          backgroundColor: "var(--hero-surface)",
          backgroundImage:
            "radial-gradient(ellipse at 78% 18%, color-mix(in srgb, var(--hero-glow) 45%, transparent), transparent 55%), linear-gradient(var(--hero-grid) 1px, transparent 1px), linear-gradient(90deg, var(--hero-grid) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 32px 32px, 32px 32px",
          backgroundRepeat: "no-repeat, repeat, repeat",
        } as HeroStyle
      }
      aria-labelledby="home-title"
    >
      {/* Post-it: un solo rendering a tutte le larghezze (come il
          riferimento). Ogni post-it decide da solo la propria soglia di
          visibilita' via minVisibleWidth: sotto i 601px ne restano visibili
          solo 2, sempre in alto, mai sotto il titolo.
          L'header e' fixed (fuori dal flusso, sovrapposto): il layer parte
          da --eg-nav-height, non dal bordo reale della sezione, altrimenti
          i post-it con top vicino a 0% finiscono sotto l'header (z-index
          piu' basso). --eg-nav-height e' il token esistente dell'header,
          nessun valore nuovo. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-(--eg-nav-height) z-[1] overflow-hidden"
        aria-hidden="true"
      >
        {scatterTags.map((tag) => (
          <span
            key={tag.label}
            className={[
              "w-[clamp(92px,15vw,148px)] px-[clamp(10px,1.8vw,15px)] pt-[clamp(9px,1.6vw,14px)] pb-[clamp(11px,2vw,16px)] text-[clamp(13px,1.9vw,17.5px)]",
              NOTE_BASE_CLASSNAME,
              tag.color === "giallo" ? "bg-eg-nota-giallo" : "bg-eg-nota-carta",
              tag.minVisibleWidth ? NOTE_VISIBILITY_CLASSNAME[tag.minVisibleWidth] : "",
            ].join(" ")}
            style={
              {
                ...tag.position,
                "--rot": tag.rotate,
                "--delay": tag.delay,
              } as ScatterStyle
            }
          >
            {tag.label}
          </span>
        ))}
      </div>

      <div className="relative z-[2] mx-auto w-full max-w-[1180px] px-[22px] min-[861px]:px-12">
        <div className="w-full max-w-[720px] text-left [animation:eg-home-fade-up_900ms_ease_180ms_both]">
          <h1 id="home-title" className="eg-h1 text-balance text-[clamp(32px,5vw,54px)] font-semibold">
            Trasformiamo il caos di casa in <strong className="inline-block whitespace-nowrap font-semibold">un percorso</strong> chiaro e affidabile.
          </h1>
          <p className="mt-[22px] max-w-[44ch] text-balance text-lg leading-[1.6] text-eg-on-brand-muted">
            Descrivi il lavoro, ricevi e confronta proposte da professionisti qualificati.
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
              className="inline-flex shrink-0 min-h-11 items-center justify-center gap-2 rounded-eg-sm border-0 bg-eg-action px-4 font-(family-name:--eg-font-brand) text-[13px] font-semibold uppercase tracking-[0.16em] text-eg-on-brand transition hover:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eg-action min-[601px]:px-5 max-[340px]:w-full max-[860px]:text-[11px] max-[860px]:tracking-[0.12em]"
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
                pendingResultSlug={pendingResultSlug}
                onSelect={selectResult}
              />
            </ul>
          ) : null}
            </div>

            <ul className="eg-form-help mt-4 flex flex-wrap items-center justify-start gap-x-9 gap-y-2 text-eg-on-brand-muted">
              {["Gratuita", "Senza impegno", "Decidi tu"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-2 shrink-0 bg-(--eg-heading-emphasis)" />
                  {item}
                </li>
              ))}
            </ul>
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
        @keyframes eg-note-pin {
          from {
            opacity: 0;
            transform: scale(0.85) rotate(var(--rot, 0deg));
          }

          to {
            opacity: 1;
            transform: scale(1) rotate(var(--rot, 0deg));
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
