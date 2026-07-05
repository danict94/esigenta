import Link from "next/link";

import { PublicShell } from "../../../site/shell/public-shell";

export default function ProfessionNotFound() {
  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <div className="eg-thread" aria-hidden="true" />

        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container-narrow text-center">
            <p className="eg-eyebrow">Professionisti</p>

            <h1 className="eg-h1 mt-5">Professione non trovata</h1>

            <p className="eg-body-muted mx-auto mt-6 max-w-[42ch]">
              La pagina richiesta non e disponibile.
            </p>

            <Link href="/" className="eg-button-primary mt-8 w-full sm:w-auto">
              Torna alla homepage
            </Link>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
