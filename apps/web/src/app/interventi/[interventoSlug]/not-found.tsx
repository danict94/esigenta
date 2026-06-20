import Link from "next/link";

import { Card, CardContent, PageShell, cn, tokens } from "@esigenta/ui";

export default function InterventionSeoNotFound() {
  return (
    <PageShell size="md">
      <Card>
        <CardContent className="space-y-5 pt-8 text-center">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-tight text-text-primary">
              Intervento non trovato
            </h1>

            <p className="text-base leading-7 text-text-secondary">
              La landing richiesta non è disponibile.
            </p>
          </div>

          <Link
            href="/"
            className={cn(
              tokens.interactive.base,
              tokens.interactive.radius,
              tokens.interactive.sizes.lg,
              tokens.interactive.variants.brand,
            )}
          >
            Torna alla homepage
          </Link>
        </CardContent>
      </Card>
    </PageShell>
  );
}
