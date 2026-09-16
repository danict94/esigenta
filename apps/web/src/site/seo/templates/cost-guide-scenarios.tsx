import { cn } from "@esigenta/ui";

import type { PriceRow } from "../market-data/base-price-ranges";
import { blueprintEyebrowClassName } from "../../shared/section-header";
import { sectionTitleClassName } from "./seo-section-title";
import { shortSummary } from "./cost-guide-price-model";

/**
 * Scope 4B — Livello 2 (scenari): righe `role: "primary"` + `role:
 * "scenario"`, nell'ordine dell'SSOT. Non renderizzata quando `rows` è
 * vuoto (guide senza `role` compilato: nessuno scenario inventato, le
 * righe restano nel Breakdown come sempre — vedi cost-guide-price-model.ts).
 *
 * Mobile: card impilate verticalmente (niente carosello). Desktop: card
 * affiancate. La riga `role: "primary"` riceve maggiore risalto — segnale
 * derivato dal dato, mai un'etichetta "primary/scenario" mostrata all'utente.
 */
export type CostScenarioCardsProps = {
  rows: PriceRow[];
};

const electricalScenarioContent = {
  "elettrico-scenario-canalizzazioni-riutilizzabili": {
    title: "Canalizzazioni esistenti riutilizzabili",
    label: "Può comprendere",
    items: [
      "Riutilizzo delle canalizzazioni esistenti",
      "Adeguamento o sostituzione delle linee",
      "Punti luce, prese e comandi necessari",
      "Adeguamento di quadro e protezioni, dove previsto",
    ],
  },
  "elettrico-rifacimento-completo": {
    title: "Rifacimento completo standard",
    label: "Comprende",
    items: [
      "Nuovo impianto elettrico interno",
      "Distribuzione dei circuiti ordinari",
      "Punti luce, prese e comandi standard",
      "Quadro generale e protezioni",
      "Normali tracce necessarie",
      "Chiusura grezza delle tracce",
    ],
  },
  "elettrico-scenario-impianto-articolato": {
    title: "Impianto più articolato",
    label: "Può comprendere",
    items: [
      "Maggiore suddivisione dei circuiti",
      "Più linee dedicate",
      "Quadro elettrico più articolato",
      "Nuove tracce più diffuse",
      "Maggior numero di punti",
      "Distribuzione più complessa",
    ],
  },
} as const;

const electricalScenarioIds = Object.keys(electricalScenarioContent);
const roofScenarioContent = {
  "tetto-sostituzione-manto": {
    title: "Sostituzione del solo manto",
    label: "Può comprendere",
    items: [
      "rimozione del vecchio manto",
      "posa di tegole, coppi o altra copertura standard",
      "lavorazioni ordinarie sul supporto esistente",
    ],
  },
  "tetto-rifacimento-copertura": {
    title: "Rifacimento standard della copertura",
    label: "Comprende",
    items: [
      "rimozione e smaltimento del vecchio manto",
      "preparazione ordinaria del supporto",
      "impermeabilizzazione",
      "nuovo manto e posa",
    ],
  },
  "tetto-rifacimento-isolamento-ventilazione": {
    title: "Rifacimento con isolamento o ventilazione",
    label: "Può comprendere",
    items: [
      "lavorazioni del rifacimento standard",
      "isolamento termico",
      "stratigrafia più evoluta",
      "tetto ventilato",
    ],
  },
  "tetto-rifacimento-struttura": {
    title: "Rifacimento con interventi strutturali",
    label: "Può comprendere",
    items: [
      "rifacimento della copertura",
      "interventi su travi",
      "interventi sull’orditura",
      "interventi sul solaio, quando necessari",
    ],
  },
} as const;
const roofScenarioIds = Object.keys(roofScenarioContent);
const facadeScenarioContent = {
  "facciata-rinnovo-finitura": {
    title: "Rinnovo della finitura",
    label: "Quando può bastare",
    items: [
      "La facciata è sostanzialmente sana e non presenta un degrado diffuso dell’intonaco.",
    ],
  },
  "facciata-ripristino-parziale": {
    title: "Ripristino parziale e nuova finitura",
    label: "Quando può bastare",
    items: [
      "Il degrado è localizzato: alcune zone richiedono il ripristino dell’intonaco, mentre il resto della facciata è ancora in condizioni accettabili.",
    ],
  },
  "facciata-rifacimento-ordinario": {
    title: "Rifacimento esteso della facciata",
    label: "Comprende",
    items: [
      "controllo delle parti distaccate",
      "rimozione significativa dell’intonaco ammalorato",
      "ripristino dell’intonaco",
      "rasatura",
      "preparazione del fondo",
      "nuova finitura",
    ],
  },
} as const;
const facadeScenarioIds = Object.keys(facadeScenarioContent);
const priceRangeClassName = "font-(family-name:--eg-font-primary) text-[22px] font-bold leading-tight text-eg-brand-strong [font-variant-numeric:tabular-nums]";

function isElectricalScenario(rows: PriceRow[]): boolean {
  return rows.length === electricalScenarioIds.length && rows.every((row) => row.id in electricalScenarioContent);
}

function isRoofScenario(rows: PriceRow[]): boolean {
  return rows.length === roofScenarioIds.length && rows.every((row) => row.id in roofScenarioContent);
}

function isFacadeScenario(rows: PriceRow[]): boolean {
  return rows.length === facadeScenarioIds.length && rows.every((row) => row.id in facadeScenarioContent);
}

function formatPriceRange(range: string): string {
  return range.replace(/^da (.+) € a (.+) € al mq$/, "$1–$2 €/mq");
}

export function CostScenarioCards({ rows }: CostScenarioCardsProps) {
  if (rows.length === 0) return null;

  if (isElectricalScenario(rows)) {
    return <ElectricalScenarioSection rows={rows} />;
  }

  if (isRoofScenario(rows)) {
    return <RoofScenarioSection rows={rows} />;
  }

  if (isFacadeScenario(rows)) {
    return <FacadeScenarioSection rows={rows} />;
  }

  return (
    <section aria-labelledby="scenari-title" className="eg-section-editorial border-t border-eg-border">
      <div className="eg-container">
        <div className="mb-8 max-w-170">
          <p className={blueprintEyebrowClassName}>Scenari</p>

          <h2 id="scenari-title" className={cn(sectionTitleClassName, "mt-3")}>
            Scegli lo scenario più vicino al tuo caso
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <ScenarioCard key={row.id} row={row} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ScenarioCard({ row }: { row: PriceRow }) {
  const isPrimary = row.role === "primary";
  // Fix UI review: niente più line-clamp CSS (troncava a metà parola/elenco,
  // es. "...del mobile o del box..."). shortSummary si ferma sempre a un
  // confine di frase reale, altezza naturale della card.
  const description = shortSummary(row.plainExplanation ?? row.note);

  return (
    <article
      className={cn(
        "eg-panel flex flex-col gap-3 p-6",
        isPrimary && "border-eg-brand-strong ring-1 ring-eg-brand-strong",
      )}
    >
      {isPrimary ? (
        <span className="w-fit bg-eg-brand-soft px-2.5 py-1 font-(family-name:--eg-font-mono) text-[10.5px] font-bold uppercase tracking-[0.06em] text-eg-brand-strong">
          Standard
        </span>
      ) : null}

      <h3 className="font-(family-name:--eg-font-primary) text-[15.5px] font-semibold leading-snug text-eg-ink">
        {row.simpleLabel ?? row.label}
      </h3>

      <p className={priceRangeClassName}>
        {row.range}
      </p>

      {description ? (
        <p className="text-[13px] leading-normal text-eg-text-muted">{description}</p>
      ) : null}
    </article>
  );
}

function ElectricalScenarioSection({ rows }: { rows: PriceRow[] }) {
  const scenarios = rows.map((row) => ({
    content: electricalScenarioContent[row.id as keyof typeof electricalScenarioContent],
    price: formatPriceRange(row.range),
  }));

  return (
    <section aria-labelledby="scenari-title" className="eg-section-editorial border-t border-eg-border">
      <div className="eg-container">
        <p className={blueprintEyebrowClassName}>Scenari</p>
        <h2 id="scenari-title" className={cn(sectionTitleClassName, "mt-3")}>
          Tre scenari di intervento
        </h2>

        <ComparativeScenarioTable scenarios={scenarios} />
      </div>
    </section>
  );
}

function RoofScenarioSection({ rows }: { rows: PriceRow[] }) {
  const scenarios = rows.map((row) => ({
    content: roofScenarioContent[row.id as keyof typeof roofScenarioContent],
    price: formatPriceRange(row.range),
  }));
  return (
    <section aria-labelledby="scenari-title" className="eg-section-editorial border-t border-eg-border">
      <div className="eg-container">
        <p className={blueprintEyebrowClassName}>Scenari</p>
        <h2 id="scenari-title" className={cn(sectionTitleClassName, "mt-3")}>
          Quattro scenari di intervento
        </h2>

        <ComparativeScenarioTable scenarios={scenarios} />

        <ScenarioExclusions
          title="Nel rifacimento standard non sono compresi"
          items={[
            "isolamento termico completo",
            "tetto ventilato o stratigrafie più evolute",
            "interventi sulla struttura portante",
            "grondaie",
            "ponteggio",
          ]}
        />
      </div>
    </section>
  );
}

function FacadeScenarioSection({ rows }: { rows: PriceRow[] }) {
  const scenarios = rows.map((row) => ({
    content: facadeScenarioContent[row.id as keyof typeof facadeScenarioContent],
    price: formatPriceRange(row.range),
  }));

  return (
    <section aria-labelledby="scenari-title" className="eg-section-editorial border-t border-eg-border">
      <div className="eg-container">
        <p className={blueprintEyebrowClassName}>Scenari</p>
        <h2 id="scenari-title" className={cn(sectionTitleClassName, "mt-3")}>
          Tre scenari di intervento
        </h2>

        <ComparativeScenarioTable scenarios={scenarios} />

        <ScenarioExclusions
          title="Nel rifacimento esteso non sono compresi"
          items={["ponteggio", "cappotto termico"]}
        />
      </div>
    </section>
  );
}

type ComparativeScenario = {
  content: {
    title: string;
    label: string;
    items: readonly string[];
  };
  price: string;
};

function ComparativeScenarioTable({ scenarios }: { scenarios: readonly ComparativeScenario[] }) {
  const lastColumnIndex = scenarios.length - 1;
  const gridStyle = { gridTemplateColumns: `repeat(${scenarios.length}, minmax(0, 1fr))` };

  return (
    <>
      <div className="mt-8 hidden overflow-hidden border border-eg-border bg-white lg:grid" style={gridStyle}>
        {scenarios.map(({ content, price }, index) => (
          <article key={content.title} className={cn("flex flex-col", index < lastColumnIndex && "border-r border-eg-border")}>
            <header className="flex min-h-14 items-start px-5 py-4.5">
              <h3 className="font-(family-name:--eg-font-primary) text-[15.5px] font-semibold leading-snug text-eg-ink">
                {content.title}
              </h3>
            </header>
            <p className={cn(priceRangeClassName, "border-y border-eg-border px-5 py-4")}>{price}</p>
            <p className="border-b border-eg-border px-5 py-3 font-(family-name:--eg-font-mono) text-[10.5px] font-semibold uppercase tracking-[0.06em] text-eg-text-muted">
              {content.label}
            </p>
            <ul className="list-none px-5">
              {content.items.map((item) => (
                <li key={item} className="border-b border-eg-border py-3 text-[13.5px] leading-normal text-eg-ink last:border-b-0">{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:hidden">
        {scenarios.map(({ content, price }) => (
          <article key={content.title} className="overflow-hidden border border-eg-border bg-white">
            <header className="px-5 py-4.5">
              <h3 className="font-(family-name:--eg-font-primary) text-[15.5px] font-semibold leading-snug text-eg-ink">
                {content.title}
              </h3>
            </header>
            <p className={cn(priceRangeClassName, "border-y border-eg-border px-5 py-4")}>{price}</p>
            <p className="border-b border-eg-border px-5 py-3 font-(family-name:--eg-font-mono) text-[10.5px] font-semibold uppercase tracking-[0.06em] text-eg-text-muted">
              {content.label}
            </p>
            <ul className="list-none px-5">
              {content.items.map((item) => (
                <li key={item} className="border-b border-eg-border py-3 text-[13.5px] leading-normal text-eg-ink last:border-b-0">{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </>
  );
}

function ScenarioExclusions({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div className="mt-5 border-t border-eg-border pt-4">
      <h3 className="font-(family-name:--eg-font-primary) text-[15px] font-semibold text-eg-ink">{title}</h3>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[13px] leading-normal text-eg-text-muted">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
