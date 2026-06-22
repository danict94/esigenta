export type RuntimePresetSlug =
  | "INTERIOR_WORK"
  | "EXTERIOR_WORK"
  | "EMERGENCY_REPAIR"
  | "RENOVATION"
  | "QUICK_SERVICE"
  | "PAINTING"
  | "PLUMBING_EMERGENCY"
  | "HOME_RENOVATION"
  | "BATHROOM_RENOVATION"
  | "ELECTRICAL_WORK"
  | "GENERIC"

// CATEGORY non è (più) un tipo di risultato restituito da searchTaxonomy
// (Phase 20.9G): una Category matchata espande direttamente ai suoi
// Intervention, non viene mai mostrata come risultato cliccabile a sé.
export type TaxonomySearchEntityType = "INTERVENTION"

export type TaxonomySearchResult = {
  id: string
  type: TaxonomySearchEntityType
  slug: string
  name: string
  description: string | null
  relevance: number
}

