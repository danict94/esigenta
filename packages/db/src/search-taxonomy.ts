import { prisma } from "./prisma/client"

import type { TaxonomySearchResult } from "./taxonomy/shared/types"

type SearchParams = {
  query: string
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function addResult(
  map: Map<string, TaxonomySearchResult>,
  result: TaxonomySearchResult,
) {
  const key = `${result.type}-${result.id}`
  const existing = map.get(key)

  if (!existing || result.relevance > existing.relevance) {
    map.set(key, result)
  }
}

export async function searchTaxonomy({
  query,
}: SearchParams): Promise<TaxonomySearchResult[]> {
  const normalizedQuery = normalize(query)

  if (!normalizedQuery) {
    return []
  }

  const resultMap = new Map<string, TaxonomySearchResult>()

  const [
    interventionAliases,
    categoryAliases,
    serviceAliases,
    domainAliases,
  ] = await Promise.all([
    prisma.interventionAlias.findMany({
      where: {
        value: {
          contains: normalizedQuery,
          mode: "insensitive",
        },
      },
      select: {
        interventionId: true,
      },
      take: 10,
    }),

    prisma.categoryAlias.findMany({
      where: {
        value: {
          contains: normalizedQuery,
          mode: "insensitive",
        },
      },
      select: {
        categoryId: true,
      },
      take: 10,
    }),

    prisma.serviceAlias.findMany({
      where: {
        value: {
          contains: normalizedQuery,
          mode: "insensitive",
        },
      },
      select: {
        serviceId: true,
      },
      take: 10,
    }),

    prisma.domainAlias.findMany({
      where: {
        value: {
          contains: normalizedQuery,
          mode: "insensitive",
        },
      },
      select: {
        domainId: true,
      },
      take: 10,
    }),
  ])

  const interventionAliasIds = interventionAliases.map(
    (alias) => alias.interventionId,
  )

  const categoryAliasIds = categoryAliases.map(
    (alias) => alias.categoryId,
  )

  const serviceAliasIds = serviceAliases.map(
    (alias) => alias.serviceId,
  )

  const domainAliasIds = domainAliases.map(
    (alias) => alias.domainId,
  )

  const directInterventions = await prisma.intervention.findMany({
    where: {
      OR: [
        {
          name: {
            contains: normalizedQuery,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: normalizedQuery,
            mode: "insensitive",
          },
        },
        {
          id: {
            in: interventionAliasIds,
          },
        },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
    },
    take: 8,
  })

  for (const intervention of directInterventions) {
    addResult(resultMap, {
      id: intervention.id,
      type: "INTERVENTION",
      slug: intervention.slug,
      name: intervention.name,
      description: intervention.description,
      relevance: 100,
    })
  }

  const matchedCategories = await prisma.category.findMany({
    where: {
      OR: [
        {
          name: {
            contains: normalizedQuery,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: normalizedQuery,
            mode: "insensitive",
          },
        },
        {
          id: {
            in: categoryAliasIds,
          },
        },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
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
    take: 5,
  })

  for (const category of matchedCategories) {
    for (const categoryService of category.services) {
      for (const relation of categoryService.service.interventions) {
        const intervention = relation.intervention

        addResult(resultMap, {
          id: intervention.id,
          type: "INTERVENTION",
          slug: intervention.slug,
          name: intervention.name,
          description: intervention.description,
          relevance: 80,
        })
      }
    }

    addResult(resultMap, {
      id: category.id,
      type: "CATEGORY",
      slug: category.slug,
      name: category.name,
      description: category.description,
      relevance: 50,
    })
  }

  const matchedServices = await prisma.service.findMany({
    where: {
      OR: [
        {
          name: {
            contains: normalizedQuery,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: normalizedQuery,
            mode: "insensitive",
          },
        },
        {
          id: {
            in: serviceAliasIds,
          },
        },
      ],
    },
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
    take: 5,
  })

  for (const service of matchedServices) {
    for (const relation of service.interventions) {
      const intervention = relation.intervention

      addResult(resultMap, {
        id: intervention.id,
        type: "INTERVENTION",
        slug: intervention.slug,
        name: intervention.name,
        description: intervention.description,
        relevance: 70,
      })
    }
  }

  const matchedDomains = await prisma.domain.findMany({
    where: {
      OR: [
        {
          name: {
            contains: normalizedQuery,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: normalizedQuery,
            mode: "insensitive",
          },
        },
        {
          id: {
            in: domainAliasIds,
          },
        },
      ],
    },
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
    take: 5,
  })

  for (const domain of matchedDomains) {
    for (const relation of domain.interventions) {
      const intervention = relation.intervention

      addResult(resultMap, {
        id: intervention.id,
        type: "INTERVENTION",
        slug: intervention.slug,
        name: intervention.name,
        description: intervention.description,
        relevance: 60,
      })
    }
  }

  return Array.from(resultMap.values())
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 10)
}
