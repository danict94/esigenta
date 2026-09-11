import assert from "node:assert/strict"
import test from "node:test"

import {
  composePublicProfessionCatalog,
  getPublicProfessionDetail,
  listPublicProfessionCategorySlugs,
  listPublicProfessionHubItems,
} from "./public-professions"

import type { FrozenTaxonomySource } from "./frozen"

function source(
  overrides: Partial<FrozenTaxonomySource> = {},
): FrozenTaxonomySource {
  return {
    categories: [
      {
        id: "category-a",
        slug: "category-a",
        name: "Category A",
        shortDescription: "Short description for category A.",
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
    ...overrides,
  }
}

test("public professions expose the frozen catalog without Prisma data", () => {
  const slugs = listPublicProfessionCategorySlugs()
  const hubItems = listPublicProfessionHubItems()

  assert.equal(slugs.length, 13)
  assert.equal(hubItems.length, slugs.length)
  assert.ok(hubItems.every((item) => item.shortDescription.trim().length > 0))
  assert.deepEqual(
    hubItems.map((item) => item.slug),
    slugs,
  )
  assert.equal(
    hubItems.reduce((total, item) => total + item.interventionCount, 0),
    101,
  )

  const detail = getPublicProfessionDetail(" impresa-edile ")
  assert.equal(detail?.category.name, "Impresa edile")
  assert.equal(detail?.projectGroups.length, 6)
  assert.equal(getPublicProfessionDetail("does-not-exist"), null)
  assert.equal(getPublicProfessionDetail("termoidraulico"), null)
  assert.equal(getPublicProfessionDetail("muratore"), null)
  assert.equal(getPublicProfessionDetail("architetto"), null)
  assert.equal(getPublicProfessionDetail("ingegnere"), null)
})

test("draft interventions are excluded from detail and hub counts", () => {
  const fixture = source()
  const projectGroup = fixture.projectGroups[0]

  assert.ok(projectGroup)

  projectGroup.interventions.push({
    id: "draft-a",
    slug: "draft-a",
    name: "Draft A",
    publicationStatus: "draft",
  })

  const catalog = composePublicProfessionCatalog(fixture)
  const detail = catalog.details[0]
  const hubItem = catalog.hubItems[0]

  assert.ok(detail)
  assert.ok(hubItem)

  const detailProjectGroup = detail.projectGroups[0]

  assert.ok(detailProjectGroup)

  assert.deepEqual(
    detailProjectGroup.interventions.map(
      (intervention) => intervention.slug,
    ),
    ["published-a"],
  )
  assert.equal(hubItem.interventionCount, 1)
})

test("public readiness gates hub, detail, static-param and sitemap slug sources", () => {
  const baseCategory = source().categories[0]!
  const fixture = source({
    categories: [
      baseCategory,
      {
        ...baseCategory,
        id: "category-hidden",
        slug: "category-hidden",
        name: "Category Hidden",
        isPublic: false,
      },
      {
        ...baseCategory,
        id: "category-public",
        slug: "category-public",
        name: "Category Public",
        isPublic: true,
      },
    ],
  })

  const catalog = composePublicProfessionCatalog(fixture)
  const expectedPublicSlugs = ["category-a", "category-public"]

  assert.deepEqual(catalog.categorySlugs, expectedPublicSlugs)
  assert.deepEqual(
    catalog.hubItems.map((item) => item.slug),
    expectedPublicSlugs,
  )
  assert.deepEqual(
    catalog.details.map((detail) => detail.category.slug),
    expectedPublicSlugs,
  )
})

test("a missing Category to ProjectGroup reference fails fast", () => {
  const fixture = source({
    categories: [
      {
        id: "category-a",
        slug: "category-a",
        name: "Category A",
        shortDescription: "Short description for category A.",
        projectGroups: ["missing-group"],
      },
    ],
  })

  assert.throws(
    () => composePublicProfessionCatalog(fixture),
    /Missing projectGroups reference: missing-group/,
  )
})

test("duplicate normalized entity slugs fail through the shared validator", () => {
  const fixture = source({
    categories: [
      {
        id: "category-a",
        slug: "category-a",
        name: "Category A",
        shortDescription: "Short description for category A.",
        projectGroups: ["group-a"],
      },
      {
        id: "category-b",
        slug: "category_a",
        name: "Category B",
        shortDescription: "Short description for category B.",
        projectGroups: ["group-a"],
      },
    ],
  })

  assert.throws(
    () => composePublicProfessionCatalog(fixture),
    /Duplicate normalized slug/,
  )
})

test("duplicate ProjectGroup references inside one Category fail fast", () => {
  const fixture = source({
    categories: [
      {
        id: "category-a",
        slug: "category-a",
        name: "Category A",
        shortDescription: "Short description for category A.",
        projectGroups: ["group-a", "group-a"],
      },
    ],
  })

  assert.throws(
    () => composePublicProfessionCatalog(fixture),
    /Duplicate ProjectGroup reference: group-a/,
  )
})

test("a public Category without shortDescription fails fast", () => {
  const fixture = source()
  const category = fixture.categories[0]

  assert.ok(category)

  const invalidCategory = {
    ...category,
    shortDescription: undefined,
  }

  fixture.categories[0] = invalidCategory as unknown as typeof category

  assert.throws(
    () => composePublicProfessionCatalog(fixture),
    /shortDescription cannot be empty/,
  )
})

test("a non-boolean public readiness value fails fast", () => {
  const fixture = source()
  const category = fixture.categories[0]!

  fixture.categories[0] = {
    ...category,
    isPublic: "yes",
  } as unknown as typeof category

  assert.throws(
    () => composePublicProfessionCatalog(fixture),
    /isPublic must be a boolean when provided/,
  )
})
