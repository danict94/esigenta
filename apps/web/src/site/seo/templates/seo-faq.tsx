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
    <section aria-labelledby="seo-faq-title" className="space-y-8">
      <div className="mx-auto max-w-[760px] text-center">
        <p className="eg-eyebrow">FAQ</p>

        <h2 id="seo-faq-title" className="eg-h2 mt-4">
          Domande frequenti
        </h2>
      </div>

      <div className="border-y border-eg-hairline">
        {faq.map((item) => (
          <article
            key={item.question}
            className="grid gap-4 border-b border-eg-hairline py-6 last:border-b-0 md:grid-cols-[0.42fr_1fr] md:gap-10"
          >
            <h3 className="eg-h3 text-[22px]">{item.question}</h3>

            <p className="eg-body-muted">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
