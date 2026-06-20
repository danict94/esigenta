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

export type TaxonomySector = {
  slug: string
  name: string
  description?: string
}

export type TaxonomyService = {
  slug: string
  name: string
  description?: string
  runtimePresetSlugs?: RuntimePresetSlug[]
  aliases?: string[]
}

export type TaxonomyIntervention = {
  slug: string
  name: string
  description?: string

  services: string[]
  runtimePresetSlugs?: RuntimePresetSlug[]

  aliases?: string[]
}

export type TaxonomyCategory = {
  slug: string
  name: string
  description?: string
  aliases?: string[]
  sectorSlug: string

  services: string[]
  runtimePresetSlugs?: RuntimePresetSlug[]
}

export type TaxonomyDomain = {
  slug: string
  name: string
  description?: string
  aliases?: string[]

  interventions: string[]
  runtimePresetSlugs?: RuntimePresetSlug[]
}

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

export type TaxonomySource = {
  sectors: TaxonomySector[]
  services: TaxonomyService[]
  interventions: TaxonomyIntervention[]
  categories: TaxonomyCategory[]
  domains: TaxonomyDomain[]
}
