import {
  Card,
  CardContent,
  cn,
  tokens,
} from "@fixpro/ui";

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
    <section
      aria-labelledby="seo-faq-title"
      className={cn("space-y-6", tokens.home.sectionGap)}
    >
      <div className="max-w-3xl">
        <p className={tokens.home.sectionLabel}>FAQ</p>

        <h2
          id="seo-faq-title"
          className={cn("mt-2", tokens.home.sectionTitle)}
        >
          Domande frequenti
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {faq.map((item) => (
          <Card key={item.question}>
            <CardContent className="space-y-3 pt-6">
              <h3 className="text-lg font-semibold leading-7 text-text-primary">
                {item.question}
              </h3>

              <p className="text-sm leading-6 text-text-secondary">
                {item.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
