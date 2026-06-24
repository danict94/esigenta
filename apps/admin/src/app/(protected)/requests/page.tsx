import Link from "next/link";

import { listAdminRequests, listUnverifiedRequests } from "@esigenta/domain";
import { Badge, Card, PageShell } from "@esigenta/ui";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatInterventionLabel(slug?: string | null) {
  if (!slug) {
    return "Intervento non disponibile";
  }

  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatFreshness(date: Date) {
  const now = Date.now();
  const createdAt = date.getTime();
  const diffMs = Math.max(0, now - createdAt);

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 30) {
    return "Nuova";
  }

  if (hours < 24) {
    return "Oggi";
  }

  if (days === 1) {
    return "Ieri";
  }

  if (days < 7) {
    return `${days} giorni fa`;
  }

  return formatDate(date);
}

function getStatusBadgeVariant(status: string) {
  if (status === "APPROVED" || status === "PUBLISHED") {
    return "success";
  }

  if (status === "REJECTED") {
    return "danger";
  }

  if (status === "PENDING_REVIEW") {
    return "warning";
  }

  return "neutral";
}

function getStatusLabel(status: string) {
  if (status === "APPROVED") {
    return "Approvata";
  }

  if (status === "PUBLISHED") {
    return "Pubblicata";
  }

  if (status === "REJECTED") {
    return "Rifiutata";
  }

  if (status === "PENDING_REVIEW") {
    return "In revisione";
  }

  if (status === "CLOSED") {
    return "Chiusa";
  }

  return status;
}

export default async function RequestsModerationPage() {
  const [requests, unverifiedRequests] = await Promise.all([
    listAdminRequests(),
    listUnverifiedRequests(),
  ]);

  return (
    <PageShell size="lg">
      <header className="border-b border-cantiere-hairline pb-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-cantiere-ink-secondary">
              Control room
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-cantiere-ink">
              Richieste
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-cantiere-ink-secondary">
              Gestisci le richieste ricevute e controlla lo stato editoriale
              nel marketplace.
            </p>
          </div>

          <Link
            href="/"
            className="text-sm font-medium text-cantiere-ink-secondary transition-colors hover:text-cantiere-ink"
          >
            Torna alla home
          </Link>
        </div>
      </header>

      {unverifiedRequests.length > 0 ? (
        <Link href="/requests/non-verificate" className="mt-8 block">
          <Card className="border-2 border-cantiere-accent bg-cantiere-linen p-5 transition-colors hover:border-cantiere-accent">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-cantiere-ink">
                  Richieste in attesa di verifica email
                </p>
                <p className="mt-1 text-sm text-cantiere-ink-secondary">
                  Non sono nella coda di revisione e non possono entrare nel
                  marketplace finché il cliente non conferma l&apos;email (o
                  un admin la verifica manualmente).
                </p>
              </div>

              <Badge variant="danger">
                {unverifiedRequests.length} da recuperare
              </Badge>
            </div>
          </Card>
        </Link>
      ) : null}

      <section className="mt-8 border border-cantiere-hairline bg-cantiere-linen p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-cantiere-ink">
              Gestione richieste
            </p>
            <p className="mt-1 text-sm text-cantiere-ink-secondary">
              Elenco delle richieste ricevute con stato e dettagli operativi.
            </p>
          </div>

          <Badge variant="neutral">
            {requests.length} richieste
          </Badge>
        </div>
      </section>

      <section className="mt-6">
        {requests.length === 0 ? (
          <Card className="p-8">
            <div className="max-w-xl">
              <p className="text-lg font-semibold text-cantiere-ink">
                Nessuna richiesta
              </p>
              <p className="mt-2 text-sm leading-6 text-cantiere-ink-secondary">
                Non ci sono richieste da mostrare in questo momento.
              </p>
            </div>
          </Card>
        ) : (
          <ul className="grid gap-4">
            {requests.map((request) => (
              <li key={request.id}>
                <Card className="p-5 transition-colors hover:border-cantiere-accent">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                          {getStatusLabel(request.status)}
                        </Badge>

                        <span className="text-xs font-medium uppercase tracking-wide text-cantiere-ink-secondary">
                          {formatFreshness(request.createdAt)}
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-semibold tracking-tight text-cantiere-ink">
                        {formatInterventionLabel(request.interventionSlug)}
                      </h2>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cantiere-ink-secondary">
                        <span>
                          <span className="text-cantiere-ink-secondary">Città:</span>{" "}
                          {request.city ?? "-"}
                        </span>

                        <span>
                          <span className="text-cantiere-ink-secondary">Cliente:</span>{" "}
                          {request.customerName ?? "-"}
                        </span>

                        <span>
                          <span className="text-cantiere-ink-secondary">Creata:</span>{" "}
                          {formatDate(request.createdAt)}
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-cantiere-ink-secondary">
                        Controlla contenuto, località e qualità del contatto
                        per gestire questa opportunità nel marketplace.
                      </p>
                    </div>

                    <div className="flex shrink-0 md:justify-end">
                      {/* D-020: edit (commercial settings), archive and
                          soft-delete actions live on the request detail
                          page, consistent with the existing review/edit
                          actions already there. */}
                      <Link
                        href={`/requests/${request.id}`}
                        className="inline-flex h-11 items-center justify-center border border-cantiere-accent bg-cantiere-accent px-5 text-sm font-medium text-cantiere-paper transition-colors hover:border-cantiere-accent-hover hover:bg-cantiere-accent-hover"
                      >
                        Apri richiesta
                      </Link>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
