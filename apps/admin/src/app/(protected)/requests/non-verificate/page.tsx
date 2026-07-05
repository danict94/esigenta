import Link from "next/link";

import { listUnverifiedRequests } from "@esigenta/domain";
import { Badge, Card, PageShell, buttonClassName } from "@esigenta/ui";

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
      <header className="border-b border-eg-hairline pb-7">
        <Link
          href="/requests"
          className="text-sm font-medium text-eg-ardesia transition-colors hover:text-eg-terra"
        >
          ← Coda richieste
        </Link>

        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-eg-ardesia">
              Recupero richieste
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-eg-terra">
              Richieste non verificate
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-eg-ardesia">
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
              <p className="text-lg font-semibold text-eg-terra">
                Nessuna richiesta da recuperare
              </p>
              <p className="mt-2 text-sm leading-6 text-eg-ardesia">
                Tutte le richieste ricevute sono state verificate o sono
                ancora nella finestra di attesa dell&apos;email del cliente.
              </p>
            </div>
          </Card>
        ) : (
          <ul className="grid gap-4">
            {requests.map((request) => (
              <li key={request.id}>
                <Card className="p-5 transition-colors hover:border-eg-cotto">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="danger">Email non verificata</Badge>
                        <span className="text-xs font-medium uppercase tracking-wide text-eg-ardesia">
                          In attesa da {formatAge(request.createdAt)}
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-semibold tracking-tight text-eg-terra">
                        {request.requestCode ?? "Codice non disponibile"}
                      </h2>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-eg-ardesia">
                        <span>
                          <span className="text-eg-ardesia">Cliente:</span>{" "}
                          {request.customerName ?? "-"}
                        </span>

                        <span>
                          <span className="text-eg-ardesia">Email:</span>{" "}
                          {request.customerEmail ?? "-"}
                        </span>

                        <span>
                          <span className="text-eg-ardesia">Telefono:</span>{" "}
                          {request.customerPhone ?? "-"}
                        </span>

                        <span>
                          <span className="text-eg-ardesia">Creata:</span>{" "}
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 md:justify-end">
                      <Link
                        href={`/requests/${request.id}`}
                        className={buttonClassName()}
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
