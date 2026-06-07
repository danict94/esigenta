import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fixpro/ui";

export default function AdminUnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-primary px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm font-medium text-text-muted">esigenta Admin</p>

          <CardTitle>Accesso non autorizzato</CardTitle>

          <CardDescription>
            Il tuo account è autenticato, ma non ha un profilo admin abilitato.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Link
            href="/accedi"
            className="inline-flex h-12 items-center justify-center border border-brand-primary bg-brand-primary px-5 text-sm font-medium text-brand-on-primary transition-colors hover:border-brand-primary-hover hover:bg-brand-primary-hover"
          >
            Torna al login
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
