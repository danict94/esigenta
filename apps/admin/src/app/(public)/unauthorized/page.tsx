import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@esigenta/ui";

export default function AdminUnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cantiere-paper px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm font-medium text-cantiere-ink-secondary">esigenta Admin</p>

          <CardTitle>Accesso non autorizzato</CardTitle>

          <CardDescription>
            Il tuo account è autenticato, ma non ha un profilo admin abilitato.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Link
            href="/accedi"
            className="inline-flex h-12 items-center justify-center border border-cantiere-accent bg-cantiere-accent px-5 text-sm font-medium text-cantiere-paper transition-colors hover:border-cantiere-accent-hover hover:bg-cantiere-accent-hover"
          >
            Torna al login
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
