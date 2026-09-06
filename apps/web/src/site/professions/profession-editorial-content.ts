export type ProfessionEditorialIntro = {
  readonly paragraphs: readonly string[];
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
  readonly intro?: ProfessionEditorialIntro;
  readonly pricing?: ProfessionEditorialPricing;
};

// Registry editoriale web-side: ogni voce entra solo dopo studio e
// approvazione del contenuto della singola professione.
const all: readonly ProfessionEditorialContent[] = [
  {
    categorySlug: "elettricista",
    intro: {
      paragraphs: [
        "Un elettricista si occupa dell’installazione, della manutenzione e della riparazione degli impianti elettrici negli edifici. Può intervenire per realizzare o modificare un impianto, individuare guasti e malfunzionamenti, installare punti luce e prese oppure integrare sistemi come citofoni, videocitofoni, dispositivi di sicurezza e soluzioni per la smart home.",
        "Per i lavori sugli impianti elettrici è importante rivolgersi a un professionista qualificato e, quando previsto dalla normativa, a un’impresa abilitata per la tipologia di intervento da eseguire. Su Esigenta puoi individuare il lavoro di cui hai bisogno, approfondirne caratteristiche e costi quando è disponibile una guida dedicata e richiedere preventivi per confrontare le soluzioni più adatte.",
      ],
    },
    pricing: {
      heading: "Quanto costa un elettricista?",
      intro:
        "La tariffa di un elettricista può variare in base alla zona, alla complessità dell’intervento, alla durata del lavoro e alle condizioni in cui viene richiesto il servizio. Per gli interventi ordinari, i riferimenti di mercato analizzati indicano generalmente una tariffa oraria compresa nella seguente fascia.",
      rows: [
        {
          label: "Tariffa oraria indicativa",
          value: "25–50 €",
          unit: "all’ora",
          note:
            "Riferimento orientativo per interventi ordinari. Materiali, eventuale uscita e condizioni particolari possono incidere sul prezzo finale.",
        },
      ],
      context: "Interventi ordinari",
      factors: [
        "Zona",
        "Complessità",
        "Durata",
        "Eventuale uscita",
        "Materiali",
      ],
      disclaimer:
        "Le tariffe indicate sono riferimenti orientativi di mercato e non costituiscono un tariffario professionale vincolante. Il costo effettivo dipende dal lavoro richiesto e dalle condizioni definite dal professionista.",
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
