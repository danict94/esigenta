import Link from "next/link";

import { listUnverifiedRequests } from "@esigenta/domain";
import { Badge, Card, PageShell } from "@esigenta/ui";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatAge(date: Date) {
  const diffMs = Math.max(0, Date.now() - date.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (hours < 1) {
    return "Meno di un'ora";
  }

  if (hours < 24) {
    return `${hours} ${hours === 1 ? "ora" : "ore"}`;
  }

  return `${days} ${days === 1 ? "giorno" : "giorni"}`;
}

export default async function UnverifiedRequestsPage() {
  const requests = await listUnverifiedRequests();

  return (
    <PageShell size="lg">
      <header className="border-b border-border-primary pb-7">
        <Link
          href="/requests"
          className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          ← Coda richieste
        </Link>

        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-text-muted">
              Recupero richieste
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
              Richieste non verificate
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
              Richieste in attesa che il cliente confermi l&apos;email.
              Finché restano in questo stato non entrano nella coda di
              revisione, non sono mai visibili alle imprese e non generano
              dispatch o notifiche. Usa le azioni nel dettaglio per inviare
              di nuovo l&apos;email o verificare manualmente.
            </p>
          </div>

          <Badge variant="danger">{requests.length} non verificate</Badge>
        </div>
      </header>

      <section className="mt-8">
        {requests.length === 0 ? (
          <Card className="p-8">
            <div className="max-w-xl">
              <p className="text-lg font-semibold text-text-primary">
                Nessuna richiesta da recuperare
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Tutte le richieste ricevute sono state verificate o sono
                ancora nella finestra di attesa dell&apos;email del cliente.
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
                        <Badge variant="danger">Email non verificata</Badge>
                        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
                          In attesa da {formatAge(request.createdAt)}
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-semibold tracking-tight text-text-primary">
                        {request.requestCode ?? "Codice non disponibile"}
                      </h2>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary">
                        <span>
                          <span className="text-text-muted">Cliente:</span>{" "}
                          {request.customerName ?? "-"}
                        </span>

                        <span>
                          <span className="text-text-muted">Email:</span>{" "}
                          {request.customerEmail ?? "-"}
                        </span>

                        <span>
                          <span className="text-text-muted">Telefono:</span>{" "}
                          {request.customerPhone ?? "-"}
                        </span>

                        <span>
                          <span className="text-text-muted">Creata:</span>{" "}
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 md:justify-end">
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
