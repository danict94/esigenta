import Link from "next/link";

import { getPasswordResetTokenState } from "@esigenta/auth";
import { Input } from "@esigenta/ui";

import { resetCompanyPasswordAction } from "./actions/reset-password-action";
import { AuthShell } from "./auth-shell";

export type CompanyResetPasswordPageProps = {
  searchParams?: Promise<{
    token?: string;
    error?: string;
  }>;
};

function getResetErrorMessage(error?: string) {
  if (error === "password_mismatch") {
    return "Le password non coincidono.";
  }

  if (error === "password_too_short") {
    return "La password deve contenere almeno 8 caratteri.";
  }

  if (error === "password_too_long") {
    return "La password e troppo lunga.";
  }

  if (error === "invalid_token" || error === "missing_token") {
    return "Link di reset non valido.";
  }

  if (error === "token_expired") {
    return "Il link di reset e scaduto.";
  }

  return null;
}

export async function CompanyResetPasswordPage({
  searchParams,
}: CompanyResetPasswordPageProps) {
  const params = searchParams ? await searchParams : {};
  const token = params.token?.trim() ?? "";
  const tokenState = await getPasswordResetTokenState({
    audience: "company",
    token,
  });
  const errorMessage = getResetErrorMessage(
    params.error ?? (tokenState.ok ? undefined : tokenState.code),
  );
  const canReset = tokenState.ok;

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <div>
          <p className="eg-eyebrow">Nuova password</p>
          <h1 className="eg-h2 mt-4">Scegli un nuovo accesso.</h1>
          <p className="eg-body-muted mt-4">
            Imposta una password nuova per continuare nell&apos;area impresa.
          </p>
        </div>

        {errorMessage ? <p className="eg-alert">{errorMessage}</p> : null}

        {canReset ? (
          <form action={resetCompanyPasswordAction} className="flex flex-col gap-5">
            <input type="hidden" name="token" value={token} />

            <label className="eg-form-field">
              <span className="eg-form-label">Nuova password</span>
              <Input
                type="password"
                name="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label className="eg-form-field">
              <span className="eg-form-label">Conferma password</span>
              <Input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <button type="submit" className="eg-button-primary w-full">
              Salva nuova password <span aria-hidden="true">&rarr;</span>
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
        ) : (
          <div className="flex flex-col gap-4">
            <p className="eg-body-muted">Richiedi un nuovo link per continuare.</p>
            <Link
              href="/area-impresa/recupera-password"
              className="eg-button-ghost w-full"
            >
              Richiedi nuovo link <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
