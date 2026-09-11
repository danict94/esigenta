import assert from "node:assert/strict"
import test from "node:test"

import {
  frozenTaxonomySource,
  listPublicProfessions,
  listPublicProfessionsForProjectGroup,
  resolveProfessionInterventions,
} from "./index"

import type { FrozenCategory, FrozenTaxonomySource } from "./source"

function category(
  slug: string,
  overrides: Partial<FrozenCategory> = {},
): FrozenCategory {
  return {
    id: slug,
    slug,
    name: slug,
    shortDescription: `${slug} description.`,
    projectGroups: ["group-a"],
    ...overrides,
  }
}

function source(): FrozenTaxonomySource {
  return {
    categories: [
      category("public-default"),
      category("private-default", { isPublic: false }),
      category("fully-excluded", {
        interventionOverrides: { exclude: ["published-a-1", "published-a-2"] },
      }),
      category("included-from-other-group", {
        projectGroups: ["group-b"],
        interventionOverrides: { include: ["published-a-2"] },
      }),
      category("included-default-without-duplicate", {
        interventionOverrides: { include: ["published-a-1"] },
      }),
    ],
    projectGroups: [
      {
        id: "group-a",
        slug: "group-a",
        name: "Group A",
        interventions: [
          {
            id: "published-a-1",
            slug: "published-a-1",
            name: "Published A 1",
            publicationStatus: "published",
          },
          {
            id: "published-a-2",
            slug: "published-a-2",
            name: "Published A 2",
            publicationStatus: "published",
          },
        ],
      },
      {
        id: "group-b",
        slug: "group-b",
        name: "Group B",
        interventions: [
          {
            id: "published-b",
            slug: "published-b",
            name: "Published B",
            publicationStatus: "published",
          },
        ],
      },
    ],
  }
}

test("service professions honor readiness and effective Intervention membership", () => {
  const fixture = source()

  assert.deepEqual(
    listPublicProfessionsForProjectGroup(" group-a ", fixture).map(
      (profession) => profession.slug,
    ),
    [
      "public-default",
      "included-from-other-group",
      "included-default-without-duplicate",
    ],
  )
})

test("a private profession stays internally resolvable but cannot leak to services", () => {
  const fixture = source()

  assert.ok(resolveProfessionInterventions("private-default", fixture))
  assert.ok(
    !listPublicProfessionsForProjectGroup("group-a", fixture).some(
      (profession) => profession.slug === "private-default",
    ),
  )
})

test("an unknown ProjectGroup fails clearly", () => {
  assert.throws(
    () => listPublicProfessionsForProjectGroup("missing-group", source()),
    /Unknown ProjectGroup: missing-group/,
  )
})

test("production service profession chips use canonical public membership order", () => {
  assert.equal(frozenTaxonomySource.categories.length, 17)
  assert.equal(listPublicProfessions(frozenTaxonomySource).length, 17)
  assert.equal(frozenTaxonomySource.projectGroups.length, 20)

  const categoryOrder = new Map(
    frozenTaxonomySource.categories.map((category, index) => [
      category.slug,
      index,
    ]),
  )

  for (const projectGroup of frozenTaxonomySource.projectGroups) {
    const resolvedCategorySlugs = listPublicProfessionsForProjectGroup(
      projectGroup.slug,
      frozenTaxonomySource,
    ).map((item) => item.slug)
    const resolvedCategoryIndexes = resolvedCategorySlugs.map(
      (slug) => categoryOrder.get(slug)!,
    )

    assert.equal(new Set(resolvedCategorySlugs).size, resolvedCategorySlugs.length)
    assert.deepEqual(
      resolvedCategoryIndexes,
      [...resolvedCategoryIndexes].sort((first, second) => first - second),
    )
  }

  assert.deepEqual(
    listPublicProfessionsForProjectGroup("riscaldamento").map(
      (category) => category.slug,
    ),
    ["idraulico", "termoidraulico"],
  )
  assert.deepEqual(
    listPublicProfessionsForProjectGroup(
      "opere-murarie-e-demolizioni",
    ).map((category) => category.slug),
    ["impresa-edile", "muratore"],
  )
  assert.deepEqual(
    listPublicProfessionsForProjectGroup(
      "tecnici-e-pratiche-edilizie",
    ).map((category) => category.slug),
    ["geometra", "architetto", "ingegnere"],
  )
  for (const groupSlug of ["facciate-e-balconi", "pavimentazioni"]) {
    assert.ok(
      listPublicProfessionsForProjectGroup(groupSlug).some(
        (category) => category.slug === "muratore",
      ),
    )
  }
})
