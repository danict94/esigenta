import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageShell, cn } from "@esigenta/ui";

import type { CostHubCategoryGroup } from "../engine/cost-hub";
import { SeoBreadcrumb } from "./seo-breadcrumb";

export type CostHubPageProps = {
  categories: readonly CostHubCategoryGroup[];
};

export function CostHubPage({ categories }: CostHubPageProps) {
  return (
    <PageShell size="lg">
      <div className="space-y-10 md:space-y-12">
        <div className="max-w-3xl space-y-5">
          <SeoBreadcrumb
            items={[{ label: "Home", href: "/" }, { label: "Guide ai costi" }]}
          />

          <h1 className="text-4xl font-semibold leading-tight text-cantiere-ink md:text-5xl">
            Guide ai costi
          </h1>

          <p className="text-lg leading-8 text-cantiere-ink-secondary">
            Range di prezzo indicativi, fattori che incidono sul preventivo e
            domande utili da fare prima di richiedere un intervento.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="space-y-10">
            {categories.map((category) => (
              <section
                key={category.slug}
                aria-labelledby={`categoria-costi-${category.slug}`}
              >
                <h2
                  id={`categoria-costi-${category.slug}`}
                  className="text-2xl font-semibold leading-8 text-cantiere-ink"
                >
                  {category.name}
                </h2>

                <ul
                  className={cn(
                    "rounded-[8px]",
                    "mt-4 divide-y divide-border-primary overflow-hidden border border-cantiere-hairline bg-cantiere-paper",
                  )}
                >
                  {category.guides.map((guide) => (
                    <li key={guide.slug}>
                      <Link
                        href={guide.canonicalPath}
                        className="flex items-center justify-between gap-4 px-5 py-5 transition-colors hover:bg-cantiere-surface md:px-6"
                      >
                        <span className="space-y-1">
                          <span className="block text-base font-semibold leading-6 text-cantiere-ink">
                            {guide.h1}
                          </span>
                          <span className="line-clamp-2 block text-sm leading-6 text-cantiere-ink-secondary">
                            {guide.summary}
                          </span>
                        </span>

                        <ArrowRight
                          className="size-4 shrink-0 text-cantiere-ink-secondary"
                          aria-hidden={true}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <p className="text-base leading-7 text-cantiere-ink-secondary">
            Le guide ai costi sono in preparazione. Torna a trovarci presto.
          </p>
        )}
      </div>
    </PageShell>
  );
}
