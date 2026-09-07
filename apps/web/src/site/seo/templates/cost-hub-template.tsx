import Link from "next/link";
import React from "react";
import { FileCheck2, Layers, Ruler, ShieldCheck } from "lucide-react";

import type { CostHubCategoryGroup } from "../engine/cost-hub";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  serializeJsonLd,
} from "../engine/schema-builder";
import { PublicShell } from "../../shell/public-shell";
import { InternalPageFinalCta } from "../../shared/internal-page-final-cta";
import {
  blueprintEyebrowClassName,
  blueprintTitleClassName,
  SectionHeader,
} from "../../shared/section-header";
import {
  CostHubCatalog,
  type CostHubCatalogCategory,
} from "./cost-hub-catalog";

export type CostHubPageProps = {
  categories: readonly CostHubCategoryGroup[];
};

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

const readingPriceItems = [
  {
    icon: Ruler,
    title: "Controlla l’unità di misura",
    description:
      "€/m², €/m, €/cad e prezzi a corpo indicano basi diverse: confronta soltanto voci espresse con la stessa unità.",
  },
  {
    icon: Layers,
    title: "Non sommare automaticamente le voci",
    description:
      "Alcune lavorazioni sono alternative, altre complementari: il totale dipende da ciò che serve davvero al lavoro.",
  },
  {
    icon: FileCheck2,
    title: "Verifica cosa comprende il prezzo",
    description:
      "Quantità, materiali, accessibilità, opere accessorie e condizioni di cantiere possono cambiare il preventivo finale.",
  },
] as const;

export function CostHubPage({ categories }: CostHubPageProps) {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Guide ai costi", path: "/costi" },
  ]);
  const faqJsonLd = buildFaqJsonLd(costHubFaq);
  const guideCount = categories.reduce(
    (total, category) => total + category.guides.length,
    0,
  );
  const catalogCategories: readonly CostHubCatalogCategory[] = categories.map(
    (category) => ({
      slug: category.slug,
      name: category.name,
      guides: category.guides.map((guide) => ({
        slug: guide.slug,
        href: guide.canonicalPath,
        title: guide.h1,
        summary: guide.hubDescription ?? guide.summary,
        sourceType: guide.sourceType,
      })),
    }),
  );

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
        <CostHubHero guideCount={guideCount} categoryCount={categories.length} />

        <section className="pb-12 sm:pb-14" aria-label="Catalogo guide ai costi">
          <div className="eg-container">
            <CostHubCatalog categories={catalogCategories} />
          </div>
        </section>

        <CostHubReadingGuide />
        <CostHubFaq />
        <InternalPageFinalCta
          title="Hai un lavoro da fare?"
          description="Dopo aver consultato i costi indicativi, descrivi ciò che devi realizzare e confronta le proposte dei professionisti più adatti."
          href="/"
          ctaLabel="Racconta il lavoro"
        />
      </div>
    </PublicShell>
  );
}

function CostHubHero({
  guideCount,
  categoryCount,
}: {
  readonly guideCount: number;
  readonly categoryCount: number;
}) {
  return (
    <header className="pt-[calc(var(--eg-nav-clear)+4px)] pb-7 sm:pb-9">
      <div className="eg-container">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-2 text-[12px] text-eg-text-muted"
        >
          <Link
            href="/"
            prefetch={false}
            className="transition-colors hover:text-eg-brand-strong"
          >
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-eg-ink">Guide ai costi</span>
        </nav>

        <div className="max-w-[760px]">
          <p className="eg-eyebrow mb-2.5 text-eg-brand-strong">Guide ai costi</p>
          <h1 className="eg-h1 text-balance">Costi dei lavori per la casa</h1>
          <p className="mt-3 max-w-[650px] text-[15px] leading-[1.62] text-eg-ink sm:text-[17px]">
            Consulta prezzi indicativi, voci di lavorazione e fattori che
            possono incidere sul costo prima di richiedere un preventivo.
          </p>
          <p className="mt-2 max-w-[610px] text-[12.5px] leading-[1.58] text-eg-text-muted sm:text-[13px]">
            Ogni guida distingue i riferimenti ufficiali dalle fasce
            orientative e spiega cosa verificare per confrontare i prezzi in
            modo più consapevole.
          </p>
          <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[11.5px] text-eg-text-muted sm:text-[12px]">
            <span>
              <strong className="font-semibold text-eg-ink">{guideCount} guide</strong>{" "}
              disponibili
            </span>
            <span>
              <strong className="font-semibold text-eg-ink">{categoryCount} aree</strong>{" "}
              di lavoro
            </span>
          </p>
        </div>
      </div>
    </header>
  );
}

function CostHubReadingGuide() {
  return (
    <section className="pb-12 sm:pb-14" aria-labelledby="cost-reading-title">
      <div className="eg-container">
        <div className="border-t border-eg-border pt-6">
          <SectionHeader
            id="cost-reading-title"
            eyebrow="Prima di confrontare"
            title="Come leggere i prezzi"
            align="left"
            eyebrowClassName={blueprintEyebrowClassName}
            titleClassName={blueprintTitleClassName}
          />
          <p className="mt-2 text-[13px] leading-[1.55] text-eg-text-muted sm:text-[14px]">
            Tre controlli semplici evitano di confrontare voci che indicano
            cose diverse.
          </p>
        </div>

        <div className="mt-4 grid border-y border-eg-border min-[981px]:grid-cols-3">
          {readingPriceItems.map(({ icon: Icon, title, description }, index) => (
            <article
              key={title}
              className={`py-4.5 min-[981px]:px-6 min-[981px]:py-5 ${
                index === 0
                  ? "min-[981px]:pl-0"
                  : "border-t border-eg-border min-[981px]:border-t-0 min-[981px]:border-l"
              }`}
            >
              <Icon
                aria-hidden="true"
                className="mb-2.5 size-5.5 text-eg-brand-strong"
                strokeWidth={1.8}
              />
              <h3 className="text-[15px] font-semibold leading-[1.3] text-eg-ink sm:text-[16px]">
                {title}
              </h3>
              <p className="mt-1.5 text-[12px] leading-[1.58] text-eg-text-muted sm:text-[12.5px]">
                {description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-3.5 flex max-w-[920px] items-start gap-2.5 text-[11.5px] leading-[1.6] text-eg-text-muted sm:text-[12px]">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-eg-brand-strong"
            strokeWidth={1.8}
          />
          <p>
            <strong className="font-semibold text-eg-ink">Fonti:</strong> le
            guide utilizzano prezzari regionali dei lavori pubblici, fonti
            istituzionali e documenti tecnici ufficiali. Gli eventuali
            confronti di mercato secondari sono indicati chiaramente come tali.
          </p>
        </div>
      </div>
    </section>
  );
}

function CostHubFaq() {
  return (
    <section className="pb-12 sm:pb-14" aria-labelledby="cost-hub-faq-title">
      <div className="eg-container">
        <div className="border-t border-eg-border pt-6">
          <SectionHeader
            id="cost-hub-faq-title"
            eyebrow="FAQ"
            title="Domande frequenti"
            align="left"
            eyebrowClassName={blueprintEyebrowClassName}
            titleClassName={blueprintTitleClassName}
          />
        </div>

        <div className="mt-4 max-w-[900px] border-t border-eg-border">
          {costHubFaq.map((item) => (
            <details
              key={item.question}
              className="group border-b border-eg-border"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-3.5 text-[13px] font-semibold text-eg-ink marker:content-none sm:text-[14px] [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="shrink-0 text-[18px] font-normal text-eg-brand-strong transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[850px] pb-4 pr-0 text-[12px] leading-[1.62] text-eg-text-muted sm:pr-10 sm:text-[13px]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
