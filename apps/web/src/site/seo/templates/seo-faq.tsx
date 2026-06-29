import { cn } from "@esigenta/ui";

export type SeoFaqItem = {
  question: string;
  answer: string;
};

export type SeoFaqProps = {
  faq: readonly SeoFaqItem[];
};

export function SeoFaq({ faq }: SeoFaqProps) {
  if (faq.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="seo-faq-title" className="space-y-6">
      <div className="max-w-3xl">
        <p className={"text-sm font-medium text-cantiere-accent"}>FAQ</p>

        <h2
          id="seo-faq-title"
          className="mt-2 text-3xl font-semibold leading-tight text-cantiere-ink md:text-4xl"
        >
          Domande frequenti
        </h2>
      </div>

      <div
        className={cn(
          "rounded-lg",
          "divide-y divide-border-primary border-y border-cantiere-hairline",
        )}
      >
        {faq.map((item) => (
          <article
            key={item.question}
            className="grid gap-3 py-5 md:grid-cols-[0.42fr_1fr] md:gap-8 md:py-6"
          >
            <h3 className="text-lg font-semibold leading-7 text-cantiere-ink">
              {item.question}
            </h3>

            <p className="text-base leading-7 text-cantiere-ink-secondary">
              {item.answer}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
