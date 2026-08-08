import Link from "next/link";

import type { CostGuide } from "../pages/costi";
import type { CostHubCategoryGroup } from "../engine/cost-hub";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  serializeJsonLd,
} from "../engine/schema-builder";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { PublicShell } from "../../shell/public-shell";
import { SeoFaq } from "./seo-faq";
import { sectionTitleClassName } from "./seo-section-title";

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
        <section className="pt-[calc(var(--eg-nav-clear)+12px)] pb-4">
          <div className="eg-container">
            <nav
              aria-label="Breadcrumb"
              className="mb-4.5 flex items-center gap-2 font-(family-name:--eg-font-brand) text-[12.5px] text-eg-text-muted"
            >
              <Link href="/" prefetch={false} className="transition-colors hover:text-eg-brand-strong">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-eg-ink">Guide ai costi</span>
            </nav>

            <p className={blueprintEyebrowClassName}>Guide ai costi</p>

            <h1 className="mt-4 mb-4 max-w-175 font-(family-name:--eg-font-brand) text-[clamp(27px,3.6vw,40px)] font-semibold leading-[1.2] tracking-[-0.01em]">
              Costi dei lavori per la casa
            </h1>

            <p className="max-w-150 text-base leading-[1.6] text-eg-ink">
              Range indicativi, fattori che cambiano il prezzo e domande utili
              da fare prima di raccontare il lavoro.
            </p>
          </div>
        </section>

        <section className="eg-section pt-8">
          <div className="eg-container">
            {categories.length > 0 ? (
              <div className="grid gap-11">
                {categories.map((category) => (
                  <section
                    key={category.slug}
                    aria-labelledby={`categoria-costi-${category.slug}`}
                  >
                    <div className="mb-5">
                      <p className={blueprintEyebrowClassName}>Categoria</p>
                      <h2 id={`categoria-costi-${category.slug}`} className={`${sectionTitleClassName} mt-2.5`}>
                        {category.name}
                      </h2>
                    </div>

                    <ul className="grid gap-4.5 min-[701px]:grid-cols-2">
                      {category.guides.map((guide, index) => (
                        <CostGuideCard key={guide.slug} index={index + 1} guide={guide} />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : (
              <p className="eg-body-muted max-w-[46ch]">
                Le guide ai costi sono in preparazione. Torna a trovarci presto.
              </p>
            )}
          </div>
        </section>

        <section className="border-t border-eg-border py-14">
          <div className="eg-container grid gap-12 min-[861px]:grid-cols-2">
            <div>
              <p className={blueprintEyebrowClassName}>Come leggere le guide</p>
              <h2 className={`${sectionTitleClassName} mt-2.5`}>Come leggere le guide ai costi</h2>
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
              <p className={blueprintEyebrowClassName}>Prezzo e preventivo</p>
              <h2 className={`${sectionTitleClassName} mt-2.5`}>Prezzo unitario e preventivo completo</h2>
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
              <p className={blueprintEyebrowClassName}>Fonti</p>
              <h2 className={`${sectionTitleClassName} mt-2.5`}>Fonti utilizzate</h2>
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

function CostGuideCard({ index, guide }: { index: number; guide: CostGuide }) {
  // Rifinitura 2026-08: sourceType (market-data/base-price-ranges.ts) è un
  // dato esplicito e dedicato, dichiarato per guida — non un'inferenza da
  // PriceRowConfidence (concetto diverso: quanto è solida una riga
  // editoriale, non cosa sono i numeri nel complesso) né uno string-match su
  // sourceLabel (rotto: "ufficiali" compare in tutti i sourceLabel, anche
  // quelli di fasce editoriali multi-fonte). Nessun if per slug: un solo
  // confronto sul dato.
  const isOfficial = guide.sourceType === "official";

  return (
    <li>
      <Link
        href={guide.canonicalPath}
        className="group flex h-full flex-col rounded-none border border-eg-border bg-eg-surface p-6 shadow-none transition-[transform,box-shadow] duration-200 ease-(--eg-ease-brand) hover:-translate-y-1 hover:shadow-eg-slab"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            aria-hidden="true"
            data-nosnippet=""
            className="font-(family-name:--eg-font-ui) text-[11.5px] font-semibold text-eg-text-muted"
          >
            {String(index).padStart(2, "0")}
          </span>

          {guide.hubBadge ? (
            <span className="inline-block bg-eg-brand-soft px-2 py-0.5 font-(family-name:--eg-font-ui) text-[10.5px] font-semibold uppercase tracking-[0.08em] text-eg-brand-strong">
              {guide.hubBadge}
            </span>
          ) : null}
        </div>

        <span className="mb-3 mt-2.5 inline-flex w-fit items-center gap-1.5 border border-eg-border px-2.25 py-1 font-(family-name:--eg-font-ui) text-[10px] font-semibold uppercase tracking-[0.06em] text-eg-text-muted">
          <span
            aria-hidden="true"
            className={`size-1.25 shrink-0 rounded-full ${isOfficial ? "bg-eg-accent" : "bg-eg-brand"}`}
          />
          {isOfficial ? "Prezzario ufficiale" : "Fascia orientativa"}
        </span>

        <h3 className="text-[16.5px] font-semibold leading-[1.3] text-eg-ink">
          {guide.h1}
        </h3>

        <p className="mt-2.5 flex-1 text-[13.5px] leading-[1.58] text-eg-text-muted">
          {guide.hubDescription ?? guide.summary}
        </p>

        <span className="mt-4.5 inline-flex items-center gap-1.5 font-(family-name:--eg-font-brand) text-[12.5px] font-semibold text-eg-accent transition-[gap] duration-200 group-hover:gap-2.5">
          Apri <span aria-hidden="true">&rarr;</span>
        </span>
      </Link>
    </li>
  );
}
