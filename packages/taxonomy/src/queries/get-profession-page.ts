import { prisma } from "@esigenta/database"

export type ProfessionPageIntervention = {
  id: string
  slug: string
  name: string
  description: string | null
}

export type ProfessionPageProjectGroup = {
  id: string
  slug: string
  name: string
  description: string | null
  interventions: ProfessionPageIntervention[]
}

export type ProfessionPage = {
  category: {
    id: string
    slug: string
    name: string
    description: string | null
  }
  projectGroups: ProfessionPageProjectGroup[]
}

/**
 * Category -> ProjectGroup -> Intervention, the discovery path that
 * replaces the legacy Category -> Service -> Intervention walk. No
 * intervention/projectGroup data is duplicated here — both queries select
 * straight from their owning tables. 2 round trips total regardless of how
 * many ProjectGroups the category has (Category by slug, then one batched
 * ProjectGroup.findMany over Category.projectGroupIds).
 */
export async function getProfessionPage(
  categorySlug: string,
): Promise<ProfessionPage | null> {
  const normalizedSlug = categorySlug.trim()

  if (!normalizedSlug) {
    return null
  }

  const category = await prisma.category.findUnique({
    where: { slug: normalizedSlug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      projectGroupIds: true,
    },
  })

  if (!category) {
    return null
  }

  const projectGroupRows =
    category.projectGroupIds.length > 0
      ? await prisma.projectGroup.findMany({
          where: { id: { in: category.projectGroupIds } },
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            interventions: {
              select: {
                id: true,
                slug: true,
                name: true,
                description: true,
              },
              orderBy: { name: "asc" },
            },
          },
        })
      : []

  const projectGroupsById = new Map(
    projectGroupRows.map((projectGroup) => [projectGroup.id, projectGroup]),
  )

  const projectGroups: ProfessionPageProjectGroup[] = category.projectGroupIds
    .map((projectGroupId) => projectGroupsById.get(projectGroupId))
    .filter((projectGroup): projectGroup is (typeof projectGroupRows)[number] =>
      Boolean(projectGroup),
    )
    .map((projectGroup) => ({
      id: projectGroup.id,
      slug: projectGroup.slug,
      name: projectGroup.name,
      description: projectGroup.description,
      interventions: projectGroup.interventions,
    }))

  return {
    category: {
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
    },
    projectGroups,
  }
}

export async function listProfessionPageCategorySlugs(): Promise<string[]> {
  const categories = await prisma.category.findMany({
    select: { slug: true },
  })

  return categories.map((category) => category.slug)
}
