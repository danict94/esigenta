import Link from "next/link";

import {
  RequestFlowError,
  getCustomerRequestsByHistoryToken,
} from "@esigenta/domain";

import { PublicShell } from "../../site/shell/public-shell";
import { CustomerRequestsNav } from "./components/customer-requests-nav";

type CustomerRequestsPageProps = {
  token?: string;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
  }).format(date);
}

function formatIntervention(slug: string | null) {
  if (!slug) {
    return "Richiesta";
  }

  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatStatus(status: string) {
  switch (status) {
    case "PENDING_VERIFICATION":
      return "In attesa di conferma";
    case "PENDING_REVIEW":
      return "In revisione";
    case "APPROVED":
      return "Approvata";
    case "PUBLISHED":
      return "Pubblicata";
    case "CLOSED":
      return "Chiusa";
    case "REJECTED":
      return "Non approvata";
    default:
      return status;
  }
}

function buildDetailHref({
  requestId,
  token,
}: {
  requestId: string;
  token: string;
}) {
  const params = new URLSearchParams({ token });

  return `/richieste/cliente/richiesta/${encodeURIComponent(requestId)}?${params.toString()}`;
}

async function loadRequests(token?: string) {
  if (!token) {
    return {
      ok: false as const,
      message: "Il link non contiene il token necessario.",
    };
  }

  try {
    return {
      ok: true as const,
      requests: await getCustomerRequestsByHistoryToken(token),
    };
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof RequestFlowError
          ? error.message
          : "Non siamo riusciti a recuperare le richieste.",
    };
  }
}

export async function CustomerRequestsPage({ token }: CustomerRequestsPageProps) {
  const result = await loadRequests(token);

  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <div className="eg-thread" aria-hidden="true" />

        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container">
            <div className="mx-auto max-w-[820px]">
              <div>
                <p className="eg-eyebrow">Le mie richieste</p>

                <h1 className="eg-h1 mt-5">Storico richieste</h1>

                <p className="eg-body-muted mt-5 max-w-[48ch]">
                  Qui trovi le richieste inviate con questa email.
                </p>
              </div>

              <CustomerRequestsNav token={token} className="mt-8" />

              {!result.ok ? (
                <div className="eg-panel mt-8 p-6">
                  <p className="eg-body-muted">{result.message}</p>
                </div>
              ) : result.requests.length === 0 ? (
                <div className="eg-panel mt-8 p-6">
                  <h2 className="eg-h3 text-[24px]">Nessuna richiesta trovata</h2>
                  <p className="eg-body-muted mt-3">
                    Non ci sono richieste associate a questa email oppure il
                    link non contiene ancora uno storico aggiornato.
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link href="/" className="eg-button-primary w-full sm:w-auto">
                      Richiedi un intervento
                    </Link>
                    <Link
                      href="/richieste/accesso"
                      className="eg-button-ghost w-full sm:w-auto"
                    >
                      Ricevi un nuovo link
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="mt-[54px] border-t border-eg-hairline max-[860px]:mt-[38px]">
                  {result.requests.map((request, index) => (
                    <li key={request.requestId}>
                      <Link
                        href={buildDetailHref({
                          requestId: request.requestId,
                          token: token ?? "",
                        })}
                        className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-6 border-b border-eg-hairline py-6 text-eg-terra max-[860px]:grid-cols-[44px_minmax(0,1fr)] max-[860px]:gap-3.5 max-[860px]:py-[22px] transition-colors hover:text-eg-cotto-dark"
                      >
                        <span className="font-mono text-xs uppercase tracking-[0.12em] text-eg-cotto-dark">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span>
                          <span className="text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.12] tracking-[-0.01em] block">
                            {formatIntervention(request.interventionSlug)}
                          </span>
                          <span className="mt-2.5 max-w-[44ch] text-[15px] leading-[1.55] text-eg-ardesia block">
                            {request.city ?? "Citta non specificata"}
                            {" - "}
                            {formatDate(request.createdAt)}
                            {" - Codice "}
                            {request.requestCode ?? request.requestId}
                          </span>
                        </span>

                        <span className="justify-self-end whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] text-eg-ardesia-2 max-[860px]:col-start-2 max-[860px]:mt-1 max-[860px]:justify-self-start">
                          {formatStatus(request.status)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
