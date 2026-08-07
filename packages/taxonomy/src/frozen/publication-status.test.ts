/**
 * Pure, in-memory lifecycle tests — no DB, no network, no I/O. Runs
 * directly against the frozen SSOT, so it is always safely runnable
 * (CI, local, anywhere) with zero setup.
 *
 * Run: node --import tsx --test src/frozen/publication-status.test.ts
 * (also covered by `pnpm --filter @esigenta/taxonomy test`).
 */
import assert from "node:assert/strict"
import { test } from "node:test"

import { frozenTaxonomySource } from "./source"
import {
  getInterventionPublicationStatus,
  isInterventionPublished,
} from "./publication-status"

function allInterventions() {
  return frozenTaxonomySource.projectGroups.flatMap(
    (projectGroup) => projectGroup.interventions,
  )
}

test("frozen taxonomy counts match the migrated baseline", () => {
  assert.equal(frozenTaxonomySource.categories.length, 13)
  assert.equal(frozenTaxonomySource.projectGroups.length, 20)
  assert.equal(allInterventions().length, 101)
})

test("exactly one Intervention is draft, and it is impermeabilizzare-terrazzo", () => {
  const interventions = allInterventions()
  const draft = interventions.filter((i) => i.publicationStatus === "draft")
  const published = interventions.filter(
    (i) => i.publicationStatus === "published",
  )

  assert.equal(published.length, 100)
  assert.equal(draft.length, 1)
  assert.equal(draft[0]?.slug, "impermeabilizzare-terrazzo")
})

test("every Intervention has an explicit, valid publicationStatus", () => {
  for (const intervention of allInterventions()) {
    assert.ok(
      intervention.publicationStatus === "draft" ||
        intervention.publicationStatus === "published",
      `${intervention.slug} has an invalid publicationStatus: ${String(
        intervention.publicationStatus,
      )}`,
    )
  }
})

test("isInterventionPublished / getInterventionPublicationStatus — published", () => {
  for (const slug of [
    "rifare-tetto",
    "impermeabilizzare-tetto",
    "impermeabilizzare-balcone-ballatoio",
    "ristrutturare-bagno",
  ]) {
    assert.equal(getInterventionPublicationStatus(slug), "published")
    assert.equal(isInterventionPublished(slug), true)
  }
})

test("isInterventionPublished / getInterventionPublicationStatus — draft", () => {
  assert.equal(
    getInterventionPublicationStatus("impermeabilizzare-terrazzo"),
    "draft",
  )
  assert.equal(isInterventionPublished("impermeabilizzare-terrazzo"), false)
})

test("isInterventionPublished / getInterventionPublicationStatus — unknown slug", () => {
  assert.equal(getInterventionPublicationStatus("does-not-exist"), null)
  assert.equal(isInterventionPublished("does-not-exist"), false)
})

test("impermeabilizzare-terrazzo keeps its full taxonomy work while draft", () => {
  const intervention = allInterventions().find(
    (i) => i.slug === "impermeabilizzare-terrazzo",
  )

  assert.ok(intervention, "impermeabilizzare-terrazzo must exist in frozen")
  assert.equal(intervention?.name, "Impermeabilizzare terrazzo")
  assert.equal(intervention?.publicationStatus, "draft")
  assert.equal(intervention?.aliases?.length, 11)

  const group = frozenTaxonomySource.projectGroups.find((projectGroup) =>
    projectGroup.interventions.some(
      (i) => i.slug === "impermeabilizzare-terrazzo",
    ),
  )
  assert.equal(group?.slug, "facciate-e-balconi")

  const owningCategory = frozenTaxonomySource.categories.find((category) =>
    category.projectGroups.includes("facciate-e-balconi"),
  )
  assert.equal(owningCategory?.slug, "impresa-edile")
})
