import { Container } from "@esigenta/ui";

import { Reveal } from "../../../site/home/reveal";

import { RequestCard, type RequestCardData } from "./request-card";
import { RequestGlyph, UnlockGlyph, ZoneGlyph } from "./marketing-glyphs";

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
  ["Zona", "Milano · zona indicata"],
  ["Intervento", "Nuovo impianto"],
  ["Tempi", "Sopralluogo"],
] as const;

// Step 2's micro-object: a product-like spec panel — the moment you read the
// details and decide, before spending a credit.
function DetailPanel() {
  return (
    <div className="rounded-[8px] border border-cantiere-hairline bg-cantiere-paper p-4 shadow-cantiere-slab md:p-5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-cantiere-ink-secondary">
        <ZoneGlyph className="size-4 text-cantiere-accent" />
        Dettagli richiesta
      </div>

      <dl className="mt-3 divide-y divide-cantiere-hairline">
        {detailRows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 py-2.5"
          >
            <dt className="text-[13px] text-cantiere-ink-secondary">{label}</dt>
            <dd className="text-right text-[13.5px] font-medium text-cantiere-ink">
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
    number: "Passo 1",
    glyph: RequestGlyph,
    title: "Ricevi richieste compatibili",
    description:
      "In base alla tua zona operativa e ai servizi configurati, l'area impresa ti mostra le richieste pertinenti al tuo lavoro.",
    visual: <RequestCard {...incomingRequest} compact />,
  },
  {
    number: "Passo 2",
    glyph: ZoneGlyph,
    title: "Valuti dettagli e zona",
    description:
      "Apri ogni richiesta, leggi cosa serve e dove, e capisci se fa per te prima di spendere un solo credito.",
    visual: <DetailPanel />,
  },
  {
    number: "Passo 3",
    glyph: UnlockGlyph,
    title: "Sblocchi solo quelle interessanti",
    description:
      "Usi i crediti soltanto sulle richieste che vuoi approfondire. Dopo lo sblocco contatti il cliente via email o telefono.",
    visual: <RequestCard {...unlockRequest} compact />,
  },
] as const;

export function BusinessHowItWorks() {
  return (
    <section className="relative bg-cantiere-paper py-20 md:py-28 lg:py-32">
      <Container size="md" gutter="md">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.16em] text-cantiere-ink-secondary">
            Come funziona
          </p>

          <h2 className="mt-4 max-w-[20ch] font-medium tracking-[-0.01em] text-cantiere-ink text-[clamp(1.625rem,1.1rem+2.2vw,2.375rem)]">
            Dalla richiesta al contatto, in tre passaggi.
          </h2>
        </div>

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map(({ number, glyph: Glyph, title, description, visual }, index) => (
            <li key={number}>
              <Reveal delayMs={index * 90} className="flex h-full flex-col">
                {visual}

                <div className="mt-6 flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-[8px] bg-cantiere-accent-tint text-cantiere-accent">
                    <Glyph className="size-[18px]" />
                  </span>

                  <span className="text-[12px] uppercase tracking-[0.14em] text-cantiere-ink-secondary">
                    {number}
                  </span>
                </div>

                <h3 className="mt-4 text-[18px] font-medium leading-[1.3] text-cantiere-ink">
                  {title}
                </h3>

                <p className="mt-3 text-[15px] leading-[1.55] text-cantiere-ink-secondary">
                  {description}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
