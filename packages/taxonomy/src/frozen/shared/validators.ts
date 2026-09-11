import {
  MAX_ALIAS_PER_ENTITY,
  MAX_PROJECT_GROUPS_PER_CATEGORY,
  MAX_INTERVENTIONS_PER_PROJECT_GROUP,
} from "./constants"
import { invariant } from "./guards"
import { resolveProfessionInterventionsFromValidatedSource } from "./resolve-profession-interventions-from-source"

import type { FrozenCategory } from "../source/types/category"
import type { FrozenIntervention } from "../source/types/intervention"
import type { FrozenProjectGroup } from "../source/types/project-group"
import type { FrozenTaxonomySource } from "../source/types/source"

function normalizeComparable(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function normalizeSlug(value: string): string {
  return normalizeComparable(value).replace(/[\s_]+/g, "-")
}

function assertNonEmptyString(value: string, label: string) {
  invariant(value.trim().length > 0, `${label} cannot be empty.`)
}

function assertNonEmptyArray<T>(values: T[], label: string) {
  invariant(values.length > 0, `${label} cannot be empty.`)
}

function validateUniqueSlugs(
  entities: Array<{ slug: string }>,
  entityName: string,
) {
  const seen = new Map<string, string>()

  for (const entity of entities) {
    const normalizedSlug = normalizeSlug(entity.slug)
    const existingSlug = seen.get(normalizedSlug)

    invariant(
      !existingSlug,
      `[${entityName}] Duplicate normalized slug: ${entity.slug} collides with ${existingSlug}`,
    )

    seen.set(normalizedSlug, entity.slug)
  }
}

function validateUniqueNames(
  entities: Array<{ name: string }>,
  entityName: string,
) {
  const seen = new Set<string>()

  for (const entity of entities) {
    const normalized = normalizeComparable(entity.name)

    invariant(!seen.has(normalized), `[${entityName}] Duplicate name: ${entity.name}`)

    seen.add(normalized)
  }
}

function validateEntityAliases(
  entity: { slug: string; name: string; aliases?: string[] },
  owner: string,
) {
  const aliases = entity.aliases ?? []

  invariant(
    aliases.length <= MAX_ALIAS_PER_ENTITY,
    `[${owner}] Too many aliases.`,
  )

  for (const alias of aliases) {
    assertNonEmptyString(alias, `[${owner}] alias`)

    invariant(
      normalizeSlug(alias) !== normalizeSlug(entity.slug),
      `[${owner}] Alias "${alias}" must not equal slug.`,
    )

    invariant(
      normalizeComparable(alias) !== normalizeComparable(entity.name),
      `[${owner}] Alias "${alias}" must not equal name.`,
    )
  }
}

function validateInterventionPublicationStatus(
  intervention: FrozenIntervention,
) {
  const owner = `intervention:${intervention.slug}`

  invariant(
    intervention.publicationStatus === "draft" ||
      intervention.publicationStatus === "published",
    `[${owner}] publicationStatus must be "draft" or "published" (got: ${String(
      intervention.publicationStatus,
    )}). Every Intervention needs an explicit, deterministic publication ` +
      `status — there is no implicit default.`,
  )
}

function validateIntervention(intervention: FrozenIntervention) {
  assertNonEmptyString(intervention.slug, "[intervention] slug")
  assertNonEmptyString(
    intervention.name,
    `[intervention:${intervention.slug}] name`,
  )

  validateInterventionPublicationStatus(intervention)
  validateEntityAliases(intervention, `intervention:${intervention.slug}`)
}

function validateProjectGroup(projectGroup: FrozenProjectGroup) {
  assertNonEmptyString(projectGroup.slug, "[projectGroup] slug")
  assertNonEmptyString(
    projectGroup.name,
    `[projectGroup:${projectGroup.slug}] name`,
  )
  assertNonEmptyArray(
    projectGroup.interventions,
    `[projectGroup:${projectGroup.slug}] interventions`,
  )

  invariant(
    projectGroup.interventions.length <= MAX_INTERVENTIONS_PER_PROJECT_GROUP,
    `[projectGroup:${projectGroup.slug}] Too many interventions.`,
  )

  validateEntityAliases(projectGroup, `projectGroup:${projectGroup.slug}`)

  validateUniqueSlugs(
    projectGroup.interventions,
    `projectGroup:${projectGroup.slug}:interventions`,
  )
  validateUniqueNames(
    projectGroup.interventions,
    `projectGroup:${projectGroup.slug}:interventions`,
  )

  for (const intervention of projectGroup.interventions) {
    validateIntervention(intervention)
  }
}

function validateCategory(
  category: FrozenCategory,
  validProjectGroupSlugs: Set<string>,
  validInterventionSlugs: Set<string>,
  source: FrozenTaxonomySource,
) {
  assertNonEmptyString(category.slug, "[category] slug")
  assertNonEmptyString(category.name, `[category:${category.slug}] name`)
  invariant(
    typeof category.shortDescription === "string" &&
      category.shortDescription.trim().length > 0,
    `[category:${category.slug}] shortDescription cannot be empty.`,
  )
  invariant(
    category.isPublic === undefined || typeof category.isPublic === "boolean",
    `[category:${category.slug}] isPublic must be a boolean when provided.`,
  )

  validateEntityAliases(category, `category:${category.slug}`)

  invariant(
    category.projectGroups.length <= MAX_PROJECT_GROUPS_PER_CATEGORY,
    `[category:${category.slug}] Too many projectGroups.`,
  )

  const seenProjectGroupSlugs = new Set<string>()

  for (const projectGroupSlug of category.projectGroups) {
    const normalizedProjectGroupSlug = normalizeSlug(projectGroupSlug)

    invariant(
      !seenProjectGroupSlugs.has(normalizedProjectGroupSlug),
      `[category:${category.slug}] Duplicate ProjectGroup reference: ${projectGroupSlug}`,
    )
    seenProjectGroupSlugs.add(normalizedProjectGroupSlug)

    invariant(
      validProjectGroupSlugs.has(projectGroupSlug),
      `[category:${category.slug}] Missing projectGroups reference: ${projectGroupSlug}`,
    )
  }

  validateCategoryInterventionOverrides(category, validInterventionSlugs)
  validateCategoryOnboardingDefaults(category, validInterventionSlugs, source)
}

function validateCategoryOnboardingDefaults(
  category: FrozenCategory,
  validInterventionSlugs: Set<string>,
  source: FrozenTaxonomySource,
) {
  const defaults: unknown = category.onboardingDefaults

  if (defaults === undefined) {
    return
  }

  const owner = `category:${category.slug}:onboardingDefaults`
  const validatedDefaults = validateInterventionOverrideList(
    defaults,
    owner,
    validInterventionSlugs,
  )
  const effectiveMembership = new Set(
    resolveProfessionInterventionsFromValidatedSource(category, source)
      .projectGroups.flatMap((group) => group.interventions)
      .map((intervention) => intervention.slug),
  )

  for (const interventionSlug of validatedDefaults) {
    invariant(
      effectiveMembership.has(interventionSlug),
      `[${owner}] Intervention is not in the effective profession membership: ${interventionSlug}`,
    )
  }
}

function validateInterventionOverrideList(
  value: unknown,
  owner: string,
  validInterventionSlugs: Set<string>,
): readonly string[] {
  invariant(Array.isArray(value), `[${owner}] must be an array.`)

  const values = value as unknown[]
  const seen = new Set<string>()

  for (const interventionSlug of values) {
    invariant(
      typeof interventionSlug === "string",
      `[${owner}] entries must be strings.`,
    )

    const normalizedInterventionSlug = normalizeSlug(interventionSlug)
    assertNonEmptyString(interventionSlug, `[${owner}] Intervention slug`)

    invariant(
      !seen.has(normalizedInterventionSlug),
      `[${owner}] Duplicate Intervention reference: ${interventionSlug}`,
    )
    seen.add(normalizedInterventionSlug)

    invariant(
      validInterventionSlugs.has(interventionSlug),
      `[${owner}] Missing Intervention reference: ${interventionSlug}`,
    )
  }

  return values as string[]
}

function validateCategoryInterventionOverrides(
  category: FrozenCategory,
  validInterventionSlugs: Set<string>,
) {
  const overrides: unknown = category.interventionOverrides

  if (overrides === undefined) {
    return
  }

  const owner = `category:${category.slug}:interventionOverrides`

  invariant(
    typeof overrides === "object" &&
      overrides !== null &&
      !Array.isArray(overrides),
    `[${owner}] must be an object.`,
  )

  const overrideRecord = overrides as Record<string, unknown>
  const unexpectedKey = Object.keys(overrideRecord).find(
    (key) => key !== "include" && key !== "exclude",
  )

  invariant(
    !unexpectedKey,
    `[${owner}] Unsupported field: ${String(unexpectedKey)}`,
  )

  const included =
    overrideRecord.include === undefined
      ? []
      : validateInterventionOverrideList(
          overrideRecord.include,
          `${owner}:include`,
          validInterventionSlugs,
        )
  const excluded =
    overrideRecord.exclude === undefined
      ? []
      : validateInterventionOverrideList(
          overrideRecord.exclude,
          `${owner}:exclude`,
          validInterventionSlugs,
        )
  const excludedSlugs = new Set(excluded.map(normalizeSlug))
  const conflictingSlug = included.find((slug) =>
    excludedSlugs.has(normalizeSlug(slug)),
  )

  invariant(
    !conflictingSlug,
    `[${owner}] Intervention cannot be both included and excluded: ${String(conflictingSlug)}`,
  )
}

export function validateFrozenTaxonomySource(source: FrozenTaxonomySource) {
  assertNonEmptyArray(source.categories, "[frozen-taxonomy] categories")
  assertNonEmptyArray(source.projectGroups, "[frozen-taxonomy] projectGroups")

  validateUniqueSlugs(source.categories, "categories")
  validateUniqueSlugs(source.projectGroups, "projectGroups")
  validateUniqueNames(source.categories, "categories")
  validateUniqueNames(source.projectGroups, "projectGroups")

  for (const projectGroup of source.projectGroups) {
    validateProjectGroup(projectGroup)
  }

  const allInterventions = source.projectGroups.flatMap(
    (projectGroup) => projectGroup.interventions,
  )

  // Intervention is the only matching unit: its slug must be globally
  // unique across every ProjectGroup, not just unique within one.
  validateUniqueSlugs(allInterventions, "interventions")
  validateUniqueNames(allInterventions, "interventions")

  const globalAliasOwners = new Map<string, string>()
  const globalSlugOwners = new Map<string, string>()

  for (const intervention of allInterventions) {
    globalSlugOwners.set(
      normalizeSlug(intervention.slug),
      `intervention:${intervention.slug}`,
    )
  }

  for (const category of source.categories) {
    globalSlugOwners.set(
      normalizeSlug(category.slug),
      `category:${category.slug}`,
    )
  }

  for (const projectGroup of source.projectGroups) {
    globalSlugOwners.set(
      normalizeSlug(projectGroup.slug),
      `projectGroup:${projectGroup.slug}`,
    )
  }

  // Aliases are global across all three aliasable entity kinds — a search
  // term must resolve to exactly one owner, never ambiguously.
  const allAliasOwners: Array<{
    slug: string
    aliases?: string[] | undefined
    owner: string
  }> = [
    ...allInterventions.map((intervention) => ({
      slug: intervention.slug,
      aliases: intervention.aliases,
      owner: `intervention:${intervention.slug}`,
    })),
    ...source.categories.map((category) => ({
      slug: category.slug,
      aliases: category.aliases,
      owner: `category:${category.slug}`,
    })),
    ...source.projectGroups.map((projectGroup) => ({
      slug: projectGroup.slug,
      aliases: projectGroup.aliases,
      owner: `projectGroup:${projectGroup.slug}`,
    })),
  ]

  for (const entity of allAliasOwners) {
    for (const alias of entity.aliases ?? []) {
      const normalizedAlias = normalizeComparable(alias)

      const existingAliasOwner = globalAliasOwners.get(normalizedAlias)
      invariant(
        !existingAliasOwner,
        `[frozen-taxonomy] Global alias collision: "${alias}" on ${entity.owner} collides with ${existingAliasOwner}`,
      )
      globalAliasOwners.set(normalizedAlias, entity.owner)

      const normalizedAliasAsSlug = normalizeSlug(alias)
      const collidingSlugOwner = globalSlugOwners.get(normalizedAliasAsSlug)
      invariant(
        !collidingSlugOwner,
        `[frozen-taxonomy] Alias "${alias}" on ${entity.owner} collides with slug owned by ${collidingSlugOwner}`,
      )
    }
  }

  const projectGroupSlugs = new Set(
    source.projectGroups.map((projectGroup) => projectGroup.slug),
  )
  const interventionSlugs = new Set(
    allInterventions.map((intervention) => intervention.slug),
  )

  for (const category of source.categories) {
    validateCategory(category, projectGroupSlugs, interventionSlugs, source)
  }
}
