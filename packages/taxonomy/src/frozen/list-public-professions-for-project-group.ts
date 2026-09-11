import { frozenTaxonomySource } from "./source"
import { listPublicProfessions } from "./list-public-professions"
import { resolveProfessionInterventions } from "./resolve-profession-interventions"

import type { FrozenCategory, FrozenTaxonomySource } from "./source"

/**
 * Resolves the public professions with at least one effective, published
 * Intervention in a ProjectGroup. Public readiness and profession overrides
 * are delegated to the canonical frozen resolvers.
 */
export function listPublicProfessionsForProjectGroup(
  groupSlug: string,
  source: FrozenTaxonomySource = frozenTaxonomySource,
): readonly FrozenCategory[] {
  const normalizedGroupSlug = groupSlug.trim()
  const publicProfessions = listPublicProfessions(source)
  const projectGroupExists = source.projectGroups.some(
    (projectGroup) => projectGroup.slug === normalizedGroupSlug,
  )

  if (!projectGroupExists) {
    throw new Error(`[public-professions] Unknown ProjectGroup: ${groupSlug}`)
  }

  return publicProfessions.filter((category) => {
    const resolved = resolveProfessionInterventions(category.slug, source)

    if (!resolved) {
      throw new Error(
        `[public-professions] Category could not be resolved: ${category.slug}`,
      )
    }

    return resolved.projectGroups.some(
      ({ projectGroup, interventions }) =>
        projectGroup.slug === normalizedGroupSlug && interventions.length > 0,
    )
  })
}
