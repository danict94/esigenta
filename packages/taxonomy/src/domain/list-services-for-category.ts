import { prisma } from "@esigenta/database"

export type TaxonomyDiscoveryIntervention = {
  id: string
  slug: string
  name: string
  description: string | null
}

export type TaxonomyDiscoveryService = {
  id: string
  slug: string
  name: string
  description: string | null
  interventions: TaxonomyDiscoveryIntervention[]
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

/**
 * Per Category, i Service collegati e — per ciascuno — gli Intervention
 * collegati (stessa relazione usata dal matching: Category -> CategoryService
 * -> Service -> InterventionService -> Intervention). A differenza della
 * precedente listInterventionsForCategory, qui non si appiattisce: il
 * grouping per Service è il livello che la UX di discovery (Phase 20.9C) usa
 * per evitare di mostrare gli Intervention di una Category ampia come lista
 * piatta — senza inventare un concetto SEO/MacroArea che non c'entra con la
 * struttura Category -> Service -> Intervention.
 */
export async function listServicesForCategory(
  categorySlug: string,
): Promise<TaxonomyDiscoveryService[]> {
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
                id: true,
                slug: true,
                name: true,
                description: true,
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

  return category.services.map(
    ({ service }) => ({
      id: service.id,
      slug: service.slug,
      name: service.name,
      description: service.description,
      interventions: sortTaxonomyDiscoveryInterventions(
        service.interventions.map(
          (relation) => relation.intervention,
        ),
      ),
    }),
  )
}
