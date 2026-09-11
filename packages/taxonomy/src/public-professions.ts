import {
  frozenTaxonomySource,
  listPublicProfessions,
  resolveProfessionInterventions,
} from "./frozen"

import type { FrozenTaxonomySource } from "./frozen"

export type PublicProfessionHubProjectGroup = {
  readonly slug: string
  readonly name: string
}

export type PublicProfessionHubItem = {
  readonly slug: string
  readonly name: string
  readonly shortDescription: string
  readonly projectGroups: readonly PublicProfessionHubProjectGroup[]
  readonly interventionCount: number
}

export type PublicProfessionIntervention = {
  readonly slug: string
  readonly name: string
  readonly description: string | null
}

export type PublicProfessionProjectGroup = {
  readonly slug: string
  readonly name: string
  readonly description: string | null
  readonly interventions: readonly PublicProfessionIntervention[]
}

export type PublicProfessionDetail = {
  readonly category: {
    readonly slug: string
    readonly name: string
    readonly description: string | null
  }
  readonly projectGroups: readonly PublicProfessionProjectGroup[]
}

export type PublicProfessionCatalog = {
  readonly categorySlugs: readonly string[]
  readonly hubItems: readonly PublicProfessionHubItem[]
  readonly details: readonly PublicProfessionDetail[]
}

/**
 * Pure composer for the public professions catalog. It validates the complete
 * source before producing a view model, preserves the source order for
 * categories, groups and interventions, and never reads Prisma or runtime DB
 * state. Keeping the source parameter makes every fail-fast branch testable
 * with a small synthetic taxonomy.
 */
export function composePublicProfessionCatalog(
  source: FrozenTaxonomySource,
): PublicProfessionCatalog {
  const publicCategories = listPublicProfessions(source)

  const details = publicCategories.map((category) => {
    const resolved = resolveProfessionInterventions(category.slug, source)

    // The category comes from the same validated source passed to the
    // resolver, so null would indicate a broken resolver contract.
    if (!resolved) {
      throw new Error(
        `[public-profession:${category.slug}] Category could not be resolved`,
      )
    }

    const projectGroups = resolved.projectGroups.map(
      ({ projectGroup, interventions }) => ({
        slug: projectGroup.slug,
        name: projectGroup.name,
        description: projectGroup.description ?? null,
        interventions: interventions.map((intervention) => ({
          slug: intervention.slug,
          name: intervention.name,
          description: intervention.description ?? null,
        })),
      }),
    )

    return {
      category: {
        slug: category.slug,
        name: category.name,
        description: category.description ?? null,
      },
      projectGroups,
    }
  })

  const hubItems = details.map((detail, index) => ({
    slug: detail.category.slug,
    name: detail.category.name,
    shortDescription: publicCategories[index]!.shortDescription,
    projectGroups: detail.projectGroups.map((projectGroup) => ({
      slug: projectGroup.slug,
      name: projectGroup.name,
    })),
    interventionCount: detail.projectGroups.reduce(
      (total, projectGroup) => total + projectGroup.interventions.length,
      0,
    ),
  }))

  return {
    categorySlugs: details.map((detail) => detail.category.slug),
    hubItems,
    details,
  }
}

const publicProfessionCatalog = composePublicProfessionCatalog(
  frozenTaxonomySource,
)

const publicProfessionDetailsBySlug = new Map(
  publicProfessionCatalog.details.map((detail) => [
    detail.category.slug,
    detail,
  ]),
)

export function listPublicProfessionCategorySlugs(): readonly string[] {
  return publicProfessionCatalog.categorySlugs
}

export function listPublicProfessionHubItems(): readonly PublicProfessionHubItem[] {
  return publicProfessionCatalog.hubItems
}

export function getPublicProfessionDetail(
  categorySlug: string,
): PublicProfessionDetail | null {
  return publicProfessionDetailsBySlug.get(categorySlug.trim()) ?? null
}
