import {
  RequestFlowError,
  verifyRequestEmail,
  verifyRequestEmailByToken,
} from "@esigenta/domain";

import { PublicShell } from "../../site/shell/public-shell";
import { CustomerRequestsNav } from "../comunicazioni/components/customer-requests-nav";

type RequestVerificationPageProps = {
  requestId?: string;
  token?: string;
};

function buildStatusUrl(statusToken: string) {
  return `/stato-richiesta/${encodeURIComponent(statusToken)}`;
}

async function verifyFromParams({
  requestId,
  token,
}: {
  requestId?: string;
  token?: string;
}) {
  if (!token) {
    return {
      ok: false as const,
      title: "Link non valido",
      message: "Il link di conferma non contiene tutti i dati necessari.",
    };
  }

  try {
    // D-014: requestId presente = link legacy query-param gia emesso.
    // Senza requestId = nuovo link single-token (/verifica-richiesta/[token]).
    const result = requestId
      ? await verifyRequestEmail({ requestId, token })
      : await verifyRequestEmailByToken({ token });

    if (result.status === "ALREADY_VERIFIED") {
      return {
        ok: true as const,
        title: "Richiesta gia confermata",
        message: "Ora e in attesa di revisione.",
        historyAccessToken: null,
        statusUrl: undefined,
      };
    }

    return {
      ok: true as const,
      title: "Richiesta confermata",
      message: "Ora e in attesa di revisione.",
      statusUrl: result.statusAccessToken
        ? buildStatusUrl(result.statusAccessToken)
        : undefined,
      historyAccessToken: result.historyAccessToken ?? null,
    };
  } catch (error) {
    if (error instanceof RequestFlowError) {
      return {
        ok: false as const,
        title: "Conferma non riuscita",
        message: error.message,
      };
    }

    return {
      ok: false as const,
      title: "Conferma non riuscita",
      message:
        "Non siamo riusciti a confermare la richiesta. Riprova tra poco.",
    };
  }
}

export async function RequestVerificationPage({
  requestId,
  token,
}: RequestVerificationPageProps) {
  const result = await verifyFromParams({ requestId, token });

  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <div className="eg-thread" aria-hidden="true" />

        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container-narrow">
            <div className="eg-panel p-6 md:p-8">
              <div className="flex flex-col gap-6">
                {result.ok ? (
                  <CustomerRequestsNav
                    token={result.historyAccessToken ?? undefined}
                  />
                ) : null}

                <div>
                  <p className="eg-eyebrow">Conferma richiesta</p>

                  <h1 className="eg-h2 mt-4">{result.title}</h1>

                  <p className="eg-body-muted mt-4">{result.message}</p>
                </div>

                {result.ok ? (
                  <>
                    <p className="eg-body-muted">
                      In futuro puoi tornare dalla voce Storico richieste e
                      vedere le richieste inviate con questa email.
                    </p>

                    {result.statusUrl ? (
                      <a href={result.statusUrl} className="eg-button-primary w-full sm:w-fit">
                        Vedi stato richiesta
                      </a>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
