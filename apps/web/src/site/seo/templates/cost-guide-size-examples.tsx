import { cn } from "@esigenta/ui";
import type { ReactNode } from "react";

import type { SizeExample } from "../market-data/shared/types";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { sectionTitleClassName } from "./seo-section-title";

export type CostSizeExamplesProps = {
  sizeExamples: readonly SizeExample[];
  table: {
    title: string;
    intro?: ReactNode;
    notes?: readonly ReactNode[];
    sizeUnit?: "mq" | "m²";
    surfaceLabel?: string;
  };
};

function formatSizeRange(sizeRange: string, sizeUnit: "mq" | "m²"): string {
  return sizeUnit === "m²" ? sizeRange.replace(" mq", " m²") : sizeRange;
}

function formatExamplePrice(range: string): string {
  return range.replace(/^da (.+) € a (.+) €$/, "$1–$2 €");
}

export function CostSizeExamples({ sizeExamples, table }: CostSizeExamplesProps) {
  if (sizeExamples.length === 0) return null;

  return <SizeExamplesTable sizeExamples={sizeExamples} {...table} />;
}

function SizeExamplesTable({
  sizeExamples,
  title,
  intro,
  notes,
  sizeUnit = "mq",
  surfaceLabel = "Superficie",
}: {
  sizeExamples: readonly SizeExample[];
  title: string;
  intro?: ReactNode;
  notes?: readonly ReactNode[];
  sizeUnit?: "mq" | "m²";
  surfaceLabel?: string;
}) {
  return (
    <section aria-labelledby="esempi-costo-title" className="eg-section-editorial">
      <div className="eg-container">
        <div className="mb-6 max-w-170">
          <p className={blueprintEyebrowClassName}>Esempi</p>
          <h2 id="esempi-costo-title" className={cn(sectionTitleClassName, "mt-3")}>
            {title}
          </h2>
          {intro ? <p className="mt-3 text-[13.5px] leading-[1.6] text-eg-text-muted">{intro}</p> : null}
        </div>

        <div className="max-w-170 overflow-hidden rounded-eg-lg border border-eg-border bg-eg-surface">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
            <p className="px-5 py-3 text-[12.5px] font-semibold text-eg-text-muted">{surfaceLabel}</p>
            <p className="px-5 py-3 text-right text-[12.5px] font-semibold text-eg-text-muted">Costo indicativo</p>
          </div>
          {sizeExamples.map((example) => (
            <div key={example.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] border-t border-eg-border">
              <p className="px-5 py-4 text-[14px] font-medium text-eg-ink">{formatSizeRange(example.sizeRange ?? "", sizeUnit)}</p>
              <p className="px-5 py-4 text-right font-(family-name:--eg-font-primary) text-[16px] font-bold leading-tight text-eg-brand-strong [font-variant-numeric:tabular-nums]">{formatExamplePrice(example.range)}</p>
            </div>
          ))}
        </div>

        {notes && notes.length > 0 ? (
          <div className="mt-5 max-w-170 space-y-2 text-[13px] leading-[1.6] text-eg-text-muted">
            {notes.map((note, index) => <p key={index}>{note}</p>)}
          </div>
        ) : null}
      </div>
    </section>
  );
}
