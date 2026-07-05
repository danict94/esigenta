import Link from "next/link";

import { Input } from "@esigenta/ui";

import { requestCompanyPasswordResetAction } from "./actions/recover-password-action";
import { AuthShell } from "./auth-shell";

export type CompanyForgotPasswordPageProps = {
  searchParams?: Promise<{
    sent?: string;
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (error === "invalid_email") {
    return "Inserisci un indirizzo email valido.";
  }

  if (error === "email_failed") {
    return "Non siamo riusciti a inviare l'email. Riprova tra poco.";
  }

  return null;
}

export async function CompanyForgotPasswordPage({
  searchParams,
}: CompanyForgotPasswordPageProps) {
  const params = searchParams ? await searchParams : {};
  const sent = params.sent === "1";
  const errorMessage = getErrorMessage(params.error);

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <div>
          <p className="eg-eyebrow">Recupero accesso</p>
          <h1 className="eg-h2 mt-4">Rimetti in ordine l'accesso.</h1>
          <p className="eg-body-muted mt-4">
            Inserisci l'email del tuo account impresa. Se esiste, riceverai un
            link sicuro per reimpostare la password.
          </p>
        </div>

        {sent ? (
          <div className="eg-alert">
            Se l'email e associata a un account impresa, riceverai a breve il
            link per reimpostare la password.
          </div>
        ) : (
          <form action={requestCompanyPasswordResetAction} className="flex flex-col gap-5">
            <label className="eg-form-field">
              <span className="eg-form-label">Email</span>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="azienda@esempio.it"
              />
            </label>

            {errorMessage ? <p className="eg-alert">{errorMessage}</p> : null}

            <button type="submit" className="eg-button-primary w-full">
              Invia link di reset <span aria-hidden="true">&rarr;</span>
            </button>

            <p className="eg-form-help text-center">
              Per maggiori informazioni leggi l&apos;
              <Link href="/privacy" className="font-medium text-eg-cotto-dark">
                informativa privacy
              </Link>{" "}
              e i{" "}
              <Link href="/termini" className="font-medium text-eg-cotto-dark">
                termini del servizio
              </Link>
              .
            </p>
          </form>
        )}

        <p className="text-center text-sm text-eg-ardesia">
          Hai ricordato la password?{" "}
          <Link href="/area-impresa/accedi" className="font-medium text-eg-cotto-dark">
            Torna all&apos;accesso
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
