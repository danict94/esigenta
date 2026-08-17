import Image from "next/image";
import Link from "next/link";

import { cn } from "@esigenta/ui";

import { getCostGuidePriceNote, type CostGuide } from "../pages/costi";
import {
  resolveBestHrefForIntervention,
  resolveInterventionHrefForCostGuide,
} from "../engine/resolve-seo-page";
import { resolveGroupBreadcrumbForCostGuide } from "../engine/resolve-group-page";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  serializeJsonLd,
} from "../engine/schema-builder";
import { PublicShell } from "../../shell/public-shell";
import { FrameMarks } from "../../shared/frame-marks";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { InternalPageIntro } from "../../shared/internal-page-intro";
import { MarketingFinalCta } from "../../shared/marketing-final-cta";
import { CostGuideHero } from "./cost-guide-hero";
import { CostScenarioCards } from "./cost-guide-scenarios";
import { CostIncludedExcluded } from "./cost-guide-included-excluded";
import { CostExtras } from "./cost-guide-extras";
import { CostSizeExamples } from "./cost-guide-size-examples";
import { CostBreakdown } from "./cost-guide-breakdown";
import { CostReference } from "./cost-guide-reference";
import { CostFactors } from "./cost-guide-factors";
import { classifyPriceRows } from "./cost-guide-price-model";
import { SeoFaq } from "./seo-faq";
import { sectionTitleClassName } from "./seo-section-title";

export type CostGuidePageProps = {
  guide: CostGuide;
};

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
 * Fix UI review: il prezzo (`CostGuideHero`) è passato come `afterTitle` a
 * `InternalPageIntro`, quindi renderizzato SUBITO dopo l'H1 — non più in un
 * container separato dopo descrizione/CTA/immagine. Stesso Hero percepito
 * di prima, solo con il prezzo più vicino alla domanda del titolo.
 */
export function CostGuidePage({ guide }: CostGuidePageProps) {
  const requestHref = `/richiesta/${guide.funnelSlug}`;
  const interventionHref = resolveInterventionHrefForCostGuide(
    guide.interventionSeoSlug,
  );
  const priceNote = getCostGuidePriceNote();
  const groupCrumb = resolveGroupBreadcrumbForCostGuide(guide);
  const classification = classifyPriceRows(guide.priceRows);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Costi", path: "/costi" },
    ...(groupCrumb ? [{ name: groupCrumb.name, path: groupCrumb.href }] : []),
    { name: guide.h1, path: guide.canonicalPath },
  ]);
  const faqJsonLd = buildFaqJsonLd(guide.faq);

  const hasRelatedWork = Boolean(guide.relatedWork && guide.relatedWork.length > 0);
  // Agevolazioni fiscali è testo fisso, sempre presente: Approfondimenti
  // esiste sempre, relatedWork/savingTips sono sotto-blocchi opzionali al
  // suo interno.

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
        <InternalPageIntro
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Costi", href: "/costi" },
            ...(groupCrumb ? [{ label: groupCrumb.name, href: groupCrumb.href }] : []),
            { label: guide.title },
          ]}
          title={guide.h1}
          // Fix UI review: il prezzo va SUBITO dopo l'H1 (afterTitle), prima
          // di descrizione/CTA — deve leggersi come risposta diretta alla
          // domanda del titolo, non come un blocco raggiunto dopo aver
          // attraversato testo e pulsanti. Stesso contenuto di prima, solo
          // riposizionato: nessun elemento nuovo, l'Hero non diventa più
          // pesante.
          afterTitle={
            <>
              <CostGuideHero
                nationalRange={guide.nationalRange}
                nationalRangeLabel={guide.nationalRangeLabel}
                nationalRangeNote={guide.nationalRangeNote}
                pricingTeaser={guide.pricingTeaser}
              />

              <p className="mt-4 max-w-155 text-[13px] leading-[1.6] text-eg-text-muted">{priceNote}</p>
            </>
          }
          description={guide.summary}
          actions={
            <>
              <Link href={requestHref} className="eg-button-primary eg-button-arrow">
                Richiedi preventivi
              </Link>

              {interventionHref ? (
                <Link href={interventionHref} className="eg-button-ghost">
                  Scopri come funziona
                </Link>
              ) : null}
            </>
          }
          aside={
            guide.heroImage ? (
              // Scope 4B: aspect-[16/9] su mobile/tablet (era aspect-square
              // anche lì) — un quadrato a piena larghezza su 320-390px
              // "rubava" quasi metà del primo schermo, spingendo il prezzo
              // sotto la piega. Da lg: torna square, dove l'immagine sta in
              // una colonna stretta accanto al testo e il quadrato resta
              // proporzionato.
              <div className="relative mx-auto aspect-video w-full max-w-100 overflow-hidden shadow-eg-slab after:absolute after:inset-0 after:bg-eg-ink after:opacity-[0.14] after:mix-blend-multiply after:content-[''] lg:aspect-square lg:max-w-none">
                <FrameMarks />
                <Image
                  src={guide.heroImage.src}
                  alt={guide.heroImage.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 36vw, (min-width: 640px) 400px, calc(100vw - 44px)"
                  className="object-cover"
                />
              </div>
            ) : undefined
          }
        />

        <CostScenarioCards rows={classification.scenarioCards} />

        <CostIncludedExcluded primary={classification.primary} />

        <CostExtras rows={classification.extras} allRows={guide.priceRows} />

        <CostSizeExamples
          sizeExamples={guide.sizeExamples}
          sizeExamplesIntro={guide.sizeExamplesIntro}
        />

        <CostBreakdown
          rows={classification.breakdown}
          allRows={guide.priceRows}
          sourceLabel={guide.sourceLabel}
          sourceYear={guide.sourceYear}
        />

        <CostReference pricePerSquareMeter={guide.pricePerSquareMeter} rows={classification.references} />

        <CostFactors factors={guide.factors} topicLabel={guide.topicLabel} />

        <section aria-labelledby="approfondimenti-title" className="eg-section-editorial border-t border-eg-border">
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
                      {guide.relatedWork?.map((item) => (
                        <Link
                          key={item.slug}
                          href={resolveBestHrefForIntervention(item.slug)}
                          prefetch={false}
                          className="group flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-eg-border py-4 no-underline transition-[padding-left] duration-200 ease-(--eg-ease-brand) hover:pl-2"
                        >
                          <div className="min-w-0">
                            <p className="font-(family-name:--eg-font-primary) text-[14.5px] font-semibold text-eg-ink">
                              {item.title}
                            </p>
                            <p className="mt-1 text-[13px] leading-normal text-eg-text-muted">{item.description}</p>
                          </div>

                          <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-eg-brand-strong transition-[transform,color] duration-200 ease-(--eg-ease-brand) group-hover:translate-x-0.5 group-hover:text-eg-brand-hover">
                            Richiedi un preventivo <span aria-hidden="true">&rarr;</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

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

        <section className="eg-section-editorial border-t border-eg-border">
          <div className="eg-container">
            <SeoFaq faq={guide.faq} defaultOpenFirst />
          </div>
        </section>

        <MarketingFinalCta
          title="Racconta il lavoro e confronta i preventivi"
          description="Continua nella richiesta dedicata e indica dettagli, tempi e zona dell'intervento."
          href={requestHref}
          ctaLabel="Vai alla richiesta"
        />
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
