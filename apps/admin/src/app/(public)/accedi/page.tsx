import { AdminLoginForm } from "./admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-primary p-8 shadow-sm">
        <p className="text-sm font-medium text-text-muted">FixPro Admin</p>

        <h1 className="mt-3 text-2xl font-semibold text-text-primary">
          Accedi
        </h1>

        <p className="mt-3 text-sm leading-6 text-text-muted">
          Accesso riservato agli operatori admin autorizzati.
        </p>

        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}