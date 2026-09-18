import type {
  CostGuideSourceType,
  PriceRow,
  SizeExample,
} from "../../market-data/shared/types";
import type { CostGuideEditorial } from "../../editorial/cost-guide-editorial";

export type CityPageQualityStatus = "draft" | "ready";
export type CityPageUniquenessLevel = "thin" | "acceptable" | "strong";

/**
 * Delta editoriale di UNA città dentro local-overrides.ts (Fase 3: tipo
 * condiviso qui, mai definito dentro una famiglia e importato dalle altre).
 * Niente nome città (viene da geo/cities.ts via citySlug), niente canonical
 * (calcolato), niente prezzi (market-data): solo prosa locale.
 */
export type CityLocalOverride = {
  citySlug: string;
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  localReading: string;
  priceInterpretation: string;
  typicalCases: string[];
  localFactors: string[];
  whenPriceGoesUp: string[];
  whatToAskInQuote: string[];
  faq: { question: string; answer: string }[];
};

export type CostGuideCityPage = {
  city: string;
  citySlug: string;
  seoEnabled: boolean;
  contentStatus: CityPageQualityStatus;
  uniquenessLevel: CityPageUniquenessLevel;
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  summary: string;
  localReading: string;
  priceInterpretation: string;
  typicalCases: string[];
  localFactors: string[];
  whenPriceGoesUp: string[];
  whatToAskInQuote: string[];
  faq: {
    question: string;
    answer: string;
  }[];
};

export type CostGuideHubCategory = {
  slug: string;
  name: string;
};

/**
 * Richiamo a un intervento specifico (taxonomy) spesso confuso con questa
 * guida, mostrato nel blocco "Interventi specifici" — mai i dettagli
 * completi, solo titolo/descrizione editoriali e lo slug reale da cui si
 * risolve la destinazione (guida costi → landing intervento → funnel).
 * `slug` è validato contro la frozen taxonomy dal composer, a build-time.
 */
export type CostGuideRelatedWorkItem = {
  slug: string;
  title: string;
  description: string;
  linkLabel?: string;
  ctaOnly?: boolean;
};

export type CostGuideScenarioPresentation = {
  rowId: PriceRow["id"];
  title?: string;
  label: "Comprende" | "Può comprendere" | "Quando può bastare";
  items: readonly string[];
};

export type CostGuideExtraPresentation = {
  rowId: PriceRow["id"];
  title?: string;
  description?: string;
};

export type CostGuideBreakdownPresentation = {
  rowId: PriceRow["id"];
  show: boolean;
};

export type CostGuidePricePresentation = {
  scenarios?: readonly CostGuideScenarioPresentation[];
  extras?: readonly CostGuideExtraPresentation[];
  breakdown?: readonly CostGuideBreakdownPresentation[];
};

export type ResolvedCostGuidePricePresentation = {
  scenarios: readonly {
    row: PriceRow;
    presentation: CostGuideScenarioPresentation;
  }[];
  extras: readonly CostGuideExtraPresentation[];
  breakdownRowIds: readonly PriceRow["id"][];
};

/**
 * Contenuto NAZIONALE di una famiglia (il base.ts della cartella): solo
 * editoriale, mai numeri (i prezzi vivono in market-data e vengono agganciati
 * dal composer via familyKey derivata dallo slug: "costGuide:<slug>").
 */
export type CostGuideBaseContent = {
  slug: string;
  funnelSlug: string;
  interventionSeoSlug: string;
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  /**
   * Data (YYYY-MM-DD) dell'ultima modifica editoriale significativa di
   * QUESTA guida — mai la data di build/deploy. Opzionale: assente = nessun
   * `<lastmod>` in sitemap per questa guida, mai un fallback inventato.
   * Validata da engine/editorial-date.ts, che documenta anche la regola di
   * quando aggiornarla (contenuto/prezzi/FAQ sostanziali sì, formattazione/
   * refactor/build no) — stesso campo/stessa regola su SeoInterventionLanding
   * e SeoGroupLanding.
   */
  lastModified?: string;
  /**
   * Contratto editoriale comune. Opzionale solo durante la migrazione delle
   * guide legacy; ogni nuova guida deve dichiararlo con i campi obbligatori
   * definiti in CostGuideEditorial.
   */
  editorial?: CostGuideEditorial;
  /**
   * Opzionale: una guida senza foto reale coerente renderizza senza il
   * blocco immagine invece di usare un path fittizio o un fallback
   * incoerente (stesso principio di SeoInterventionLanding.image). Vedi
   * templates/cost-page-template.tsx ed engine/metadata.ts, gli unici punti
   * che leggono questo campo.
   */
  heroImage?: { src: string; alt: string };
  hubCategory: CostGuideHubCategory;
  topicLabel: string;
  summary: string;
  factors: string[];
  locationFactors?: readonly string[];
  savingTips: string[];
  /** Opzionale: solo per le guide che vogliono il blocco "Interventi specifici". */
  relatedWork?: readonly CostGuideRelatedWorkItem[];
  /** Introduzione editoriale alternativa al listino delle singole lavorazioni. */
  breakdownIntro?: string;
  hideBreakdownSourceNote?: boolean;
  /** Copy opzionale del blocco condiviso degli extra condizionali. */
  extrasPresentation?: {
    title: string;
    intro: string;
    layout?: "cards" | "columns";
  };
  scenarioExclusions?: {
    title: string;
    items: readonly string[];
  };
  /** Variante compatta della sezione Fattori, senza sottosezioni duplicate. */
  compactFactors?: {
    title: string;
    intro: string;
  };
  /** Fascia da evidenziare tipograficamente nella FAQ della guida. */
  faqEmphasizePhrase?: string;
  /**
   * Etichetta alternativa alla didascalia fissa "RANGE INDICATIVO
   * COMPLESSIVO" mostrata nel modulo Costi di /interventi/[slug]
   * (geo-cost-module.tsx), quando `nationalRange` non è un totale
   * complessivo (es. una fascia al mq). Il campo vale esclusivamente per il
   * modulo Costi della landing intervento, non per la guida /costi.
   * Assente = didascalia fissa invariata, nessun effetto sulle guide che non
   * la impostano.
   */
  interventionRangeLabel?: string;
  /** Variante tabellare per gli esempi: copy e intestazioni restano dati della guida. */
  sizeExamplesTable?: {
    title: string;
    intro: string;
    notes: readonly string[];
    surfaceLabel?: string;
    sizeUnit?: "mq" | "m²";
  };
  /**
   * Quando presente, la guida non ha ancora prezzi verificati su prezzari
   * ufficiali: il composer salta del tutto la lookup in market-data (nessuna
   * voce richiesta lì) e produce priceRows/sizeExamples vuoti e
   * nationalRange/pricePerSquareMeter assenti. Il template mostra questo
   * testo al posto di Sintesi numerica e Tabella prezzi (sezione tabella non
   * renderizzata, mai vuota). Guide senza questo campo passano dallo stesso
   * identico percorso di sempre.
   */
  pricingTeaser?: string;
  /**
   * Descrizione breve dedicata alla card di /costi, distinta da `summary`
   * (che resta il paragrafo hero della pagina intera della guida). Opzionale:
   * quando assente, la card di /costi ricade su `summary` — nessun effetto
   * sulle guide che non la impostano.
   */
  hubDescription?: string;
  /**
   * Ordine di comparsa nella categoria dell'hub /costi, crescente. Opzionale:
   * le guide senza questo campo vanno in fondo alla loro categoria, ordinate
   * per titolo poi slug (mai per ordine di import). Nessun effetto sulla
   * pagina della guida stessa.
   */
  hubOrder?: number;
  /**
   * Esclude la guida dall'hub /costi pur restando pubblicata e raggiungibile
   * al proprio URL. Default false: nessuna guida è esclusa a meno di
   * impostarlo esplicitamente.
   */
  hubExcluded?: boolean;
  /**
   * Etichetta breve opzionale mostrata sulla card dell'hub (es. "Nuovo").
   * Da valorizzare solo con un criterio editoriale reale, mai per riempire
   * lo spazio — assente per la maggior parte delle guide.
   */
  hubBadge?: string;
};

export type CostGuide = {
  slug: string;
  funnelSlug: string;
  interventionSeoSlug: string;
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  /** Passato invariato da CostGuideBaseContent.lastModified — vedi lì. */
  lastModified?: string;
  editorial?: CostGuideEditorial;
  /**
   * Categoria pubblica per il raggruppamento in /costi (Phase 20.2). Concetto
   * editoriale che vive solo qui: non importare da site/services né dalla taxonomy,
   * per non accoppiare il raggruppamento delle guide costo al dominio dei servizi.
   */
  hubCategory: CostGuideHubCategory;
  /**
   * Immagine hero/OG della guida — mai un'immagine fissa condivisa tra
   * guide diverse. Opzionale: vedi il commento su CostGuideBaseContent.
   */
  heroImage?: { src: string; alt: string };
  /**
   * Frase breve minuscola usata per generalizzare i titoli di sezione del
   * template (es. "ristrutturare un bagno", "rifare un tetto"). Evita di
   * hardcodare il tema della guida dentro cost-page-template.tsx.
   */
  topicLabel: string;
  summary: string;
  /** Assente quando la guida è in modalità pricingTeaser (nessun prezzo ancora). */
  nationalRange?: string;
  pricePerSquareMeter?: string;
  /** Righe tecniche da market-data (stessa shape, mai ridefinita qui). Vuoto se pricingTeaser è presente. */
  priceRows: PriceRow[];
  pricePresentation: ResolvedCostGuidePricePresentation;
  /** Base dati mostrata sotto la tabella (da market-data, se dichiarata). */
  sourceLabel?: string;
  sourceYear?: string;
  /**
   * Provenienza esplicita dei numeri (da market-data, mai da string-match
   * su sourceLabel né da PriceRowConfidence): "official" solo se ogni riga
   * è un prezzo ufficiale puntuale, "mixed" per una fascia editoriale
   * multi-fonte. Assente quando la guida è in modalità pricingTeaser. Unica
   * fonte del badge in cost-hub-template.tsx.
   */
  sourceType?: CostGuideSourceType;
  sizeExamples: SizeExample[];
  cityPages: CostGuideCityPage[];
  factors: string[];
  locationFactors?: readonly string[];
  savingTips: string[];
  faq: { question: string; answer: string }[];
  relatedWork?: readonly CostGuideRelatedWorkItem[];
  breakdownIntro?: string;
  hideBreakdownSourceNote?: boolean;
  extrasPresentation?: {
    title: string;
    intro: string;
    layout?: "cards" | "columns";
  };
  scenarioExclusions?: {
    title: string;
    items: readonly string[];
  };
  compactFactors?: {
    title: string;
    intro: string;
  };
  faqEmphasizePhrase?: string;
  interventionRangeLabel?: string;
  sizeExamplesTable?: {
    title: string;
    intro: string;
    notes: readonly string[];
    surfaceLabel?: string;
    sizeUnit?: "mq" | "m²";
  };
  pricingTeaser?: string;
  hubDescription?: string;
  hubOrder?: number;
  hubExcluded?: boolean;
  hubBadge?: string;
};
