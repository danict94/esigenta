import { cn } from "@esigenta/ui";

import type { PriceRow } from "../market-data/base-price-ranges";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { sectionTitleClassName } from "./seo-section-title";
import { describeAddsTo, isQuoteRequired } from "./cost-guide-price-model";

/**
 * Scope 4B — Livello 3 (extra): righe `role: "extra"`. Non renderizzata
 * quando `rows` è vuoto (guide senza `role` compilato: le righe restano nel
 * Breakdown come sempre). Mostra sempre le voci come CONDIZIONI eventuali,
 * mai come costi da sommare automaticamente al prezzo principale — nessun
 * riferimento al nome tecnico della relation (`addsTo`).
 */
export type CostExtrasProps = {
  rows: PriceRow[];
  allRows: readonly PriceRow[];
};

const electricalExtraContent = {
  "elettrico-ripristino-estetico-tracce": {
    title: "Ripristino estetico finale",
    description: "Rasatura, tinteggiatura e finiture necessarie dopo la chiusura grezza delle tracce.",
  },
  "elettrico-montante-contatore-quadro": {
    title: "Montante contatore → quadro",
    description: "Intervento sul collegamento tra contatore e quadro generale dell’abitazione.",
  },
  "elettrico-adeguamento-impianto-terra": {
    title: "Adeguamento o rifacimento della messa a terra",
    description: "Intervento generale sull’impianto di terra quando quello esistente richiede adeguamenti.",
  },
} as const;

function isElectricalExtra(rows: PriceRow[]): boolean {
  return rows.length === 3 && rows.every((row) => row.id in electricalExtraContent);
}

function isFacadeExtra(rows: PriceRow[]): boolean {
  return rows.length === 1 && rows[0]?.id === "facciata-fissativo-primer";
}

export function CostExtras({ rows, allRows }: CostExtrasProps) {
  if (rows.length === 0) return null;

  if (isElectricalExtra(rows)) {
    return <ElectricalExtrasSection rows={rows} />;
  }

  if (isFacadeExtra(rows)) {
    return <FacadeExtrasSection row={rows[0]!} />;
  }

  return (
    <section aria-labelledby="extra-title" className="eg-section-editorial border-t border-eg-border">
      <div className="eg-container">
        <div className="mb-8 max-w-170">
          <p className={blueprintEyebrowClassName}>Extra</p>

          <h2 id="extra-title" className={cn(sectionTitleClassName, "mt-3")}>
            Cosa può far salire il prezzo
          </h2>

          <p className="mt-3 max-w-160 text-[13.5px] leading-[1.6] text-eg-text-muted">
            Non sono compresi nel prezzo standard e non vanno sommati sempre: si applicano solo quando la condizione descritta è reale nel tuo caso.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rows.map((row) => (
            <ExtraCard key={row.id} row={row} allRows={allRows} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FacadeExtrasSection({ row }: { row: PriceRow }) {
  return (
    <section aria-labelledby="extra-title" className="eg-section-editorial border-t border-eg-border">
      <div className="eg-container">
        <div className="mb-8 max-w-170">
          <p className={blueprintEyebrowClassName}>Extra</p>

          <h2 id="extra-title" className={cn(sectionTitleClassName, "mt-3")}>
            Cosa può far salire il prezzo
          </h2>

          <p className="mt-3 max-w-160 text-[13.5px] leading-[1.6] text-eg-text-muted">
            Alcune lavorazioni si aggiungono solo quando richieste dalle condizioni del supporto e non vanno considerate automaticamente.
          </p>
        </div>

        <article className="border border-eg-warning-border bg-eg-warning-soft p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="font-(family-name:--eg-font-primary) text-[14.5px] font-semibold text-eg-ink">
              {row.simpleLabel ?? row.label}
            </h3>
            <p className="font-(family-name:--eg-font-primary) font-bold text-eg-ink [font-variant-numeric:tabular-nums]">
              3–7 €/mq
            </p>
          </div>

          <p className="mt-2 text-[13px] leading-normal text-eg-ink">{row.plainExplanation}</p>
        </article>
      </div>
    </section>
  );
}

function ElectricalExtrasSection({ rows }: { rows: PriceRow[] }) {
  return (
    <section aria-labelledby="extra-title" className="eg-section-editorial border-t border-eg-border">
      <div className="eg-container">
        <div className="mb-6 max-w-170">
          <p className={blueprintEyebrowClassName}>Extra</p>
          <h2 id="extra-title" className={cn(sectionTitleClassName, "mt-3")}>
            Cosa può far aumentare il prezzo
          </h2>
          <p className="mt-3 max-w-160 text-[13.5px] leading-[1.6] text-eg-text-muted">
            Alcune lavorazioni possono aggiungersi solo quando necessarie, in base alle condizioni dell’impianto e dell’immobile.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-eg-border">
          {rows.map((row) => {
            const content = electricalExtraContent[row.id as keyof typeof electricalExtraContent];

            return (
              <article key={row.id} className="border-t border-eg-border pt-4 lg:border-t-0 lg:px-5 lg:first:pl-0 lg:last:pr-0">
                <h3 className="font-(family-name:--eg-font-primary) text-[14.5px] font-semibold text-eg-ink">
                  {content.title}
                </h3>
                <p className="mt-2 font-(family-name:--eg-font-mono) text-[10.5px] font-semibold uppercase tracking-[0.06em] text-eg-text-muted">
                  Da valutare
                </p>
                <p className="mt-2.5 text-[13px] leading-normal text-eg-ink">{content.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ExtraCard({ row, allRows }: { row: PriceRow; allRows: readonly PriceRow[] }) {
  const description = row.plainExplanation ?? row.note;
  const addsToText = describeAddsTo(row, allRows);
  const priceText = isQuoteRequired(row) ? "Da valutare" : row.range;

  return (
    <article className="border border-eg-warning-border bg-eg-warning-soft p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-(family-name:--eg-font-primary) text-[14.5px] font-semibold text-eg-ink">
          {row.simpleLabel ?? row.label}
        </h3>

        <p className="font-(family-name:--eg-font-primary) font-bold text-eg-ink [font-variant-numeric:tabular-nums]">
          {priceText}
        </p>
      </div>

      {description ? (
        <p className="mt-2 text-[13px] leading-normal text-eg-ink">{description}</p>
      ) : null}

      {addsToText ? (
        <p className="mt-2.5 text-[12.5px] leading-normal font-medium text-eg-warning">{addsToText}</p>
      ) : null}
    </article>
  );
}
