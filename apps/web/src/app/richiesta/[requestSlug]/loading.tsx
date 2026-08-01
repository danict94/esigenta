import { PublicShell } from "../../../site/shell/public-shell";

// Blocco decorativo puro (aria-hidden dal chiamante): stessa palette neutra
// del design system, nessun colore nuovo. animate-pulse rispetta già la
// regola globale prefers-reduced-motion in packages/ui/src/styles/globals.css.
function SkeletonBlock({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-eg-sm bg-eg-surface-muted ${className}`} />
  );
}

export default function RequestFlowLoading() {
  return (
    <PublicShell navbarVariant="funnel" showFooter={false}>
      <div className="eg-page eg-page-bg">
        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+44px)]">
          <div className="eg-container">
            <div className="mx-auto w-full max-w-[980px]">
              {/* Identico a request-flow-page.tsx: stesso markup statico,
                  cosi' non c'e' nessuno scatto quando il funnel reale monta. */}
              <header className="max-w-[620px]">
                <p className="eg-eyebrow">Richiesta guidata</p>
                <p className="eg-body-muted mt-4 text-[17px] leading-8">
                  Pochi passaggi per preparare una richiesta chiara e utile.
                </p>
              </header>

              {/* mt-8 flex flex-col gap-8: stessa apertura di
                  request-step-ui.tsx, per allineare il punto di innesto. */}
              <div aria-busy="true" aria-live="polite" className="mt-8 flex flex-col gap-8">
                <p className="sr-only">Apertura del percorso guidato...</p>

                <div aria-hidden="true">
                  <div className="w-full border border-eg-border bg-eg-surface-muted px-4 py-3 sm:w-fit sm:max-w-full">
                    <SkeletonBlock className="h-3 w-32 bg-eg-border/60" />
                    <SkeletonBlock className="mt-2 h-4 w-40 bg-eg-border/60" />
                  </div>

                  <div className="mt-6 h-px w-20 bg-eg-brand-strong" />

                  <div className="mt-6 flex items-center gap-2">
                    <SkeletonBlock className="h-2 w-2 rounded-full" />
                    <SkeletonBlock className="h-2 w-2 rounded-full" />
                    <SkeletonBlock className="h-2 w-2 rounded-full" />
                  </div>

                  <div className="mt-6">
                    <SkeletonBlock className="h-3 w-28" />
                    <SkeletonBlock className="mt-4 h-9 w-3/4 max-w-[420px]" />
                    <SkeletonBlock className="mt-5 h-4 w-full max-w-[46ch]" />
                    <SkeletonBlock className="mt-2 h-4 w-2/3 max-w-[30ch]" />
                  </div>
                </div>

                <div aria-hidden="true" className="grid gap-3 sm:grid-cols-2">
                  <SkeletonBlock className="h-14 w-full" />
                  <SkeletonBlock className="h-14 w-full" />
                </div>

                <div aria-hidden="true" className="flex items-center justify-between gap-4 pt-2">
                  <SkeletonBlock className="h-11 w-28" />
                  <SkeletonBlock className="h-11 w-32" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
