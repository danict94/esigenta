import type { Prisma } from "@prisma/client"

type CatalogClient = Prisma.TransactionClient

export type CategoryInterventionRow = {
  id: string
  slug: string
  name: string
  projectGroupId: string | null
}

type CategoryProjectGroupsRow = {
  id: string
  projectGroupIds: string[]
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values))
}

/**
 * Infrastructural catalog traversal: Category -> Category.projectGroupIds
 * -> Intervention.projectGroupId. Lives here, not @esigenta/domain, so
 * @esigenta/auth's onboarding bootstrap and @esigenta/domain's request
 * eligibility / services-configuration reads share exactly one
 * implementation instead of two independently-written copies of the same
 * two-hop traversal. Category never gates Intervention beyond this
 * expansion — see docs/taxonomy.md. Two round trips regardless of how
 * many categoryIds are passed in, never one query per category.
 */
export async function resolveInterventionsForCategoryIdsWithClient(
  client: CatalogClient,
  categoryIds: string[],
): Promise<{
  projectGroupIds: string[]
  interventions: CategoryInterventionRow[]
}> {
  if (categoryIds.length === 0) {
    return { projectGroupIds: [], interventions: [] }
  }

  const categories = await client.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, projectGroupIds: true },
  })

  const projectGroupIds = unique(
    (categories as CategoryProjectGroupsRow[]).flatMap(
      (category) => category.projectGroupIds,
    ),
  )

  if (projectGroupIds.length === 0) {
    return { projectGroupIds, interventions: [] }
  }

  const interventions = await client.intervention.findMany({
    where: { projectGroupId: { in: projectGroupIds } },
    select: { id: true, slug: true, name: true, projectGroupId: true },
  })

  return { projectGroupIds, interventions }
}
