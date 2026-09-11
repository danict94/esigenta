import { prisma } from "@esigenta/database"
import { resolveProfessionInterventions } from "@esigenta/taxonomy/frozen"

export type DashboardCategoryFilterIntervention = {
  id: string
  slug: string
  name: string
  projectGroupId: string | null
}

type CategoryFilterCatalogClient = {
  category: {
    findMany(query: unknown): Promise<Array<{ id: string; slug: string }>>
  }
  intervention: {
    findMany(query: unknown): Promise<DashboardCategoryFilterIntervention[]>
  }
}

type ProfessionMembershipResolver = (categorySlug: string) => {
  readonly projectGroups: readonly {
    readonly interventions: readonly { readonly slug: string }[]
  }[]
} | null

/** Catalog-only projection used to narrow the explicit dashboard filter. */
export async function loadDashboardCategoryFilterInterventions(
  categoryIds: string[],
  client: CategoryFilterCatalogClient =
    prisma as unknown as CategoryFilterCatalogClient,
  resolveMembership: ProfessionMembershipResolver =
    resolveProfessionInterventions,
): Promise<{ interventions: DashboardCategoryFilterIntervention[] }> {
  const normalizedCategoryIds = Array.from(
    new Set(categoryIds.map((categoryId) => categoryId.trim()).filter(Boolean)),
  )

  if (normalizedCategoryIds.length === 0) {
    return { interventions: [] }
  }

  const categories = await client.category.findMany({
    where: { id: { in: normalizedCategoryIds } },
    select: { id: true, slug: true },
  })
  const categoriesById = new Map(
    categories.map((category) => [category.id, category]),
  )
  const interventionSlugs: string[] = []
  const seenInterventionSlugs = new Set<string>()

  for (const categoryId of normalizedCategoryIds) {
    const category = categoriesById.get(categoryId)

    if (!category) {
      throw new Error(`[dashboard-category-filter] Missing DB Category: ${categoryId}`)
    }

    const resolved = resolveMembership(category.slug)

    if (!resolved) {
      throw new Error(
        `[dashboard-category-filter] Missing frozen Category: ${category.slug}`,
      )
    }

    for (const { interventions } of resolved.projectGroups) {
      for (const intervention of interventions) {
        if (!seenInterventionSlugs.has(intervention.slug)) {
          seenInterventionSlugs.add(intervention.slug)
          interventionSlugs.push(intervention.slug)
        }
      }
    }
  }

  if (interventionSlugs.length === 0) {
    return { interventions: [] }
  }

  const rows = await client.intervention.findMany({
    where: { slug: { in: interventionSlugs } },
    select: { id: true, slug: true, name: true, projectGroupId: true },
  })
  const rowsBySlug = new Map(rows.map((row) => [row.slug, row]))
  const interventions = interventionSlugs.map((interventionSlug) => {
    const row = rowsBySlug.get(interventionSlug)

    if (!row) {
      throw new Error(
        `[dashboard-category-filter] Missing DB Intervention for frozen slug: ${interventionSlug}`,
      )
    }

    return row
  })

  return { interventions }
}
