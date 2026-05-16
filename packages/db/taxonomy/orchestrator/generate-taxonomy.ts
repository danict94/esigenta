import fs from "node:fs/promises"
import path from "node:path"

import { taxonomySource } from "../source"
import {
  TAXONOMY_BUILD_VERSION,
} from "../shared/constants"
import { validateTaxonomySource } from "../shared/validators"

import type {
  TaxonomyCategory,
  TaxonomyDomain,
  TaxonomyIntervention,
  TaxonomySector,
  TaxonomyService,
} from "../shared/types"

const OUTPUT_DIR = path.resolve(
  process.cwd(),
  "taxonomy/generated",
)

function bySlug<T extends { slug: string }>(a: T, b: T): number {
  return a.slug.localeCompare(b.slug)
}

function sortedUnique(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) =>
    a.localeCompare(b),
  )
}

function cleanAliases(aliases?: string[]): string[] | undefined {
  if (!aliases || aliases.length === 0) {
    return undefined
  }

  return sortedUnique(
    aliases.map((alias) => alias.trim()).filter(Boolean),
  )
}

function cleanDescription(
  description?: string,
): string | undefined {
  const cleanValue = description?.trim()

  return cleanValue ? cleanValue : undefined
}

function cleanSector(sector: TaxonomySector): TaxonomySector {
  const description = cleanDescription(sector.description)
  const result: TaxonomySector = {
    slug: sector.slug,
    name: sector.name,
  }

  if (description) {
    result.description = description
  }

  return result
}

function cleanService(service: TaxonomyService): TaxonomyService {
  const aliases = cleanAliases(service.aliases)
  const description = cleanDescription(service.description)

  const result: TaxonomyService = {
    slug: service.slug,
    name: service.name,
  }

  if (description) {
    result.description = description
  }

  if (aliases) {
    result.aliases = aliases
  }

  return result
}

function cleanIntervention(
  intervention: TaxonomyIntervention,
): TaxonomyIntervention {
  const aliases = cleanAliases(intervention.aliases)
  const description = cleanDescription(intervention.description)

  const result: TaxonomyIntervention = {
    slug: intervention.slug,
    name: intervention.name,
    services: sortedUnique(intervention.services),
  }

  if (description) {
    result.description = description
  }

  if (aliases) {
    result.aliases = aliases
  }

  return result
}

function cleanCategory(
  category: TaxonomyCategory,
): TaxonomyCategory {
  const aliases = cleanAliases(category.aliases)
  const description = cleanDescription(category.description)

  const result: TaxonomyCategory = {
    slug: category.slug,
    name: category.name,
    sectorSlug: category.sectorSlug,
    services: sortedUnique(category.services),
  }

  if (description) {
    result.description = description
  }

  if (aliases) {
    result.aliases = aliases
  }

  return result
}

function cleanDomain(domain: TaxonomyDomain): TaxonomyDomain {
  const aliases = cleanAliases(domain.aliases)
  const description = cleanDescription(domain.description)

  const result: TaxonomyDomain = {
    slug: domain.slug,
    name: domain.name,
    interventions: sortedUnique(domain.interventions),
  }

  if (description) {
    result.description = description
  }

  if (aliases) {
    result.aliases = aliases
  }

  return result
}

async function writeArtifact(
  fileName: string,
  value: unknown,
) {
  await fs.writeFile(
    path.join(OUTPUT_DIR, fileName),
    `${JSON.stringify(value, null, 2)}\n`,
  )
}

async function generateTaxonomy() {
  validateTaxonomySource(taxonomySource)

  const sectors = taxonomySource.sectors
    .map(cleanSector)
    .sort(bySlug)

  const services = taxonomySource.services
    .map(cleanService)
    .sort(bySlug)

  const interventions = taxonomySource.interventions
    .map(cleanIntervention)
    .sort(bySlug)

  const categories = taxonomySource.categories
    .map(cleanCategory)
    .sort(bySlug)

  const domains = taxonomySource.domains
    .map(cleanDomain)
    .sort(bySlug)

  await fs.mkdir(OUTPUT_DIR, {
    recursive: true,
  })

  await writeArtifact("manifest.generated.json", {
    version: TAXONOMY_BUILD_VERSION,
    counts: {
      sectors: sectors.length,
      services: services.length,
      interventions: interventions.length,
      categories: categories.length,
      domains: domains.length,
    },
  })
  await writeArtifact("sectors.generated.json", sectors)
  await writeArtifact("services.generated.json", services)
  await writeArtifact("interventions.generated.json", interventions)
  await writeArtifact("categories.generated.json", categories)
  await writeArtifact("domains.generated.json", domains)

  console.log("Generated taxonomy artifacts")
}

generateTaxonomy().catch((error) => {
  console.error("Taxonomy generation failed")
  console.error(error)

  process.exit(1)
})
