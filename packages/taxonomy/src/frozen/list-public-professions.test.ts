import assert from "node:assert/strict"
import test from "node:test"

import {
  frozenTaxonomySource,
  listPublicProfessions,
  resolveProfessionInterventions,
} from "./index"

import type { FrozenTaxonomySource } from "./source"

function source(): FrozenTaxonomySource {
  return {
    categories: [
      {
        id: "public-a",
        slug: "public-a",
        name: "Public A",
        shortDescription: "Public A description.",
        projectGroups: ["group-a"],
      },
      {
        id: "private-b",
        slug: "private-b",
        name: "Private B",
        shortDescription: "Private B description.",
        isPublic: false,
        projectGroups: ["group-a"],
      },
      {
        id: "public-c",
        slug: "public-c",
        name: "Public C",
        shortDescription: "Public C description.",
        isPublic: true,
        projectGroups: ["group-a"],
      },
    ],
    projectGroups: [
      {
        id: "group-a",
        slug: "group-a",
        name: "Group A",
        interventions: [
          {
            id: "published-a",
            slug: "published-a",
            name: "Published A",
            publicationStatus: "published",
          },
        ],
      },
    ],
  }
}

test("the canonical public profession gate preserves public source order", () => {
  assert.deepEqual(
    listPublicProfessions(source()).map((category) => category.slug),
    ["public-a", "public-c"],
  )
})

test("a non-public profession remains internally resolvable", () => {
  const fixture = source()
  const resolved = resolveProfessionInterventions("private-b", fixture)

  assert.equal(resolved?.category.slug, "private-b")
  assert.deepEqual(
    resolved?.projectGroups.flatMap(({ interventions }) =>
      interventions.map((intervention) => intervention.slug),
    ),
    ["published-a"],
  )
})

test("all 17 production professions are public in frozen source order", () => {
  assert.equal(frozenTaxonomySource.categories.length, 17)
  assert.deepEqual(
    listPublicProfessions(frozenTaxonomySource).map((category) => category.slug),
    [
      "impresa-edile",
      "muratore",
      "idraulico",
      "termoidraulico",
      "elettricista",
      "cartongessista",
      "imbianchino",
      "installatore-fotovoltaico",
      "tecnico-climatizzazione",
      "serramentista",
      "fabbro",
      "fumista",
      "giardiniere",
      "geometra",
      "architetto",
      "ingegnere",
      "piscinista",
    ],
  )
})
