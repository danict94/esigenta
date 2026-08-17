import { cn } from "@esigenta/ui";

import type { PriceRow } from "../market-data/base-price-ranges";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { sectionTitleClassName } from "./seo-section-title";
import { CostHighlight } from "./cost-highlight";

const DEFAULT_MQ_CAVEAT =
  "Valore di riferimento utile solo per confrontare preventivi già ricevuti: non moltiplicarlo per i mq per ottenere un totale.";

/**
 * Scope 4B — Livello 5 (riferimenti secondari): sempre presente il costo al
 * mq (campo `pricePerSquareMeter`, esiste su tutte e 6 le guide), più le
 * righe `role: "reference"` quando presenti (solo bagno oggi). Peso visivo
 * deliberatamente minore del prezzo principale — mai nello stesso stile
 * grande/grassetto dell'Hero o degli Scenari, per non farle sembrare
 * equivalenti al prezzo principale.
 *
 * Fix UI review: le righe reference con un range aperto (es. "oltre 12.000 €,
 * senza un massimo definito") NON usano più il layout label/prezzo allineati
 * a destra come una card di prezzo comparabile — il range entra nel testo
 * come premessa, non come cifra isolata, con un kicker che dichiara
 * esplicitamente che si tratta di una soglia, non di un'altra opzione.
 */
export type CostReferenceProps = {
  pricePerSquareMeter?: string;
  rows: PriceRow[];
};

export function CostReference({ pricePerSquareMeter, rows }: CostReferenceProps) {
  if (!pricePerSquareMeter && rows.length === 0) return null;

  // Se una riga reference è già la lettura al mq (es. "Costo indicativo al
  // mq"), la sua nota diventa la spiegazione del box mq: evita di ripetere
  // lo stesso numero due volte nella sezione.
  const mqRow = rows.find((row) => row.unit === "al mq");
  const otherRows = rows.filter((row) => row.id !== mqRow?.id);
  const mqCaveat = mqRow?.plainExplanation ?? mqRow?.note ?? DEFAULT_MQ_CAVEAT;

  return (
    <section aria-labelledby="riferimenti-title" className="eg-section-editorial border-t border-eg-border">
      <div className="eg-container">
        <div className="mb-7 max-w-170">
          <p className={blueprintEyebrowClassName}>Altri riferimenti utili</p>

          <h2 id="riferimenti-title" className={cn(sectionTitleClassName, "mt-3")}>
            Valori di confronto, non da sommare al prezzo
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)]">
          {pricePerSquareMeter ? (
            <div>
              <CostHighlight label="Costo al mq (riferimento)" value={pricePerSquareMeter} />
              <p className="mt-2.5 max-w-100 text-[12.5px] leading-normal text-eg-text-muted">{mqCaveat}</p>
            </div>
          ) : null}

          {otherRows.length > 0 ? (
            <div className="flex flex-col gap-4">
              <p className="font-(family-name:--eg-font-mono) text-[11px] font-semibold uppercase tracking-widest text-eg-text-muted">
                Quando il costo può superare la fascia standard
              </p>

              <ul className="flex flex-col gap-4">
                {otherRows.map((row) => (
                  <li key={row.id} className="border-l-2 border-eg-border pl-4">
                    <p className="font-(family-name:--eg-font-primary) text-[13px] font-semibold text-eg-ink">
                      {row.simpleLabel ?? row.label}
                    </p>

                    <p className="mt-1 text-[12.5px] leading-normal text-eg-text-muted">
                      {row.range ? <span className="font-medium text-eg-ink">{row.range}.</span> : null}{" "}
                      {row.plainExplanation ?? row.note}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
