import { Fragment } from "react";

import { cn } from "@esigenta/ui";

import { processSteps } from "../../shared/process-steps";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { sectionTitleClassName } from "./seo-section-title";

/**
 * Blocco "Come funziona" per le pagine SEO (gruppo e intervento): stessa
 * fonte condivisa della home (site/shared/process-steps), mai copy duplicata.
 */
export function HowItWorks() {
  return (
    <div className="eg-container">
      <div className="mb-9 max-w-160">
        <p className={blueprintEyebrowClassName}>Come funziona</p>

        <h2 id="come-funziona-title" className={cn(sectionTitleClassName, "mt-3")}>
          Dalla richiesta al lavoro fatto
        </h2>
      </div>

      <div className="flex flex-col gap-6 min-[761px]:flex-row min-[761px]:items-center min-[761px]:gap-0">
        {processSteps.map((step, index) => (
          <Fragment key={step.title}>
            <div className="flex min-w-0 flex-1 items-center gap-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-eg-brand-strong bg-eg-surface font-(family-name:--eg-font-mono) text-sm font-bold text-eg-brand-strong">
                {step.verified ? "✓" : step.marker}
              </span>

              <div className="min-w-0">
                <h3 className="font-(family-name:--eg-font-primary) text-[14.5px] font-semibold leading-[1.3]">
                  {step.title}
                </h3>

                <p className="mt-0.5 text-[12.5px] leading-normal text-eg-ink">{step.description}</p>
              </div>
            </div>

            {index < processSteps.length - 1 ? (
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mx-4 hidden shrink-0 text-eg-border min-[761px]:block"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
