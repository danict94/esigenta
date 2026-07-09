import type { PriceRow } from "../../market-data/base-price-ranges";

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
  heroImage: { src: string; alt: string };
  hubCategory: CostGuideHubCategory;
  topicLabel: string;
  summary: string;
  factors: string[];
  savingTips: string[];
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
  /**
   * Categoria pubblica per il raggruppamento in /costi (Phase 20.2). Concetto
   * editoriale che vive solo qui: non importare da site/services né dalla taxonomy,
   * per non accoppiare il raggruppamento delle guide costo al dominio dei servizi.
   */
  hubCategory: CostGuideHubCategory;
  /** Immagine hero/OG della guida — mai un'immagine fissa condivisa tra guide diverse. */
  heroImage: { src: string; alt: string };
  /**
   * Frase breve minuscola usata per generalizzare i titoli di sezione del
   * template (es. "ristrutturare un bagno", "rifare un tetto"). Evita di
   * hardcodare il tema della guida dentro cost-page-template.tsx.
   */
  topicLabel: string;
  summary: string;
  nationalRange: string;
  pricePerSquareMeter: string;
  /** Righe tecniche da market-data (stessa shape, mai ridefinita qui). */
  priceRows: PriceRow[];
  /** Base dati mostrata sotto la tabella (da market-data, se dichiarata). */
  sourceLabel?: string;
  sourceYear?: string;
  sizeExamples: { label: string; range: string; note: string }[];
  citySections: {
    city: string;
    title: string;
    summary: string;
    localReading: string;
    typicalCases: string[];
    factors: string[];
  }[];
  cityPages: CostGuideCityPage[];
  factors: string[];
  savingTips: string[];
  faq: { question: string; answer: string }[];
};
