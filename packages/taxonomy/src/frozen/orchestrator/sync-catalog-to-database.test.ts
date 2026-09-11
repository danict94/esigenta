import assert from "node:assert/strict"
import test from "node:test"

import type { PrismaClient } from "@prisma/client"

import type { FrozenCategory } from "../source"
import { frozenTaxonomySource } from "../source"
import { listPublicProfessions } from "../list-public-professions"
import {
  inferCategorySectorId,
  syncFrozenCategoriesToDatabase,
} from "./sync-catalog-to-database"

function category(slug: string, projectGroups: string[]): FrozenCategory {
  return {
    id: slug,
    slug,
    name: slug,
    shortDescription: slug,
    projectGroups,
  }
}

test("sector inference requires one unambiguous shared-ProjectGroup sector", () => {
  const contexts = [
    { slug: "anchor", sectorId: "sector-a", projectGroupIds: ["pg-a"] },
  ]

  assert.equal(inferCategorySectorId("new", ["pg-a"], contexts), "sector-a")
  assert.throws(
    () => inferCategorySectorId("new", ["pg-missing"], contexts),
    /missing/,
  )
  assert.throws(
    () =>
      inferCategorySectorId("new", ["pg-a"], [
        ...contexts,
        { slug: "other", sectorId: "sector-b", projectGroupIds: ["pg-a"] },
      ]),
    /ambiguous/,
  )
})

test("the next production sync can infer sectors for the four newly added professions", () => {
  const projectGroupIds = new Map(
    frozenTaxonomySource.projectGroups.map(({ slug }) => [slug, `db:${slug}`]),
  )
  const sectorByPublicAnchor = new Map([
    ["idraulico", "sector:impianti"],
    ["impresa-edile", "sector:edilizia"],
    ["geometra", "sector:edilizia"],
  ])
  const contexts = listPublicProfessions()
    .filter((category) => sectorByPublicAnchor.has(category.slug))
    .map((category) => ({
      slug: category.slug,
      sectorId: sectorByPublicAnchor.get(category.slug)!,
      projectGroupIds: category.projectGroups.map(
        (projectGroupSlug) => projectGroupIds.get(projectGroupSlug)!,
      ),
    }))
  const expected = new Map([
    ["termoidraulico", "sector:impianti"],
    ["muratore", "sector:edilizia"],
    ["architetto", "sector:edilizia"],
    ["ingegnere", "sector:edilizia"],
  ])

  for (const [slug, sectorId] of expected) {
    const category = frozenTaxonomySource.categories.find(
      (candidate) => candidate.slug === slug,
    )!
    const resolvedProjectGroupIds = category.projectGroups.map(
      (projectGroupSlug) => projectGroupIds.get(projectGroupSlug)!,
    )

    assert.equal(
      inferCategorySectorId(slug, resolvedProjectGroupIds, contexts),
      sectorId,
    )
  }
})

test("category sync upserts missing frozen Categories by slug without deleting DB rows", async () => {
  type Row = {
    id: string
    slug: string
    name: string
    description: string | null
    sectorId: string
    projectGroupIds: string[]
  }
  const rows = new Map<string, Row>([
    [
      "anchor",
      {
        id: "db:anchor",
        slug: "anchor",
        name: "Anchor",
        description: null,
        sectorId: "sector-a",
        projectGroupIds: ["db:group"],
      },
    ],
    [
      "db-only",
      {
        id: "db:db-only",
        slug: "db-only",
        name: "DB only",
        description: null,
        sectorId: "sector-a",
        projectGroupIds: [],
      },
    ],
  ])
  const upsertedSlugs: string[] = []
  const client = {
    category: {
      findMany: async () => [...rows.values()],
      upsert: async (query: {
        where: { slug: string }
        create: Omit<Row, "id">
        update: Partial<Row>
      }) => {
        upsertedSlugs.push(query.where.slug)
        const existing = rows.get(query.where.slug)
        const record: Row = existing
          ? { ...existing, ...query.update }
          : { id: `db:${query.where.slug}`, ...query.create }
        rows.set(query.where.slug, record)
        return record
      },
    },
    categoryAlias: {
      deleteMany: async () => ({ count: 0 }),
      createMany: async () => ({ count: 0 }),
    },
  } as unknown as PrismaClient

  const result = await syncFrozenCategoriesToDatabase(
    client,
    new Map([["group", "db:group"]]),
    [category("anchor", ["group"]), category("new", ["group"])],
  )

  assert.deepEqual(upsertedSlugs, ["anchor", "new"])
  assert.deepEqual(result, { upserted: 2, created: ["new"] })
  assert.equal(rows.get("new")?.sectorId, "sector-a")
  assert.equal(rows.has("db-only"), true)
})
