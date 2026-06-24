import Link from "next/link"

import { AuthShell } from "./auth-shell"

export function SelezionaImpresaPage() {
  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-medium tracking-[-0.01em] text-cantiere-ink text-[clamp(1.5rem,1.2rem+1vw,2rem)]">
            Account già collegato a un&apos;impresa
          </h1>

          <p className="text-[15px] leading-[1.5] text-cantiere-ink-secondary">
            Per la release, ogni account impresa gestisce una sola azienda. Se
            hai già completato l&apos;iscrizione, accedi alla tua area impresa
            per continuare.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/area-impresa/richieste"
            className="inline-flex h-12 items-center justify-center rounded-[8px] border border-cantiere-accent bg-cantiere-accent px-5 text-sm font-medium text-cantiere-paper transition-colors hover:border-cantiere-accent-hover hover:bg-cantiere-accent-hover"
          >
            Vai all&apos;area impresa
          </Link>

          <Link
            href="/area-impresa/accedi"
            className="inline-flex h-12 items-center justify-center rounded-[8px] border border-cantiere-hairline bg-cantiere-paper px-5 text-sm font-medium text-cantiere-ink transition-colors hover:border-cantiere-accent"
          >
            Accedi
          </Link>
        </div>

        <p className="text-xs leading-5 text-cantiere-ink-secondary">
          La gestione di più imprese dallo stesso account non è attiva in questa
          versione.
        </p>
      </div>
    </AuthShell>
  )
}
