import Link from "next/link"

import { Container } from "@fixpro/ui"

export function Navbar() {
  return (
    <header className="border-b border-border-primary bg-surface-primary">
      <Container size="xl" className="flex h-20 items-center justify-between">
        <Link
          href="/"
          className="text-3xl font-bold tracking-tight"
          aria-label="Esigenta home"
        >
          <span className="text-text-primary">Esi</span>
          <span className="text-brand-primary">genta</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/richieste/accesso"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Le mie richieste
          </Link>
        </nav>

        <div className="flex items-center gap-8">
          <Link
            href="/area-impresa/accedi"
            className="text-base text-text-primary transition-colors hover:text-brand-primary"
          >
            Accedi
          </Link>

          <Link
            href="/area-impresa"
            className="group text-base text-text-primary transition-colors hover:text-brand-primary"
          >
            <span>Sei un professionista?</span>
            <span
              aria-hidden="true"
              className="mt-1 block h-0.5 w-full bg-brand-primary"
            />
          </Link>
        </div>
      </Container>
    </header>
  )
}