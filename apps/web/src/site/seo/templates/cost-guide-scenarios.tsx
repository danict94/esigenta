import { cn } from "@esigenta/ui";

import type { PriceRow } from "../market-data/base-price-ranges";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { sectionTitleClassName } from "./seo-section-title";
import { shortSummary } from "./cost-guide-price-model";

/**
 * Scope 4B — Livello 2 (scenari): righe `role: "primary"` + `role:
 * "scenario"`, nell'ordine dell'SSOT. Non renderizzata quando `rows` è
 * vuoto (guide senza `role` compilato: nessuno scenario inventato, le
 * righe restano nel Breakdown come sempre — vedi cost-guide-price-model.ts).
 *
 * Mobile: card impilate verticalmente (niente carosello). Desktop: card
 * affiancate. La riga `role: "primary"` riceve maggiore risalto — segnale
 * derivato dal dato, mai un'etichetta "primary/scenario" mostrata all'utente.
 */
export type CostScenarioCardsProps = {
  rows: PriceRow[];
};

export function CostScenarioCards({ rows }: CostScenarioCardsProps) {
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="scenari-title" className="eg-section-editorial border-t border-eg-border">
      <div className="eg-container">
        <div className="mb-8 max-w-170">
          <p className={blueprintEyebrowClassName}>Quanto può costare</p>

          <h2 id="scenari-title" className={cn(sectionTitleClassName, "mt-3")}>
            Scegli lo scenario più vicino al tuo caso
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <ScenarioCard key={row.id} row={row} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ScenarioCard({ row }: { row: PriceRow }) {
  const isPrimary = row.role === "primary";
  // Fix UI review: niente più line-clamp CSS (troncava a metà parola/elenco,
  // es. "...del mobile o del box..."). shortSummary si ferma sempre a un
  // confine di frase reale, altezza naturale della card.
  const description = shortSummary(row.plainExplanation ?? row.note);

  return (
    <article
      className={cn(
        "eg-panel flex flex-col gap-3 p-6",
        isPrimary && "border-eg-brand-strong ring-1 ring-eg-brand-strong",
      )}
    >
      {isPrimary ? (
        <span className="w-fit bg-eg-brand-soft px-2.5 py-1 font-(family-name:--eg-font-mono) text-[10.5px] font-bold uppercase tracking-[0.06em] text-eg-brand-strong">
          Standard
        </span>
      ) : null}

      <h3 className="font-(family-name:--eg-font-primary) text-[15.5px] font-semibold leading-snug text-eg-ink">
        {row.simpleLabel ?? row.label}
      </h3>

      <p className="font-(family-name:--eg-font-primary) text-[22px] font-bold leading-tight text-eg-brand-strong [font-variant-numeric:tabular-nums]">
        {row.range}
      </p>

      {description ? (
        <p className="text-[13px] leading-normal text-eg-text-muted">{description}</p>
      ) : null}
    </article>
  );
}
