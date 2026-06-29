"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { TaxonomySearchResult } from "@esigenta/taxonomy";

import { HomeImage } from "./home-image";

import { getHomeSystems } from "./systems";
import { cc, ccElevation, ccFont, ccPhotoGrade, ccSlabShadow } from "../shell/palette";
import { ArrowRightIcon } from "../shell/icons";
import { Reveal } from "./reveal";

const MIN_SEARCH_QUERY_LENGTH = 3;
const SEARCH_ERROR_MESSAGE = "Non riesco a caricare i risultati ora";

const preloadedResults: TaxonomySearchResult[] = [
  {
    id: "preload-1",
    type: "INTERVENTION",
    name: "Ristrutturare bagno",
    slug: "ristrutturare-bagno",
    description: null,
    relevance: 100,
  },
  {
    id: "preload-2",
    type: "INTERVENTION",
    name: "Riparare perdita acqua",
    slug: "riparare-perdita-acqua",
    description: null,
    relevance: 100,
  },
];

type DesktopSlab = {
  width: string;
  aspect: string;
  rotate: string;
  shift: string;
};

const desktopSlabs: DesktopSlab[] = [
  { width: "w-[280px]", aspect: "aspect-[4/5]", rotate: "-rotate-3", shift: "mt-0" },
  { width: "w-[210px]", aspect: "aspect-square", rotate: "rotate-2", shift: "mt-16" },
  { width: "w-[240px]", aspect: "aspect-[4/5]", rotate: "-rotate-2", shift: "-mt-4" },
  { width: "w-[190px]", aspect: "aspect-square", rotate: "rotate-3", shift: "mt-10" },
  { width: "w-[240px]", aspect: "aspect-[4/5]", rotate: "-rotate-4", shift: "mt-1" },
];

const mobileSlabs: { rotate: string; align: string }[] = [
  { rotate: "-rotate-2", align: "self-start" },
  { rotate: "rotate-2", align: "self-end" },
  { rotate: "-rotate-3", align: "self-start" },
  { rotate: "rotate-3", align: "self-end" },
  { rotate: "-rotate-1", align: "self-start" },
];

export function Explosion() {
  const router = useRouter();
  const systems = getHomeSystems().slice(0, 5);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TaxonomySearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (trimmed.length < MIN_SEARCH_QUERY_LENGTH) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      setSearchError(null);

      return;
    }

    const controller = new AbortController();

    setResults([]);
    setIsLoading(true);
    setHasSearched(false);
    setSearchError(null);

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/taxonomy/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          setResults([]);
          setHasSearched(true);
          setSearchError(SEARCH_ERROR_MESSAGE);

          return;
        }

        setResults((await response.json()) as TaxonomySearchResult[]);
        setHasSearched(true);
        setSearchError(null);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setResults([]);
        setHasSearched(true);
        setSearchError(SEARCH_ERROR_MESSAGE);
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

  function keepDropdownInView() {
    const rect = searchRef.current?.getBoundingClientRect();

    if (!rect || rect.bottom + 220 <= window.innerHeight) {
      return;
    }

    searchRef.current?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }

  function goToResult(result: TaxonomySearchResult) {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    const qs = params.toString();

    router.push(`/richiesta/${encodeURIComponent(result.slug)}${qs ? `?${qs}` : ""}`);
  }

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;
  const isSearchQueryValid = trimmedQuery.length >= MIN_SEARCH_QUERY_LENGTH;
  const displayedResults = !hasQuery
    ? preloadedResults
    : isSearchQueryValid
      ? results
      : [];
  const showDropdown =
    isFocused &&
    ((!hasQuery && preloadedResults.length > 0) ||
      (isSearchQueryValid &&
        (isLoading ||
          searchError !== null ||
          hasSearched ||
          displayedResults.length > 0)));

  return (
    <>
    <section style={ccFont} className="overflow-visible bg-white">
      <div className="mx-auto flex max-w-[1280px] flex-col px-5 pb-12 pt-(--fp-nav-clear) sm:px-10 md:px-12 md:pb-16 lg:px-16">
        <h1
          className="max-w-[18ch] text-cantiere-display"
          style={{ color: cc.ink }}
        >
          Bagni, tetti, impianti elettrici. Vicino a te.
        </h1>

        <p className="mt-5 max-w-[36ch] text-[17px] leading-[1.5]" style={{ color: cc.inkSecondary }}>
          Ogni mestiere della tua casa, scomposto e affidato a un professionista verificato.
        </p>

        <p className="mt-10 text-[12px] uppercase tracking-[0.1em] md:mt-12" style={{ color: cc.inkSecondary }}>
          Cosa devi sistemare?
        </p>

        <div ref={searchRef} className="relative z-[60] mt-3 w-full max-w-2xl">
          <div
            className="flex h-16 items-center gap-2 rounded-[10px] border bg-white pl-5 pr-2 transition-shadow duration-300"
            style={{
              borderColor: isFocused ? cc.accent : cc.hairline,
              boxShadow: isFocused
                ? `0 0 0 4px ${cc.accent}1F, ${ccElevation}`
                : ccElevation,
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
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && displayedResults[0]) {
                  event.preventDefault();
                  goToResult(displayedResults[0]);
                }
              }}
              aria-label="Cosa devi sistemare?"
              placeholder="ad esempio: tinteggiatura"
              className="h-full min-w-0 flex-1 bg-transparent text-[18px] outline-none"
              style={{ color: cc.ink }}
            />

            <button
              type="button"
              aria-label="Avvia ricerca interventi"
              onClick={() => {
                if (displayedResults[0]) {
                  goToResult(displayedResults[0]);
                }
              }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] transition-colors"
              style={{ backgroundColor: cc.accent, color: cc.paper }}
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>

          {showDropdown ? (
            <ul
              className="absolute left-0 right-0 top-full z-[70] mt-2 overflow-hidden rounded-[8px] border"
              style={{ borderColor: cc.hairline, backgroundColor: "#FFFFFF", boxShadow: ccSlabShadow }}
            >
              {hasQuery && isLoading ? (
                <li className="px-4 py-3 text-[14px]" style={{ color: cc.inkSecondary }}>
                  Carico i risultati...
                </li>
              ) : hasQuery && searchError ? (
                <li className="px-4 py-3 text-[14px]" style={{ color: cc.inkSecondary }}>
                  {searchError}
                </li>
              ) : displayedResults.length > 0 ? (
                displayedResults.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => goToResult(result)}
                      className="block w-full px-4 py-3 text-left text-[15px] transition-colors hover:bg-black/5"
                      style={{ color: cc.ink }}
                    >
                      {result.name}
                    </button>
                  </li>
                ))
              ) : hasQuery && hasSearched ? (
                <li className="px-4 py-3 text-[14px]" style={{ color: cc.inkSecondary }}>
                  Nessun risultato trovato
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>

      </div>
    </section>

    <section style={ccFont} className="overflow-visible bg-cantiere-paper">
      <div className="mx-auto flex max-w-[1280px] flex-col px-5 py-12 sm:px-10 md:px-12 md:py-16 lg:px-16">
        <div className="hidden items-start gap-6 overflow-visible md:flex">
          {systems.map((system, index) => {
            const layout = desktopSlabs[index % desktopSlabs.length]!;

            return (
              <Reveal key={system.slug} delayMs={index * 90} className={`shrink-0 ${layout.width} ${layout.shift}`}>
                <a href={system.href} className="group block">
                  <div
                    className={`relative overflow-hidden rounded-[4px] ${layout.aspect} ${layout.rotate} transition-transform duration-300 group-hover:rotate-0`}
                    style={{ boxShadow: ccSlabShadow }}
                  >
                    <HomeImage
                      src={system.image}
                      alt={system.title}
                      sizes="280px"
                      fallbackLabel={`Foto ${system.title}`}
                      className="absolute inset-0"
                      imageClassName={ccPhotoGrade}
                    />
                  </div>

                  <p className="mt-3 text-[13px]" style={{ color: cc.inkSecondary }}>
                    {system.title}
                  </p>
                </a>
              </Reveal>
            );
          })}
        </div>

        <div className="flex flex-col gap-5 md:hidden">
          {systems.map((system, index) => {
            const layout = mobileSlabs[index % mobileSlabs.length]!;

            return (
              <Reveal key={system.slug} delayMs={index * 70} className={`flex w-[78%] flex-col ${layout.align}`}>
                <a href={system.href} className={`block ${layout.rotate}`}>
                  <div
                    className="relative aspect-[4/3] overflow-hidden rounded-[4px]"
                    style={{ boxShadow: ccSlabShadow }}
                  >
                    <HomeImage
                      src={system.image}
                      alt={system.title}
                      sizes="78vw"
                      fallbackLabel={`Foto ${system.title}`}
                      className="absolute inset-0"
                      imageClassName={ccPhotoGrade}
                    />
                  </div>

                  <p className="mt-2 text-[13px]" style={{ color: cc.inkSecondary }}>
                    {system.title}
                  </p>
                </a>
              </Reveal>
            );
          })}
        </div>

        <a
          href="/servizi"
          className="group mt-10 inline-flex w-fit items-center gap-1.5 self-start text-[14px]"
          style={{ color: cc.inkSecondary }}
        >
          Esplora tutti gli interventi
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </section>
    </>
  );
}
