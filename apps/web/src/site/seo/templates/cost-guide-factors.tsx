import { cn } from "@esigenta/ui";

import { blueprintEyebrowClassName } from "../../shared/section-header";
import { sectionTitleClassName } from "./seo-section-title";

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

export type CostFactorsProps = {
  factors: readonly string[];
  locationFactors?: readonly string[];
  topicLabel: string;
  compactContent?: { title: string; intro: string; factors: readonly string[] };
};

export function CostFactors({ factors, topicLabel, locationFactors = cityInfluenceFactors, compactContent }: CostFactorsProps) {
  if (compactContent) return <CompactFactors {...compactContent} />;

  return (
    <section aria-labelledby="fattori-costo-title" className="eg-section-editorial">
      <div className="eg-container">
        <div className="mb-7 max-w-170">
          <p className={blueprintEyebrowClassName}>Fattori</p>
          <h2 id="fattori-costo-title" className={cn(sectionTitleClassName, "mt-3")}>Da cosa dipende il prezzo</h2>
        </div>

        <div className="grid max-w-230 gap-9 md:grid-cols-2">
          <FactorGroup title="Il lavoro in sé" items={factors} />
          <div>
            <h3 className="mb-3 text-[15px] font-semibold text-eg-ink">La tua zona e il tuo edificio</h3>
            <p className="mb-4 max-w-160 text-[13.5px] leading-[1.6] text-eg-text-muted">
              {`Le fasce di questa guida sono nazionali: ${topicLabel} nella tua zona può costare diversamente in base a fattori locali, non a un prezzo di città che oggi non abbiamo.`}
            </p>
            <FactorList items={locationFactors} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CompactFactors({ title, intro, factors }: { title: string; intro: string; factors: readonly string[] }) {
  return (
    <section aria-labelledby="fattori-costo-title" className="eg-section-editorial">
      <div className="eg-container">
        <div className="mb-6 max-w-170">
          <p className={blueprintEyebrowClassName}>Fattori</p>
          <h2 id="fattori-costo-title" className={cn(sectionTitleClassName, "mt-3")}>{title}</h2>
          <p className="mt-3 max-w-160 text-[13.5px] leading-[1.6] text-eg-text-muted">{intro}</p>
        </div>
        <FactorList items={factors} className="grid max-w-230 gap-x-8 md:grid-cols-2" />
      </div>
    </section>
  );
}

function FactorGroup({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <h3 className="mb-3 text-[15px] font-semibold text-eg-ink">{title}</h3>
      <FactorList items={items} />
    </div>
  );
}

function FactorList({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn("grid gap-y-3", className)}>
      {items.map((item) => (
        <li key={item} className="relative pl-4 text-[13.5px] leading-normal text-eg-text-muted before:absolute before:left-0 before:top-[0.5em] before:size-1.25 before:rounded-full before:bg-eg-brand">
          {item}
        </li>
      ))}
    </ul>
  );
}
