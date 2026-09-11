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
  readonly requestMicrocopy?: string;
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
  {
    categorySlug: "impresa-edile",
    seo: {
      title: "Trova un'impresa edile e confronta preventivi | Esigenta",
      description:
        "Trova un'impresa edile per lavori e ristrutturazioni, scegli l'intervento che ti serve e richiedi preventivi per confrontare le proposte disponibili.",
    },
    hero: {
      src: "/assets/images/professionisti-hero.webp",
      alt: "Impresa edile al lavoro su un edificio",
    },
    intro: {
      lead:
        "Un’impresa edile si occupa di lavori di costruzione, manutenzione e ristrutturazione degli edifici.",
      paragraphs: [
        "Può eseguire opere murarie, ristrutturazioni, interventi su facciate e balconi, pavimentazioni, coperture e lavori di costruzione, direttamente o coordinando le diverse lavorazioni necessarie al cantiere.",
      ],
      note:
        "Le attività offerte possono variare da un’impresa all’altra. Su Esigenta puoi scegliere il lavoro che devi realizzare e richiedere preventivi per confrontare le proposte disponibili.",
    },
    requestMicrocopy:
      "Confronta imprese per il lavoro che devi realizzare",
    closingSections: [
      {
        kind: "when-to-contact",
        heading: "Quando rivolgersi a un’impresa edile",
        items: [
          {
            title: "Ristrutturazioni articolate",
            description:
              "Quando il lavoro comprende più fasi o diverse lavorazioni edili da organizzare nello stesso intervento.",
          },
          {
            title: "Opere sull’edificio",
            description:
              "Per interventi su murature, facciate, balconi, pavimentazioni, coperture e altre parti dell’immobile.",
          },
          {
            title: "Costruzioni e ampliamenti",
            description:
              "Per lavori più estesi che richiedono organizzazione del cantiere e il coordinamento delle attività necessarie.",
          },
        ],
      },
      {
        heading: "Cosa incide sul preventivo",
        paragraphs: [
          "Il costo di un lavoro edile dipende dal tipo di intervento e dalle condizioni specifiche del cantiere.",
        ],
        items: [
          "tipo di intervento",
          "dimensioni del lavoro",
          "condizioni dell’immobile",
          "materiali e finiture",
          "numero di lavorazioni coinvolte",
          "accessibilità del cantiere",
        ],
      },
      {
        kind: "how-to-choose",
        heading: "Come scegliere un’impresa edile",
        items: [
          {
            title: "Esperienza su lavori simili",
            description:
              "Valuta se l’impresa ha esperienza con interventi paragonabili a quello che devi realizzare.",
          },
          {
            title: "Preventivo chiaro",
            description:
              "Confronta le lavorazioni comprese, i materiali, i tempi indicativi e le condizioni della proposta, non soltanto il totale.",
          },
          {
            title: "Dati e documentazione",
            description:
              "Verifica i dati dell’impresa e la documentazione pertinente al tipo di lavoro da eseguire.",
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
