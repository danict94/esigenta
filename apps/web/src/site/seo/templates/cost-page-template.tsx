import Image from "next/image";
import Link from "next/link";

import { getCostGuidePriceNote, type CostGuide } from "../pages/costi";
import { resolveInterventionHrefForCostGuide } from "../engine/resolve-seo-page";
import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from "../engine/schema-builder";
import { PublicShell } from "../../shell/public-shell";
import { RequestCtaPanel } from "./request-cta-panel";
import { SeoFaq } from "./seo-faq";

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

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Costi", path: "/costi" },
    { name: guide.h1, path: guide.canonicalPath },
  ]);

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <div className="eg-page eg-page-bg">
        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container">
            <div className="grid items-start gap-[clamp(42px,6vw,82px)] lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
              <div className="max-w-[720px] max-lg:max-w-none">
                <nav aria-label="Breadcrumb" className="eg-nav-link mb-10">
                  <Link href="/" prefetch={false}>
                    Home
                  </Link>
                  <span aria-hidden="true" className="mx-3 text-eg-ardesia-2">
                    /
                  </span>
                  <Link href="/costi" prefetch={false}>
                    Costi
                  </Link>
                </nav>

                <p className="eg-eyebrow">Guida costi</p>

                <h1 className="eg-h1 mt-5">{guide.h1}</h1>

                <p className="eg-body-muted mt-6 max-w-[54ch] text-[17px] leading-8">
                  {guide.summary}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href={requestHref} className="eg-button-primary w-full sm:w-auto">
                    Richiedi preventivi
                  </Link>

                  {interventionHref ? (
                    <Link href={interventionHref} className="eg-button-ghost w-full sm:w-auto">
                      Landing intervento
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-eg-lg shadow-eg-slab after:absolute after:inset-0 after:bg-eg-terra after:opacity-[0.14] after:mix-blend-multiply after:content-[''] aspect-[4/3] md:aspect-[720/520]">
                <Image
                  src={guide.heroImage.src}
                  alt={guide.heroImage.alt}
                  fill
                  priority
                  sizes="(min-width: 1280px) 420px, (min-width: 1024px) 36vw, calc(100vw - 44px)"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="sintesi-costo-title" className="eg-section bg-eg-calce-2">
          <div className="eg-container">
            <div className="grid gap-10 border-y border-eg-hairline py-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.36fr)] lg:items-start">
              <div>
                <p className="eg-eyebrow">Sintesi costo</p>

                <h2 id="sintesi-costo-title" className="eg-h2 mt-4">
                  Range indicativi per {guide.topicLabel}
                </h2>

                <div className="mt-7 grid gap-4 md:grid-cols-2">
                  <CostHighlight label="Costo complessivo" value={guide.nationalRange} />
                  <CostHighlight label="Costo al mq" value={guide.pricePerSquareMeter} />
                </div>

                <p className="eg-form-help mt-5 max-w-[58ch]">{priceNote}</p>
              </div>

              <RequestCtaPanel
                requestHref={requestHref}
                ctaLabel={`Richiedi preventivi per ${guide.topicLabel}`}
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="tabella-prezzi-title" className="eg-section">
          <div className="eg-container">
            <div className="mx-auto max-w-[760px] text-center">
              <p className="eg-eyebrow">Tabella prezzi</p>

              <h2 id="tabella-prezzi-title" className="eg-h2 mt-4">
                Voci che compongono il preventivo
              </h2>
            </div>

            <PriceTable
              rows={guide.priceRows}
              sourceLabel={guide.sourceLabel}
              sourceYear={guide.sourceYear}
            />
          </div>
        </section>

        <section aria-labelledby="dimensioni-bagno-title" className="eg-section bg-eg-calce-2">
          <div className="eg-container">
            <div className="mx-auto max-w-[760px] text-center">
              <p className="eg-eyebrow">Esempi</p>

              <h2 id="dimensioni-bagno-title" className="eg-h2 mt-4">
                Esempi per dimensione e livello di finitura
              </h2>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {guide.sizeExamples.map((example) => (
                <article key={example.label} className="eg-panel p-5">
                  <h3 className="eg-h3 text-[22px]">{example.label}</h3>

                  <p className="mt-3 text-2xl font-medium leading-tight text-eg-terra">
                    {example.range}
                  </p>

                  <p className="eg-body-muted mt-3">{example.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="fattori-costo-title" className="eg-section">
          <div className="eg-container">
            <div className="grid gap-10 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
              <div className="max-w-2xl">
                <p className="eg-eyebrow">Fattori costo</p>

                <h2 id="fattori-costo-title" className="eg-h2 mt-4">
                  Cosa incide davvero sul prezzo
                </h2>
              </div>

              <ul className="eg-panel grid gap-4 p-5 md:grid-cols-2 md:p-6">
                {guide.factors.map((factor) => (
                  <li key={factor} className="flex gap-3 text-sm leading-6 text-eg-ardesia">
                    <Dot />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="citta-preventivo-title" className="eg-section bg-eg-calce-2">
          <div className="eg-container">
            <div className="mx-auto max-w-[720px] text-center">
              <p className="eg-eyebrow">Citt&agrave;</p>

              <h2 id="citta-preventivo-title" className="eg-h2 mt-4">
                La citt&agrave; pu&ograve; incidere sul preventivo?
              </h2>

              <p className="eg-body-muted mx-auto mt-5 max-w-[62ch]">
                Le fasce di questa guida sono nazionali: {guide.topicLabel} nella
                tua zona pu&ograve; costare diversamente in base a fattori
                locali, non a un prezzo di citt&agrave; che oggi non abbiamo.
              </p>
            </div>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cityInfluenceFactors.map((factor) => (
                <li
                  key={factor}
                  className="eg-panel flex gap-3 p-4 text-sm leading-6 text-eg-ardesia"
                >
                  <Dot />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="risparmiare-title" className="eg-section">
          <div className="eg-container">
            <div className="eg-panel p-5 md:p-7">
              <div className="max-w-3xl">
                <p className="eg-eyebrow">Consigli</p>

                <h2 id="risparmiare-title" className="eg-h2 mt-4">
                  Come risparmiare senza perdere qualit&agrave;
                </h2>
              </div>

              <ul className="mt-7 grid gap-4 md:grid-cols-2">
                {guide.savingTips.map((tip) => (
                  <li key={tip} className="flex gap-3 text-sm leading-6 text-eg-ardesia">
                    <Dot />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="eg-section bg-eg-calce-2">
          <div className="eg-container">
            <SeoFaq faq={guide.faq} />
          </div>
        </section>

        <section className="eg-section-large bg-eg-terra text-eg-calce">
          <div className="eg-container-narrow text-center">
            <p className="eg-eyebrow text-eg-calce/60">Prossimo passo</p>

            <h2 className="eg-h2 mt-4">Racconta il lavoro e confronta i preventivi</h2>

            <p className="mt-5 text-[15px] leading-7 text-eg-calce/70">
              Continua nella richiesta dedicata e indica dettagli, tempi e zona
              dell&apos;intervento.
            </p>

            <Link href={requestHref} className="eg-button-primary mt-8 w-full sm:w-auto">
              Vai alla richiesta
            </Link>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}

function CostHighlight({ label, value }: { label: string; value: string }) {
  return (
    <div className="eg-panel p-5">
      <p className="eg-metric-label">{label}</p>
      <p className="mt-3 text-2xl font-medium leading-tight text-eg-terra">{value}</p>
    </div>
  );
}

const priceTableGridCols =
  "md:grid-cols-[minmax(0,1.15fr)_minmax(4.5rem,0.45fr)_minmax(8rem,0.6fr)_minmax(0,1.35fr)]";

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
      <div className="eg-panel mt-12 overflow-hidden">
        <div
          className={`hidden border-b border-eg-hairline px-5 py-4 text-sm font-medium text-eg-terra md:grid ${priceTableGridCols}`}
        >
          <span>Voce</span>
          <span>Unit&agrave;</span>
          <span>Fascia indicativa</span>
          <span>Note</span>
        </div>

        {groups.map((group) => (
          <div key={group.category}>
            <div className="border-b border-eg-hairline bg-eg-terra/5 px-5 py-2.5">
              <p className="eg-table-label">{group.category}</p>
            </div>

            <div className="divide-y divide-eg-hairline">
              {group.rows.map((row) => (
                <PriceTableRow key={row.label} row={row} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {sourceLabel ? (
        <p className="eg-form-help mt-4 text-center">
          {sourceLabel}
          {sourceYear ? `, aggiornati ${sourceYear}` : null}. Le fasce non
          sono un preventivo: il prezzo reale dipende dal sopralluogo.
        </p>
      ) : null}
    </>
  );
}

function PriceTableRow({ row }: { row: CostGuide["priceRows"][number] }) {
  return (
    <div
      className={`grid gap-4 px-5 py-5 text-sm leading-6 md:grid ${priceTableGridCols}`}
    >
      <div>
        <p className="eg-table-label md:hidden">Voce</p>
        <p className="mt-1 font-medium text-eg-terra md:mt-0">{row.label}</p>
      </div>

      <div>
        <p className="eg-table-label md:hidden">Unit&agrave;</p>
        <p className="mt-1 text-eg-ardesia md:mt-0">{row.unit ?? "—"}</p>
      </div>

      <div>
        <p className="eg-table-label md:hidden">Fascia</p>
        <p className="mt-1 font-medium text-eg-terra [font-variant-numeric:tabular-nums] md:mt-0">
          {row.range}
        </p>
      </div>

      <div>
        <p className="eg-table-label md:hidden">Note</p>
        <p className="mt-1 text-eg-ardesia md:mt-0">{row.note}</p>

        {row.includes || row.excludes ? (
          <div className="mt-2 grid gap-1">
            {row.includes ? (
              <p className="text-[12.5px] leading-5 text-eg-ardesia">
                <span className="eg-scope-tag mr-1.5 text-eg-cotto-dark">Include</span>
                {row.includes}
              </p>
            ) : null}

            {row.excludes ? (
              <p className="text-[12.5px] leading-5 text-eg-ardesia">
                <span className="eg-scope-tag mr-1.5">Escluso</span>
                {row.excludes}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Dot() {
  return (
    <span
      aria-hidden="true"
      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-eg-cotto-dark"
    />
  );
}
