import type { ReactNode } from "react";

import Link from "next/link";

import { ProEyebrow } from "./pro-primitives";

type ProHeroProps = {
  children: ReactNode;
};

export function ProHero({ children }: ProHeroProps) {
  return (
    <section
      className="eg-theme-ink relative z-2 overflow-hidden pt-[calc(var(--eg-nav-height)+64px)] pb-20"
      aria-labelledby="business-title"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 12% 90%, color-mix(in srgb, var(--eg-color-brand) 40%, transparent), transparent 55%)",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="eg-container relative grid items-start gap-14 min-[861px]:grid-cols-[1fr_1.05fr]">
        <div>
          <ProEyebrow tone="light">Per professionisti e imprese</ProEyebrow>
          <h1
            id="business-title"
            className="eg-h1 mt-4.5 mb-4.5 max-w-130 text-balance"
          >
            Il lavoro giusto arriva <strong className="eg-hero-emphasis font-semibold">gia organizzato.</strong>
          </h1>
          <p className="eg-body max-w-110 text-eg-on-brand-muted">
            Niente piu preventivi a vuoto o clienti che non richiamano. Ricevi
            richieste reali, verificate e nella tua zona. Paghi il contatto
            solo quando e davvero valido.
          </p>
          <p className="mt-5 text-sm text-eg-on-brand-muted">
            Hai gia un profilo?{" "}
            <Link
              href="/area-impresa/accedi"
              prefetch={false}
              className="font-semibold text-eg-brand-on-dark hover:underline"
            >
              Accedi all&apos;area impresa <span aria-hidden="true">&rarr;</span>
            </Link>
          </p>
        </div>

        <div id="inizia" aria-label="Configura il profilo professionista" className="scroll-mt-28">
          {children}
        </div>
      </div>
    </section>
  );
}
