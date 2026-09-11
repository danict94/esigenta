import assert from "node:assert/strict"
import test from "node:test"

import type { Prisma } from "@prisma/client"

import { frozenTaxonomySource } from "@esigenta/taxonomy/frozen"

import { resolveOnboardingInterventionIdsWithClient } from "./resolve-onboarding-intervention-ids"

function productionClient() {
  let queries = 0
  const interventions = frozenTaxonomySource.projectGroups.flatMap((group) =>
    group.interventions.map((intervention) => ({
      id: `db:${intervention.slug}`,
      slug: intervention.slug,
    })),
  )
  const client = {
    intervention: {
      findMany: async (query: { where: { slug: { in: string[] } } }) => {
        queries += 1
        return interventions.filter((intervention) =>
          query.where.slug.in.includes(intervention.slug),
        )
      },
    },
  } as unknown as Prisma.TransactionClient

  return { client, getQueries: () => queries }
}

test("signup resolves only canonical onboarding defaults in one DB query", async () => {
  for (const [categorySlug, expectedCount] of [
    ["idraulico", 7],
    ["impresa-edile", 15],
    ["elettricista", 11],
  ] as const) {
    const { client, getQueries } = productionClient()
    const ids = await resolveOnboardingInterventionIdsWithClient(
      client,
      categorySlug,
    )

    assert.equal(ids.length, expectedCount)
    assert.equal(getQueries(), 1)
  }
})

test("signup fails clearly when a frozen default is absent from DB", async () => {
  const client = {
    intervention: { findMany: async () => [] },
  } as unknown as Prisma.TransactionClient

  await assert.rejects(
    resolveOnboardingInterventionIdsWithClient(client, "idraulico"),
    /Missing DB Intervention for frozen slug/,
  )
})
