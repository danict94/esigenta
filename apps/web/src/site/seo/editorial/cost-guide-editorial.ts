export const costGuideAuthor = {
  name: "Daniele Sapienza",
  affiliation: "Esigenta",
} as const;

export const costGuidePublisher = {
  name: "Esigenta",
} as const;

export const defaultCostGuideMethodology =
  "Fasce elaborate sulla base di prezzari regionali ufficiali e confronto con prezzi di mercato nazionali per lavorazioni comparabili.";

export type TechnicalReference = {
  label: string;
  type: "standard" | "law" | "guideline" | "other";
  href?: string;
};

/** Collegamento editoriale a un'altra guida /costi; il rendering è opzionale. */
export type CostGuideRelatedGuide = {
  slug: string;
  description?: string;
};

/**
 * Contratto editoriale comune per una guida /costi.
 *
 * Autore, publisher, metodologia base e data di modifica sono policy del
 * template /costi. Qui restano solo dati propri della guida o override reali.
 */
export type CostGuideEditorial = {
  /** Data editoriale dichiarata manualmente, mai derivata da build o deploy. */
  datePublished?: string;
  methodology?: string;
  technicalReferences?: readonly TechnicalReference[];
  relatedGuides?: readonly CostGuideRelatedGuide[];
};

export type ResolvedCostGuideEditorial = CostGuideEditorial & {
  author: typeof costGuideAuthor;
  publisher: typeof costGuidePublisher;
  methodology: string;
  /** Deriva dall'unica fonte editoriale usata anche dalla sitemap. */
  dateModified?: string;
};

export function resolveCostGuideEditorial(
  editorial: CostGuideEditorial | undefined,
  dateModified: string | undefined,
): ResolvedCostGuideEditorial {
  return {
    ...editorial,
    author: costGuideAuthor,
    publisher: costGuidePublisher,
    methodology: editorial?.methodology ?? defaultCostGuideMethodology,
    dateModified,
  };
}
