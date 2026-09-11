import assert from "node:assert/strict"
import test from "node:test"

import { frozenTaxonomySource } from "@esigenta/taxonomy/frozen"

import { resolveConfigurableCategorySuggestions } from "./resolve-configurable-category-suggestions"

test("service suggestions use effective Intervention membership, not DB ProjectGroups", () => {
  let calls = 0
  const categories = [{ id: "db:profession", slug: "profession", name: "Profession" }]
  const projectGroups = [
    {
      interventions: [
        { id: "db:kept", slug: "kept" },
        { id: "db:included", slug: "included" },
        { id: "db:excluded", slug: "excluded" },
      ],
    },
  ]
  const result = resolveConfigurableCategorySuggestions(
    categories,
    projectGroups,
    (categorySlug: string) => {
      calls += 1
      assert.equal(categorySlug, "profession")
      return {
        projectGroups: [
          {
            interventions: [
              { slug: "kept" },
              { slug: "included" },
            ],
          },
        ],
      }
    },
  )

  assert.equal(calls, 1)
  assert.deepEqual(result[0]?.suggestedInterventionIds, ["db:kept", "db:included"])
})

test("newly public company professions expose effective membership suggestions", () => {
  const interventionRows = frozenTaxonomySource.projectGroups.flatMap(
    (projectGroup) =>
      projectGroup.interventions.map((intervention) => ({
        id: `db:${intervention.slug}`,
        slug: intervention.slug,
      })),
  )
  const categories = [
    "termoidraulico",
    "muratore",
    "architetto",
    "ingegnere",
  ].map((slug) => ({ id: `db:${slug}`, slug, name: slug }))
  const result = resolveConfigurableCategorySuggestions(categories, [
    { interventions: interventionRows },
  ])

  assert.deepEqual(
    result.map(({ slug, suggestedInterventionIds }) => [
      slug,
      suggestedInterventionIds.length,
    ]),
    [
      ["termoidraulico", 6],
      ["muratore", 11],
      ["architetto", 5],
      ["ingegnere", 5],
    ],
  )
})
