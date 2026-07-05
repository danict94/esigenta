import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@esigenta/ui";

import { AdminLoginForm } from "./admin-login-form";
import { AdminBrand } from "../../../components/admin-brand";

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
    <main className="flex min-h-screen items-center justify-center bg-eg-calce px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <AdminBrand className="mb-2" />

          <CardTitle>Accedi</CardTitle>

          <CardDescription>
            Accesso riservato agli operatori admin autorizzati.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {passwordResetCompleted ? (
            <p className="mb-5 border border-eg-hairline bg-eg-calce-2 px-3 py-2 text-sm text-eg-terra">
              Password aggiornata. Ora puoi accedere.
            </p>
          ) : null}

          <AdminLoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
