import Link from "next/link";

import {
  PageShell,
  cn,
  tokens,
} from "@esigenta/ui";

export default function CostGuideNotFound() {
  return (
    <PageShell size="lg">
      <section className="mx-auto max-w-2xl space-y-5 py-12 text-center">
        <h1 className="text-4xl font-semibold leading-tight text-text-primary">
          Guida costi non trovata
        </h1>

        <p className="text-base leading-7 text-text-secondary">
          La guida richiesta non è disponibile.
        </p>

        <Link
          href="/"
          className={cn(
            tokens.interactive.base,
            tokens.interactive.radius,
            tokens.interactive.sizes.lg,
            tokens.interactive.variants.brand,
            "w-full sm:w-auto",
          )}
        >
          Torna alla home
        </Link>
      </section>
    </PageShell>
  );
}
