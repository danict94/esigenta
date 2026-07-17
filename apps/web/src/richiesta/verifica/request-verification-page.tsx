import {
  RequestFlowError,
  verifyRequestEmail,
  verifyRequestEmailByToken,
} from "@esigenta/domain";

import { PublicShell } from "../../site/shell/public-shell";

type RequestVerificationPageProps = {
  requestId?: string;
  token?: string;
};

type VerificationResult =
  | {
      ok: true;
      alreadyVerified: boolean;
      title: string;
      message: string;
      statusUrl?: string;
    }
  | {
      ok: false;
      title: string;
      message: string;
    };

function buildStatusUrl(statusToken: string) {
  return `/stato-richiesta/${encodeURIComponent(statusToken)}`;
}

/**
 * I messaggi di dominio in verify-request.ts sono in inglese (consumer anche
 * admin, non li tocchiamo qui): il livello presentazionale mappa solo i
 * codici noti su copy italiano, mai error.message direttamente.
 */
function mapVerificationErrorCode(code: string | undefined): {
  title: string;
  message: string;
} {
  switch (code) {
    case "invalid_verification_token":
      return {
        title: "Link non valido",
        message: "Il link di conferma non e valido.",
      };

    case "verification_token_expired":
      return {
        title: "Link non valido",
        message: "Il link di conferma e scaduto.",
      };

    case "request_not_found":
      return {
        title: "Conferma non riuscita",
        message: "Non siamo riusciti a trovare la richiesta.",
      };

    default:
      return {
        title: "Conferma non riuscita",
        message: "Non siamo riusciti a confermare la richiesta.",
      };
  }
}

async function verifyFromParams({
  requestId,
  token,
}: {
  requestId?: string;
  token?: string;
}): Promise<VerificationResult> {
  if (!token) {
    return { ok: false, ...mapVerificationErrorCode("invalid_verification_token") };
  }

  try {
    // D-014: requestId presente = link legacy query-param gia emesso.
    // Senza requestId = nuovo link single-token (/verifica-richiesta/[token]).
    const result = requestId
      ? await verifyRequestEmail({ requestId, token })
      : await verifyRequestEmailByToken({ token });

    if (result.status === "ALREADY_VERIFIED") {
      return {
        ok: true,
        alreadyVerified: true,
        title: "Email gia confermata",
        message: "La richiesta e gia stata confermata.",
      };
    }

    return {
      ok: true,
      alreadyVerified: false,
      title: "Email confermata",
      // Nessun template email per "revisione completata" esiste in
      // @esigenta/notifications: nessuna promessa di aggiornamento
      // automatico non supportata dal codice.
      message: "La richiesta e ora in revisione.",
      statusUrl: result.statusAccessToken
        ? buildStatusUrl(result.statusAccessToken)
        : undefined,
    };
  } catch (error) {
    return {
      ok: false,
      ...mapVerificationErrorCode(
        error instanceof RequestFlowError ? error.code : undefined,
      ),
    };
  }
}

export async function RequestVerificationPage({
  requestId,
  token,
}: RequestVerificationPageProps) {
  const result = await verifyFromParams({ requestId, token });
  const primaryHref = result.ok && result.statusUrl ? result.statusUrl : "/";
  const primaryLabel = result.ok && result.statusUrl ? "Vedi stato richiesta" : "Torna alla home";

  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container-narrow">
            <div className="eg-panel p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div>
                  <p className="eg-eyebrow">Conferma richiesta</p>

                  <h1 className="eg-h2 mt-4">{result.title}</h1>

                  <p className="eg-body-muted mt-4">{result.message}</p>
                </div>

                <a href={primaryHref} className="eg-button-primary w-full sm:w-fit">
                  {primaryLabel}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
