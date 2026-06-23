"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { TaxonomySearchResult } from "@esigenta/taxonomy";

import { HomeImage } from "./home-image";

import { getHomeSystems } from "./systems";
import { cc, ccFont, ccPhotoGrade, ccSlabShadow } from "../shell/palette";
import { ArrowRightIcon } from "../shell/icons";
import { Reveal } from "./reveal";

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults(preloadedResults);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const controller = new AbortController();

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/taxonomy/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          return;
        }

        setResults((await response.json()) as TaxonomySearchResult[]);
      } catch {
        // Aborted request — ignored intentionally.
      }
    }, 180);

    return () => {
      controller.abort();

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  function goToResult(result: TaxonomySearchResult) {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    const qs = params.toString();

    router.push(`/richiesta/${encodeURIComponent(result.slug)}${qs ? `?${qs}` : ""}`);
  }

  const showDropdown = isFocused && results.length > 0;

  return (
    <section
      style={{
        ...ccFont,
        backgroundColor: cc.linen,
        backgroundImage: `linear-gradient(180deg, ${cc.paper} 0%, ${cc.linen} 100%)`,
      }}
      className="overflow-hidden"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col px-5 pb-20 pt-16 sm:px-10 sm:pt-20 md:px-12 md:pb-28 md:pt-24 lg:px-16">
        <h1
          className="order-1 max-w-[18ch] font-medium leading-[1.02] tracking-[-0.02em] text-[clamp(2.5rem,1.6rem+5vw,5.75rem)]"
          style={{ color: cc.ink }}
        >
          Bagni, tetti, impianti elettrici. Vicino a te.
        </h1>

        <p className="order-2 mt-5 max-w-[36ch] text-[17px] leading-[1.5]" style={{ color: cc.inkSecondary }}>
          Ogni mestiere della tua casa, scomposto e affidato a un professionista verificato.
        </p>

        <div className="mt-14 hidden items-start gap-6 overflow-visible md:order-3 md:flex">
          {systems.map((system, index) => {
            const layout = desktopSlabs[index % desktopSlabs.length]!;

            return (
              <Reveal key={system.slug} delayMs={index * 90} className={`shrink-0 ${layout.width} ${layout.shift}`}>
                <a href={system.href} className="group block">
                  <div
                    className={`relative overflow-hidden rounded-[4px] border-[6px] ${layout.aspect} ${layout.rotate} transition-transform duration-300 group-hover:rotate-0`}
                    style={{ borderColor: "#FFFFFF", boxShadow: ccSlabShadow }}
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

        <div className="order-5 mt-10 flex flex-col gap-5 md:hidden">
          {systems.map((system, index) => {
            const layout = mobileSlabs[index % mobileSlabs.length]!;

            return (
              <Reveal key={system.slug} delayMs={index * 70} className={`flex w-[78%] flex-col ${layout.align}`}>
                <a href={system.href} className={`block ${layout.rotate}`}>
                  <div
                    className="relative aspect-[4/3] overflow-hidden rounded-[4px] border-[5px]"
                    style={{ borderColor: "#FFFFFF", boxShadow: ccSlabShadow }}
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

        <p className="order-3 mt-16 text-[12px] uppercase tracking-[0.1em] md:order-4 md:mt-20" style={{ color: cc.inkSecondary }}>
          Cosa devi sistemare?
        </p>

        <div className="relative order-4 mt-3 max-w-2xl md:order-5">
          <div
            className="flex h-16 items-center gap-2 border-b border-t-2 pl-1 pr-1.5 transition-shadow duration-300"
            style={{
              borderTopColor: cc.accent,
              borderBottomColor: cc.hairline,
              boxShadow: isFocused
                ? `0 0 0 1px ${cc.accent}, 0 0 28px -4px ${cc.accent}AA`
                : `0 0 18px -8px ${cc.accent}66`,
            }}
          >
            <input
              type="text"
              value={query}
              onFocus={() => {
                setIsFocused(true);

                if (query.trim() === "") {
                  setResults(preloadedResults);
                }
              }}
              onBlur={() => {
                setTimeout(() => setIsFocused(false), 150);
              }}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && results[0]) {
                  event.preventDefault();
                  goToResult(results[0]);
                }
              }}
              placeholder="ad esempio: tinteggiatura"
              className="h-full min-w-0 flex-1 bg-transparent text-[20px] outline-none"
              style={{ color: cc.ink }}
            />

            <button
              type="button"
              aria-label="Avvia ricerca"
              onClick={() => {
                if (results[0]) {
                  goToResult(results[0]);
                }
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] transition-colors"
              style={{ backgroundColor: cc.accent, color: cc.paper }}
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>

          {showDropdown ? (
            <ul
              className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-[8px] border"
              style={{ borderColor: cc.hairline, backgroundColor: cc.paper, boxShadow: ccSlabShadow }}
            >
              {results.map((result) => (
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
              ))}
            </ul>
          ) : null}
        </div>

        <a
          href="/servizi"
          className="group order-6 mt-6 inline-flex w-fit items-center gap-1.5 self-start text-[14px]"
          style={{ color: cc.inkSecondary }}
        >
          Esplora tutti gli interventi
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}
