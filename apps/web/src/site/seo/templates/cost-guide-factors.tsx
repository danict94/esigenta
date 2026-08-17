import { cn } from "@esigenta/ui";

import { blueprintEyebrowClassName } from "../../shared/section-header";
import { sectionTitleClassName } from "./seo-section-title";

/**
 * Fase 5.G — fattori generici (non specifici di una città, nessun link,
 * nessun prezzo locale) sul perché il preventivo può variare per zona. Le
 * pagine città sono disabilitate: vedi engine/static-params.ts. Spostato qui
 * (Scope 4B) da cost-page-template.tsx insieme al resto del blocco fattori.
 */
const cityInfluenceFactors: readonly string[] = [
  "accesso al cantiere",
  "piano dell'immobile e disponibilità dell'ascensore",
  "parcheggio e carico/scarico dei materiali",
  "regole condominiali sugli orari di cantiere",
  "trasporto dei materiali fino al cantiere",
  "smaltimento delle macerie",
  "disponibilità dei professionisti nella zona",
  "complessità e stato dell'immobile",
];

/**
 * Scope 4B — "Da cosa dipende il prezzo": stesso contenuto di prima
 * (`factors` editoriali + fattori di zona condivisi), estratto in
 * componente dedicato e alleggerito nella presentazione (Task 11): titolo
 * generico, non più una sequenza di card tutte uguali.
 */
export type CostFactorsProps = {
  factors: readonly string[];
  topicLabel: string;
};

export function CostFactors({ factors, topicLabel }: CostFactorsProps) {
  return (
    <section aria-labelledby="fattori-costo-title" className="eg-section-editorial border-t border-eg-border">
      <div className="eg-container">
        <div className="mb-8 max-w-170">
          <p className={blueprintEyebrowClassName}>Cosa incide sul prezzo</p>

          <h2 id="fattori-costo-title" className={cn(sectionTitleClassName, "mt-3")}>
            Da cosa dipende il prezzo
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3.5 border-b border-eg-border pb-2.5 font-(family-name:--eg-font-mono) text-[11.5px] uppercase tracking-widest text-eg-brand-strong">
              Il lavoro in s&eacute;
            </p>

            <ul className="flex flex-col gap-2">
              {factors.map((factor) => (
                <li key={factor} className="flex gap-2.5 text-[13.5px] leading-normal text-eg-ink">
                  <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-eg-brand" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3.5 border-b border-eg-border pb-2.5 font-(family-name:--eg-font-mono) text-[11.5px] uppercase tracking-widest text-eg-brand-strong">
              La tua zona e il tuo edificio
            </p>

            <p className="mb-4 max-w-160 text-[13.5px] leading-[1.6] text-eg-ink">
              {/* Stringa unica via template literal: JSX collassa lo spazio tra
                  {topicLabel} e il testo successivo quando sono su righe
                  diverse, producendo "tettonella tua zona" invece di "tetto
                  nella tua zona" — bug shared, un solo fix qui. */}
              {`Le fasce di questa guida sono nazionali: ${topicLabel} nella tua zona può costare diversamente in base a fattori locali, non a un prezzo di città che oggi non abbiamo.`}
            </p>

            <ul className="flex flex-col gap-2">
              {cityInfluenceFactors.map((factor) => (
                <li key={factor} className="flex gap-2.5 text-[13.5px] leading-normal text-eg-ink">
                  <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-eg-brand" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
