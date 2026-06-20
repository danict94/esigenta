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
  getPasswordResetTokenState,
} from "@esigenta/auth"

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
  const params =
    searchParams ? await searchParams : {}
  const token =
    params.token?.trim() ?? ""
  const tokenState =
    await getPasswordResetTokenState({
      audience:
        "company",
      token,
    })
  const errorMessage =
    getResetErrorMessage(
      params.error ??
        (tokenState.ok
          ? undefined
          : tokenState.code),
    )
  const canReset =
    tokenState.ok

  return (
    <main className="min-h-screen bg-surface-primary text-text-primary">
      <Container size="sm">
        <div className="flex min-h-screen items-center py-12">
          <Card className="w-full">
            <CardHeader>
              <p className="text-sm font-medium text-brand-primary">
                Area impresa
              </p>
              <CardTitle>
                Reimposta password
              </CardTitle>
              <CardDescription>
                Scegli una nuova password per il tuo accesso impresa.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {errorMessage ? (
                <p className="mb-5 border border-border-focus bg-surface-secondary px-4 py-3 text-sm text-text-primary">
                  {errorMessage}
                </p>
              ) : null}

              {canReset ? (
                <form
                  action={resetCompanyPasswordAction}
                  className="grid gap-5"
                >
                  <input
                    type="hidden"
                    name="token"
                    value={token}
                  />

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-text-primary">
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

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-text-primary">
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

                  <Button type="submit">
                    Salva nuova password
                  </Button>

                  <p className="text-center text-xs leading-5 text-text-muted">
                    Per maggiori informazioni leggi l&apos;
                    <Link
                      href="/privacy"
                      className="font-medium text-brand-primary"
                    >
                      informativa privacy
                    </Link>{" "}
                    e i{" "}
                    <Link
                      href="/termini"
                      className="font-medium text-brand-primary"
                    >
                      termini del servizio
                    </Link>
                    .
                  </p>
                </form>
              ) : (
                <div className="grid gap-4">
                  <p className="text-sm leading-6 text-text-secondary">
                    Richiedi un nuovo link per continuare.
                  </p>
                  <Link
                    href="/area-impresa/recupera-password"
                    className="text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover"
                  >
                    Richiedi nuovo link
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </main>
  )
}
