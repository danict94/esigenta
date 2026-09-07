"use client";

import React, { useState } from "react";

import {
  DirectoryAction,
  DirectoryGroupHeader,
  DirectoryItemSummary,
  DirectoryItemTitle,
} from "../../shared/directory-primitives";
import {
  blueprintTitleClassName,
  SectionHeader,
} from "../../shared/section-header";

export type CostHubCatalogGuide = {
  readonly slug: string;
  readonly href: string;
  readonly title: string;
  readonly summary: string;
  readonly sourceType?: "official" | "mixed";
};

export type CostHubCatalogCategory = {
  readonly slug: string;
  readonly name: string;
  readonly guides: readonly CostHubCatalogGuide[];
};

const ALL_GUIDES_FILTER = "all";

export function filterCostHubCategories(
  categories: readonly CostHubCatalogCategory[],
  selectedCategorySlug: string,
): readonly CostHubCatalogCategory[] {
  if (selectedCategorySlug === ALL_GUIDES_FILTER) {
    return categories;
  }

  return categories.filter(({ slug }) => slug === selectedCategorySlug);
}

export function CostHubCatalog({
  categories,
}: {
  readonly categories: readonly CostHubCatalogCategory[];
}) {
  const [selectedCategorySlug, setSelectedCategorySlug] =
    useState(ALL_GUIDES_FILTER);
  const visibleCategories = filterCostHubCategories(
    categories,
    selectedCategorySlug,
  );
  const visibleGuideCount = visibleCategories.reduce(
    (total, category) => total + category.guides.length,
    0,
  );

  if (categories.length === 0) {
    return (
      <p className="py-8 text-[14px] leading-[1.6] text-eg-text-muted">
        Le guide ai costi sono in preparazione. Torna a trovarci presto.
      </p>
    );
  }

  return (
    <>
      <nav
        aria-label="Filtra le guide per area"
        className="-mx-[22px] flex gap-5 overflow-x-auto border-y border-eg-border px-[22px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6 min-[861px]:mx-0 min-[861px]:px-0"
      >
        <CostHubFilterButton
          active={selectedCategorySlug === ALL_GUIDES_FILTER}
          onSelect={() => setSelectedCategorySlug(ALL_GUIDES_FILTER)}
        >
          Tutte le guide
        </CostHubFilterButton>
        {categories.map((category) => (
          <CostHubFilterButton
            key={category.slug}
            active={selectedCategorySlug === category.slug}
            onSelect={() => setSelectedCategorySlug(category.slug)}
          >
            {category.name}
          </CostHubFilterButton>
        ))}
      </nav>

      <div className="flex flex-col gap-2 pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div>
          <SectionHeader
            id="cost-guide-catalog-title"
            title="Guide ai costi per intervento"
            align="left"
            titleClassName={blueprintTitleClassName}
          />
          <p className="mt-2 max-w-[690px] text-[13px] leading-[1.55] text-eg-text-muted sm:text-[14px]">
            Parti dal lavoro che devi realizzare e approfondisci prezzi,
            lavorazioni e fattori che possono modificare il preventivo.
          </p>
        </div>
        <p aria-live="polite" className="shrink-0 text-[12px] text-eg-text-muted">
          {visibleGuideCount} {visibleGuideCount === 1 ? "guida" : "guide"}
        </p>
      </div>

      <div aria-labelledby="cost-guide-catalog-title">
        {visibleCategories.map((category) => (
          <section key={category.slug} className="pt-5" data-cost-hub-group={category.slug}>
            <DirectoryGroupHeader
              title={category.name}
              count={`${category.guides.length} ${
                category.guides.length === 1 ? "guida" : "guide"
              }`}
            />

            <ul className="grid grid-cols-1 border-t border-eg-border min-[701px]:grid-cols-2 min-[701px]:gap-x-9">
              {category.guides.map((guide) => (
                <CostHubGuideItem key={guide.slug} guide={guide} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

function CostHubFilterButton({
  active,
  children,
  onSelect,
}: {
  readonly active: boolean;
  readonly children: React.ReactNode;
  readonly onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={`relative shrink-0 border-0 bg-transparent py-3.5 text-[11.5px] font-semibold whitespace-nowrap transition-colors hover:text-eg-ink sm:text-[12px] ${
        active
          ? "text-eg-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-eg-brand-hover after:content-['']"
          : "text-eg-text-muted"
      }`}
    >
      {children}
    </button>
  );
}

function CostHubGuideItem({ guide }: { guide: CostHubCatalogGuide }) {
  return (
    <li className="min-w-0 border-b border-eg-border">
      <div className="group relative flex h-full min-w-0 flex-col py-4.5 text-eg-ink transition-[padding-left] duration-200 ease-(--eg-ease-brand) hover:pl-2">
        <DirectoryItemTitle
          headingLevel={4}
          className="transition-colors group-hover:text-eg-brand-hover"
        >
          {guide.title}
        </DirectoryItemTitle>

        {guide.sourceType === "official" ? (
          <p className="mt-1.5 text-[11px] leading-[1.4] text-eg-text-muted">
            <strong className="font-semibold text-eg-brand-strong">Fonte:</strong>{" "}
            prezzario ufficiale
          </p>
        ) : null}

        <DirectoryItemSummary className="mt-2 flex-1">
          {guide.summary}
        </DirectoryItemSummary>

        <DirectoryAction
          href={guide.href}
          className="mt-3.5 self-end after:absolute after:inset-0"
        >
          Apri la guida
        </DirectoryAction>
      </div>
    </li>
  );
}
