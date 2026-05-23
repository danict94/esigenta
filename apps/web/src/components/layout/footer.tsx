import { Container, tokens } from "@fixpro/ui"

export function Footer() {
  return (
    <footer className="border-t border-border-primary">
      <Container size="xl">
        <div className="flex flex-col gap-6 py-10">
          <div className="text-lg font-semibold tracking-tight">
            <span className="text-text-primary">Esi</span>
            <span className="text-brand-primary">genta</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-text-secondary">
            <a
              href="#"
              className="transition-colors hover:text-text-primary"
            >
              Privacy
            </a>

            <a
              href="#"
              className="transition-colors hover:text-text-primary"
            >
              Termini
            </a>

            <a
              href="#"
              className="transition-colors hover:text-text-primary"
            >
              Contatti
            </a>
          </div>

          <p className={tokens.typography.caption}>
            © 2026 Esigenta. Tutti i diritti riservati.
          </p>
        </div>
      </Container>
    </footer>
  )
}