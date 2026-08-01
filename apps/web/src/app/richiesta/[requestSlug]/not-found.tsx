import Link from "next/link";

import { PublicShell } from "../../../site/shell/public-shell";

export default function RequestFlowNotFound() {
  return (
    <PublicShell navbarVariant="funnel" showFooter={false}>
      <div className="eg-page eg-page-bg">
        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container-narrow text-center">
            <p className="eg-eyebrow">Richiesta guidata</p>

            <h1 className="eg-h1 mt-5">Intervento non disponibile</h1>

            <p className="eg-body-muted mx-auto mt-6 max-w-[42ch]">
              Il percorso richiesto non esiste oppure non è più disponibile.
              Torna alla ricerca per scegliere un altro intervento.
            </p>

            <Link href="/" className="eg-button-primary mt-8 w-full sm:w-auto">
              Torna alla ricerca
            </Link>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
