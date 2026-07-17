import Link from "next/link";

import { PublicShell } from "../../../../site/shell/public-shell";

export default function CityCostGuideNotFound() {
  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container-narrow text-center">
            <p className="eg-eyebrow">Guide ai costi</p>

            <h1 className="eg-h1 mt-5">Guida costi citt&agrave; non trovata</h1>

            <p className="eg-body-muted mx-auto mt-6 max-w-[42ch]">
              La guida richiesta non &egrave; disponibile o non supera il quality
              gate.
            </p>

            <Link href="/costi" className="eg-button-primary mt-8 w-full sm:w-auto">
              Torna alle guide
            </Link>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
