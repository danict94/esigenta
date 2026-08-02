import Link from "next/link";

import { Reveal } from "../shared/reveal";
import { blueprintEyebrowClassName, blueprintTitleClassName, SectionHeader } from "../shared/section-header";

type TrustItem = {
  question: string;
  answer: string;
};

const trustItems: TrustItem[] = [
  {
    question: "Chi fa il lavoro",
    answer:
      "Esigenta ti mette in contatto con le imprese; il lavoro lo esegue l'impresa che scegli tu.",
  },
  {
    question: "Non serve sapere il mestiere giusto",
    answer:
      "Descrivi il problema con parole tue: individuiamo noi la categoria di professionista adatta.",
  },
  {
    question: "Nessun costo, nessun obbligo",
    answer:
      "Scrivere una richiesta è gratuito e non ti impegna ad accettare nessuna proposta.",
  },
  {
    question: "La scelta resta tua",
    answer: "Confronti le risposte e decidi tu se, come e con chi procedere.",
  },
];

export function HomeTrustSection() {
  return (
    <section className="relative z-1 bg-eg-ink py-24 text-eg-on-brand max-[600px]:py-16" aria-labelledby="trust-title">
      <div className="eg-container">
        <Reveal>
          <SectionHeader
            eyebrow="Prima di iniziare"
            title="Cosa succede quando scrivi una richiesta."
            id="trust-title"
            className="max-w-160 text-left mb-14"
            eyebrowClassName={blueprintEyebrowClassName}
            titleClassName={`${blueprintTitleClassName} text-eg-on-brand`}
          />
        </Reveal>

        <Reveal>
          <dl className="grid grid-cols-1 gap-px border border-eg-on-brand-border bg-eg-on-brand-border min-[861px]:grid-cols-2">
            {trustItems.map((item) => (
              <div
                key={item.question}
                className="bg-eg-ink px-8 py-7.5 transition-colors duration-250 ease-(--eg-ease-brand) hover:bg-[color-mix(in_srgb,var(--eg-color-ink)_88%,white)]"
              >
                <dt className="eg-h3 text-[15.5px] font-semibold text-eg-on-brand">{item.question}</dt>
                <dd className="eg-body-muted mt-2.5 text-[14.5px] text-eg-on-brand-muted">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-eg-on-brand-border pt-6 font-(family-name:--eg-font-brand) text-[13.5px] text-eg-on-brand-muted">
          <span>Guide ai costi già pubblicate:</span>
          <Link href="/costi/ristrutturare-bagno" prefetch={false} className="text-eg-brand-on-dark hover:underline">
            ristrutturare bagno
          </Link>
          <span aria-hidden="true" className="opacity-40">·</span>
          <Link href="/costi/rifare-tetto" prefetch={false} className="text-eg-brand-on-dark hover:underline">
            rifare tetto
          </Link>
          <span aria-hidden="true" className="opacity-40">|</span>
          <Link href="/privacy" prefetch={false} className="text-eg-brand-on-dark hover:underline">
            Come trattiamo i tuoi dati &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
