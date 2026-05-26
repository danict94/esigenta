import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fixpro/ui";

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
    <main className="flex min-h-screen items-center justify-center bg-surface-primary px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm font-medium text-text-muted">FixPro Admin</p>

          <CardTitle>Accedi</CardTitle>

          <CardDescription>
            Accesso riservato agli operatori admin autorizzati.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {passwordResetCompleted ? (
            <p className="mb-5 border border-border-primary bg-surface-secondary px-3 py-2 text-sm text-text-primary">
              Password aggiornata. Ora puoi accedere.
            </p>
          ) : null}

          <AdminLoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
