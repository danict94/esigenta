import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { frozenTaxonomySource } from "../source"
import { FROZEN_TAXONOMY_BUILD_VERSION } from "../shared/constants"
import { validateFrozenTaxonomySource } from "../shared/validators"

import type { FrozenAlias } from "../source/types/alias"
import type { FrozenCategory } from "../source/types/category"
import type { FrozenIntervention } from "../source/types/intervention"
import type { FrozenProjectGroup } from "../source/types/project-group"

const currentDir = path.dirname(fileURLToPath(import.meta.url))

// packages/taxonomy/src/frozen/orchestrator -> packages/taxonomy
const packageDir = path.resolve(currentDir, "../../..")

// Isolated output directory: the frozen pipeline never writes into the
// legacy generated/ folder while both models coexist.
const OUTPUT_DIR = path.resolve(packageDir, "generated", "frozen")

function bySlug<T extends { slug: string }>(a: T, b: T): number {
  return a.slug.localeCompare(b.slug)
}

function sortedUnique(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))
}

type GeneratedCategory = {
  id: string
  slug: string
  name: string
  description?: string
  aliases?: string[]
  projectGroups: string[]
}

type GeneratedProjectGroup = {
  id: string
  slug: string
  name: string
  description?: string
  aliases?: string[]
  interventionSlugs: string[]
}

type GeneratedIntervention = {
  id: string
  slug: string
  name: string
  description?: string
  projectGroupSlug: string
  runtimePresetSlugs?: string[]
  aliases?: string[]
}

function cleanCategory(category: FrozenCategory): GeneratedCategory {
  const result: GeneratedCategory = {
    id: category.id,
    slug: category.slug,
    name: category.name,
    projectGroups: sortedUnique(category.projectGroups),
  }

  if (category.description) {
    result.description = category.description
  }

  if (category.aliases && category.aliases.length > 0) {
    result.aliases = sortedUnique(category.aliases)
  }

  return result
}

function cleanProjectGroup(
  projectGroup: FrozenProjectGroup,
): GeneratedProjectGroup {
  const result: GeneratedProjectGroup = {
    id: projectGroup.id,
    slug: projectGroup.slug,
    name: projectGroup.name,
    interventionSlugs: sortedUnique(
      projectGroup.interventions.map((intervention) => intervention.slug),
    ),
  }

  if (projectGroup.description) {
    result.description = projectGroup.description
  }

  if (projectGroup.aliases && projectGroup.aliases.length > 0) {
    result.aliases = sortedUnique(projectGroup.aliases)
  }

  return result
}

function cleanIntervention(
  intervention: FrozenIntervention,
  projectGroupSlug: string,
): GeneratedIntervention {
  const result: GeneratedIntervention = {
    id: intervention.id,
    slug: intervention.slug,
    name: intervention.name,
    projectGroupSlug,
  }

  if (intervention.description) {
    result.description = intervention.description
  }

  if (
    intervention.runtimePresetSlugs &&
    intervention.runtimePresetSlugs.length > 0
  ) {
    result.runtimePresetSlugs = sortedUnique(intervention.runtimePresetSlugs)
  }

  if (intervention.aliases && intervention.aliases.length > 0) {
    result.aliases = sortedUnique(intervention.aliases)
  }

  return result
}

function buildAliases(
  owners: Array<{
    slug: string
    aliases?: string[]
    ownerType: FrozenAlias["ownerType"]
  }>,
): FrozenAlias[] {
  return owners
    .flatMap((owner) =>
      (owner.aliases ?? []).map((alias) => ({
        value: alias,
        ownerType: owner.ownerType,
        ownerSlug: owner.slug,
      })),
    )
    .sort(
      (a, b) =>
        a.ownerType.localeCompare(b.ownerType) ||
        a.ownerSlug.localeCompare(b.ownerSlug) ||
        a.value.localeCompare(b.value),
    )
}

async function writeArtifact(fileName: string, value: unknown) {
  await fs.writeFile(
    path.join(OUTPUT_DIR, fileName),
    `${JSON.stringify(value, null, 2)}\n`,
  )
}

async function generateFrozenTaxonomy() {
  validateFrozenTaxonomySource(frozenTaxonomySource)

  const categories = frozenTaxonomySource.categories
    .map(cleanCategory)
    .sort(bySlug)

  const projectGroups = frozenTaxonomySource.projectGroups
    .map(cleanProjectGroup)
    .sort(bySlug)

  const interventions = frozenTaxonomySource.projectGroups
    .flatMap((projectGroup) =>
      projectGroup.interventions.map((intervention) =>
        cleanIntervention(intervention, projectGroup.slug),
      ),
    )
    .sort(bySlug)

  const aliases = buildAliases([
    ...frozenTaxonomySource.projectGroups.flatMap((projectGroup) =>
      projectGroup.interventions.map((intervention) => ({
        ...intervention,
        ownerType: "intervention" as const,
      })),
    ),
    ...frozenTaxonomySource.categories.map((category) => ({
      ...category,
      ownerType: "category" as const,
    })),
    ...frozenTaxonomySource.projectGroups.map((projectGroup) => ({
      ...projectGroup,
      ownerType: "projectGroup" as const,
    })),
  ])

  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  await writeArtifact("categories.generated.json", categories)
  await writeArtifact("project-groups.generated.json", projectGroups)
  await writeArtifact("interventions.generated.json", interventions)
  await writeArtifact("aliases.generated.json", aliases)
  await writeArtifact("manifest.generated.json", {
    version: FROZEN_TAXONOMY_BUILD_VERSION,
    counts: {
      categories: categories.length,
      projectGroups: projectGroups.length,
      interventions: interventions.length,
      aliases: aliases.length,
    },
  })

  console.log("Generated frozen taxonomy artifacts")
}

generateFrozenTaxonomy().catch((error) => {
  console.error("Frozen taxonomy generation failed")
  console.error(error)

  process.exit(1)
})
