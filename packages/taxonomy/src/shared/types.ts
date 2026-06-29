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
