import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@esigenta/ui";

import {
  getCostGuideBySlug,
  type CostGuide,
} from "../pages/costi";
import {
  resolveBestHrefForIntervention,
  resolveInterventionHrefForCostGuide,
} from "../engine/resolve-seo-page";
import { resolveGroupBreadcrumbForCostGuide } from "../engine/resolve-group-page";
import {
  buildBreadcrumbJsonLd,
  buildCostGuideArticleJsonLd,
  buildFaqJsonLd,
  serializeJsonLd,
} from "../engine/schema-builder";
import { PublicShell } from "../../shell/public-shell";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { InternalPageIntro } from "../../shared/internal-page-intro";
import { MarketingFinalCta } from "../../shared/marketing-final-cta";
import { resolveCostGuideEditorial } from "../editorial/cost-guide-editorial";
import { resolveCostGuideToc } from "../editorial/cost-guide-toc";
import { CostGuideEditorialMeta } from "./cost-guide-editorial-meta";
import { CostGuideToc } from "./cost-guide-toc";
import { CostGuideTechnicalReferences } from "./cost-guide-technical-references";
import { GuideHelpfulness } from "./guide-helpfulness";
import { ComparativeScenarioTable } from "./cost-guide-scenarios";
import { CostExtras } from "./cost-guide-extras";
import { CostSizeExamples } from "./cost-guide-size-examples";
import { CostBreakdown } from "./cost-guide-breakdown";
import { CostFactors } from "./cost-guide-factors";
import { classifyPriceRows } from "./cost-guide-price-model";
import { SeoFaq } from "./seo-faq";
import { sectionTitleClassName } from "./seo-section-title";

export type CostGuidePageProps = {
  guide: CostGuide;
};

// Regola editoriale condivisa per le hero delle guide costi: una fascia in
// euro resta leggibile nel testo introduttivo senza richiedere markup manuale
// nei contenuti di ogni singola guida.
const priceRangePattern = /\b\d+(?:[.,]\d+)?\s*(?:a|–|-)\s*\d+(?:[.,]\d+)?\s*€(?:\s*(?:al|\/)\s*(?:mq|m²))?/;
const priceRangeSplitPattern = new RegExp(`(${priceRangePattern.source})`, "g");

function emphasizePriceRanges(text: string): ReactNode {
  return text.split(priceRangeSplitPattern).map((part, index) =>
    priceRangePattern.test(part) ? <strong key={index}>{part}</strong> : part,
  );
}

/**
 * Scope 4B — redesign responsive del template condiviso. Ordine delle
 * sezioni (dalla domanda più immediata alla più di dettaglio):
 * Hero (quanto costa) → Scenari (role primary/scenario) → Cosa comprende
 * (includes/excludes della riga primary) → Extra (role extra) → Esempi per
 * dimensione (PRIMA del dettaglio, per stimare il proprio caso) → Dettaglio
 * lavorazioni (ex tabella piatta, ora raggruppata per categoria) →
 * Riferimenti secondari (role reference + costo al mq) → Da cosa dipende il
 * prezzo → Approfondimenti (agevolazioni, interventi specifici, consigli) →
 * FAQ → CTA finale.
 *
 * Le sezioni derivate dal nuovo modello semantico (Scenari, Cosa comprende,
 * Extra, Riferimenti) si auto-nascondono quando la guida non ha `role`
 * compilato — vedi classifyPriceRows in cost-guide-price-model.ts: su quelle
 * 5 guide, `breakdown` contiene semplicemente TUTTE le righe (comportamento
 * equivalente alla vecchia tabella), nessun contenuto perso.
 *
 * La hero usa un solo percorso editoriale: H1, introduzione della guida,
 * metadata editoriale e TOC. Prezzi e relative note restano nelle sezioni
 * dedicate, mai come blocchi concorrenti sopra l'introduzione.
 */
export function CostGuidePage({ guide }: CostGuidePageProps) {
  const requestHref = `/richiesta/${guide.funnelSlug}`;
  const interventionHref = resolveInterventionHrefForCostGuide(
    guide.interventionSeoSlug,
  );
  const groupCrumb = resolveGroupBreadcrumbForCostGuide(guide);
  const classification = classifyPriceRows(guide.priceRows, guide.pricePresentation.breakdownRowIds);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Costi", path: "/costi" },
    ...(groupCrumb ? [{ name: groupCrumb.name, path: groupCrumb.href }] : []),
    { name: guide.h1, path: guide.canonicalPath },
  ]);
  const faqJsonLd = buildFaqJsonLd(guide.faq);
  const editorial = resolveCostGuideEditorial(guide.editorial, guide.lastModified);
  const articleJsonLd = editorial.datePublished && editorial.dateModified
    ? buildCostGuideArticleJsonLd({
        guide,
        datePublished: editorial.datePublished,
        dateModified: editorial.dateModified,
      })
    : null;
  const relatedGuides = (editorial.relatedGuides ?? []).flatMap((item) => {
    const relatedGuide = getCostGuideBySlug(item.slug);

    return relatedGuide && relatedGuide.canonicalPath !== guide.canonicalPath
      ? [{ ...item, href: relatedGuide.canonicalPath, title: relatedGuide.h1 }]
      : [];
  });

  const hasRelatedWork = Boolean(guide.relatedWork && guide.relatedWork.length > 0);
  const sectionPresence = {
    scenarios: guide.pricePresentation.scenarios.length > 0,
    extras: classification.extras.length > 0,
    examples: guide.sizeExamples.length > 0 && Boolean(guide.sizeExamplesTable),
    breakdown: classification.breakdown.length > 0,
    factors: guide.factors.length > 0 || (guide.locationFactors?.length ?? 0) > 0,
    insights: true,
    faq: guide.faq.length > 0,
  };
  const toc = resolveCostGuideToc(sectionPresence);
  // Agevolazioni fiscali è testo fisso, sempre presente: Approfondimenti
  // esiste sempre, relatedWork/savingTips sono sotto-blocchi opzionali al
  // suo interno.

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      {articleJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
        />
      ) : null}
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
        />
      ) : null}
      <div className="eg-page eg-page-bg">
        <div className="eg-cost-guide">
        <InternalPageIntro
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Costi", href: "/costi" },
            ...(groupCrumb ? [{ label: groupCrumb.name, href: groupCrumb.href }] : []),
            { label: guide.title },
          ]}
          title={guide.h1}
          wideContent
          bottomSpacing="inherited"
          note={<CostGuideEditorialMeta editorial={editorial} />}
          description={emphasizePriceRanges(guide.summary)}
        />

        <CostGuideToc sections={toc} />

        <div className="eg-cost-guide-flow">
        {sectionPresence.scenarios ? (
          <ComparativeScenarioTable scenarios={guide.pricePresentation.scenarios} exclusions={guide.scenarioExclusions} />
        ) : null}

        {sectionPresence.extras ? (
          <CostExtras
            rows={classification.extras}
            allRows={guide.priceRows}
            presentation={guide.extrasPresentation}
            rowPresentation={guide.pricePresentation.extras}
          />
        ) : null}

        {sectionPresence.examples && guide.sizeExamplesTable ? (
          <CostSizeExamples
            sizeExamples={guide.sizeExamples}
            table={{
              title: guide.sizeExamplesTable.title,
              intro: emphasizePriceRanges(guide.sizeExamplesTable.intro),
              notes: guide.sizeExamplesTable.notes,
              surfaceLabel: guide.sizeExamplesTable.surfaceLabel,
              sizeUnit: guide.sizeExamplesTable.sizeUnit,
            }}
          />
        ) : null}

        <MarketingFinalCta
          title="Richiedi preventivi per il tuo lavoro"
          description="Confronta le proposte di professionisti disponibili nella tua zona e verifica il costo reale del tuo intervento."
          href={requestHref}
          ctaLabel="Richiedi preventivi"
          secondaryAction={interventionHref ? {
            href: interventionHref,
            label: "Scopri l’intervento",
          } : undefined}
          variant="cost"
        />

        {sectionPresence.breakdown ? (
          <CostBreakdown
            rows={classification.breakdown}
            allRows={guide.priceRows}
            sourceLabel={guide.sourceLabel}
            sourceYear={guide.sourceYear}
            hideSourceNote={guide.hideBreakdownSourceNote}
            intro={guide.breakdownIntro}
          />
        ) : null}

        {sectionPresence.factors ? (
          <CostFactors
            factors={guide.factors}
            locationFactors={guide.locationFactors}
            topicLabel={guide.topicLabel}
            compactContent={guide.compactFactors ? {
              ...guide.compactFactors,
              factors: guide.factors,
            } : undefined}
          />
        ) : null}

        <section aria-labelledby="approfondimenti-title" className="eg-section-editorial">
          <div className="eg-container">
            <div className="mb-9 max-w-170">
              <p className={blueprintEyebrowClassName}>Approfondimenti</p>

              <h2 id="approfondimenti-title" className={cn(sectionTitleClassName, "mt-3")}>
                Per saperne di più
              </h2>
            </div>

            <div className="flex flex-col gap-10">
                {hasRelatedWork ? (
                  <div>
                    <h3 className="mb-4 font-(family-name:--eg-font-primary) text-[16px] font-semibold text-eg-ink">
                      Ti serve solo una parte del lavoro?
                    </h3>

                    <div className="border-t border-eg-border">
                      {guide.relatedWork?.map((item) => item.ctaOnly ? (
                        <div key={item.slug} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-eg-border py-4">
                          <div className="min-w-0">
                            <p className="font-(family-name:--eg-font-primary) text-[14.5px] font-semibold text-eg-ink">{item.title}</p>
                            <p className="mt-1 text-[13px] leading-normal text-eg-text-muted">{item.description}</p>
                          </div>
                          <Link href={resolveBestHrefForIntervention(item.slug)} prefetch={false} className="shrink-0 whitespace-nowrap text-xs font-semibold text-eg-brand-strong no-underline transition-[transform,color] duration-200 ease-(--eg-ease-brand) hover:translate-x-0.5 hover:text-eg-brand-hover">
                            {item.linkLabel ?? "Richiedi un preventivo"} <span aria-hidden="true">&rarr;</span>
                          </Link>
                        </div>
                      ) : (
                        <Link key={item.slug} href={resolveBestHrefForIntervention(item.slug)} prefetch={false} className="group flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-eg-border py-4 no-underline transition-[padding-left] duration-200 ease-(--eg-ease-brand) hover:pl-2">
                          <div className="min-w-0">
                            <p className="font-(family-name:--eg-font-primary) text-[14.5px] font-semibold text-eg-ink">{item.title}</p>
                            <p className="mt-1 text-[13px] leading-normal text-eg-text-muted">{item.description}</p>
                          </div>
                          <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-eg-brand-strong transition-[transform,color] duration-200 ease-(--eg-ease-brand) group-hover:translate-x-0.5 group-hover:text-eg-brand-hover">
                            {item.linkLabel ?? "Richiedi un preventivo"} <span aria-hidden="true">&rarr;</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {relatedGuides.length > 0 ? (
                  <div>
                    <h3 className="mb-4 font-(family-name:--eg-font-primary) text-[16px] font-semibold text-eg-ink">
                      Guide correlate
                    </h3>

                    <div className="border-t border-eg-border">
                      {relatedGuides.map((item) => (
                        <Link
                          key={item.slug}
                          href={item.href}
                          prefetch={false}
                          className="group flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-eg-border py-4 no-underline transition-[padding-left] duration-200 ease-(--eg-ease-brand) hover:pl-2"
                        >
                          <div className="min-w-0">
                            <p className="font-(family-name:--eg-font-primary) text-[14.5px] font-semibold text-eg-ink">
                              {item.title}
                            </p>
                            {item.description ? (
                              <p className="mt-1 text-[13px] leading-normal text-eg-text-muted">
                                {item.description}
                              </p>
                            ) : null}
                          </div>

                          <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-eg-brand-strong transition-[transform,color] duration-200 ease-(--eg-ease-brand) group-hover:translate-x-0.5 group-hover:text-eg-brand-hover">
                            Leggi la guida <span aria-hidden="true">&rarr;</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                <CostGuideTechnicalReferences references={editorial.technicalReferences} />

                {guide.savingTips.length > 0 ? (
                  <div>
                    <h3 className="mb-4 font-(family-name:--eg-font-primary) text-[16px] font-semibold text-eg-ink">
                      Come risparmiare senza perdere qualit&agrave;
                    </h3>

                    <ul className="max-w-170">
                      {guide.savingTips.map((tip, index) => (
                        <li key={tip} className="flex items-start gap-3 border-b border-eg-border py-3 text-[14px] leading-[1.55] text-eg-ink">
                          <span className="eg-list-index mt-px shrink-0 font-bold text-eg-brand-strong">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div>
                  <h3 className="mb-4 font-(family-name:--eg-font-primary) text-[16px] font-semibold text-eg-ink">
                    Verifica se il tuo intervento rientra in un bonus attivo
                  </h3>

                  {/* Audit 2026-08: era "Alcuni interventi sul tetto possono...",
                      fisso in questo template shared e quindi mostrato anche su
                      bagno, impianto elettrico e terrazzo — testo neutro e
                      davvero universale, nessuna aliquota o norma nuova. */}
                  <p className="max-w-170 text-[13.5px] leading-[1.6] text-eg-ink">
                    Alcuni interventi possono rientrare nelle agevolazioni fiscali
                    previste per le ristrutturazioni edilizie o per la
                    riqualificazione energetica. Percentuali, limiti, requisiti e
                    adempimenti possono cambiare e dipendono dall&apos;immobile e
                    dal tipo di lavoro: verifica sempre le condizioni aggiornate
                    sui canali ufficiali prima di pianificare la spesa.
                  </p>

                  <ul className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-7">
                    <li>
                      <a
                        href="https://www.agenziaentrate.gov.it/portale/aree-tematiche/casa/agevolazioni/agevolazioni-per-le-ristrutturazioni-edilizie"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-eg-brand-strong underline decoration-eg-border underline-offset-4 transition-colors hover:text-eg-brand-hover"
                      >
                        Agevolazioni per le ristrutturazioni &mdash; Agenzia delle Entrate
                        <ExternalLinkGlyph className="size-3 shrink-0" />
                        <span className="sr-only">(apre in una nuova scheda)</span>
                      </a>
                    </li>

                    <li>
                      <a
                        href="https://www.efficienzaenergetica.enea.it/detrazioni-fiscali.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-eg-brand-strong underline decoration-eg-border underline-offset-4 transition-colors hover:text-eg-brand-hover"
                      >
                        Detrazioni fiscali per l&apos;efficienza energetica &mdash; ENEA
                        <ExternalLinkGlyph className="size-3 shrink-0" />
                        <span className="sr-only">(apre in una nuova scheda)</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
          </div>
        </section>

        <section className="eg-section-editorial">
          <div className="eg-container">
            <SeoFaq
              faq={guide.faq}
              defaultOpenFirst
              emphasizePhrase={guide.faqEmphasizePhrase}
            />
          </div>
        </section>
        <GuideHelpfulness guideSlug={guide.slug} />
        </div>

        </div>
      </div>
    </PublicShell>
  );
}

function ExternalLinkGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className}>
      <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}
