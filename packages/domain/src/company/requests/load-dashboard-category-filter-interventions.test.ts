import assert from "node:assert/strict"
import test from "node:test"

import { loadDashboardCategoryFilterInterventions } from "./load-dashboard-category-filter-interventions"

test("dashboard Category filter uses canonical membership in two batch reads", async () => {
  let categoryQueries = 0
  let interventionQueries = 0
  const client = {
    category: {
      findMany: async () => {
        categoryQueries += 1
        return [{ id: "db:profession", slug: "profession" }]
      },
    },
    intervention: {
      findMany: async () => {
        interventionQueries += 1
        return [
          { id: "db:included", slug: "included", name: "Included", projectGroupId: "db:other" },
          { id: "db:kept", slug: "kept", name: "Kept", projectGroupId: "db:default" },
        ]
      },
    },
  }

  const result = await loadDashboardCategoryFilterInterventions(
    ["db:profession", "db:profession"],
    client,
    () => ({
      projectGroups: [
        { interventions: [{ slug: "kept" }] },
        { interventions: [{ slug: "included" }] },
      ],
    }),
  )

  assert.equal(categoryQueries, 1)
  assert.equal(interventionQueries, 1)
  assert.deepEqual(
    result.interventions.map((intervention) => intervention.slug),
    ["kept", "included"],
  )
})
