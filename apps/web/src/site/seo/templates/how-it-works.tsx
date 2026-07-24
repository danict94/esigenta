import { processSteps } from "../../shared/process-steps";

/**
 * Blocco "Come funziona" per le pagine SEO (gruppo e intervento): stessa
 * fonte condivisa della home (site/shared/process-steps), mai copy duplicata.
 */
export function HowItWorks() {
  return (
    <div className="eg-container">
      <div className="mx-auto max-w-[760px] text-center">
        <p className="eg-eyebrow">Come funziona</p>

        <h2 id="come-funziona-title" className="eg-h2 mt-4">
          Dalla richiesta al lavoro fatto
        </h2>
      </div>

      <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {processSteps.map((step) => (
          <li key={step.title} className="eg-panel p-5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-eg-border font-(family-name:--eg-font-ui) text-xs uppercase tracking-[0.08em] text-eg-brand-strong">
              {step.verified ? "✓" : step.marker}
            </span>

            <h3 className="eg-h3 mt-4 text-[22px]">{step.title}</h3>

            <p className="eg-body-muted mt-3 text-sm leading-6">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
