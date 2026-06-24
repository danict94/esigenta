import Link from "next/link"

import { Button, Input } from "@esigenta/ui"

import { AuthShell } from "./auth-shell"

import {
  requestCompanyPasswordResetAction,
} from "./actions/recover-password-action"

export type CompanyForgotPasswordPageProps = {
  searchParams?: Promise<{
    sent?: string
    error?: string
  }>
}

function getErrorMessage(
  error?: string,
) {
  if (error === "invalid_email") {
    return "Inserisci un indirizzo email valido."
  }

  if (error === "email_failed") {
    return "Non siamo riusciti a inviare l'email. Riprova tra poco."
  }

  return null
}

export async function CompanyForgotPasswordPage({
  searchParams,
}: CompanyForgotPasswordPageProps) {
  const params = searchParams ? await searchParams : {}
  const sent = params.sent === "1"
  const errorMessage = getErrorMessage(params.error)

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-medium tracking-[-0.01em] text-cantiere-ink text-[clamp(1.5rem,1.2rem+1vw,2rem)]">
            Recupera password
          </h1>

          <p className="text-[15px] leading-[1.5] text-cantiere-ink-secondary">
            Inserisci l&apos;email del tuo account impresa. Se l&apos;account
            esiste, riceverai un link sicuro per reimpostare la password.
          </p>
        </div>

        {sent ? (
          <div className="rounded-[8px] border border-cantiere-hairline bg-cantiere-linen px-4 py-3 text-sm leading-6 text-cantiere-ink">
            Se l&apos;email è associata a un account impresa, riceverai a breve
            il link per reimpostare la password.
          </div>
        ) : (
          <form
            action={requestCompanyPasswordResetAction}
            className="flex flex-col gap-5"
          >
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-cantiere-ink">
                Email
              </span>

              <Input
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="azienda@esempio.it"
              />
            </label>

            {errorMessage ? (
              <p className="rounded-[8px] border border-cantiere-accent bg-cantiere-linen px-4 py-3 text-sm text-cantiere-ink">
                {errorMessage}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full">
              Invia link di reset
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
        )}

        <p className="text-center text-sm text-cantiere-ink-secondary">
          Hai ricordato la password?{" "}
          <Link
            href="/area-impresa/accedi"
            className="font-semibold text-cantiere-accent transition-colors hover:text-cantiere-accent-hover"
          >
            Torna all&apos;accesso
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
