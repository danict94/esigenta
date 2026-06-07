import Link from "next/link";

import { listAdminRequests } from "@esigenta/db";
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
  const requests = await listAdminRequests();

  return (
    <PageShell size="lg">
      <header className="border-b border-border-primary pb-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-text-muted">
              Control room
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
              Richieste
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
              Gestisci le richieste ricevute e controlla lo stato editoriale
              nel marketplace.
            </p>
          </div>

          <Link
            href="/"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Torna alla home
          </Link>
        </div>
      </header>

      <section className="mt-8 border border-border-primary bg-surface-secondary p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Gestione richieste
            </p>
            <p className="mt-1 text-sm text-text-secondary">
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
              <p className="text-lg font-semibold text-text-primary">
                Nessuna richiesta
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Non ci sono richieste da mostrare in questo momento.
              </p>
            </div>
          </Card>
        ) : (
          <ul className="grid gap-4">
            {requests.map((request) => (
              <li key={request.id}>
                <Card className="p-5 transition-colors hover:border-brand-primary">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                          {getStatusLabel(request.status)}
                        </Badge>

                        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
                          {formatFreshness(request.createdAt)}
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-semibold tracking-tight text-text-primary">
                        {formatInterventionLabel(request.interventionSlug)}
                      </h2>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary">
                        <span>
                          <span className="text-text-muted">Città:</span>{" "}
                          {request.city ?? "-"}
                        </span>

                        <span>
                          <span className="text-text-muted">Cliente:</span>{" "}
                          {request.customerName ?? "-"}
                        </span>

                        <span>
                          <span className="text-text-muted">Creata:</span>{" "}
                          {formatDate(request.createdAt)}
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-text-secondary">
                        Controlla contenuto, località e qualità del contatto
                        per gestire questa opportunità nel marketplace.
                      </p>
                    </div>

                    <div className="flex shrink-0 md:justify-end">
                      {/* TODO: add admin actions for edit/archive/soft delete after schema decision */}
                      <Link
                        href={`/requests/${request.id}`}
                        className="inline-flex h-11 items-center justify-center border border-brand-primary bg-brand-primary px-5 text-sm font-medium text-brand-on-primary transition-colors hover:border-brand-primary-hover hover:bg-brand-primary-hover"
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
