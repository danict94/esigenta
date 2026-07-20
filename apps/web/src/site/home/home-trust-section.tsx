import Link from "next/link";

import { SectionHeader } from "./section-header";

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
    <section className="eg-section-large bg-eg-calce" aria-labelledby="trust-title">
      <div className="eg-container">
        <SectionHeader
          eyebrow="Prima di iniziare"
          title="Cosa succede quando scrivi una richiesta."
          id="trust-title"
          className="text-left"
        />

        <dl className="mt-[54px] grid gap-x-12 gap-y-10 min-[861px]:grid-cols-2">
          {trustItems.map((item) => (
            <div key={item.question} className="border-t border-eg-hairline pt-5">
              <dt className="eg-h3 text-[20px]">{item.question}</dt>
              <dd className="eg-body-muted mt-2">{item.answer}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 flex flex-col gap-2 border-t border-eg-hairline pt-6 min-[861px]:flex-row min-[861px]:items-center min-[861px]:justify-between">
          <p className="eg-form-help">
            Guide ai costi già pubblicate:{" "}
            <Link href="/costi/ristrutturare-bagno" prefetch={false} className="text-eg-cotto-dark">
              ristrutturare bagno
            </Link>
            {" · "}
            <Link href="/costi/rifare-tetto" prefetch={false} className="text-eg-cotto-dark">
              rifare tetto
            </Link>
          </p>

          <Link href="/privacy" prefetch={false} className="eg-link-mono shrink-0">
            Come trattiamo i tuoi dati <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
