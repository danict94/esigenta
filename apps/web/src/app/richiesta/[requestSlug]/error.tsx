"use client";

import { useEffect } from "react";
import Link from "next/link";

import { PublicShell } from "../../../site/shell/public-shell";

type RequestFlowErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RequestFlowError({ error, reset }: RequestFlowErrorProps) {
  useEffect(() => {
    // Stesso pattern "[scope] messaggio" gia' usato dalle route API
    // (vedi apps/web/src/app/api/taxonomy/search/route.ts): solo console,
    // solo lato client, nessun dettaglio esposto nell'interfaccia sotto.
    console.error("[richiesta-funnel] Unexpected error", error);
  }, [error]);

  return (
    <PublicShell navbarVariant="funnel" showFooter={false}>
      <div className="eg-page eg-page-bg">
        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+44px)]">
          <div className="eg-container">
            <div className="mx-auto w-full max-w-[980px]">
              <div className="eg-panel mx-auto max-w-[560px] p-6 text-center md:p-8">
                <h1 className="eg-h2">Non siamo riusciti ad aprire il percorso</h1>

                <p className="eg-body-muted mt-4">
                  Si è verificato un problema durante il caricamento. Puoi
                  riprovare oppure tornare alla ricerca.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button type="button" className="eg-button-primary" onClick={reset}>
                    Riprova
                  </button>

                  <Link href="/" className="eg-button-ghost">
                    Torna alla ricerca
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
