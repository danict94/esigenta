import { cn } from "@esigenta/ui";

import type { SizeExample } from "../market-data/base-price-ranges";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { sectionTitleClassName } from "./seo-section-title";
import { sizeExamplesGridClassName } from "./cost-guide-price-model";

/**
 * Scope 4B — esempi per dimensione, spostati PRIMA delle singole lavorazioni
 * (Task 6): aiutano a stimare il proprio caso prima del dettaglio tecnico.
 * Contenuto invariato rispetto a prima, solo riposizionato ed estratto in
 * componente dedicato. Griglia leggibile su desktop, card impilate/2 colonne
 * su mobile senza overflow.
 *
 * Fix UI review: il numero di colonne dipende dal conteggio reale degli
 * esempi (vedi sizeExamplesGridClassName) invece di un fisso `md:grid-cols-3`
 * — con 4 esempi (il caso più comune) evitava un 3+1 sbilanciato.
 */
export type CostSizeExamplesProps = {
  sizeExamples: readonly SizeExample[];
  sizeExamplesIntro?: string;
};

export function CostSizeExamples({ sizeExamples, sizeExamplesIntro }: CostSizeExamplesProps) {
  if (sizeExamples.length === 0) return null;

  return (
    <section aria-labelledby="esempi-costo-title" className="eg-section-editorial border-t border-eg-border">
      <div className="eg-container">
        <div className="mb-8 max-w-170">
          <p className={blueprintEyebrowClassName}>Esempi</p>

          <h2 id="esempi-costo-title" className={cn(sectionTitleClassName, "mt-3")}>
            Quanto può costare nel tuo caso
          </h2>
        </div>

        {sizeExamplesIntro ? (
          <p className="mb-6 max-w-170 border border-eg-border bg-eg-surface px-5 py-4 text-[13.5px] leading-[1.6] text-eg-ink">
            {sizeExamplesIntro}
          </p>
        ) : null}

        <div className={sizeExamplesGridClassName(sizeExamples.length)}>
          {sizeExamples.map((example) => (
            <article key={example.label} className="border border-eg-border bg-eg-surface px-5.5 py-6">
              {example.sizeRange ? (
                <span className="mb-2.5 inline-block bg-eg-brand-soft px-2.5 py-1 font-(family-name:--eg-font-mono) text-[11px] font-bold uppercase tracking-[0.04em] text-eg-brand-strong">
                  {example.sizeRange}
                </span>
              ) : null}

              <p className="mb-2.5 text-[19px] font-bold leading-tight text-eg-brand-strong [font-variant-numeric:tabular-nums]">
                {example.range}
              </p>

              <h3 className="mb-2 font-(family-name:--eg-font-primary) text-[15px] font-semibold">
                {example.label}
              </h3>

              <p className="text-[13px] leading-normal text-eg-text-muted">{example.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
