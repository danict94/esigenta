export type CostGuideTocItem = {
  id: string;
  label: string;
};

export type CostGuideSectionPresence = {
  scenarios: boolean;
  extras: boolean;
  examples: boolean;
  breakdown: boolean;
  factors: boolean;
  insights: boolean;
  faq: boolean;
};

const costGuideTocSections: readonly (CostGuideTocItem & {
  key: keyof CostGuideSectionPresence;
})[] = [
  { key: "scenarios", id: "scenari-title", label: "Scenari" },
  { key: "extras", id: "extra-title", label: "Extra" },
  { key: "examples", id: "esempi-costo-title", label: "Esempi di costo" },
  { key: "breakdown", id: "lavorazioni-title", label: "Prezzi dettagliati" },
  { key: "factors", id: "fattori-costo-title", label: "Fattori" },
  { key: "insights", id: "approfondimenti-title", label: "Approfondimenti" },
  { key: "faq", id: "seo-faq-title", label: "FAQ" },
];

/**
 * Fonte unica per visibilita delle macro-sezioni e indice: il template usa
 * queste stesse presence per renderizzare i blocchi, senza TOC manuali per
 * singola guida.
 */
export function resolveCostGuideToc(
  presence: CostGuideSectionPresence,
): readonly CostGuideTocItem[] {
  return costGuideTocSections
    .filter((section) => presence[section.key])
    .map(({ id, label }) => ({ id, label }));
}
