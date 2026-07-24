import Link from "next/link";

import type { CostHubCategoryGroup } from "../engine/cost-hub";
import { PublicShell } from "../../shell/public-shell";

export type CostHubPageProps = {
  categories: readonly CostHubCategoryGroup[];
};

export function CostHubPage({ categories }: CostHubPageProps) {
  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container">
            <div className="mx-auto max-w-[760px] text-center">
              <nav aria-label="Breadcrumb" className="eg-nav-link mb-10">
                <Link href="/" prefetch={false}>
                  Home
                </Link>
                <span aria-hidden="true" className="mx-3 text-eg-text-muted">
                  /
                </span>
                <span className="text-eg-ink">Guide ai costi</span>
              </nav>

              <p className="eg-eyebrow">Guide ai costi</p>
              <h1 className="eg-h1 mt-5">Prezzi chiari prima del preventivo.</h1>
              <p className="mx-auto mt-[22px] max-w-[44ch] text-base leading-[1.65] text-eg-text-muted">
                Range indicativi, fattori che cambiano il prezzo e domande utili
                da fare prima di raccontare il lavoro.
              </p>
            </div>

            {categories.length > 0 ? (
              <div className="mt-16 grid gap-14">
                {categories.map((category) => (
                  <section
                    key={category.slug}
                    aria-labelledby={`categoria-costi-${category.slug}`}
                  >
                    <div className="mx-auto max-w-[760px] text-center">
                      <p className="eg-eyebrow">Categoria</p>
                      <h2 id={`categoria-costi-${category.slug}`} className="eg-h2 mt-4">
                        {category.name}
                      </h2>
                    </div>

                    <ul className="mt-[54px] border-t border-eg-border max-[860px]:mt-[38px]">
                      {category.guides.map((guide, index) => (
                        <li key={guide.slug}>
                          <Link
                            href={guide.canonicalPath}
                            className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-6 border-b border-eg-border py-6 text-eg-ink max-[860px]:grid-cols-[44px_minmax(0,1fr)] max-[860px]:gap-3.5 max-[860px]:py-[22px] transition-colors hover:text-eg-brand-strong"
                          >
                            <span
                              aria-hidden="true"
                              data-nosnippet=""
                              className="font-(family-name:--eg-font-ui) text-xs uppercase tracking-[0.12em] text-eg-brand-strong"
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            {" "}
                            <span>
                              <span className="text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.12] tracking-[-0.01em] block">{guide.h1}</span>
                              <span className="mt-2.5 max-w-[44ch] text-[15px] leading-[1.55] text-eg-text-muted block">
                                {guide.summary}
                              </span>
                            </span>
                            <span className="justify-self-end whitespace-nowrap font-(family-name:--eg-font-ui) text-[11px] uppercase tracking-[0.12em] text-eg-text-muted max-[860px]:col-start-2 max-[860px]:mt-1 max-[860px]:justify-self-start">Apri &rarr;</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : (
              <p className="eg-body-muted mx-auto mt-12 max-w-[46ch] text-center">
                Le guide ai costi sono in preparazione. Torna a trovarci presto.
              </p>
            )}
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
