import { resolveProfessionInterventions } from "@esigenta/taxonomy/frozen"

type CategoryRow = { id: string; slug: string; name: string }
type ProjectGroupRow = {
  interventions: readonly { id: string; slug: string }[]
}
type MembershipResolver = (categorySlug: string) => {
  readonly projectGroups: readonly {
    readonly interventions: readonly { readonly slug: string }[]
  }[]
} | null

export type ConfigurableCategorySuggestion = CategoryRow & {
  suggestedInterventionIds: string[]
}

export function resolveConfigurableCategorySuggestions(
  categories: readonly CategoryRow[],
  projectGroups: readonly ProjectGroupRow[],
  resolveMembership: MembershipResolver = resolveProfessionInterventions,
): ConfigurableCategorySuggestion[] {
  const interventionIdsBySlug = new Map(
    projectGroups.flatMap((projectGroup) =>
      projectGroup.interventions.map(
        (intervention) => [intervention.slug, intervention.id] as const,
      ),
    ),
  )

  return categories.map((category) => {
    const resolved = resolveMembership(category.slug)

    if (!resolved) {
      throw new Error(
        `[services-configuration] Missing frozen Category: ${category.slug}`,
      )
    }

    const suggestedInterventionIds = resolved.projectGroups.flatMap(
      ({ interventions }) =>
        interventions.map((intervention) => {
          const interventionId = interventionIdsBySlug.get(intervention.slug)

          if (!interventionId) {
            throw new Error(
              `[services-configuration] Missing DB Intervention for frozen slug: ${intervention.slug}`,
            )
          }

          return interventionId
        }),
    )

    return { ...category, suggestedInterventionIds }
  })
}
