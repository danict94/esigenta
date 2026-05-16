import Link from "next/link"

import {
  Card,
  Container,
  cn,
  tokens,
} from "@fixpro/ui"

export default function SelezionaImpresaPage() {
  return (
    <main className="min-h-screen bg-surface-primary text-text-primary">
      <Container size="sm">
        <div className="flex min-h-screen items-center justify-center py-12">
          <Card className="w-full p-6 md:p-8">
            <p className="text-sm font-medium text-brand-primary">
              Area impresa
            </p>

            <h1
              className={cn(
                "mt-3 text-text-primary",
                tokens.typography.title,
              )}
            >
              Account già collegato a un’impresa
            </h1>

            <p className="mt-4 text-sm leading-6 text-text-secondary">
              Per la release, ogni account impresa gestisce una sola azienda.
              Se hai già completato l’iscrizione, accedi alla tua area impresa
              per continuare.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/area-impresa/richieste"
                className="inline-flex h-12 items-center justify-center rounded-md border border-brand-primary bg-brand-primary px-5 text-sm font-medium text-brand-on-primary transition-colors hover:border-brand-primary-hover hover:bg-brand-primary-hover"
              >
                Vai all’area impresa
              </Link>

              <Link
                href="/area-impresa/accedi"
                className="inline-flex h-12 items-center justify-center rounded-md border border-border-primary bg-surface-primary px-5 text-sm font-medium text-text-primary transition-colors hover:border-border-focus"
              >
                Accedi
              </Link>
            </div>

            <p className="mt-5 text-xs leading-5 text-text-muted">
              La gestione di più imprese dallo stesso account non è attiva in
              questa versione.
            </p>
          </Card>
        </div>
      </Container>
    </main>
  )
}
