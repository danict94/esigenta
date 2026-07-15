import {
  prisma,
  resolveInterventionsForCategoryIdsWithClient,
  type CategoryInterventionRow,
} from "@esigenta/database"

/** Catalog projection used only by the explicit dashboard category filter. */
export async function loadRequestCategoryInterventions(
  categoryIds: string[],
): Promise<{
  projectGroupIds: string[]
  interventions: CategoryInterventionRow[]
}> {
  return resolveInterventionsForCategoryIdsWithClient(prisma, categoryIds)
}
