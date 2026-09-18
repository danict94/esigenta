import Link from "next/link";

import type { PublicProfessionHubItem } from "@esigenta/taxonomy/public-professions";

import { Reveal } from "../shared/reveal";

export function HomeProfessionsSection({
  professions,
}: {
  professions: readonly PublicProfessionHubItem[];
}) {
  return (
    <section
      className="relative z-1 py-20 max-[600px]:py-16"
      aria-labelledby="home-professions-title"
    >
      <div className="eg-container">
        <Reveal>
          <p className="mb-5 font-(family-name:--eg-font-primary) text-[13px] font-semibold text-eg-accent">
            Professionisti
          </p>
        </Reveal>

        <div className="grid gap-10 min-[861px]:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] min-[861px]:gap-16">
          <Reveal>
            <div className="max-w-[510px]">
              <h2 id="home-professions-title" className="eg-h2 text-balance">
                Cerca professionisti vicino a te
              </h2>
              <p className="eg-body-muted mt-4 max-w-[48ch] text-[15px] leading-[1.6]">
                Trova il professionista pi&ugrave; adatto al lavoro che devi
                realizzare. Esplora le professioni disponibili oppure parti
                direttamente dalla tua esigenza.
              </p>
            </div>
          </Reveal>

          <Reveal delayMs={90}>
            <div>
              <ul className="grid grid-cols-1 border-t border-eg-border min-[601px]:grid-cols-2 min-[601px]:gap-x-8">
                {professions.map((profession) => (
                  <li key={profession.slug} className="border-b border-eg-border">
                    <Link
                      href={`/professionisti/${profession.slug}`}
                      prefetch={false}
                      className="group flex items-center justify-between gap-4 py-4 font-(family-name:--eg-font-primary) text-[15px] font-semibold text-eg-ink no-underline transition-colors hover:text-eg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-eg-brand"
                    >
                      {profession.name}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        className="size-4 shrink-0 text-eg-accent transition-transform duration-200 ease-(--eg-ease-brand) group-hover:translate-x-1"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/professionisti"
                prefetch={false}
                className="eg-button-primary mt-7 flex w-full justify-center min-[601px]:inline-flex min-[601px]:w-auto"
              >
                Esplora tutti i professionisti
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
