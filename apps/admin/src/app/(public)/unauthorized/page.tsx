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
    <main className="flex min-h-screen items-center justify-center bg-eg-calce px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm font-medium text-eg-ardesia">esigenta Admin</p>

          <CardTitle>Accesso non autorizzato</CardTitle>

          <CardDescription>
            Il tuo account è autenticato, ma non ha un profilo admin abilitato.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Link
            href="/accedi"
            className="inline-flex h-12 items-center justify-center border border-eg-cotto bg-eg-cotto px-5 text-sm font-medium text-eg-calce transition-colors hover:border-eg-cotto-dark hover:bg-eg-cotto-dark"
          >
            Torna al login
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
