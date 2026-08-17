import { cn } from "@esigenta/ui";

import type { PriceRow } from "../market-data/base-price-ranges";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { sectionTitleClassName } from "./seo-section-title";
import {
  describeAlternative,
  describeCostTypeBadge,
  describeIncludedIn,
  groupPriceRowsByCategory,
  isQuoteRequired,
  splitCommaList,
} from "./cost-guide-price-model";

/**
 * Scope 4B — Livello 4 (dettaglio): sostituisce la vecchia PriceTable
 * (tabella piatta a 4 colonne). Le righe restanti dopo Scenari/Extra/
 * Reference, raggruppate per `category` (campo esistente, generico — non
 * categorie hardcoded per il bagno, vedi cost-guide-price-model.ts). Su una
 * guida senza `role` compilato, `rows` è l'intero array della guida: stesso
 * contenuto della vecchia tabella, solo diversa presentazione.
 *
 * Ogni riga è già leggibile in forma sintetica (nome, prezzo, unità, una
 * spiegazione breve, badge solo quando utili). I dettagli tecnici completi
 * (includes/excludes per intero, nota tecnica, codice di capitolato) sono
 * dietro un `<details>` leggero PER RIGA — non un accordion pesante, e mai
 * un accordion per GRUPPO: i gruppi restano sempre visibili.
 */
export type CostBreakdownProps = {
  rows: PriceRow[];
  allRows: readonly PriceRow[];
  sourceLabel?: string;
  sourceYear?: string;
};

export function CostBreakdown({ rows, allRows, sourceLabel, sourceYear }: CostBreakdownProps) {
  if (rows.length === 0) return null;

  const groups = groupPriceRowsByCategory(rows);

  return (
    <section aria-labelledby="lavorazioni-title" className="eg-section-editorial border-t border-eg-border">
      <div className="eg-container">
        <div className="mb-8 max-w-170">
          <p className={blueprintEyebrowClassName}>Dettaglio</p>

          <h2 id="lavorazioni-title" className={cn(sectionTitleClassName, "mt-3")}>
            Prezzi delle singole lavorazioni
          </h2>

          <p className="mt-3 max-w-160 text-[13.5px] leading-[1.6] text-eg-text-muted">
            Alcune di queste lavorazioni sono già comprese nel prezzo standard più sopra: quando lo sono, la riga lo indica esplicitamente e non va sommata di nuovo.
          </p>
        </div>

        <div className="flex flex-col gap-9">
          {groups.map((group) => {
            const categoryNote = group.rows.find((row) => row.categoryNote)?.categoryNote;

            return (
              <div key={group.category}>
                <h3 className="border-b border-eg-border pb-2.5 font-(family-name:--eg-font-mono) text-[12px] uppercase tracking-[0.08em] text-eg-text-muted">
                  {group.category}
                </h3>

                {categoryNote ? (
                  <p className="mt-2.5 text-[12.5px] leading-normal text-eg-text-muted">{categoryNote}</p>
                ) : null}

                <div className="mt-3.5 flex flex-col divide-y divide-eg-border border-y border-eg-border">
                  {group.rows.map((row) => (
                    <BreakdownRow key={row.id} row={row} allRows={allRows} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {sourceLabel ? (
          <p className="mt-7 text-center font-(family-name:--eg-font-primary) text-[12.5px] text-eg-ink">
            {sourceLabel}
            {sourceYear ? `, aggiornati ${sourceYear}` : null}. Le fasce non sono un preventivo: il prezzo reale dipende dal sopralluogo.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function BreakdownRow({ row, allRows }: { row: PriceRow; allRows: readonly PriceRow[] }) {
  const quoteRequired = isQuoteRequired(row);
  const usesPlainExplanationAsSummary = Boolean(row.plainExplanation);
  const summary = row.plainExplanation ?? row.note;

  const costTypeBadge = describeCostTypeBadge(row);
  const includedInText = describeIncludedIn(row, allRows);
  const alternativeText = describeAlternative(row, allRows);

  const includedItems = splitCommaList(row.includes);
  const excludedItems = splitCommaList(row.excludes);
  const noteInDetails = usesPlainExplanationAsSummary ? row.note : null;

  const hasDetails = Boolean(
    includedItems.length > 0 || excludedItems.length > 0 || row.technicalCode || noteInDetails,
  );

  return (
    <div className="py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <p className="font-(family-name:--eg-font-primary) text-[14.5px] font-semibold text-eg-ink">
            {row.simpleLabel ?? row.label}
          </p>

          {row.simpleLabel && row.simpleLabel !== row.label ? (
            <p className="mt-0.5 font-(family-name:--eg-font-mono) text-[10.5px] text-eg-text-muted">
              {row.label}
              {row.technicalCode ? ` — ${row.technicalCode}` : null}
            </p>
          ) : null}

          {row.unit ? (
            <p className="mt-0.5 font-(family-name:--eg-font-mono) text-[10.5px] text-eg-text-muted">
              {row.unitLabel ? `${row.unitLabel} (${row.unit})` : row.unit}
            </p>
          ) : null}
        </div>

        <p
          className={cn(
            "shrink-0 font-(family-name:--eg-font-primary) [font-variant-numeric:tabular-nums]",
            quoteRequired ? "text-[13px] font-medium text-eg-text-muted" : "font-bold text-eg-ink",
          )}
        >
          {row.range}
        </p>
      </div>

      {summary ? <p className="mt-1.5 max-w-140 text-[13px] leading-normal text-eg-text-muted">{summary}</p> : null}

      {costTypeBadge || includedInText || alternativeText ? (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {costTypeBadge ? (
            <span className="inline-block border border-eg-border px-2 py-0.5 font-(family-name:--eg-font-mono) text-[10px] font-semibold uppercase tracking-wide text-eg-text-muted">
              {costTypeBadge}
            </span>
          ) : null}

          {includedInText ? (
            <span className="text-[12px] font-medium text-eg-success">{includedInText}</span>
          ) : null}

          {alternativeText ? (
            <span className="text-[12px] font-medium text-eg-brand-hover">{alternativeText}</span>
          ) : null}
        </div>
      ) : null}

      {hasDetails ? (
        <details className="group mt-2">
          <summary className="cursor-pointer list-none text-[12px] font-semibold text-eg-brand-hover marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">+ Dettagli</span>
            <span className="hidden group-open:inline">– Nascondi dettagli</span>
          </summary>

          <div className="mt-2 max-w-140 text-[12.5px] leading-normal text-eg-text-muted">
            {noteInDetails ? <p className="mb-2">{noteInDetails}</p> : null}

            {includedItems.length > 0 ? (
              <p className="mb-1.5">
                <span className="font-semibold text-eg-success">Incluso: </span>
                {includedItems.join(", ")}
              </p>
            ) : null}

            {excludedItems.length > 0 ? (
              <p>
                <span className="font-semibold text-eg-error">Escluso: </span>
                {excludedItems.join(", ")}
              </p>
            ) : null}
          </div>
        </details>
      ) : null}
    </div>
  );
}
