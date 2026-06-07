import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { taxonomySource } from "../source"
import {
  TAXONOMY_BUILD_VERSION,
} from "../shared/constants"
import { validateTaxonomySource } from "../shared/validators"

import type {
  TaxonomyCategory,
  TaxonomyDomain,
  TaxonomySource,
  TaxonomyIntervention,
  TaxonomySector,
  TaxonomyService,
} from "../shared/types"

const currentDir = path.dirname(fileURLToPath(import.meta.url))

const packageDir = path.resolve(currentDir, "../../..")

const OUTPUT_DIR = path.resolve(
  packageDir,
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

function normalizeComparable(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function cleanAliases(
  aliases: string[] | undefined,
  name: string,
): string[] | undefined {
  if (!aliases || aliases.length === 0) {
    return undefined
  }

  const normalizedName = normalizeComparable(name)

  const cleanedAliases = sortedUnique(
    aliases
      .map((alias) => alias.trim())
      .filter(
        (alias) =>
          alias.length > 0 &&
          normalizeComparable(alias) !== normalizedName,
      ),
  )

  return cleanedAliases.length > 0 ? cleanedAliases : undefined
}

function cleanRuntimePresetSlugs(
  runtimePresetSlugs?: string[],
): string[] | undefined {
  if (
    !runtimePresetSlugs ||
    runtimePresetSlugs.length === 0
  ) {
    return undefined
  }

  return sortedUnique(
    runtimePresetSlugs
      .map((presetSlug) =>
        presetSlug.trim(),
      )
      .filter(Boolean),
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
  const aliases = cleanAliases(service.aliases, service.name)
  const description = cleanDescription(service.description)
  const runtimePresetSlugs =
    cleanRuntimePresetSlugs(
      service.runtimePresetSlugs,
    ) as TaxonomyService["runtimePresetSlugs"]

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

  if (runtimePresetSlugs) {
    result.runtimePresetSlugs =
      runtimePresetSlugs
  }

  return result
}

function cleanIntervention(
  intervention: TaxonomyIntervention,
): TaxonomyIntervention {
  const aliases = cleanAliases(
    intervention.aliases,
    intervention.name,
  )
  const description = cleanDescription(intervention.description)
  const runtimePresetSlugs =
    cleanRuntimePresetSlugs(
      intervention.runtimePresetSlugs,
    ) as TaxonomyIntervention["runtimePresetSlugs"]

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

  if (runtimePresetSlugs) {
    result.runtimePresetSlugs =
      runtimePresetSlugs
  }

  return result
}

function cleanCategory(
  category: TaxonomyCategory,
): TaxonomyCategory {
  const aliases = cleanAliases(category.aliases, category.name)
  const description = cleanDescription(category.description)
  const runtimePresetSlugs =
    cleanRuntimePresetSlugs(
      category.runtimePresetSlugs,
    ) as TaxonomyCategory["runtimePresetSlugs"]

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

  if (runtimePresetSlugs) {
    result.runtimePresetSlugs =
      runtimePresetSlugs
  }

  return result
}

function cleanDomain(domain: TaxonomyDomain): TaxonomyDomain {
  const aliases = cleanAliases(domain.aliases, domain.name)
  const description = cleanDescription(domain.description)
  const runtimePresetSlugs =
    cleanRuntimePresetSlugs(
      domain.runtimePresetSlugs,
    ) as TaxonomyDomain["runtimePresetSlugs"]

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

  if (runtimePresetSlugs) {
    result.runtimePresetSlugs =
      runtimePresetSlugs
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

  const generatedTaxonomy: TaxonomySource = {
    sectors,
    services,
    interventions,
    categories,
    domains,
  }

  validateTaxonomySource(generatedTaxonomy)

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
  await writeArtifact("sectors.generated.json", generatedTaxonomy.sectors)
  await writeArtifact("services.generated.json", generatedTaxonomy.services)
  await writeArtifact(
    "interventions.generated.json",
    generatedTaxonomy.interventions,
  )
  await writeArtifact(
    "categories.generated.json",
    generatedTaxonomy.categories,
  )
  await writeArtifact("domains.generated.json", generatedTaxonomy.domains)

  console.log("Generated taxonomy artifacts")
}

generateTaxonomy().catch((error) => {
  console.error("Taxonomy generation failed")
  console.error(error)

  process.exit(1)
})
