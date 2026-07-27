import type { ReactNode } from "react";

import Link from "next/link";

import { ProEyebrow } from "./pro-primitives";

type ProHeroProps = {
  children: ReactNode;
};

export function ProHero({ children }: ProHeroProps) {
  return (
    <section
      className="relative z-2 overflow-hidden bg-eg-brand-strong pt-[calc(var(--eg-nav-height)+64px)] pb-20 text-eg-on-brand"
      aria-labelledby="business-title"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 12% 90%, color-mix(in srgb, var(--eg-color-brand) 40%, transparent), transparent 55%), linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 32px 32px, 32px 32px",
        backgroundRepeat: "no-repeat, repeat, repeat",
      }}
    >
      <div className="eg-container relative grid items-start gap-14 min-[861px]:grid-cols-[1fr_1.05fr]">
        <div>
          <ProEyebrow tone="light">Per professionisti e imprese</ProEyebrow>
          <h1
            id="business-title"
            className="mt-4.5 mb-4.5 text-balance font-(family-name:--eg-font-brand) text-[clamp(30px,4.2vw,46px)] font-semibold leading-[1.16] tracking-[-0.01em]"
          >
            Il lavoro giusto arriva <strong className="font-semibold text-eg-emphasis-warm">gia organizzato.</strong>
          </h1>
          <p className="max-w-110 text-[16.5px] leading-[1.6] text-eg-on-brand-muted">
            Niente piu preventivi a vuoto o clienti che non richiamano. Ricevi
            richieste reali, verificate e nella tua zona. Paghi il contatto
            solo quando e davvero valido.
          </p>
          <p className="mt-5 text-[13.5px] text-eg-on-brand-muted">
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
