import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn, tokens } from "@esigenta/ui";

import { listCostGuides } from "../seo/pages/costi";
import { HomeContentRail } from "../shell/home-content-rail";

export function CostGuides() {
  const guides = listCostGuides();

  if (guides.length === 0) {
    return null;
  }

  return (
    <section className={tokens.home.section}>
      <HomeContentRail>
        <div className="max-w-3xl">
          <p className={tokens.home.sectionLabel}>Consigli</p>

          <h2 className={cn("mt-2", tokens.home.sectionTitle)}>
            Guide ai costi
          </h2>

          <p className={cn("mt-4", tokens.home.sectionDescription)}>
            Prezzi indicativi, fattori che incidono sul preventivo e cosa
            valutare prima di richiedere un intervento.
          </p>
        </div>

        <ul className="mt-9 divide-y divide-border-primary border-y border-border-primary">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={guide.canonicalPath}
                className="flex items-center justify-between gap-4 py-5 text-text-primary transition-colors hover:text-action-primary"
              >
                <span className="text-base font-medium leading-6">
                  {guide.h1}
                </span>

                <ArrowRight
                  className="size-4 shrink-0 text-text-muted"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex justify-end">
          <Link
            href="/costi"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-primary underline underline-offset-4 transition-colors hover:text-action-primary"
          >
            <ArrowRight
              className="size-5 text-action-primary"
              aria-hidden="true"
            />
            Vedi tutte le guide
          </Link>
        </div>
      </HomeContentRail>
    </section>
  );
}
