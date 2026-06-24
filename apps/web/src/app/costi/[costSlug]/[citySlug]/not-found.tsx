import Link from "next/link";

import { PageShell, cn } from "@esigenta/ui";

export default function CityCostGuideNotFound() {
  return (
    <PageShell size="lg">
      <section className="mx-auto max-w-2xl space-y-5 py-12 text-center">
        <h1 className="text-4xl font-semibold leading-tight text-cantiere-ink">
          Guida costi città non trovata
        </h1>

        <p className="text-base leading-7 text-cantiere-ink-secondary">
          La guida richiesta non è disponibile o non supera il quality gate.
        </p>

        <Link
          href="/costi/ristrutturare-bagno"
          className={cn(
            "inline-flex items-center justify-center font-medium transition-colors",
            "rounded-[8px]",
            "h-12 px-6 text-[15px]",
            "border border-cantiere-accent bg-cantiere-accent text-cantiere-paper hover:border-cantiere-accent-hover hover:bg-cantiere-accent-hover",
            "w-full sm:w-auto",
          )}
        >
          Torna alla guida bagno
        </Link>
      </section>
    </PageShell>
  );
}
