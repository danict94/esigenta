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

test("production service profession chips preserve their previous order", () => {
  assert.equal(frozenTaxonomySource.categories.length, 17)
  assert.equal(listPublicProfessions(frozenTaxonomySource).length, 13)
  assert.equal(frozenTaxonomySource.projectGroups.length, 20)

  for (const projectGroup of frozenTaxonomySource.projectGroups) {
    const previousCategorySlugs = frozenTaxonomySource.categories
      .filter(
        (item) =>
          item.isPublic !== false &&
          item.projectGroups.includes(projectGroup.slug),
      )
      .map((item) => item.slug)
    const resolvedCategorySlugs = listPublicProfessionsForProjectGroup(
      projectGroup.slug,
      frozenTaxonomySource,
    ).map((item) => item.slug)

    assert.deepEqual(resolvedCategorySlugs, previousCategorySlugs)
  }

  assert.deepEqual(
    listPublicProfessionsForProjectGroup("riscaldamento").map(
      (category) => category.slug,
    ),
    ["idraulico"],
  )
  for (const internalProfessionSlug of [
    "muratore",
    "architetto",
    "ingegnere",
  ]) {
    assert.ok(
      frozenTaxonomySource.projectGroups.every(
        (projectGroup) =>
          !listPublicProfessionsForProjectGroup(projectGroup.slug).some(
            (category) => category.slug === internalProfessionSlug,
          ),
      ),
    )
  }
})
