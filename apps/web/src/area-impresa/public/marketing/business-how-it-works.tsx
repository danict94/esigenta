import { Reveal } from "../../../site/home/reveal";

import { RequestGlyph, UnlockGlyph, ZoneGlyph } from "./marketing-glyphs";
import { RequestCard, type RequestCardData } from "./request-card";

const incomingRequest: RequestCardData = {
  category: "Impianto elettrico",
  city: "Milano",
  zoneLabel: "zona indicata",
  badge: { label: "Verificata", tone: "verified" },
  chips: ["Nuovo impianto", "Sopralluogo"],
};

const unlockRequest: RequestCardData = {
  category: "Climatizzatore",
  city: "Palermo",
  badge: { label: "Contatto da valutare", tone: "neutral" },
  chips: ["2 split"],
  seats: { taken: 2, total: 3 },
};

const detailRows = [
  ["Categoria", "Impianto elettrico"],
  ["Zona", "Milano / zona indicata"],
  ["Intervento", "Nuovo impianto"],
  ["Tempi", "Sopralluogo"],
] as const;

function DetailPanel() {
  return (
    <div className="eg-panel bg-eg-calce p-4 md:p-5">
      <div className="eg-mono-label flex items-center gap-2">
        <ZoneGlyph className="size-4 text-eg-cotto-dark" />
        Dettagli richiesta
      </div>

      <dl className="mt-3 divide-y divide-eg-hairline">
        {detailRows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[13px] text-eg-ardesia">{label}</dt>
            <dd className="text-right text-[13.5px] font-medium text-eg-terra">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const steps = [
  {
    number: "01",
    glyph: RequestGlyph,
    title: "Ricevi richieste compatibili",
    description:
      "Zona, servizi e dettagli arrivano gia ordinati: capisci subito se il lavoro rientra nel tuo perimetro.",
    visual: <RequestCard {...incomingRequest} compact />,
  },
  {
    number: "02",
    glyph: ZoneGlyph,
    title: "Valuti prima di spendere",
    description:
      "Leggi categoria, luogo, tempi e contesto prima di usare crediti. La scelta resta tua.",
    visual: <DetailPanel />,
  },
  {
    number: "03",
    glyph: UnlockGlyph,
    title: "Sblocchi solo i contatti giusti",
    description:
      "Quando una richiesta ti interessa, apri il contatto e continui la conversazione dall'area impresa.",
    visual: <RequestCard {...unlockRequest} compact />,
  },
] as const;

export function BusinessHowItWorks() {
  return (
    <section className="eg-section bg-eg-calce" aria-labelledby="business-steps-title">
      <div className="eg-container">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="eg-eyebrow">Come funziona</p>
          <h2 id="business-steps-title" className="eg-h2 mt-4">
            Dal bisogno del cliente al contatto, senza rumore.
          </h2>
          <p className="eg-body-muted mx-auto mt-5 max-w-[46ch]">
            La richiesta nasce dal percorso cliente e arriva a te in una forma
            leggibile, prima ancora dello sblocco.
          </p>
        </div>

        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map(({ number, glyph: Glyph, title, description, visual }, index) => (
            <li key={number}>
              <Reveal delayMs={index * 90} className="flex h-full flex-col">
                {visual}

                <div className="mt-6 flex items-center gap-3">
                  <span className="eg-mono-label text-eg-cotto-dark">{number}</span>
                  <Glyph className="size-5 text-eg-ardesia" />
                </div>

                <h3 className="eg-h3 mt-4">{title}</h3>
                <p className="eg-body-muted mt-3">{description}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
