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
  electricalVariant?: boolean;
};

function formatElectricalSizeRange(sizeRange: string): string {
  return sizeRange.replace(" mq", " m²");
}

function formatElectricalExamplePrice(range: string): string {
  return range.replace(/^da (.+) € a (.+) €$/, "$1–$2 €");
}

export function CostSizeExamples({ sizeExamples, sizeExamplesIntro, electricalVariant = false }: CostSizeExamplesProps) {
  if (sizeExamples.length === 0) return null;

  if (electricalVariant) {
    return <ElectricalSizeExamples sizeExamples={sizeExamples} />;
  }

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

function ElectricalSizeExamples({ sizeExamples }: { sizeExamples: readonly SizeExample[] }) {
  return (
    <section aria-labelledby="esempi-costo-title" className="eg-section-editorial border-t border-eg-border">
      <div className="eg-container">
        <div className="mb-6 max-w-170">
          <h2 id="esempi-costo-title" className={sectionTitleClassName}>
            Esempi di costo per metratura
          </h2>
          <p className="mt-3 text-[13.5px] leading-[1.6] text-eg-text-muted">
            Stime calcolate sulla fascia 55–90 €/m² del rifacimento completo standard.
          </p>
        </div>

        <div className="max-w-170 overflow-hidden border border-eg-border bg-white">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
            <p className="px-5 py-3 text-[13px] font-semibold text-eg-ink">
              Superficie
            </p>
            <p className="border-l border-eg-border px-5 py-3 text-[13px] font-semibold text-eg-ink">
              Costo indicativo
            </p>
          </div>

          {sizeExamples.map((example) => (
            <div key={example.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] border-t border-eg-border">
              <p className="px-5 py-4 text-[14px] font-medium text-eg-ink">{formatElectricalSizeRange(example.sizeRange ?? "")}</p>
              <p className="border-l border-eg-border px-5 py-4 font-(family-name:--eg-font-primary) text-[16px] font-bold leading-tight text-eg-brand-strong [font-variant-numeric:tabular-nums]">
                {formatElectricalExamplePrice(example.range)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 max-w-170 space-y-2 text-[13px] leading-[1.6] text-eg-text-muted">
          <p>
            Le stime per metratura sono ottenute applicando la fascia standard di 55–90 €/m² alla superficie: non sono rilevazioni di mercato indipendenti per ciascun taglio.
          </p>
          <p>
            Negli appartamenti piccoli il costo al m² può risultare più alto, perché quadro elettrico, verifiche e alcune lavorazioni minime non diminuiscono in proporzione alla superficie.
          </p>
        </div>
      </div>
    </section>
  );
}
