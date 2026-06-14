import { prisma } from "@esigenta/database"

export type TaxonomyDiscoveryIntervention = {
  id: string
  slug: string
  name: string
  description: string | null
}

export function sortTaxonomyDiscoveryInterventions(
  interventions: TaxonomyDiscoveryIntervention[],
): TaxonomyDiscoveryIntervention[] {
  return [...interventions].sort(
    (first, second) =>
      first.name.localeCompare(
        second.name,
        "it",
      ) ||
      first.slug.localeCompare(
        second.slug,
        "it",
      ),
  )
}

export async function listInterventionsForCategory(
  categorySlug: string,
): Promise<TaxonomyDiscoveryIntervention[]> {
  const normalizedSlug =
    categorySlug.trim()

  if (!normalizedSlug) {
    return []
  }

  const category =
    await prisma.category.findUnique({
      where: {
        slug: normalizedSlug,
      },
      select: {
        services: {
          select: {
            service: {
              select: {
                interventions: {
                  select: {
                    intervention: {
                      select: {
                        id: true,
                        slug: true,
                        name: true,
                        description: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

  if (!category) {
    return []
  }

  const interventionsById =
    new Map<
      string,
      TaxonomyDiscoveryIntervention
    >()

  for (const categoryService of category.services) {
    for (const relation of categoryService.service.interventions) {
      const intervention =
        relation.intervention

      interventionsById.set(
        intervention.id,
        intervention,
      )
    }
  }

  return sortTaxonomyDiscoveryInterventions(
    Array.from(
      interventionsById.values(),
    ),
  )
}
