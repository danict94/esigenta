import Link from "next/link"

import { Card, Container, cn } from "@esigenta/ui";

export function SelezionaImpresaPage() {
  return (
    <main className="min-h-screen bg-cantiere-paper text-cantiere-ink">
      <Container size="sm">
        <div className="flex min-h-screen items-center justify-center py-12">
          <Card className="w-full p-6 md:p-8">
            <p className="text-sm font-medium text-cantiere-accent">
              Area impresa
            </p>

            <h1
              className={cn(
                "mt-3 text-cantiere-ink",
                "text-[clamp(1.625rem,1.1rem+2.2vw,2.375rem)] font-medium tracking-[-0.01em]",
              )}
            >
              Account già collegato a un’impresa
            </h1>

            <p className="mt-4 text-sm leading-6 text-cantiere-ink-secondary">
              Per la release, ogni account impresa gestisce una sola azienda.
              Se hai già completato l’iscrizione, accedi alla tua area impresa
              per continuare.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/area-impresa/richieste"
                className="inline-flex h-12 items-center justify-center rounded-md border border-cantiere-accent bg-cantiere-accent px-5 text-sm font-medium text-cantiere-paper transition-colors hover:border-cantiere-accent-hover hover:bg-cantiere-accent-hover"
              >
                Vai all’area impresa
              </Link>

              <Link
                href="/area-impresa/accedi"
                className="inline-flex h-12 items-center justify-center rounded-md border border-cantiere-hairline bg-cantiere-paper px-5 text-sm font-medium text-cantiere-ink transition-colors hover:border-cantiere-accent"
              >
                Accedi
              </Link>
            </div>

            <p className="mt-5 text-xs leading-5 text-cantiere-ink-secondary">
              La gestione di più imprese dallo stesso account non è attiva in
              questa versione.
            </p>
          </Card>
        </div>
      </Container>
    </main>
  )
}
