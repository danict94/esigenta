import Link from "next/link"
import { Container, cn } from "@esigenta/ui";

import {
  RequestFlowError,
  getCustomerRequestsByHistoryToken,
} from "@esigenta/domain"

import { PublicShell } from "../../site/shell/public-shell"
import { CustomerRequestsNav } from "./components/customer-requests-nav"

type CustomerRequestsPageProps = {
  token?: string
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
  }).format(date)
}

function formatIntervention(slug: string | null) {
  if (!slug) {
    return "Richiesta"
  }

  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatStatus(status: string) {
  switch (status) {
    case "PENDING_VERIFICATION":
      return "In attesa di conferma"
    case "PENDING_REVIEW":
      return "In revisione"
    case "APPROVED":
      return "Approvata"
    case "PUBLISHED":
      return "Pubblicata"
    case "CLOSED":
      return "Chiusa"
    case "REJECTED":
      return "Non approvata"
    default:
      return status
  }
}

function buildDetailHref({
  requestId,
  token,
}: {
  requestId: string
  token: string
}) {
  const params = new URLSearchParams({ token })

  return `/richieste/cliente/richiesta/${encodeURIComponent(requestId)}?${params.toString()}`
}

async function loadRequests(token?: string) {
  if (!token) {
    return {
      ok: false as const,
      message: "Il link non contiene il token necessario.",
    }
  }

  try {
    return {
      ok: true as const,
      requests: await getCustomerRequestsByHistoryToken(token),
    }
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof RequestFlowError
          ? error.message
          : "Non siamo riusciti a recuperare le richieste.",
    }
  }
}

export async function CustomerRequestsPage({
  token,
}: CustomerRequestsPageProps) {
  const result = await loadRequests(token)

  const primaryLinkClass =
    "inline-flex h-11 items-center justify-center rounded-md border border-cantiere-accent bg-cantiere-accent px-5 text-sm font-semibold text-cantiere-paper transition-colors hover:border-cantiere-accent-hover hover:bg-cantiere-accent-hover"
  const secondaryLinkClass =
    "inline-flex h-11 items-center justify-center rounded-md border border-cantiere-hairline bg-cantiere-paper px-5 text-sm font-semibold text-cantiere-ink transition-colors hover:border-cantiere-accent"

  return (
    <PublicShell>
      <section className={"py-20 md:py-28 lg:py-32"}>
        <Container size="md">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <h1
                  className={cn(
                    "text-cantiere-ink",
                    "font-medium text-cantiere-heading",
                  )}
                >
                  Storico richieste
                </h1>
                <p className="text-sm leading-6 text-cantiere-ink-secondary">
                  Qui trovi le richieste inviate con questa email.
                </p>
              </div>

              <CustomerRequestsNav token={token} />
            </div>

            {!result.ok ? (
              <div className="border border-cantiere-hairline bg-cantiere-paper p-6">
                <p className="text-sm text-cantiere-ink-secondary">
                  {result.message}
                </p>
              </div>
            ) : result.requests.length === 0 ? (
              <div className="space-y-4 border border-cantiere-hairline bg-cantiere-paper p-6">
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-cantiere-ink">
                    Nessuna richiesta trovata
                  </h2>
                  <p className="text-sm leading-6 text-cantiere-ink-secondary">
                    Non ci sono richieste associate a questa email oppure il
                    link non contiene ancora uno storico aggiornato.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    href="/"
                    className={primaryLinkClass}
                  >
                    Richiedi un intervento
                  </Link>
                  <Link
                    href="/richieste/accesso"
                    className={secondaryLinkClass}
                  >
                    Ricevi un nuovo link
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {result.requests.map((request) => (
                  <Link
                    key={request.requestId}
                    href={buildDetailHref({
                      requestId: request.requestId,
                      token: token ?? "",
                    })}
                    className="block border border-cantiere-hairline bg-cantiere-paper p-4 transition-colors hover:bg-cantiere-linen"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-cantiere-ink">
                          {formatIntervention(request.interventionSlug)}
                        </p>
                        <p className="text-sm text-cantiere-ink-secondary">
                          {request.city ?? "Città non specificata"}
                          {" - "}
                          {formatDate(request.createdAt)}
                        </p>
                        <p className="text-xs text-cantiere-ink-secondary">
                          Codice richiesta:{" "}
                          {request.requestCode ?? request.requestId}
                        </p>
                      </div>

                      <div className="text-sm text-cantiere-ink-secondary sm:text-right">
                        <p className="font-medium text-cantiere-ink">
                          {formatStatus(request.status)}
                        </p>
                        <p className="mt-3 font-semibold text-cantiere-accent">
                          Vedi dettagli
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>
    </PublicShell>
  )
}
