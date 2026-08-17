import { cn } from "@esigenta/ui";

import type { PriceRow } from "../market-data/base-price-ranges";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { sectionTitleClassName } from "./seo-section-title";
import { splitCommaList, splitVisibleAndRest } from "./cost-guide-price-model";

/**
 * Scope 4B — "Cosa comprende" del prezzo principale (riga `role: "primary"`).
 * Non renderizzata quando non esiste una riga primary con includes/excludes
 * (guide senza `role` compilato): niente ipotesi su quale riga rappresenti
 * "il pacchetto", quell'informazione resta nel Breakdown come sempre.
 *
 * Due liste puntate affiancate su desktop, impilate su mobile — mai un unico
 * paragrafo lungo da capitolato. Il testo sorgente non cambia: le voci sono
 * lo stesso `includes`/`excludes` della SSOT, solo suddivise in elenco.
 *
 * Fix UI review: le prime VISIBLE_ITEMS_LIMIT voci restano bullet list
 * scannabile; le restanti (spesso la maggioranza, specie negli esclusi) si
 * leggono in una riga compatta sotto un separatore — MAI un accordion (voluto
 * esplicitamente) e MAI un contenuto nascosto: tutto il testo è sempre
 * visibile, solo con peso tipografico minore per non sembrare un capitolato.
 */
const VISIBLE_ITEMS_LIMIT = 5;

export type CostIncludedExcludedProps = {
  primary: PriceRow | null;
};

export function CostIncludedExcluded({ primary }: CostIncludedExcludedProps) {
  if (!primary || (!primary.includes && !primary.excludes)) return null;

  const included = splitCommaList(primary.includes);
  const excluded = splitCommaList(primary.excludes);

  return (
    <section aria-labelledby="cosa-comprende-title" className="eg-section-editorial border-t border-eg-border">
      <div className="eg-container">
        <div className="mb-8 max-w-170">
          <p className={blueprintEyebrowClassName}>Cosa comprende</p>

          <h2 id="cosa-comprende-title" className={cn(sectionTitleClassName, "mt-3")}>
            Cosa comprende il prezzo standard
          </h2>

          <p className="mt-3 max-w-160 text-[14px] leading-[1.6] text-eg-text-muted">
            Perimetro di “{primary.simpleLabel ?? primary.label}” ({primary.range})
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {included.length > 0 ? (
            <IncludedExcludedList title="Già compreso" items={included} tone="included" />
          ) : null}

          {excluded.length > 0 ? (
            <IncludedExcludedList title="A parte / escluso" items={excluded} tone="excluded" />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function IncludedExcludedList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "included" | "excluded";
}) {
  const { visible, rest } = splitVisibleAndRest(items, VISIBLE_ITEMS_LIMIT);

  return (
    <div className="border border-eg-border bg-eg-surface p-5.5">
      <p
        className={cn(
          "mb-3.5 border-b border-eg-border pb-2.5 font-(family-name:--eg-font-mono) text-[11.5px] uppercase tracking-widest",
          tone === "included" ? "text-eg-success" : "text-eg-text-muted",
        )}
      >
        {title}
      </p>

      <ul className="flex flex-col gap-2.5">
        {visible.map((item) => (
          <li key={item} className="flex gap-2.5 text-[13.5px] leading-normal text-eg-ink">
            <span
              aria-hidden="true"
              className={cn(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                tone === "included" ? "bg-eg-success" : "bg-eg-text-muted",
              )}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {rest.length > 0 ? (
        <p className="mt-3.5 border-t border-eg-border pt-3 text-[12px] leading-[1.6] text-eg-text-muted">
          {rest.join(", ")}
        </p>
      ) : null}
    </div>
  );
}
