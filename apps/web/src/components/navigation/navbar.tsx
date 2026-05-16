import Link from 'next/link'

import { Button, Container } from '@fixpro/ui'

export function Navbar() {
  return (
    <header className="border-b border-border-primary">
      <Container size="xl" className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight"
        >
          FixPro
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/trova-professionisti"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Trova professionisti
          </Link>

          <Link
            href="/come-funziona"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Come funziona
          </Link>

          <Link
            href="/richieste/accesso"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Le mie richieste
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/area-impresa/accedi"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Accedi
          </Link>

          <Link href="/area-impresa">
            <Button>
              Sei un professionista?
            </Button>
          </Link>
        </div>
      </Container>
    </header>
  )
}