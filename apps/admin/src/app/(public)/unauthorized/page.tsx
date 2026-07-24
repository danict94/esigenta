import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  buttonClassName,
} from "@esigenta/ui";

import { AdminBrand } from "../../../components/admin-brand";

export default function AdminUnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-eg-surface px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <AdminBrand className="mb-2" />

          <CardTitle>Accesso non autorizzato</CardTitle>

          <CardDescription>
            Il tuo account è autenticato, ma non ha un profilo admin abilitato.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Link
            href="/accedi"
            className={buttonClassName({ size: "lg" })}
          >
            Torna al login
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
