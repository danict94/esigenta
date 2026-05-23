import Link from "next/link";

import { listPendingRequests } from "@fixpro/db";
import { Badge, Card, PageShell } from "@fixpro/ui";

export const dynamic = "force-dynamic";

function formatPendingLabel(count: number) {
  if (count === 0) {
    return "Nessuna richiesta in attesa";
  }

  if (count === 1) {
    return "1 richiesta in attesa";
  }

  return `${count} richieste in attesa`;
}

export default async function AdminHomePage() {
  const pendingRequests = await listPendingRequests();
  const pendingCount = pendingRequests.length;
  const hasPendingRequests = pendingCount > 0;

  return (
    <PageShell size="lg" className="py-8 md:py-10">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium text-text-muted">
          Quadro operativo
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
          Stato marketplace
        </h1>

        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Vista rapida delle aree che richiedono attenzione. I dettagli operativi
          restano nelle sezioni dedicate.
        </p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium text-text-muted">
              Richieste in attesa
            </p>

            <Badge variant={hasPendingRequests ? "warning" : "success"}>
              {hasPendingRequests ? "Da lavorare" : "Pulita"}
            </Badge>
          </div>

          <p className="mt-5 text-5xl font-semibold tracking-tight text-text-primary">
            {pendingCount}
          </p>

          <p className="mt-2 text-sm text-text-secondary">
            {formatPendingLabel(pendingCount)}
          </p>

          <div className="mt-5 border-t border-border-primary pt-4">
            <Link
              href="/requests"
              className="text-sm font-medium text-brand-primary transition-colors hover:text-brand-primary-hover"
            >
              Apri moderazione →
            </Link>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium text-text-muted">
              Stato coda
            </p>

            <Badge variant={hasPendingRequests ? "warning" : "success"}>
              {hasPendingRequests ? "Attiva" : "In ordine"}
            </Badge>
          </div>

          <p className="mt-5 text-2xl font-semibold tracking-tight text-text-primary">
            {hasPendingRequests ? "Richiede revisione" : "Nessuna azione"}
          </p>

          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {hasPendingRequests
              ? "Ci sono richieste verificate da controllare prima della pubblicazione."
              : "La coda moderazione non contiene richieste pendenti."}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium text-text-muted">
              Imprese
            </p>

            <Badge variant="neutral">Prossima</Badge>
          </div>

          <p className="mt-5 text-2xl font-semibold tracking-tight text-text-primary">
            Non collegata
          </p>

          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Area futura per profili, onboarding, qualità e controllo imprese.
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium text-text-muted">
              Assistenza
            </p>

            <Badge variant="success">Attiva</Badge>
          </div>

          <p className="mt-5 text-2xl font-semibold tracking-tight text-text-primary">
            Collegata
          </p>

          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Messaggi operativi tra imprese e team FixPro.
          </p>

          <div className="mt-5 border-t border-border-primary pt-4">
            <Link
              href="/support"
              className="text-sm font-medium text-brand-primary transition-colors hover:text-brand-primary-hover"
            >
              Apri assistenza
            </Link>
          </div>
        </Card>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-text-muted">
                Priorità attuale
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-tight text-text-primary">
                {hasPendingRequests
                  ? "Controllare la coda richieste"
                  : "Marketplace in ordine"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {hasPendingRequests
                  ? "Le richieste in attesa devono essere valutate prima di diventare opportunità visibili alle imprese."
                  : "Non ci sono richieste da moderare in questo momento."}
              </p>
            </div>

            <Link
              href="/requests"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-md border border-brand-primary bg-brand-primary px-5 text-sm font-medium text-brand-on-primary transition-colors hover:border-brand-primary-hover hover:bg-brand-primary-hover"
            >
              Gestisci richieste
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-text-muted">
            Regola operativa
          </p>

          <h2 className="mt-2 text-lg font-semibold text-text-primary">
            Pubblicare solo richieste lavorabili
          </h2>

          <ul className="mt-4 space-y-2 text-sm leading-6 text-text-secondary">
            <li>• Intervento chiaro</li>
            <li>• Luogo coerente</li>
            <li>• Cliente contattabile</li>
            <li>• Nessun contenuto spam</li>
          </ul>
        </Card>
      </section>
    </PageShell>
  );
}
