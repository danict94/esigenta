export type ProfessionEditorialIntro = {
  readonly lead?: string;
  readonly paragraphs: readonly string[];
  readonly note?: string;
};

export type ProfessionEditorialHero = {
  readonly src: string;
  readonly alt: string;
};

export type ProfessionEditorialSection = {
  readonly kind?: "when-to-contact" | "how-to-choose";
  readonly heading: string;
  readonly paragraphs?: readonly string[];
  readonly items?: readonly string[];
};

export type ProfessionEditorialPricingRow = {
  readonly label: string;
  readonly value: string;
  readonly unit?: string;
  readonly note?: string;
};

export type ProfessionEditorialPricing = {
  readonly heading: string;
  readonly intro?: string;
  readonly rows: readonly ProfessionEditorialPricingRow[];
  readonly context?: string;
  readonly factors?: readonly string[];
  readonly disclaimer?: string;
  readonly lastReviewed?: string;
};

export type ProfessionEditorialContent = {
  readonly categorySlug: string;
  readonly hero?: ProfessionEditorialHero;
  readonly intro?: ProfessionEditorialIntro;
  readonly pricing?: ProfessionEditorialPricing;
  readonly closingSections?: readonly ProfessionEditorialSection[];
};

// Registry editoriale web-side: ogni voce entra solo dopo studio e
// approvazione del contenuto della singola professione.
const all: readonly ProfessionEditorialContent[] = [
  {
    categorySlug: "elettricista",
    hero: {
      src: "/assets/images/impianto-elettrico.webp",
      alt: "Intervento su impianto elettrico domestico",
    },
    intro: {
      lead:
        "Un elettricista si occupa dell’installazione, della manutenzione e della riparazione degli impianti elettrici negli edifici.",
      paragraphs: [
        "Può realizzare o modificare un impianto, individuare guasti e malfunzionamenti, installare punti luce e prese oppure integrare citofoni, sistemi di sicurezza e soluzioni per la smart home.",
      ],
      note:
        "Per i lavori sugli impianti elettrici è importante rivolgersi a un professionista qualificato e, quando previsto, a un’impresa abilitata. Su Esigenta puoi individuare l’intervento di cui hai bisogno, approfondirne caratteristiche e costi quando è disponibile una guida dedicata e richiedere preventivi per confrontare le soluzioni più adatte.",
    },
    pricing: {
      heading: "Quanto costa un elettricista?",
      rows: [
        {
          label: "Tariffa oraria indicativa",
          value: "25–50 €",
          unit: "all’ora",
        },
      ],
      context: "Tariffa indicativa per interventi ordinari",
      factors: [
        "Zona",
        "Complessità",
        "Durata",
        "Materiali",
        "Eventuale uscita",
      ],
      disclaimer:
        "Valore orientativo di mercato. IVA e condizioni dipendono dal preventivo.",
      lastReviewed: "settembre 2026",
    },
  },
];

const byCategorySlug: ReadonlyMap<string, ProfessionEditorialContent> = new Map(
  all.map((content) => [content.categorySlug, content]),
);

export function getProfessionEditorialContent(
  categorySlug: string,
): ProfessionEditorialContent | null {
  return byCategorySlug.get(categorySlug.trim()) ?? null;
}

// Future extension point (non implementato qui): Category + location potrà
// risolvere aziende/professionisti registrati, area operativa, profilo,
// recensioni reali, rating e CTA verso profilo o richiesta. Richiederà un
// resolver runtime separato; questi dati non appartengono al registry
// editoriale statico.
