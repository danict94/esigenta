import Image from "next/image";
import Link from "next/link";

import { cn } from "@esigenta/ui";

import { getCostGuidePriceNote, type CostGuide } from "../pages/costi";
import type { PriceRowType } from "../market-data/base-price-ranges";
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
import { SeoFaq } from "./seo-faq";
import { sectionTitleClassName } from "./seo-section-title";

export type CostGuidePageProps = {
  guide: CostGuide;
};

/**
 * Fase 5.G — fattori generici (non specifici di una città, nessun link,
 * nessun prezzo locale) sul perché il preventivo può variare per zona.
 * Le pagine città sono disabilitate: vedi engine/static-params.ts.
 */
const cityInfluenceFactors: readonly string[] = [
  "accesso al cantiere",
  "piano dell'immobile e disponibilità dell'ascensore",
  "parcheggio e carico/scarico dei materiali",
  "regole condominiali sugli orari di cantiere",
  "trasporto dei materiali fino al cantiere",
  "smaltimento delle macerie",
  "disponibilità dei professionisti nella zona",
  "complessità e stato dell'immobile",
];

export function CostGuidePage({ guide }: CostGuidePageProps) {
  const requestHref = `/richiesta/${guide.funnelSlug}`;
  const interventionHref = resolveInterventionHrefForCostGuide(
    guide.interventionSeoSlug,
  );
  const priceNote = getCostGuidePriceNote();
  const groupCrumb = resolveGroupBreadcrumbForCostGuide(guide);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Costi", path: "/costi" },
    ...(groupCrumb ? [{ name: groupCrumb.name, path: groupCrumb.href }] : []),
    { name: guide.h1, path: guide.canonicalPath },
  ]);
  const faqJsonLd = buildFaqJsonLd(guide.faq);

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
        <section className="pt-[calc(var(--eg-nav-clear)+12px)] pb-10">
          <div className="eg-container">
            <nav
              aria-label="Breadcrumb"
              className="mb-4.5 flex items-center gap-2 font-(family-name:--eg-font-brand) text-[12.5px] text-eg-text-muted"
            >
              <Link href="/" prefetch={false} className="transition-colors hover:text-eg-brand-strong">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/costi" prefetch={false} className="transition-colors hover:text-eg-brand-strong">
                Costi
              </Link>
              <span aria-hidden="true">/</span>
              {groupCrumb ? (
                <>
                  <Link href={groupCrumb.href} prefetch={false} className="transition-colors hover:text-eg-brand-strong">
                    {groupCrumb.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              ) : null}
              <span className="text-eg-ink">{guide.title}</span>
            </nav>

            <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <p className={blueprintEyebrowClassName}>Guida costi</p>

                <h1 className="mt-4 mb-4 max-w-190 font-(family-name:--eg-font-brand) text-[clamp(26px,3.6vw,40px)] font-semibold leading-[1.2] tracking-[-0.01em]">
                  {guide.h1}
                </h1>

                <p className="mb-6.5 max-w-160 text-base leading-[1.6] text-eg-ink">
                  {guide.summary}
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link href={requestHref} className="eg-button-primary">
                    Richiedi preventivi
                  </Link>

                  {interventionHref ? (
                    <Link href={interventionHref} className="eg-button-ghost">
                      Vedi la pagina del servizio
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="relative mx-auto aspect-square w-full max-w-100 overflow-hidden shadow-eg-slab after:absolute after:inset-0 after:bg-eg-ink after:opacity-[0.14] after:mix-blend-multiply after:content-[''] lg:max-w-none">
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
            </div>
          </div>
        </section>

        <section aria-labelledby="sintesi-costo-title" className="border-t border-eg-border py-14">
          <div className="eg-container">
            <div className="mb-8 max-w-170">
              <p className={blueprintEyebrowClassName}>Sintesi costo</p>

              <h2 id="sintesi-costo-title" className={cn(sectionTitleClassName, "mt-3")}>
                Range indicativi per {guide.topicLabel}
              </h2>
            </div>

            {guide.pricingTeaser ? (
              <div className="mb-6 max-w-170 border border-eg-border bg-eg-surface px-6.5 py-7">
                <p className="text-[14.5px] leading-[1.6] text-eg-ink">{guide.pricingTeaser}</p>
              </div>
            ) : (
              <>
                <div className="mb-5 grid grid-cols-1 gap-px border border-eg-border bg-eg-border sm:grid-cols-2">
                  <CostHighlight label="Costo complessivo" value={guide.nationalRange ?? ""} />
                  <CostHighlight label="Costo al mq" value={guide.pricePerSquareMeter ?? ""} />
                </div>

                <p className="mb-6 max-w-155 text-[13px] leading-[1.6] text-eg-ink">{priceNote}</p>
              </>
            )}

            <div className="flex flex-wrap items-center justify-between gap-5 border border-eg-border bg-eg-surface px-6 py-5.5">
              <div>
                <h3 className="font-(family-name:--eg-font-brand) text-[15px] font-semibold">
                  Trova professionisti nella tua zona
                </h3>

                <p className="mt-1 max-w-100 text-[13.5px] leading-normal text-eg-text-muted">
                  Il comune lo indichi durante la richiesta: bastano pochi passaggi.
                </p>
              </div>

              <Link href={requestHref} className="eg-button-primary">
                Richiedi preventivi
              </Link>
            </div>
          </div>
        </section>

        {guide.priceRows.length > 0 ? (
          <section aria-labelledby="tabella-prezzi-title" className="border-t border-eg-border py-14">
            <div className="eg-container">
              <div className="mb-8 max-w-170">
                <p className={blueprintEyebrowClassName}>Tabella prezzi</p>

                <h2 id="tabella-prezzi-title" className={cn(sectionTitleClassName, "mt-3")}>
                  Voci che compongono il preventivo
                </h2>
              </div>

              <PriceTable
                rows={guide.priceRows}
                sourceLabel={guide.sourceLabel}
                sourceYear={guide.sourceYear}
              />

              <p className="mt-6 max-w-170 text-[13.5px] leading-[1.6] text-eg-ink">
                Alcune lavorazioni sono comprese di norma nel rifacimento, altre
                dipendono dal capitolato o costituiscono interventi separati.
                Controlla le voci Incluso ed Escluso e, se ti serve solo un
                lavoro specifico, selezionalo qui sotto.
              </p>

              {guide.priceTableNote ? (
                <p className="mt-3 max-w-170 text-[13.5px] leading-[1.6] text-eg-text-muted">
                  {guide.priceTableNote}
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {guide.relatedWork && guide.relatedWork.length > 0 ? (
          <section aria-labelledby="interventi-specifici-title" className="border-t border-eg-border py-14">
            <div className="eg-container">
              <div className="mb-8 max-w-170">
                <p className={blueprintEyebrowClassName}>Interventi specifici</p>

                <h2 id="interventi-specifici-title" className={cn(sectionTitleClassName, "mt-3")}>
                  Ti serve solo una parte del lavoro?
                </h2>
              </div>

              <div className="border-t border-eg-border">
                {guide.relatedWork.map((item) => (
                  <Link
                    key={item.slug}
                    href={resolveBestHrefForIntervention(item.slug)}
                    prefetch={false}
                    className="group flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-eg-border py-4.5 no-underline transition-[padding-left] duration-200 ease-(--eg-ease-brand) hover:pl-2"
                  >
                    <div className="min-w-0">
                      <p className="font-(family-name:--eg-font-brand) text-[15px] font-semibold text-eg-ink">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[13px] leading-normal text-eg-text-muted">{item.description}</p>
                    </div>

                    <span className="shrink-0 whitespace-nowrap font-(family-name:--eg-font-brand) text-xs font-semibold text-eg-brand-strong transition-transform duration-200 ease-(--eg-ease-brand) group-hover:translate-x-0.5 group-hover:text-eg-accent">
                      Richiedi questo intervento <span aria-hidden="true">&rarr;</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {guide.sizeExamples.length > 0 ? (
          <section aria-labelledby="esempi-costo-title" className="border-t border-eg-border py-14">
            <div className="eg-container">
              <div className="mb-8 max-w-170">
                <p className={blueprintEyebrowClassName}>Esempi</p>

                <h2 id="esempi-costo-title" className={cn(sectionTitleClassName, "mt-3")}>
                  Esempi per dimensione e livello di finitura
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {guide.sizeExamples.map((example) => (
                  <article key={example.label} className="border border-eg-border bg-eg-surface px-5.5 py-6">
                    {example.sizeRange ? (
                      <span className="mb-2.5 inline-block bg-eg-brand-soft px-2.5 py-1 font-(family-name:--eg-font-brand) text-[11px] font-bold uppercase tracking-[0.04em] text-eg-brand-strong">
                        {example.sizeRange}
                      </span>
                    ) : null}

                    <p className="mb-2.5 font-(family-name:--eg-font-brand) text-[19px] font-bold leading-tight text-eg-accent">
                      {example.range}
                    </p>

                    <h3 className="mb-2 font-(family-name:--eg-font-brand) text-[15px] font-semibold">
                      {example.label}
                    </h3>

                    <p className="text-[13px] leading-normal text-eg-text-muted">{example.note}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="fattori-costo-title" className="border-t border-eg-border py-14">
          <div className="eg-container">
            <div className="mb-8 max-w-170">
              <p className={blueprintEyebrowClassName}>Cosa incide sul prezzo</p>

              <h2 id="fattori-costo-title" className={cn(sectionTitleClassName, "mt-3")}>
                Fattori generali e fattori legati alla zona
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="mb-3.5 border-b border-eg-border pb-2.5 font-(family-name:--eg-font-brand) text-[11.5px] uppercase tracking-widest text-eg-brand">
                  Il lavoro in s&eacute;
                </p>

                <ul>
                  {guide.factors.map((factor) => (
                    <li key={factor} className="flex gap-2.5 border-b border-eg-border py-2.25 text-sm leading-normal text-eg-ink">
                      <span aria-hidden="true" className="mt-1.75 size-1.5 shrink-0 bg-eg-brand" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-3.5 border-b border-eg-border pb-2.5 font-(family-name:--eg-font-brand) text-[11.5px] uppercase tracking-widest text-eg-brand">
                  La tua zona e il tuo edificio
                </p>

                <p className="mb-4.5 max-w-160 text-[13.5px] leading-[1.6] text-eg-ink">
                  Le fasce di questa guida sono nazionali: {guide.topicLabel} nella
                  tua zona pu&ograve; costare diversamente in base a fattori
                  locali, non a un prezzo di citt&agrave; che oggi non abbiamo.
                </p>

                <ul>
                  {cityInfluenceFactors.map((factor) => (
                    <li key={factor} className="flex gap-2.5 border-b border-eg-border py-2.25 text-sm leading-normal text-eg-ink">
                      <span aria-hidden="true" className="mt-1.75 size-1.5 shrink-0 bg-eg-brand" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="agevolazioni-fiscali-title" className="border-t border-eg-border py-14">
          <div className="eg-container">
            <div className="border border-eg-border bg-eg-surface px-6.5 py-7">
              <p className={blueprintEyebrowClassName}>Agevolazioni fiscali</p>

              <h2 id="agevolazioni-fiscali-title" className={cn(sectionTitleClassName, "mt-3")}>
                Verifica se il tuo intervento rientra in un bonus attivo
              </h2>

              <p className="mt-3.5 max-w-170 text-[14.5px] leading-[1.6] text-eg-ink">
                Alcuni interventi sul tetto possono rientrare nelle
                agevolazioni fiscali previste per le ristrutturazioni edilizie
                o per la riqualificazione energetica. Percentuali, limiti,
                requisiti e adempimenti possono cambiare e dipendono
                dall&apos;immobile e dal tipo di lavoro: verifica sempre le
                condizioni aggiornate sui canali ufficiali prima di
                pianificare la spesa.
              </p>

              <ul className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-7">
                <li>
                  <a
                    href="https://www.agenziaentrate.gov.it/portale/aree-tematiche/casa/agevolazioni/agevolazioni-per-le-ristrutturazioni-edilizie"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-(family-name:--eg-font-brand) text-[13px] font-semibold text-eg-brand-strong underline decoration-eg-border underline-offset-4 transition-colors hover:text-eg-accent"
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
                    className="inline-flex items-center gap-1.5 font-(family-name:--eg-font-brand) text-[13px] font-semibold text-eg-brand-strong underline decoration-eg-border underline-offset-4 transition-colors hover:text-eg-accent"
                  >
                    Detrazioni fiscali per l&apos;efficienza energetica &mdash; ENEA
                    <ExternalLinkGlyph className="size-3 shrink-0" />
                    <span className="sr-only">(apre in una nuova scheda)</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="risparmiare-title" className="border-t border-eg-border py-14">
          <div className="eg-container">
            <div className="mb-8 max-w-170">
              <p className={blueprintEyebrowClassName}>Consigli</p>

              <h2 id="risparmiare-title" className={cn(sectionTitleClassName, "mt-3")}>
                Come risparmiare senza perdere qualit&agrave;
              </h2>
            </div>

            <ul className="max-w-170">
              {guide.savingTips.map((tip, index) => (
                <li key={tip} className="flex items-start gap-3 border-b border-eg-border py-3.25 text-[14.5px] leading-[1.55] text-eg-ink">
                  <span className="mt-px shrink-0 font-(family-name:--eg-font-brand) text-[13px] font-bold text-eg-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-eg-border py-14">
          <div className="eg-container">
            <SeoFaq faq={guide.faq} defaultOpenFirst />
          </div>
        </section>

        <section className="border-t border-eg-border bg-eg-brand-strong py-16 text-eg-on-brand">
          <div className="eg-container-narrow text-center">
            <p className="flex items-center justify-center gap-2.5 font-(family-name:--eg-font-brand) text-xs uppercase tracking-[0.14em] text-[#9fd3e8] before:inline-block before:h-px before:w-5.5 before:bg-[#9fd3e8] before:content-['']">
              Prossimo passo
            </p>

            <h2 className={cn(sectionTitleClassName, "mt-3.5")}>
              Racconta il lavoro e confronta i preventivi
            </h2>

            <p className="mt-3 text-[14.5px] leading-[1.6] text-eg-on-brand-muted">
              Continua nella richiesta dedicata e indica dettagli, tempi e zona
              dell&apos;intervento.
            </p>

            <Link href={requestHref} className="eg-button-primary mt-6">
              Vai alla richiesta
            </Link>
          </div>
        </section>
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

function CostHighlight({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-eg-surface px-6.5 py-7">
      <p className="font-(family-name:--eg-font-brand) text-[clamp(24px,3vw,32px)] font-bold leading-[1.15] text-eg-brand-strong">
        {value}
      </p>

      <p className="mt-2 font-(family-name:--eg-font-brand) text-[11.5px] uppercase tracking-wider text-eg-text-muted">
        {label}
      </p>
    </div>
  );
}

const priceTableGridCols =
  "md:grid-cols-[minmax(0,1.3fr)_minmax(5rem,0.7fr)_minmax(6rem,0.6fr)_minmax(0,2.4fr)]";

const priceTypeLabel: Record<PriceRowType, string> = {
  manodopera: "Manodopera",
  fornitura: "Fornitura",
  corpo: "Pacchetto a corpo",
};

type PriceRowGroup = { category: string; rows: CostGuide["priceRows"] };

/** Raggruppa preservando l'ordine di prima apparizione di ogni categoria nell'array sorgente. */
function groupPriceRowsByCategory(rows: CostGuide["priceRows"]): PriceRowGroup[] {
  const groups: PriceRowGroup[] = [];
  const groupByCategory = new Map<string, PriceRowGroup>();

  for (const row of rows) {
    const existingGroup = groupByCategory.get(row.category);

    if (existingGroup) {
      existingGroup.rows.push(row);
    } else {
      const newGroup: PriceRowGroup = { category: row.category, rows: [row] };
      groupByCategory.set(row.category, newGroup);
      groups.push(newGroup);
    }
  }

  return groups;
}

function PriceTable({
  rows,
  sourceLabel,
  sourceYear,
}: {
  rows: CostGuide["priceRows"];
  sourceLabel?: string;
  sourceYear?: string;
}) {
  const groups = groupPriceRowsByCategory(rows);

  return (
    <>
      <div
        className={`hidden border-b border-eg-border px-0 pb-2.5 font-(family-name:--eg-font-brand) text-[11px] uppercase tracking-wider text-eg-text-muted md:grid ${priceTableGridCols}`}
      >
        <span>Voce</span>
        <span>Fascia indicativa</span>
        <span>Tipo</span>
        <span>Note</span>
      </div>

      {groups.map((group, index) => (
        <div key={group.category} className={index === 0 ? "mt-0" : "mt-2"}>
          <p
            className={`font-(family-name:--eg-font-brand) text-[11.5px] uppercase tracking-[0.08em] text-eg-text-muted ${index === 0 ? "pt-0" : "pt-5.5"} pb-2.5`}
          >
            {group.category}
          </p>

          <div className="bg-eg-surface">
            {group.rows.map((row) => (
              <PriceTableRow key={row.label} row={row} />
            ))}
          </div>
        </div>
      ))}

      {sourceLabel ? (
        <p className="mt-4.5 text-center font-(family-name:--eg-font-brand) text-[12.5px] text-eg-ink">
          {sourceLabel}
          {sourceYear ? `, aggiornati ${sourceYear}` : null}. Le fasce non
          sono un preventivo: il prezzo reale dipende dal sopralluogo.
        </p>
      ) : null}
    </>
  );
}

function PriceTableRow({ row }: { row: CostGuide["priceRows"][number] }) {
  // Righe "Da valutare con il professionista" (bagno, tetto) o "Costi
  // aggiuntivi che possono incidere sul preventivo" (impermeabilizzare
  // tetto) non hanno un numero reale — la Fascia deve leggersi diversamente
  // da un prezzo vero, non con lo stesso trattamento bold/mono. Nessuna
  // colonna Tipo vuota mostra più un trattino: resta semplicemente assente.
  const isQualitative =
    row.category === "Da valutare con il professionista" ||
    row.category === "Costi aggiuntivi che possono incidere sul preventivo";

  return (
    <div
      className={`grid gap-x-4 gap-y-1 border-b border-eg-border px-3.5 py-3.5 text-sm leading-6 transition-colors hover:bg-eg-page md:grid md:items-start md:gap-y-0 ${priceTableGridCols}`}
    >
      <div>
        <p className="font-semibold text-eg-ink">{row.label}</p>
        {row.unit ? (
          <p className="mt-0.5 font-(family-name:--eg-font-brand) text-[11px] text-eg-text-muted">{row.unit}</p>
        ) : null}
      </div>

      {isQualitative ? (
        <p className="text-[13px] font-medium italic leading-normal text-eg-text-muted">{row.range}</p>
      ) : (
        <p className="font-(family-name:--eg-font-brand) font-bold text-eg-ink [font-variant-numeric:tabular-nums]">
          {row.range}
        </p>
      )}

      {row.priceType ? (
        <p>
          <span className="inline-block border border-eg-border px-2 py-0.5 font-(family-name:--eg-font-brand) text-[10.5px] font-semibold uppercase tracking-wide text-eg-text-muted">
            {priceTypeLabel[row.priceType]}
          </span>
        </p>
      ) : (
        <p aria-hidden="true" />
      )}

      <div>
        <p className="max-w-80 text-[13px] leading-normal text-eg-text-muted">
          {row.note}
          {row.includes ? (
            <>
              {" "}
              <span className="font-semibold text-eg-success">Incluso</span> {row.includes}.
            </>
          ) : null}
          {row.excludes ? (
            <>
              {" "}
              <span className="font-semibold text-eg-accent">Escluso</span> {row.excludes}.
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
