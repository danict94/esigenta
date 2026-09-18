import { cn } from "@esigenta/ui";

import type { PriceRow } from "../market-data/shared/types";
import type { CostGuideExtraPresentation } from "../pages/costi/types";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { sectionTitleClassName } from "./seo-section-title";
import { describeAddsTo, isQuoteRequired } from "./cost-guide-price-model";

export type CostExtrasProps = {
  rows: PriceRow[];
  allRows: readonly PriceRow[];
  presentation?: { title: string; intro: string; layout?: "cards" | "columns" };
  rowPresentation?: readonly CostGuideExtraPresentation[];
};

export function CostExtras({ rows, allRows, presentation, rowPresentation = [] }: CostExtrasProps) {
  if (rows.length === 0) return null;

  const presentationByRowId = new Map(rowPresentation.map((item) => [item.rowId, item]));

  return (
    <section aria-labelledby="extra-title" className="eg-section-editorial">
      <div className="eg-container">
        <div className="mb-7 max-w-170">
          <p className={blueprintEyebrowClassName}>Extra</p>
          <h2 id="extra-title" className={cn(sectionTitleClassName, "mt-3")}>
            {presentation?.title ?? "Cosa può far salire il prezzo"}
          </h2>
          <p className="mt-3 max-w-160 text-[13.5px] leading-[1.6] text-eg-text-muted">
            {presentation?.intro ?? "Non sono compresi nel prezzo standard e non vanno sommati sempre: si applicano solo quando la condizione descritta è reale nel tuo caso."}
          </p>
        </div>

        <div className="grid max-w-230 gap-x-7 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <ExtraItem
              key={row.id}
              row={row}
              allRows={allRows}
              presentation={presentationByRowId.get(row.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ExtraItem({ row, allRows, presentation }: {
  row: PriceRow;
  allRows: readonly PriceRow[];
  presentation?: CostGuideExtraPresentation;
}) {
  const description = presentation?.description ?? row.plainExplanation ?? row.note;
  const priceText = isQuoteRequired(row) ? "Da valutare" : row.range;
  const title = presentation?.title ?? row.simpleLabel ?? row.label;
  const addsToText = describeAddsTo(row, allRows);

  return (
    <article className="border-t border-eg-border pt-4">
      <h3 className="text-[15px] font-semibold leading-snug text-eg-ink">{title}</h3>
      <p className="mt-2 font-(family-name:--eg-font-primary) text-[13px] font-semibold text-eg-text-muted [font-variant-numeric:tabular-nums]">
        {priceText}
      </p>
      {description ? <p className="mt-2.5 text-[13px] leading-[1.55] text-eg-text-muted">{description}</p> : null}
      {addsToText ? <p className="mt-2 text-[12px] font-medium leading-normal text-eg-warning">{addsToText}</p> : null}
    </article>
  );
}
