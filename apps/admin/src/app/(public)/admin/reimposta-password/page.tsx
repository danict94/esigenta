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
  getPasswordResetTokenState,
  resetPasswordWithToken,
} from "@esigenta/db/auth";

type AdminResetPasswordPageProps = {
  searchParams?: Promise<{
    token?: string;
    error?: string;
  }>;
};

function getResetErrorMessage(
  error?: string,
) {
  if (error === "password_mismatch") {
    return "Le password non coincidono.";
  }

  if (error === "password_too_short") {
    return "La password deve contenere almeno 8 caratteri.";
  }

  if (error === "password_too_long") {
    return "La password è troppo lunga.";
  }

  if (
    error === "invalid_token" ||
    error === "missing_token"
  ) {
    return "Link di reset non valido.";
  }

  if (error === "token_expired") {
    return "Il link di reset è scaduto.";
  }

  return null;
}

function buildResetRetryUrl({
  token,
  error,
}: {
  token: string;
  error: string;
}) {
  const url =
    new URL(
      "/admin/reimposta-password",
      "http://local",
    );

  url.searchParams.set("token", token);
  url.searchParams.set("error", error);

  return `${url.pathname}${url.search}`;
}

async function resetAdminPasswordAction(
  formData: FormData,
) {
  "use server";

  const token =
    String(
      formData.get("token") ?? "",
    ).trim();
  const password =
    String(
      formData.get("password") ?? "",
    );
  const confirmPassword =
    String(
      formData.get("confirmPassword") ?? "",
    );

  if (password !== confirmPassword) {
    redirect(
      buildResetRetryUrl({
        token,
        error: "password_mismatch",
      }),
    );
  }

  const result =
    await resetPasswordWithToken({
      audience: "admin",
      token,
      password,
    });

  if (!result.ok) {
    redirect(
      buildResetRetryUrl({
        token,
        error: result.code,
      }),
    );
  }

  redirect("/accedi?passwordReset=1");
}

export default async function AdminResetPasswordPage({
  searchParams,
}: AdminResetPasswordPageProps) {
  const params =
    searchParams ? await searchParams : {};
  const token =
    params.token?.trim() ?? "";
  const tokenState =
    await getPasswordResetTokenState({
      audience: "admin",
      token,
    });
  const errorMessage =
    getResetErrorMessage(
      params.error ??
        (tokenState.ok
          ? undefined
          : tokenState.code),
    );
  const canReset =
    tokenState.ok;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-primary px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm font-medium text-text-muted">
            esigenta Admin
          </p>
          <CardTitle>
            Reimposta password
          </CardTitle>
          <CardDescription>
            Scegli una nuova password per l'accesso admin.
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
              action={resetAdminPasswordAction}
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
            </form>
          ) : (
            <div className="grid gap-4">
              <p className="text-sm leading-6 text-text-secondary">
                Richiedi un nuovo link per continuare.
              </p>
              <Link
                href="/admin/recupera-password"
                className="text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover"
              >
                Richiedi nuovo link
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
