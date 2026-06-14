import { prisma } from "@esigenta/database"

export type InterventionForFunnel = {
  id: string
  slug: string
  name: string
  description: string | null
  serviceSlugs: string[]
  categorySlugs: string[]
  domainSlugs: string[]
}

function sortedUnique(values: string[]): string[] {
  return Array.from(new Set(values.filter((v) => v.trim()))).sort()
}

export async function resolveInterventionForFunnel(
  slug: string,
): Promise<InterventionForFunnel | null> {
  const intervention = await prisma.intervention.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      services: {
        select: {
          service: {
            select: {
              slug: true,
              categories: {
                select: {
                  category: {
                    select: { slug: true },
                  },
                },
              },
            },
          },
        },
      },
      domains: {
        select: {
          domain: {
            select: { slug: true },
          },
        },
      },
    },
  })

  if (!intervention) return null

  return {
    id: intervention.id,
    slug: intervention.slug,
    name: intervention.name,
    description: intervention.description,
    serviceSlugs: sortedUnique(
      intervention.services.map((r) => r.service.slug),
    ),
    categorySlugs: sortedUnique(
      intervention.services.flatMap((r) =>
        r.service.categories.map((cr) => cr.category.slug),
      ),
    ),
    domainSlugs: sortedUnique(
      intervention.domains.map((r) => r.domain.slug),
    ),
  }
}
