import Link from "next/link";

import { PublicShell } from "../../../site/shell/public-shell";

export default function InterventionSeoNotFound() {
  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container-narrow text-center">
            <p className="eg-eyebrow">Interventi</p>

            <h1 className="eg-h1 mt-5">Intervento non trovato</h1>

            <p className="eg-body-muted mx-auto mt-6 max-w-[42ch]">
              La landing richiesta non e disponibile.
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
