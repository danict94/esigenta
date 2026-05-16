import Link from "next/link";

export default function AdminUnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-primary p-8 shadow-sm">
        <p className="text-sm font-medium text-text-muted">FixPro Admin</p>

        <h1 className="mt-3 text-2xl font-semibold text-text-primary">
          Accesso non autorizzato
        </h1>

        <p className="mt-3 text-sm leading-6 text-text-muted">
          Il tuo account è autenticato, ma non ha un profilo admin abilitato.
        </p>

        <Link
          href="/accedi"
          className="mt-6 inline-flex rounded-xl bg-text-primary px-4 py-2 text-sm font-medium text-surface-primary"
        >
          Torna al login
        </Link>
      </div>
    </main>
  );
}