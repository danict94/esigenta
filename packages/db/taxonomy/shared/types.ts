export type TaxonomySector = {
  slug: string
  name: string
  description?: string
}

export type TaxonomyService = {
  slug: string
  name: string
  description?: string
  aliases?: string[]
}

export type TaxonomyIntervention = {
  slug: string
  name: string
  description?: string

  services: string[]

  aliases?: string[]
}

export type TaxonomyCategory = {
  slug: string
  name: string
  description?: string
  aliases?: string[]
  sectorSlug: string

  services: string[]
}

export type TaxonomyDomain = {
  slug: string
  name: string
  description?: string
  aliases?: string[]

  interventions: string[]
}

export type TaxonomySearchEntityType =
  | "INTERVENTION"
  | "CATEGORY"

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
