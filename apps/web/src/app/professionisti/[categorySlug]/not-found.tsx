import Link from "next/link";

import { Card, CardContent, PageShell, cn } from "@esigenta/ui";

export default function ProfessionNotFound() {
  return (
    <PageShell size="md">
      <Card>
        <CardContent className="space-y-5 pt-8 text-center">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-tight text-cantiere-ink">
              Professione non trovata
            </h1>

            <p className="text-base leading-7 text-cantiere-ink-secondary">
              La pagina richiesta non è disponibile.
            </p>
          </div>

          <Link
            href="/"
            className={cn(
              "inline-flex items-center justify-center font-medium transition-colors",
              "rounded-[8px]",
              "h-12 px-6 text-[15px]",
              "border border-cantiere-accent bg-cantiere-accent text-cantiere-paper hover:border-cantiere-accent-hover hover:bg-cantiere-accent-hover",
            )}
          >
            Torna alla homepage
          </Link>
        </CardContent>
      </Card>
    </PageShell>
  );
}
