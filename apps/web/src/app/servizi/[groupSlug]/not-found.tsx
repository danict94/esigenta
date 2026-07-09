import Link from "next/link";

import { PublicShell } from "../../../site/shell/public-shell";

export default function GroupLandingNotFound() {
  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <div className="eg-thread" aria-hidden="true" />

        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container-narrow text-center">
            <p className="eg-eyebrow">Servizi</p>

            <h1 className="eg-h1 mt-5">Ambito non trovato</h1>

            <p className="eg-body-muted mx-auto mt-6 max-w-[42ch]">
              L&apos;ambito richiesto non &egrave; disponibile.
            </p>

            <Link href="/servizi" className="eg-button-primary mt-8 w-full sm:w-auto">
              Torna ai servizi
            </Link>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
