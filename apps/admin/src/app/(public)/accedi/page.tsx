import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@esigenta/ui";

import { AdminLoginForm } from "./admin-login-form";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    passwordReset?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params =
    searchParams ? await searchParams : {};
  const passwordResetCompleted =
    params.passwordReset === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-cantiere-paper px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm font-medium text-cantiere-ink-secondary">esigenta Admin</p>

          <CardTitle>Accedi</CardTitle>

          <CardDescription>
            Accesso riservato agli operatori admin autorizzati.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {passwordResetCompleted ? (
            <p className="mb-5 border border-cantiere-hairline bg-cantiere-linen px-3 py-2 text-sm text-cantiere-ink">
              Password aggiornata. Ora puoi accedere.
            </p>
          ) : null}

          <AdminLoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
