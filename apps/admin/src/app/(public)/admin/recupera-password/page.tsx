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
} from "@esigenta/auth";

import { AdminBrand } from "../../../../components/admin-brand";

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
    <main className="flex min-h-screen items-center justify-center bg-eg-calce px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <AdminBrand className="mb-2" />
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
            <div className="border border-eg-hairline bg-eg-calce-2 px-4 py-3 text-sm leading-6 text-eg-terra">
              Se l'email è associata a un account admin, riceverai a breve il
              link per reimpostare la password.
            </div>
          ) : (
            <form
              action={requestAdminPasswordResetAction}
              className="grid gap-5"
            >
              <label className="grid gap-2">
                <span className="text-sm font-medium text-eg-terra">
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
                <p className="border border-eg-cotto bg-eg-calce-2 px-4 py-3 text-sm text-eg-terra">
                  {errorMessage}
                </p>
              ) : null}

              <Button type="submit">
                Invia link di reset
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-eg-ardesia">
            Hai ricordato la password?{" "}
            <Link
              href="/accedi"
              className="font-semibold text-eg-cotto transition-colors hover:text-eg-cotto-dark"
            >
              Torna all'accesso
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
