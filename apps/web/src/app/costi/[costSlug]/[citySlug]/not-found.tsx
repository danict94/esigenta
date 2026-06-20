import Link from "next/link";

import { PageShell, cn, tokens } from "@esigenta/ui";

export default function CityCostGuideNotFound() {
  return (
    <PageShell size="lg">
      <section className="mx-auto max-w-2xl space-y-5 py-12 text-center">
        <h1 className="text-4xl font-semibold leading-tight text-text-primary">
          Guida costi città non trovata
        </h1>

        <p className="text-base leading-7 text-text-secondary">
          La guida richiesta non è disponibile o non supera il quality gate.
        </p>

        <Link
          href="/costi/ristrutturare-bagno"
          className={cn(
            tokens.interactive.base,
            tokens.interactive.radius,
            tokens.interactive.sizes.lg,
            tokens.interactive.variants.brand,
            "w-full sm:w-auto",
          )}
        >
          Torna alla guida bagno
        </Link>
      </section>
    </PageShell>
  );
}
