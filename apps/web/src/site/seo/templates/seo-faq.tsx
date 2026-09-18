import { sectionTitleClassName } from "./seo-section-title";

export type SeoFaqItem = {
  question: string;
  answer: string;
};

export type SeoFaqProps = {
  faq: readonly SeoFaqItem[];
  title?: string;
  /** Solo la guida costi apre la prima voce di default (docs/costi.html). */
  defaultOpenFirst?: boolean;
  emphasizePhrase?: string;
};

export function SeoFaq({
  faq,
  title = "Domande frequenti",
  defaultOpenFirst = false,
  emphasizePhrase,
}: SeoFaqProps) {
  if (faq.length === 0) {
    return null;
  }

  return (
    <div aria-labelledby="seo-faq-title">
      <div className="mb-7 max-w-160">
        <h2 id="seo-faq-title" className={sectionTitleClassName}>
          {title}
        </h2>
      </div>

      <div className="max-w-190">
        {faq.map((item, index) => (
          <details
            key={item.question}
            open={defaultOpenFirst && index === 0}
            className="group border-b border-eg-border last:border-b-0"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15px] font-semibold text-eg-ink marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eg-brand-hover [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center text-[18px] font-normal text-eg-brand-strong transition-transform duration-250 ease-(--eg-ease-brand) group-open:rotate-45"
              >
                +
              </span>
            </summary>

            <p className="max-w-165 pb-5 text-[14px] leading-[1.6] text-eg-text-muted">
              <FaqAnswer answer={item.answer} emphasizePhrase={emphasizePhrase} />
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}

function FaqAnswer({ answer, emphasizePhrase }: { answer: string; emphasizePhrase?: string }) {
  if (!emphasizePhrase || !answer.includes(emphasizePhrase)) return answer;

  return answer.split(emphasizePhrase).map((part, index, parts) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 ? <strong>{emphasizePhrase}</strong> : null}
    </span>
  ));
}
