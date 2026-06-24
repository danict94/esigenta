import Link from "next/link"

import { Button, Input } from "@esigenta/ui"

import {
  getPasswordResetTokenState,
} from "@esigenta/auth"

import { AuthShell } from "./auth-shell"

import {
  resetCompanyPasswordAction,
} from "./actions/reset-password-action"

export type CompanyResetPasswordPageProps = {
  searchParams?: Promise<{
    token?: string
    error?: string
  }>
}

function getResetErrorMessage(
  error?: string,
) {
  if (error === "password_mismatch") {
    return "Le password non coincidono."
  }

  if (error === "password_too_short") {
    return "La password deve contenere almeno 8 caratteri."
  }

  if (error === "password_too_long") {
    return "La password è troppo lunga."
  }

  if (
    error === "invalid_token" ||
    error === "missing_token"
  ) {
    return "Link di reset non valido."
  }

  if (error === "token_expired") {
    return "Il link di reset è scaduto."
  }

  return null
}

export async function CompanyResetPasswordPage({
  searchParams,
}: CompanyResetPasswordPageProps) {
  const params = searchParams ? await searchParams : {}
  const token = params.token?.trim() ?? ""
  const tokenState = await getPasswordResetTokenState({
    audience: "company",
    token,
  })
  const errorMessage = getResetErrorMessage(
    params.error ?? (tokenState.ok ? undefined : tokenState.code),
  )
  const canReset = tokenState.ok

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-medium tracking-[-0.01em] text-cantiere-ink text-[clamp(1.5rem,1.2rem+1vw,2rem)]">
            Reimposta password
          </h1>

          <p className="text-[15px] leading-[1.5] text-cantiere-ink-secondary">
            Scegli una nuova password per il tuo accesso impresa.
          </p>
        </div>

        {errorMessage ? (
          <p className="rounded-[8px] border border-cantiere-accent bg-cantiere-linen px-4 py-3 text-sm text-cantiere-ink">
            {errorMessage}
          </p>
        ) : null}

        {canReset ? (
          <form
            action={resetCompanyPasswordAction}
            className="flex flex-col gap-5"
          >
            <input type="hidden" name="token" value={token} />

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-cantiere-ink">
                Nuova password
              </span>

              <Input
                type="password"
                name="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-cantiere-ink">
                Conferma password
              </span>

              <Input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <Button type="submit" size="lg" className="w-full">
              Salva nuova password
            </Button>

            <p className="text-center text-xs leading-5 text-cantiere-ink-secondary">
              Per maggiori informazioni leggi l&apos;
              <Link
                href="/privacy"
                className="font-medium text-cantiere-accent"
              >
                informativa privacy
              </Link>{" "}
              e i{" "}
              <Link
                href="/termini"
                className="font-medium text-cantiere-accent"
              >
                termini del servizio
              </Link>
              .
            </p>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-6 text-cantiere-ink-secondary">
              Richiedi un nuovo link per continuare.
            </p>

            <Link
              href="/area-impresa/recupera-password"
              className="text-sm font-semibold text-cantiere-accent transition-colors hover:text-cantiere-accent-hover"
            >
              Richiedi nuovo link
            </Link>
          </div>
        )}
      </div>
    </AuthShell>
  )
}
