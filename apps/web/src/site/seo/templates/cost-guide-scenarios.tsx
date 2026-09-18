import { cn } from "@esigenta/ui";

import type { ResolvedCostGuidePricePresentation } from "../pages/costi/types";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { sectionTitleClassName } from "./seo-section-title";

export type ScenarioExclusions = { title: string; items: readonly string[] };

export type ComparativeScenarioTableProps = {
  scenarios: ResolvedCostGuidePricePresentation["scenarios"];
  exclusions?: ScenarioExclusions;
};

export function ComparativeScenarioTable({ scenarios: resolvedScenarios, exclusions }: ComparativeScenarioTableProps) {
  if (resolvedScenarios.length === 0) return null;

  const scenarios = resolvedScenarios.map(({ row, presentation }) => ({
    title: presentation.title ?? row.simpleLabel ?? row.label,
    label: presentation.label,
    items: presentation.items,
    price: formatPriceRange(row.range),
  }));

  return (
    <section aria-labelledby="scenari-title" className="eg-section-editorial">
      <div className="eg-container">
        <div className="mb-7 max-w-170">
          <p className={blueprintEyebrowClassName}>Scenari</p>
          <h2 id="scenari-title" className={cn(sectionTitleClassName, "mt-3")}>
            {scenarios.length === 3 ? "Tre scenari di intervento" : "Quattro scenari di intervento"}
          </h2>
        </div>

        <div className="lg:overflow-hidden lg:rounded-eg-lg lg:border lg:border-eg-border lg:bg-eg-surface">
          <table className="w-full table-fixed border-collapse text-left">
            <thead className="hidden bg-eg-surface-muted lg:table-header-group">
              <tr>
                <th className="w-[28%] px-5 py-3 text-[11.5px] font-semibold text-eg-text-muted">Scenario</th>
                <th className="w-[20%] px-5 py-3 text-[11.5px] font-semibold text-eg-text-muted">Fascia indicativa</th>
                <th className="px-5 py-3 text-[11.5px] font-semibold text-eg-text-muted">Cosa comprende</th>
              </tr>
            </thead>
            <tbody className="grid gap-3 lg:table-row-group lg:gap-0">
              {scenarios.map((scenario) => (
                <tr key={scenario.title} className="block overflow-hidden rounded-eg-lg border border-eg-border bg-eg-surface lg:table-row lg:rounded-none lg:border-0 lg:border-b lg:border-eg-border last:lg:border-b-0">
                  <td className="block px-5 pb-2 pt-5 lg:table-cell lg:px-5 lg:py-5">
                    <h3 className="text-[15px] font-semibold leading-[1.45] text-eg-ink">{scenario.title}</h3>
                  </td>
                  <td data-label="Fascia indicativa" className="block px-5 pb-4 text-[22px] font-bold leading-tight text-eg-brand-strong [font-variant-numeric:tabular-nums] before:mb-1 before:block before:text-[10.5px] before:font-semibold before:text-eg-text-muted before:content-[attr(data-label)] lg:table-cell lg:px-5 lg:py-5 lg:text-[21px] lg:before:hidden">
                    {scenario.price}
                  </td>
                  <td data-label="Cosa comprende" className="block px-5 pb-5 lg:table-cell lg:px-5 lg:py-5">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-eg-text-muted">{scenario.label}</p>
                    <ul className="grid gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-2">
                      {scenario.items.map((item) => (
                        <li key={item} className="relative pl-3 text-[13px] leading-[1.45] text-eg-text-muted before:absolute before:left-0 before:top-[0.48em] before:size-1.25 before:rounded-full before:bg-eg-brand">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {exclusions ? <ScenarioExclusions {...exclusions} /> : null}
      </div>
    </section>
  );
}

function formatPriceRange(range: string): string {
  return range.replace(/^da (.+) a (.+)$/, "$1–$2").replace(/ al mq$/, "/mq");
}

function ScenarioExclusions({ title, items }: ScenarioExclusions) {
  return (
    <div className="mt-5 max-w-170 border-t border-eg-border pt-4">
      <h3 className="text-[15px] font-semibold text-eg-ink">{title}</h3>
      <ul className="mt-3 space-y-1.5 text-[13px] leading-normal text-eg-text-muted">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}
