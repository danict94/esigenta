import {
  RequestFlowError,
  getRequestStatusByToken,
} from "@esigenta/domain";

import { PublicShell } from "../../site/shell/public-shell";
import { CustomerRequestsNav } from "../comunicazioni/components/customer-requests-nav";

type RequestStatusPageProps = {
  token: string;
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

function getStatusMessage(status: string) {
  switch (status) {
    case "PENDING_REVIEW":
      return "La richiesta e in revisione. Ti aggiorneremo quando sara pronta.";
    case "APPROVED":
      return "La richiesta e stata approvata ed e pronta per la pubblicazione.";
    case "PUBLISHED":
      return "La richiesta e pubblicata e visibile ai professionisti disponibili.";
    case "CLOSED":
      return "La richiesta e stata chiusa.";
    case "REJECTED":
      return "La richiesta non e stata approvata dopo la revisione.";
    default:
      return "Stiamo elaborando lo stato della richiesta.";
  }
}

function getFinalTimelineLabel(status: string) {
  switch (status) {
    case "APPROVED":
      return "Approvata";
    case "PUBLISHED":
      return "Pubblicata";
    case "CLOSED":
      return "Chiusa";
    case "REJECTED":
      return "Non approvata";
    default:
      return "Approvata, pubblicata o chiusa";
  }
}

function isReviewStarted(status: string) {
  return [
    "PENDING_REVIEW",
    "APPROVED",
    "PUBLISHED",
    "CLOSED",
    "REJECTED",
  ].includes(status);
}

function isFinal(status: string) {
  return ["APPROVED", "PUBLISHED", "CLOSED", "REJECTED"].includes(status);
}

function buildTimeline({
  status,
  verifiedAt,
}: {
  status: string;
  verifiedAt: Date | null;
}) {
  return [
    {
      label: "Richiesta inviata",
      active: true,
    },
    {
      label: "Email confermata",
      active: Boolean(verifiedAt) || status !== "PENDING_VERIFICATION",
    },
    {
      label: "In revisione",
      active: isReviewStarted(status),
    },
    {
      label: getFinalTimelineLabel(status),
      active: isFinal(status),
    },
  ];
}

async function loadStatus(token: string) {
  if (!token) {
    return {
      ok: false as const,
      title: "Link non valido",
      message: "Il link non contiene il token necessario.",
    };
  }

  try {
    const request = await getRequestStatusByToken({ token });

    return {
      ok: true as const,
      request,
    };
  } catch (error) {
    return {
      ok: false as const,
      title: "Stato non disponibile",
      message:
        error instanceof RequestFlowError
          ? error.message
          : "Non siamo riusciti a recuperare lo stato della richiesta.",
    };
  }
}

export async function RequestStatusPage({ token }: RequestStatusPageProps) {
  const result = await loadStatus(token);

  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container-narrow">
            <div className="eg-panel p-6 md:p-8">
              {result.ok ? (
                <div className="flex flex-col gap-7">
                  <CustomerRequestsNav
                    token={result.request.historyAccessToken ?? undefined}
                    showNewRequest={false}
                    showAccessLink={false}
                  />

                  <div>
                    <p className="eg-eyebrow">Stato richiesta</p>

                    <h1 className="eg-h2 mt-4">
                      {formatStatus(result.request.status)}
                    </h1>

                    <p className="eg-body-muted mt-4">
                      {getStatusMessage(result.request.status)}
                    </p>
                  </div>

                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <DetailItem
                      label="Codice richiesta"
                      value={result.request.requestCode ?? result.request.requestId}
                    />
                    <DetailItem
                      label="Intervento"
                      value={formatIntervention(result.request.interventionSlug)}
                    />
                    <DetailItem
                      label="Citta"
                      value={result.request.city ?? "Non specificata"}
                    />
                    <DetailItem
                      label="Data invio"
                      value={formatDate(result.request.createdAt)}
                    />
                  </dl>

                  <div className="border-y border-eg-hairline py-5">
                    <h2 className="text-sm font-medium text-eg-terra">
                      Avanzamento
                    </h2>

                    <ol className="mt-5 space-y-4">
                      {buildTimeline({
                        status: result.request.status,
                        verifiedAt: result.request.verifiedAt,
                      }).map((item) => (
                        <li key={item.label} className="flex items-center gap-3 text-sm">
                          <span
                            className={[
                              "h-2.5 w-2.5 rounded-full border",
                              item.active
                                ? "border-eg-cotto bg-eg-cotto"
                                : "border-eg-hairline bg-eg-calce",
                            ].join(" ")}
                            aria-hidden="true"
                          />
                          <span
                            className={item.active ? "text-eg-terra" : "text-eg-ardesia"}
                          >
                            {item.label}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="eg-eyebrow">Stato richiesta</p>
                  <h1 className="eg-h2 mt-4">{result.title}</h1>
                  <p className="eg-body-muted mt-4">{result.message}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-eg-hairline bg-eg-calce p-3">
      <dt className="eg-eyebrow">{label}</dt>
      <dd className="mt-2 font-medium text-eg-terra">{value}</dd>
    </div>
  );
}
