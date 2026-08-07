import path from "node:path"

import { config } from "dotenv"
import type { InterventionPublicationStatus, PrismaClient } from "@prisma/client"

import { frozenTaxonomySource } from "../source"
import { validateFrozenTaxonomySource } from "../shared/validators"
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
  categoriesMatched: number
  categoriesUnmatched: string[]
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

  let categoriesMatched = 0
  const categoriesUnmatched: string[] = []

  for (const category of frozenTaxonomySource.categories) {
    const projectGroupIds = category.projectGroups.map((projectGroupSlug) => {
      const projectGroupId = projectGroupIdBySlug.get(projectGroupSlug)

      if (!projectGroupId) {
        throw new Error(
          `[category:${category.slug}] Missing projectGroups reference: ${projectGroupSlug}`,
        )
      }

      return projectGroupId
    })

    const result = await prisma.category.updateMany({
      where: {
        slug: category.slug,
      },
      data: {
        name: category.name,
        description: category.description ?? null,
        projectGroupIds,
      },
    })

    if (result.count === 0) {
      categoriesUnmatched.push(category.slug)
    } else {
      categoriesMatched += result.count

      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category.slug },
        select: { id: true },
      })

      if (categoryRecord) {
        await replaceCategoryAliases(
          prisma,
          categoryRecord.id,
          category.aliases ?? [],
        )
      }
    }
  }

  return {
    projectGroupsUpserted: projectGroupIdBySlug.size,
    interventionsUpserted,
    interventionsCreated,
    categoriesMatched,
    categoriesUnmatched,
  }
}

const { prisma } = await import("@esigenta/database")

syncCatalogToDatabase(prisma)
  .then((report) => {
    console.log("Catalog sync completed")
    console.log(JSON.stringify(report, null, 2))

    if (report.categoriesUnmatched.length > 0) {
      console.error(
        "Catalog sync completed with unmatched frozen-source category references — see report above.",
      )
      process.exitCode = 1
    }
  })
  .catch((error) => {
    console.error("Catalog sync failed")
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
