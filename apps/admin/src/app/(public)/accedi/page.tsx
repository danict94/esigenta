import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fixpro/ui";

import { AdminLoginForm } from "./admin-login-form";

export default function AdminLoginPage() {
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
          <AdminLoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
