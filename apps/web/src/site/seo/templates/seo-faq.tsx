import { cn } from "@esigenta/ui";

import { blueprintEyebrowClassName } from "../../shared/section-header";
import { sectionTitleClassName } from "./seo-section-title";

export type SeoFaqItem = {
  question: string;
  answer: string;
};

export type SeoFaqProps = {
  faq: readonly SeoFaqItem[];
  /** Solo la guida costi apre la prima voce di default (docs/costi.html). */
  defaultOpenFirst?: boolean;
};

export function SeoFaq({ faq, defaultOpenFirst = false }: SeoFaqProps) {
  if (faq.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="seo-faq-title">
      <div className="mb-9 max-w-160">
        <p className={blueprintEyebrowClassName}>FAQ</p>

        <h2 id="seo-faq-title" className={cn(sectionTitleClassName, "mt-3")}>
          Domande frequenti
        </h2>
      </div>

      <div className="max-w-190 border-t border-eg-border">
        {faq.map((item, index) => (
          <details
            key={item.question}
            open={defaultOpenFirst && index === 0}
            className="group border-b border-eg-border"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4.5 font-(family-name:--eg-font-brand) text-[14.5px] font-semibold text-eg-ink marker:content-none [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                aria-hidden="true"
                className="shrink-0 text-lg font-normal text-eg-accent transition-transform duration-250 ease-(--eg-ease-brand) group-open:rotate-45"
              >
                +
              </span>
            </summary>

            <p className="max-w-165 pb-5 text-[14px] leading-[1.6] text-eg-ink">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
