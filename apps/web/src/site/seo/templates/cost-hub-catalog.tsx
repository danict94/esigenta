"use client";

import Link from "next/link";
import React, { useState } from "react";

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
  if (categories.length === 0) {
    return (
      <p className="py-8 text-[14px] leading-[1.6] text-eg-text-muted">
        Le guide ai costi sono in preparazione. Torna a trovarci presto.
      </p>
    );
  }

  return (
    <div className="eg-cost-hub-catalog">
      <nav
        aria-label="Filtra le guide per area"
        className="eg-cost-hub-filters"
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

      <div className="eg-cost-hub-families" aria-label="Famiglie di guide ai costi">
        {visibleCategories.map((category) => (
          <section key={category.slug} className="eg-cost-hub-family" data-cost-hub-group={category.slug}>
            <header className="eg-cost-hub-family-header">
              <h3>{category.name}</h3>
              <span>
                {category.guides.length} {category.guides.length === 1 ? "guida" : "guide"}
              </span>
            </header>

            <ul className="eg-cost-hub-guide-surface">
              {category.guides.map((guide) => (
                <CostHubGuideItem key={guide.slug} guide={guide} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
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
    <li className="eg-cost-hub-guide-row">
      <div className="eg-cost-hub-guide-copy">
        <h4>{guide.title}</h4>

        {guide.sourceType === "official" ? (
          <p className="eg-cost-hub-guide-source">
            <strong className="font-semibold text-eg-brand-strong">Fonte:</strong>{" "}
            prezzario ufficiale
          </p>
        ) : null}

        <p className="eg-cost-hub-guide-summary">{guide.summary}</p>
      </div>

      <Link href={guide.href} prefetch={false} className="eg-cost-hub-guide-link">
        Apri la guida
      </Link>
    </li>
  );
}
