export type CityPageQualityStatus = "draft" | "ready";
export type CityPageUniquenessLevel = "thin" | "acceptable" | "strong";

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
  priceRows: { label: string; range: string; note: string }[];
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
