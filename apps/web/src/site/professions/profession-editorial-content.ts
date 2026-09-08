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
  readonly items?: readonly ProfessionEditorialItem[];
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

export type ProfessionEditorialSeo = {
  readonly title: string;
  readonly description: string;
};

export type ProfessionEditorialItem =
  | string
  | {
      readonly title: string;
      readonly description: string;
    };

export type ProfessionEditorialContent = {
  readonly categorySlug: string;
  readonly seo?: ProfessionEditorialSeo;
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
    seo: {
      title: "Trova un elettricista e confronta preventivi | Esigenta",
      description:
        "Trova un elettricista per i lavori di casa, consulta la tariffa oraria indicativa e richiedi preventivi per confrontare le soluzioni disponibili.",
    },
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
    closingSections: [
      {
        kind: "when-to-contact",
        heading: "Quando rivolgersi a un elettricista",
        paragraphs: [
          "Puoi rivolgerti a un elettricista quando devi realizzare o modificare un impianto, individuare un guasto, aggiungere prese o punti luce oppure installare citofoni, sistemi di sicurezza e soluzioni per la smart home.",
        ],
      },
      {
        kind: "how-to-choose",
        heading: "Come scegliere un elettricista",
        items: [
          "Verifica l’abilitazione quando è prevista per il tipo di intervento.",
          "Confronta cosa comprende il preventivo e quali lavorazioni restano escluse.",
          "Chiarisci materiali, tempi di esecuzione e documentazione prevista.",
        ],
      },
    ],
  },
  {
    categorySlug: "idraulico",
    seo: {
      title: "Trova un idraulico e confronta preventivi | Esigenta",
      description:
        "Trova un idraulico per i lavori di casa, scegli tra interventi di idraulica e riscaldamento e richiedi preventivi per confrontare le soluzioni disponibili.",
    },
    intro: {
      lead:
        "Un idraulico si occupa dell’installazione, della manutenzione e della riparazione degli impianti idrici e sanitari negli edifici.",
      paragraphs: [
        "Interviene su tubazioni, perdite, scarichi, sanitari e punti acqua. In base alle competenze e alle abilitazioni richieste, può occuparsi anche di impianti di riscaldamento e produzione di acqua calda.",
      ],
      note:
        "Per i lavori per cui è richiesta un’abilitazione ai sensi del D.M. 37/2008, è importante verificare che l’impresa sia abilitata per la specifica tipologia di impianto. Su Esigenta puoi scegliere l’intervento di cui hai bisogno e richiedere preventivi da confrontare.",
    },
    closingSections: [
      {
        kind: "when-to-contact",
        heading: "Quando rivolgersi a un idraulico",
        paragraphs: [
          "Puoi rivolgerti a un idraulico quando devi realizzare o modificare un impianto idrico, risolvere perdite o scarichi ostruiti, sostituire sanitari e punti acqua. Per caldaie e altri impianti di riscaldamento, verifica che il professionista o l’impresa disponga delle abilitazioni richieste per il lavoro.",
        ],
      },
      {
        kind: "how-to-choose",
        heading: "Come scegliere un idraulico",
        items: [
          {
            title: "Verifica le abilitazioni",
            description:
              "Per i lavori regolamentati, controlla che l’impresa sia abilitata per la specifica tipologia di impianto.",
          },
          {
            title: "Confronta il preventivo",
            description:
              "Verifica che siano indicate le lavorazioni, i materiali e gli eventuali costi accessori.",
          },
          {
            title: "Chiarisci tempi e documentazione",
            description:
              "Prima dei lavori, chiedi i tempi previsti e quale documentazione verrà rilasciata quando richiesta.",
          },
        ],
      },
    ],
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
