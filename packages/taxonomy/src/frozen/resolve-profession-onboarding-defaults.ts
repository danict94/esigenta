import { frozenTaxonomySource } from "./source"
import { resolveProfessionInterventions } from "./resolve-profession-interventions"

import type { ResolvedProfessionInterventions } from "./resolve-profession-interventions"
import type { FrozenTaxonomySource } from "./source"

/**
 * Resolves the deterministic CompanyIntervention preset for a profession.
 * Explicit defaults are always filtered through the effective canonical
 * membership; absent defaults preserve the historical full-membership preset.
 */
export function resolveProfessionOnboardingDefaults(
  categorySlug: string,
  source: FrozenTaxonomySource = frozenTaxonomySource,
): ResolvedProfessionInterventions | null {
  const resolved = resolveProfessionInterventions(categorySlug, source)

  if (!resolved || resolved.category.onboardingDefaults === undefined) {
    return resolved
  }

  const defaultSlugs = new Set(resolved.category.onboardingDefaults)
  const projectGroups = resolved.projectGroups
    .map(({ projectGroup, interventions }) => ({
      projectGroup,
      interventions: interventions.filter((intervention) =>
        defaultSlugs.has(intervention.slug),
      ),
    }))
    .filter(({ interventions }) => interventions.length > 0)

  return { category: resolved.category, projectGroups }
}
