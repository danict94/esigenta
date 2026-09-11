import assert from "node:assert/strict"
import test from "node:test"

import { frozenTaxonomySource } from "./source"
import { listCompanyProfessions } from "./list-company-professions"
import { listPublicProfessions } from "./list-public-professions"

const newlyPublicProfessionSlugs = [
  "termoidraulico",
  "muratore",
  "architetto",
  "ingegnere",
] as const

test("company professions include every frozen Category in source order", () => {
  assert.deepEqual(
    listCompanyProfessions().map((category) => category.slug),
    frozenTaxonomySource.categories.map((category) => category.slug),
  )
  assert.equal(listCompanyProfessions().length, 17)
})

test("newly published professions remain available to company consumers", () => {
  const companySlugs = new Set(
    listCompanyProfessions().map((category) => category.slug),
  )
  const publicSlugs = new Set(
    listPublicProfessions().map((category) => category.slug),
  )

  for (const slug of newlyPublicProfessionSlugs) {
    assert.equal(companySlugs.has(slug), true)
    assert.equal(publicSlugs.has(slug), true)
  }
  assert.equal(companySlugs.size, 17)
  assert.equal(publicSlugs.size, 17)
})
