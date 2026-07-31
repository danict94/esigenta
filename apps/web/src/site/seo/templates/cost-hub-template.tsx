import Link from "next/link";

import type { CostHubCategoryGroup } from "../engine/cost-hub";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  serializeJsonLd,
} from "../engine/schema-builder";
import { PublicShell } from "../../shell/public-shell";
import { SeoFaq } from "./seo-faq";

export type CostHubPageProps = {
  categories: readonly CostHubCategoryGroup[];
};

// Testo generico, valido per qualunque guida: nessun numero, nessun
// riferimento a una lavorazione specifica (quelli vivono nelle singole
// guide). Evita duplicazione con le sezioni "Fattori"/"Note" già presenti
// in ogni pagina guida.
const readingGuideItems: readonly string[] = [
  "Ogni riga di una tabella descrive una lavorazione specifica, non un pacchetto di lavori.",
  "Cosa comprende e cosa esclude ogni voce dipende dal capitolato: leggi sempre incluso ed escluso.",
  "€/m², €/m, €/cad e i prezzi a corpo non sono equivalenti: confronta solo voci con la stessa unità.",
  "Alcune voci sono alternative tra loro, altre sono complementari e si aggiungono.",
  "Non tutte le voci di una tabella vanno sommate per ottenere un totale.",
];

const unitVsQuoteItems: readonly string[] = [
  "Il prezzo unitario di una voce non è il totale del lavoro.",
  "Il preventivo dipende da quantità, accessibilità, materiali, opere accessorie e organizzazione del cantiere.",
  "I valori di queste guide non sono un tariffario nazionale.",
  "Il totale non si ottiene scegliendo il valore più basso della tabella né sommando automaticamente tutte le righe.",
];

const sourcesItems: readonly string[] = [
  "Prezzari regionali dei lavori pubblici.",
  "Fonti istituzionali.",
  "Documenti tecnici ufficiali.",
  "Eventuali confronti di mercato secondari, sempre segnalati chiaramente come tali.",
];

// Solo domande sul sito/metodo di calcolo, mai su una lavorazione specifica:
// le FAQ di bagno/tetto/impianto elettrico restano nelle singole guide.
const costHubFaq: readonly { question: string; answer: string }[] = [
  {
    question: "I prezzi mostrati sono preventivi finali?",
    answer:
      "No. Sono prezzi ufficiali o range indicativi per singole voci di lavorazione: il preventivo reale dipende dal sopralluogo, dalle quantità e dalle condizioni del cantiere.",
  },
  {
    question: "Perché i prezzi cambiano tra una regione e l'altra?",
    answer:
      "Perché derivano da prezzari regionali dei lavori pubblici, che possono avere capitolati e voci diverse da regione a regione: non esiste un prezzo unico nazionale per la stessa lavorazione.",
  },
  {
    question: "Posso sommare tutte le voci di una guida per ottenere il totale?",
    answer:
      "No. Alcune voci sono lavorazioni complete, altre sono componenti o opere accessorie che si aggiungono solo quando servono: il totale dipende da quali voci ti servono davvero, non da una somma automatica.",
  },
  {
    question: "Cosa significa 'prezzo per unità'?",
    answer:
      "Significa che il prezzo si riferisce a un'unità di misura precisa — a corpo, al mq, al metro lineare o a elemento — non all'intero lavoro: unità diverse non sono confrontabili tra loro senza verificarle.",
  },
  {
    question: "Da dove provengono i prezzi di queste guide?",
    answer:
      "Da prezzari regionali dei lavori pubblici e da altre fonti istituzionali o documenti tecnici ufficiali, citati sotto la tabella di ogni guida; eventuali confronti di mercato secondari sono sempre segnalati come tali.",
  },
];

export function CostHubPage({ categories }: CostHubPageProps) {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Guide ai costi", path: "/costi" },
  ]);
  const faqJsonLd = buildFaqJsonLd(costHubFaq);

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
        />
      ) : null}
      <div className="eg-page eg-page-bg">
        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container">
            <div className="mx-auto max-w-[760px] text-center">
              <nav aria-label="Breadcrumb" className="eg-nav-link mb-10">
                <Link href="/" prefetch={false}>
                  Home
                </Link>
                <span aria-hidden="true" className="mx-3 text-eg-text-muted">
                  /
                </span>
                <span className="text-eg-ink">Guide ai costi</span>
              </nav>

              <p className="eg-eyebrow">Guide ai costi</p>
              <h1 className="eg-h1 mt-5">Costi dei lavori per la casa</h1>
              <p className="mx-auto mt-[22px] max-w-[44ch] text-base leading-[1.65] text-eg-text-muted">
                Range indicativi, fattori che cambiano il prezzo e domande utili
                da fare prima di raccontare il lavoro.
              </p>
            </div>

            {categories.length > 0 ? (
              <div className="mt-16 grid gap-14">
                {categories.map((category) => (
                  <section
                    key={category.slug}
                    aria-labelledby={`categoria-costi-${category.slug}`}
                  >
                    <div className="mx-auto max-w-[760px] text-center">
                      <p className="eg-eyebrow">Categoria</p>
                      <h2 id={`categoria-costi-${category.slug}`} className="eg-h2 mt-4">
                        {category.name}
                      </h2>
                    </div>

                    <ul className="mt-[54px] border-t border-eg-border max-[860px]:mt-[38px]">
                      {category.guides.map((guide, index) => (
                        <li key={guide.slug}>
                          <Link
                            href={guide.canonicalPath}
                            className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-6 border-b border-eg-border py-6 text-eg-ink max-[860px]:grid-cols-[44px_minmax(0,1fr)] max-[860px]:gap-3.5 max-[860px]:py-[22px] transition-colors hover:text-eg-brand-strong"
                          >
                            <span
                              aria-hidden="true"
                              data-nosnippet=""
                              className="font-(family-name:--eg-font-ui) text-xs uppercase tracking-[0.12em] text-eg-brand-strong"
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            {" "}
                            <span>
                              <span className="flex flex-wrap items-center gap-2.5">
                                <span className="text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.12] tracking-[-0.01em]">{guide.h1}</span>
                                {guide.hubBadge ? (
                                  <span className="inline-block bg-eg-brand-soft px-2 py-0.5 font-(family-name:--eg-font-ui) text-[10.5px] font-semibold uppercase tracking-[0.08em] text-eg-brand-strong">
                                    {guide.hubBadge}
                                  </span>
                                ) : null}
                              </span>
                              <span className="mt-2.5 max-w-[44ch] text-[15px] leading-[1.55] text-eg-text-muted block">
                                {guide.hubDescription ?? guide.summary}
                              </span>
                            </span>
                            <span className="justify-self-end whitespace-nowrap font-(family-name:--eg-font-ui) text-[11px] uppercase tracking-[0.12em] text-eg-text-muted max-[860px]:col-start-2 max-[860px]:mt-1 max-[860px]:justify-self-start">Apri &rarr;</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : (
              <p className="eg-body-muted mx-auto mt-12 max-w-[46ch] text-center">
                Le guide ai costi sono in preparazione. Torna a trovarci presto.
              </p>
            )}
          </div>
        </section>

        <section className="border-t border-eg-border py-14">
          <div className="eg-container grid gap-12 min-[861px]:grid-cols-2">
            <div>
              <p className="eg-eyebrow">Come leggere le guide</p>
              <h2 className="eg-h2 mt-4">Come leggere le guide ai costi</h2>
              <ul className="mt-6">
                {readingGuideItems.map((item) => (
                  <li key={item} className="flex gap-2.5 border-b border-eg-border py-2.5 text-sm leading-normal text-eg-ink">
                    <span aria-hidden="true" className="mt-1.75 size-1.5 shrink-0 bg-eg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eg-eyebrow">Prezzo e preventivo</p>
              <h2 className="eg-h2 mt-4">Prezzo unitario e preventivo completo</h2>
              <ul className="mt-6">
                {unitVsQuoteItems.map((item) => (
                  <li key={item} className="flex gap-2.5 border-b border-eg-border py-2.5 text-sm leading-normal text-eg-ink">
                    <span aria-hidden="true" className="mt-1.75 size-1.5 shrink-0 bg-eg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-eg-border py-14">
          <div className="eg-container">
            <div className="max-w-160">
              <p className="eg-eyebrow">Fonti</p>
              <h2 className="eg-h2 mt-4">Fonti utilizzate</h2>
              <ul className="mt-6">
                {sourcesItems.map((item) => (
                  <li key={item} className="flex gap-2.5 border-b border-eg-border py-2.5 text-sm leading-normal text-eg-ink">
                    <span aria-hidden="true" className="mt-1.75 size-1.5 shrink-0 bg-eg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-eg-border py-14">
          <div className="eg-container">
            <SeoFaq faq={costHubFaq} />
          </div>
        </section>

        <section className="border-t border-eg-border bg-eg-brand-strong py-16 text-eg-on-brand">
          <div className="eg-container-narrow text-center">
            <p className="flex items-center justify-center gap-2.5 font-(family-name:--eg-font-brand) text-xs uppercase tracking-[0.14em] text-[#9fd3e8] before:inline-block before:h-px before:w-5.5 before:bg-[#9fd3e8] before:content-['']">
              Prossimo passo
            </p>

            <h2 className="eg-h2 mt-3.5">Racconta il lavoro e confronta i preventivi</h2>

            <p className="mt-3 text-[14.5px] leading-[1.6] text-eg-on-brand-muted">
              Descrivi cosa devi fare: ti aiutiamo a tradurlo in una richiesta
              chiara verso i professionisti giusti.
            </p>

            <Link href="/" prefetch={false} className="eg-button-primary mt-6">
              Racconta il lavoro
            </Link>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
