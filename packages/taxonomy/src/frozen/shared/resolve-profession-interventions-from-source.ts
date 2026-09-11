import type {
  FrozenCategory,
  FrozenIntervention,
  FrozenProjectGroup,
  FrozenTaxonomySource,
} from "../source"

export type ResolvedProfessionProjectGroup = {
  readonly projectGroup: FrozenProjectGroup
  readonly interventions: readonly FrozenIntervention[]
}

export type ResolvedProfessionInterventions = {
  readonly category: FrozenCategory
  readonly projectGroups: readonly ResolvedProfessionProjectGroup[]
}

export function resolveProfessionInterventionsFromValidatedSource(
  category: FrozenCategory,
  source: FrozenTaxonomySource,
): ResolvedProfessionInterventions {
  const projectGroupsBySlug = new Map(
    source.projectGroups.map((projectGroup) => [projectGroup.slug, projectGroup]),
  )
  const defaultProjectGroupSlugs = new Set(category.projectGroups)
  const includedInterventionSlugs = new Set(
    category.interventionOverrides?.include ?? [],
  )
  const excludedInterventionSlugs = new Set(
    category.interventionOverrides?.exclude ?? [],
  )

  const projectGroups = category.projectGroups.map((projectGroupSlug) => {
    const projectGroup = projectGroupsBySlug.get(projectGroupSlug)

    if (!projectGroup) {
      throw new Error(
        `[profession:${category.slug}] Missing ProjectGroup reference: ${projectGroupSlug}`,
      )
    }

    return {
      projectGroup,
      interventions: projectGroup.interventions.filter(
        (intervention) =>
          intervention.publicationStatus === "published" &&
          !excludedInterventionSlugs.has(intervention.slug),
      ),
    }
  })

  for (const projectGroup of source.projectGroups) {
    if (defaultProjectGroupSlugs.has(projectGroup.slug)) {
      continue
    }

    const includedInterventions = projectGroup.interventions.filter(
      (intervention) =>
        intervention.publicationStatus === "published" &&
        includedInterventionSlugs.has(intervention.slug),
    )

    if (includedInterventions.length > 0) {
      projectGroups.push({ projectGroup, interventions: includedInterventions })
    }
  }

  return { category, projectGroups }
}
