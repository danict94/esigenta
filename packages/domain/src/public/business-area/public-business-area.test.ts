import assert from "node:assert/strict"
import test from "node:test"

import { listCompanyProfessions } from "@esigenta/taxonomy/frozen"

import { getPublicBusinessAreaPageData } from "./public-business-area"

test("business-area profession selector uses all company professions", async () => {
  let membershipQueries = 0
  const result = await getPublicBusinessAreaPageData(
    { userId: null },
    {
      companyMembership: {
        findFirst: async () => {
          membershipQueries += 1
          return null
        },
      },
    },
  )

  assert.deepEqual(
    result.categories,
    listCompanyProfessions().map(({ slug, name }) => ({ slug, name })),
  )
  assert.equal(result.categories.length, 17)
  assert.equal(membershipQueries, 0)
})

test("business-area profession selector includes the four newly public professions", async () => {
  const result = await getPublicBusinessAreaPageData(
    { userId: "user-1" },
    {
      companyMembership: {
        findFirst: async () => ({ id: "membership-1" }),
      },
    },
  )
  const slugs = new Set(result.categories.map((category) => category.slug))

  for (const slug of [
    "termoidraulico",
    "muratore",
    "architetto",
    "ingegnere",
  ]) {
    assert.equal(slugs.has(slug), true)
  }
  assert.equal(result.hasDeactivatedCompany, true)
})
