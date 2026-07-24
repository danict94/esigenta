import Link from "next/link";

import { AuthShell } from "./auth-shell";

export function SelezionaImpresaPage() {
  return (
    <AuthShell headerAction={null}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="eg-eyebrow">Profilo gia presente</p>
          <h1 className="eg-h2 mt-4">Questo account ha gia un&apos;impresa.</h1>
          <p className="eg-body-muted mt-4">
            Per questa versione ogni account impresa gestisce una sola azienda.
            Se hai gia completato l&apos;iscrizione, accedi alla tua area impresa.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/area-impresa/richieste"
            className="eg-button-primary"
          >
            Vai all&apos;area impresa <span aria-hidden="true">&rarr;</span>
          </Link>

          <Link
            href="/area-impresa/accedi"
            className="eg-button-ghost"
          >
            Accedi
          </Link>
        </div>

        <p className="eg-form-help">
          La gestione di piu imprese dallo stesso account non e attiva in questa
          versione.
        </p>
      </div>
    </AuthShell>
  );
}
