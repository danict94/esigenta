import Link from "next/link"

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  Input,
} from "@esigenta/ui"

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
  const params =
    searchParams ? await searchParams : {}
  const sent =
    params.sent === "1"
  const errorMessage =
    getErrorMessage(params.error)

  return (
    <main className="min-h-screen bg-cantiere-paper text-cantiere-ink">
      <Container size="sm">
        <div className="flex min-h-screen items-center py-12">
          <Card className="w-full">
            <CardHeader>
              <p className="text-sm font-medium text-cantiere-accent">
                Area impresa
              </p>
              <CardTitle>
                Recupera password
              </CardTitle>
              <CardDescription>
                Inserisci l&apos;email del tuo account impresa. Se l&apos;account esiste,
                riceverai un link sicuro per reimpostare la password.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {sent ? (
                <div className="border border-cantiere-hairline bg-cantiere-linen px-4 py-3 text-sm leading-6 text-cantiere-ink">
                  Se l&apos;email è associata a un account impresa, riceverai a
                  breve il link per reimpostare la password.
                </div>
              ) : (
                <form
                  action={requestCompanyPasswordResetAction}
                  className="grid gap-5"
                >
                  <label className="grid gap-2">
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
                    <p className="border border-cantiere-accent bg-cantiere-linen px-4 py-3 text-sm text-cantiere-ink">
                      {errorMessage}
                    </p>
                  ) : null}

                  <Button type="submit">
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

              <p className="mt-6 text-center text-sm text-cantiere-ink-secondary">
                Hai ricordato la password?{" "}
                <Link
                  href="/area-impresa/accedi"
                  className="font-semibold text-cantiere-accent transition-colors hover:text-cantiere-accent-hover"
                >
                  Torna all&apos;accesso
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </main>
  )
}
