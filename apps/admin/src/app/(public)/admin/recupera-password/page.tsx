import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@esigenta/ui";

import {
  requestPasswordReset,
} from "@esigenta/db/auth";

type AdminForgotPasswordPageProps = {
  searchParams?: Promise<{
    sent?: string;
    error?: string;
  }>;
};

function getErrorMessage(
  error?: string,
) {
  if (error === "invalid_email") {
    return "Inserisci un indirizzo email valido.";
  }

  if (error === "email_failed") {
    return "Non siamo riusciti a inviare l'email. Riprova tra poco.";
  }

  return null;
}

async function requestAdminPasswordResetAction(
  formData: FormData,
) {
  "use server";

  const email =
    String(
      formData.get("email") ?? "",
    );

  const result =
    await requestPasswordReset({
      audience: "admin",
      email,
    });

  if (!result.ok) {
    redirect(
      `/admin/recupera-password?error=${result.code}`,
    );
  }

  redirect("/admin/recupera-password?sent=1");
}

export default async function AdminForgotPasswordPage({
  searchParams,
}: AdminForgotPasswordPageProps) {
  const params =
    searchParams ? await searchParams : {};
  const sent =
    params.sent === "1";
  const errorMessage =
    getErrorMessage(params.error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-primary px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm font-medium text-text-muted">
            esigenta Admin
          </p>
          <CardTitle>
            Recupera password
          </CardTitle>
          <CardDescription>
            Inserisci l'email admin. Se l'account esiste, riceverai un link
            sicuro per reimpostare la password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="border border-border-primary bg-surface-secondary px-4 py-3 text-sm leading-6 text-text-primary">
              Se l'email è associata a un account admin, riceverai a breve il
              link per reimpostare la password.
            </div>
          ) : (
            <form
              action={requestAdminPasswordResetAction}
              className="grid gap-5"
            >
              <label className="grid gap-2">
                <span className="text-sm font-medium text-text-primary">
                  Email
                </span>
                <Input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                />
              </label>

              {errorMessage ? (
                <p className="border border-border-focus bg-surface-secondary px-4 py-3 text-sm text-text-primary">
                  {errorMessage}
                </p>
              ) : null}

              <Button type="submit">
                Invia link di reset
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-text-secondary">
            Hai ricordato la password?{" "}
            <Link
              href="/accedi"
              className="font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover"
            >
              Torna all'accesso
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
