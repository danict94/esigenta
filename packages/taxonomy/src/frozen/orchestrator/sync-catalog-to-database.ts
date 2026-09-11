import path from "node:path"

import { config } from "dotenv"
import type { InterventionPublicationStatus, PrismaClient } from "@prisma/client"

import { frozenTaxonomySource } from "../source"
import { validateFrozenTaxonomySource } from "../shared/validators"
import type { FrozenCategory } from "../source"
import type { InterventionPublicationStatus as FrozenPublicationStatus } from "../source/types/intervention"

const packageDir = path.resolve(import.meta.dirname, "../../..")

config({
  path: path.resolve(packageDir, "../../.env"),
})

/**
 * Frozen uses lowercase string literals ("draft"/"published", TS-domain
 * convention); the DB enum uses UPPER_CASE (Prisma-domain convention,
 * matching every other Status enum in schema.prisma). Sync is the one
 * place that crosses the boundary — no other code should need this map.
 */
function toDbPublicationStatus(
  status: FrozenPublicationStatus,
): InterventionPublicationStatus {
  return status === "published" ? "PUBLISHED" : "DRAFT"
}

type SyncReport = {
  projectGroupsUpserted: number
  interventionsUpserted: number
  interventionsCreated: string[]
  categoriesUpserted: number
  categoriesCreated: string[]
}

type CategorySectorContext = {
  slug: string
  sectorId: string
  projectGroupIds: readonly string[]
}

/**
 * Sector is a surviving DB-only grouping and is intentionally absent from
 * frozen Taxonomy V2. A new Category inherits it only when existing catalog
 * data gives one unambiguous answer through shared ProjectGroups.
 */
export function inferCategorySectorId(
  categorySlug: string,
  projectGroupIds: readonly string[],
  categoryContexts: readonly CategorySectorContext[],
): string {
  const matchingSectorIds = new Set(
    categoryContexts
      .filter(
        (context) =>
          context.slug !== categorySlug &&
          context.projectGroupIds.some((projectGroupId) =>
            projectGroupIds.includes(projectGroupId),
          ),
      )
      .map((context) => context.sectorId),
  )

  if (matchingSectorIds.size !== 1) {
    const reason = matchingSectorIds.size === 0 ? "missing" : "ambiguous"

    throw new Error(
      `[category:${categorySlug}] Cannot infer DB sectorId from shared ProjectGroups: ${reason}`,
    )
  }

  return [...matchingSectorIds][0]!
}

async function replaceCategoryAliases(
  prisma: PrismaClient,
  categoryId: string,
  aliases: string[],
) {
  await prisma.categoryAlias.deleteMany({ where: { categoryId } })

  if (aliases.length === 0) {
    return
  }

  await prisma.categoryAlias.createMany({
    data: aliases.map((value) => ({ value, categoryId })),
    skipDuplicates: true,
  })
}

export async function syncFrozenCategoriesToDatabase(
  prisma: PrismaClient,
  projectGroupIdBySlug: ReadonlyMap<string, string>,
  categories: readonly FrozenCategory[] = frozenTaxonomySource.categories,
): Promise<{ upserted: number; created: string[] }> {
  const existingCategories = await prisma.category.findMany({
    select: {
      slug: true,
      sectorId: true,
      projectGroupIds: true,
    },
  })
  const existingSlugs = new Set(
    existingCategories.map((category) => category.slug),
  )
  const categoryContexts: CategorySectorContext[] = [...existingCategories]
  const created: string[] = []

  for (const category of categories) {
    const projectGroupIds = category.projectGroups.map((projectGroupSlug) => {
      const projectGroupId = projectGroupIdBySlug.get(projectGroupSlug)

      if (!projectGroupId) {
        throw new Error(
          `[category:${category.slug}] Missing projectGroups reference: ${projectGroupSlug}`,
        )
      }

      return projectGroupId
    })
    const existingCategory = categoryContexts.find(
      (context) => context.slug === category.slug,
    )
    const sectorId =
      existingCategory?.sectorId ??
      inferCategorySectorId(category.slug, projectGroupIds, categoryContexts)
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description ?? null,
        sectorId,
        projectGroupIds,
      },
      update: {
        name: category.name,
        description: category.description ?? null,
        projectGroupIds,
      },
    })

    if (!existingSlugs.has(category.slug)) {
      created.push(category.slug)
    }

    const contextIndex = categoryContexts.findIndex(
      (context) => context.slug === category.slug,
    )
    const nextContext = {
      slug: category.slug,
      sectorId: record.sectorId,
      projectGroupIds,
    }

    if (contextIndex === -1) {
      categoryContexts.push(nextContext)
    } else {
      categoryContexts[contextIndex] = nextContext
    }

    await replaceCategoryAliases(prisma, record.id, category.aliases ?? [])
  }

  return { upserted: categories.length, created }
}

async function replaceProjectGroupAliases(
  prisma: PrismaClient,
  projectGroupId: string,
  aliases: string[],
) {
  await prisma.projectGroupAlias.deleteMany({ where: { projectGroupId } })

  if (aliases.length === 0) {
    return
  }

  await prisma.projectGroupAlias.createMany({
    data: aliases.map((value) => ({ value, projectGroupId })),
    skipDuplicates: true,
  })
}

async function replaceInterventionAliases(
  prisma: PrismaClient,
  interventionId: string,
  aliases: string[],
) {
  await prisma.interventionAlias.deleteMany({ where: { interventionId } })

  if (aliases.length === 0) {
    return
  }

  await prisma.interventionAlias.createMany({
    data: aliases.map((value) => ({ value, interventionId })),
    skipDuplicates: true,
  })
}

/**
 * Exported (only change from a private function) so
 * publication-lifecycle.integration.test.ts can call the real sync logic
 * directly against a test DATABASE_URL, instead of re-implementing it or
 * spawning this file as a subprocess. Behavior is unchanged: the bottom-of
 * -file script entry point below still calls this the same way.
 */
export async function syncCatalogToDatabase(
  prisma: PrismaClient,
): Promise<SyncReport> {
  validateFrozenTaxonomySource(frozenTaxonomySource)

  console.log("Syncing frozen catalog to database...")

  // ProjectGroup is persisted, non-operational (docs/taxonomy.md).
  const projectGroupIdBySlug = new Map<string, string>()

  for (const projectGroup of frozenTaxonomySource.projectGroups) {
    const record = await prisma.projectGroup.upsert({
      where: {
        slug: projectGroup.slug,
      },
      create: {
        slug: projectGroup.slug,
        name: projectGroup.name,
        description: projectGroup.description ?? null,
      },
      update: {
        name: projectGroup.name,
        description: projectGroup.description ?? null,
      },
    })

    projectGroupIdBySlug.set(projectGroup.slug, record.id)

    await replaceProjectGroupAliases(
      prisma,
      record.id,
      projectGroup.aliases ?? [],
    )
  }

  // Frozen taxonomy is the canonical creator of Intervention rows
  // (Phase 15B — see docs/archive-legacy/refoundation/taxonomy-refoundation/15B_FINAL_CONSUMERS_REPORT.md
  // §D). name/description on an EXISTING row stay owned by whichever
  // pipeline first created it (legacy seed-taxonomy.ts, for every row
  // seeded before this phase) — update only touches projectGroupId for
  // those two fields. publicationStatus is different: it is a genuine
  // frozen-owned operational field (the publication gate), not editorial
  // content — frozen always wins here, on create AND on every update, in
  // both directions (published -> draft is a normal, expected transition,
  // never a special case).
  let interventionsUpserted = 0
  const interventionsCreated: string[] = []

  for (const projectGroup of frozenTaxonomySource.projectGroups) {
    const projectGroupId = projectGroupIdBySlug.get(projectGroup.slug)

    if (!projectGroupId) {
      throw new Error(`ProjectGroup not synced: ${projectGroup.slug}`)
    }

    for (const intervention of projectGroup.interventions) {
      const publicationStatus = toDbPublicationStatus(
        intervention.publicationStatus,
      )

      const record = await prisma.intervention.upsert({
        where: {
          slug: intervention.slug,
        },
        create: {
          slug: intervention.slug,
          name: intervention.name,
          description: intervention.description ?? null,
          projectGroupId,
          publicationStatus,
        },
        update: {
          projectGroupId,
          publicationStatus,
        },
      })

      interventionsUpserted += 1

      if (record.createdAt.getTime() === record.updatedAt.getTime()) {
        interventionsCreated.push(intervention.slug)
      }

      await replaceInterventionAliases(
        prisma,
        record.id,
        intervention.aliases ?? [],
      )
    }
  }

  const categorySync = await syncFrozenCategoriesToDatabase(
    prisma,
    projectGroupIdBySlug,
  )

  return {
    projectGroupsUpserted: projectGroupIdBySlug.size,
    interventionsUpserted,
    interventionsCreated,
    categoriesUpserted: categorySync.upserted,
    categoriesCreated: categorySync.created,
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(import.meta.filename)
) {
  const { prisma } = await import("@esigenta/database")

  syncCatalogToDatabase(prisma)
    .then((report) => {
      console.log("Catalog sync completed")
      console.log(JSON.stringify(report, null, 2))
    })
    .catch((error) => {
      console.error("Catalog sync failed")
      console.error(error)
      process.exitCode = 1
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
