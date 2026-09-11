import assert from "node:assert/strict"
import test from "node:test"

import {
  frozenTaxonomySource,
  resolveProfessionOnboardingDefaults,
  resolveProfessionInterventions,
} from "./index"

import type { FrozenTaxonomySource } from "./source"

function fixtureSource(): FrozenTaxonomySource {
  return {
    categories: [
      {
        id: "profession-a",
        slug: "profession-a",
        name: "Profession A",
        shortDescription: "Profession A description.",
        projectGroups: ["group-b", "group-a"],
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
      {
        id: "group-b",
        slug: "group-b",
        name: "Group B",
        interventions: [
          {
            id: "published-b-2",
            slug: "published-b-2",
            name: "Published B 2",
            publicationStatus: "published",
          },
          {
            id: "draft-b",
            slug: "draft-b",
            name: "Draft B",
            publicationStatus: "draft",
          },
          {
            id: "published-b-1",
            slug: "published-b-1",
            name: "Published B 1",
            publicationStatus: "published",
          },
        ],
      },
      {
        id: "group-c",
        slug: "group-c",
        name: "Group C",
        interventions: [
          {
            id: "published-c-2",
            slug: "published-c-2",
            name: "Published C 2",
            publicationStatus: "published",
          },
          {
            id: "draft-c",
            slug: "draft-c",
            name: "Draft C",
            publicationStatus: "draft",
          },
          {
            id: "published-c-1",
            slug: "published-c-1",
            name: "Published C 1",
            publicationStatus: "published",
          },
        ],
      },
    ],
  }
}

function directPublishedDerivation(source: FrozenTaxonomySource) {
  return source.categories.map((category) => ({
    categorySlug: category.slug,
    projectGroups: category.projectGroups.map((projectGroupSlug) => {
      const projectGroup = source.projectGroups.find(
        (candidate) => candidate.slug === projectGroupSlug,
      )

      assert.ok(projectGroup)

      return {
        slug: projectGroup.slug,
        interventionSlugs: projectGroup.interventions
          .filter((intervention) => intervention.publicationStatus === "published")
          .map((intervention) => intervention.slug),
      }
    }),
  }))
}

function resolvedPublishedDerivation(source: FrozenTaxonomySource) {
  return source.categories.map((category) => {
    const resolved = resolveProfessionInterventions(category.slug, source)

    assert.ok(resolved)

    return {
      categorySlug: resolved.category.slug,
      projectGroups: resolved.projectGroups.map(
        ({ projectGroup, interventions }) => ({
          slug: projectGroup.slug,
          interventionSlugs: interventions.map(
            (intervention) => intervention.slug,
          ),
        }),
      ),
    }
  })
}

test("the canonical profession resolver preserves the complete current catalog", () => {
  assert.equal(frozenTaxonomySource.categories.length, 17)
  assert.equal(frozenTaxonomySource.projectGroups.length, 20)

  const resolved = resolvedPublishedDerivation(frozenTaxonomySource)
  const projectGroupSlugs = resolved.flatMap((profession) =>
    profession.projectGroups.map((projectGroup) => projectGroup.slug),
  )
  const interventionSlugs = resolved.flatMap((profession) =>
    profession.projectGroups.flatMap(
      (projectGroup) => projectGroup.interventionSlugs,
    ),
  )

  assert.equal(projectGroupSlugs.length, 26)
  assert.equal(new Set(projectGroupSlugs).size, 20)
  assert.equal(interventionSlugs.length, 128)
  assert.equal(new Set(interventionSlugs).size, 101)
})

test("Termoidraulico and Idraulico share the canonical riscaldamento group", () => {
  const termoidraulico = resolveProfessionInterventions("termoidraulico")
  const idraulico = resolveProfessionInterventions("idraulico")

  assert.ok(termoidraulico)
  assert.ok(idraulico)
  assert.equal(termoidraulico.category.isPublic, true)
  assert.deepEqual(termoidraulico.category.aliases, ["termoidraulici"])
  assert.deepEqual(
    termoidraulico.projectGroups.map(({ projectGroup }) => projectGroup.slug),
    ["riscaldamento"],
  )
  assert.ok(
    idraulico.projectGroups.some(
      ({ projectGroup }) => projectGroup.slug === "riscaldamento",
    ),
  )

  const interventionSlugs = termoidraulico.projectGroups.flatMap(
    ({ interventions }) => interventions.map((intervention) => intervention.slug),
  )

  assert.deepEqual(interventionSlugs, [
    "installare-o-sostituire-caldaia",
    "installare-pompa-di-calore",
    "installare-o-sostituire-termosifoni",
    "installare-riscaldamento-a-pavimento",
    "installare-o-sostituire-scaldabagno",
    "fare-manutenzione-caldaia",
  ])
  assert.equal(interventionSlugs.length, 6)
  assert.equal(new Set(interventionSlugs).size, 6)
})

test("Muratore uses one base group and canonical cross-group includes", () => {
  const resolved = resolveProfessionInterventions("muratore")

  assert.ok(resolved)
  assert.equal(resolved.category.isPublic, true)
  assert.deepEqual(resolved.category.aliases, ["muratori"])
  assert.deepEqual(resolved.category.projectGroups, [
    "opere-murarie-e-demolizioni",
  ])
  assert.deepEqual(resolved.category.interventionOverrides, {
    include: [
      "fare-massetto",
      "posare-o-rifare-pavimento-interno",
      "riparare-pavimento",
      "rifare-facciata",
      "ripristinare-balconi-e-ballatoi",
      "ripristino-frontalino",
    ],
  })
  assert.deepEqual(
    resolved.projectGroups.map(({ projectGroup }) => projectGroup.slug),
    [
      "opere-murarie-e-demolizioni",
      "facciate-e-balconi",
      "pavimentazioni",
    ],
  )

  const interventionSlugs = resolved.projectGroups.flatMap(
    ({ interventions }) => interventions.map((intervention) => intervention.slug),
  )

  assert.deepEqual(interventionSlugs, [
    "aprire-o-chiudere-vano",
    "demolire-parete-o-tramezzo",
    "costruire-parete-o-tramezzo",
    "demolizioni-interne",
    "piccole-opere-murarie",
    "rifare-facciata",
    "ripristinare-balconi-e-ballatoi",
    "ripristino-frontalino",
    "fare-massetto",
    "posare-o-rifare-pavimento-interno",
    "riparare-pavimento",
  ])
  assert.equal(interventionSlugs.length, 11)
  assert.equal(new Set(interventionSlugs).size, 11)
  assert.ok(
    resolved.projectGroups
      .find(({ projectGroup }) => projectGroup.slug === "pavimentazioni")
      ?.interventions.some(
        (intervention) => intervention.slug === "fare-massetto",
      ),
  )
})

test("Geometra, Architetto and Ingegnere are distinct professions sharing the technical catalog", () => {
  const expectedInterventionSlugs = [
    "fare-cila-o-scia",
    "fare-ape",
    "fare-variazione-catastale",
    "fare-sanatoria-edilizia",
    "fare-progetto-ristrutturazione",
  ]
  const expectedDefaults = [
    "fare-cila-o-scia",
    "fare-progetto-ristrutturazione",
  ]

  for (const [categorySlug, aliases, isPublic] of [
    ["geometra", ["geometri"], true],
    ["architetto", ["architetti"], true],
    ["ingegnere", ["ingegneri"], true],
  ] as const) {
    const resolved = resolveProfessionInterventions(categorySlug)

    assert.ok(resolved)
    assert.equal(resolved.category.isPublic !== false, isPublic)
    assert.deepEqual(resolved.category.aliases, aliases)
    assert.equal(resolved.category.interventionOverrides, undefined)
    assert.deepEqual(
      resolved.projectGroups.map(({ projectGroup }) => projectGroup.slug),
      ["tecnici-e-pratiche-edilizie"],
    )

    const interventionSlugs = resolved.projectGroups.flatMap(
      ({ interventions }) =>
        interventions.map((intervention) => intervention.slug),
    )
    assert.deepEqual(interventionSlugs, expectedInterventionSlugs)
    assert.equal(interventionSlugs.length, new Set(interventionSlugs).size)
  }

  assert.equal(
    resolveProfessionInterventions("geometra")?.category.onboardingDefaults,
    undefined,
  )
  for (const categorySlug of ["architetto", "ingegnere"]) {
    const defaults = resolveProfessionOnboardingDefaults(categorySlug)
    assert.ok(defaults)
    assert.deepEqual(
      defaults.projectGroups.flatMap(({ interventions }) =>
        interventions.map((intervention) => intervention.slug),
      ),
      expectedDefaults,
    )
    assert.ok(
      expectedDefaults.every((slug) =>
        expectedInterventionSlugs.includes(slug),
      ),
    )
  }
})

test("technical profession names and plural aliases have one correct Category owner", () => {
  for (const [term, expectedSlug] of [
    ["geometra", "geometra"],
    ["geometri", "geometra"],
    ["architetto", "architetto"],
    ["architetti", "architetto"],
    ["ingegnere", "ingegnere"],
    ["ingegneri", "ingegnere"],
  ] as const) {
    const normalizedTerm = term.trim().toLocaleLowerCase("it")
    const owners = frozenTaxonomySource.categories.filter((category) =>
      [category.slug, category.name, ...(category.aliases ?? [])].some(
        (value) => value.trim().toLocaleLowerCase("it") === normalizedTerm,
      ),
    )

    assert.deepEqual(
      owners.map((category) => category.slug),
      [expectedSlug],
    )
  }
})

test("representative profession intervention counts stay unchanged", () => {
  const expectedCounts = new Map([
    ["idraulico", 11],
    ["elettricista", 11],
    ["impresa-edile", 33],
  ])

  for (const [categorySlug, expectedCount] of expectedCounts) {
    const resolved = resolveProfessionInterventions(categorySlug)

    assert.ok(resolved)
    assert.equal(
      resolved.projectGroups.reduce(
        (total, group) => total + group.interventions.length,
        0,
      ),
      expectedCount,
    )
  }
})

test("production onboarding presets preserve explicit profession defaults", () => {
  const cases = [
    ["impresa-edile", 33, 15],
    ["idraulico", 11, 7],
    ["termoidraulico", 6, 4],
    ["muratore", 11, 6],
    ["geometra", 5, 5],
    ["architetto", 5, 2],
    ["ingegnere", 5, 2],
    ["elettricista", 11, 11],
  ] as const

  for (const [categorySlug, membershipCount, defaultCount] of cases) {
    const membership = resolveProfessionInterventions(categorySlug)
    const defaults = resolveProfessionOnboardingDefaults(categorySlug)

    assert.ok(membership)
    assert.ok(defaults)
    assert.equal(
      membership.projectGroups.flatMap((group) => group.interventions).length,
      membershipCount,
    )
    assert.equal(
      defaults.projectGroups.flatMap((group) => group.interventions).length,
      defaultCount,
    )
  }

  const idraulicoDefaults = resolveProfessionOnboardingDefaults("idraulico")
  const termoidraulicoDefaults =
    resolveProfessionOnboardingDefaults("termoidraulico")
  const impresaDefaults = resolveProfessionOnboardingDefaults("impresa-edile")
  assert.ok(idraulicoDefaults)
  assert.ok(termoidraulicoDefaults)
  assert.ok(impresaDefaults)
  assert.deepEqual(
    idraulicoDefaults.projectGroups.flatMap(({ interventions }) =>
      interventions.map((intervention) => intervention.slug),
    ),
    [
      "rifare-impianto-idraulico-bagno",
      "riparare-perdita-acqua",
      "disostruire-scarichi",
      "sostituire-box-doccia",
      "installare-sanitari",
      "installare-o-sostituire-termosifoni",
      "installare-o-sostituire-scaldabagno",
    ],
  )
  const termoidraulicoDefaultSlugs =
    termoidraulicoDefaults.projectGroups.flatMap(({ interventions }) =>
      interventions.map((intervention) => intervention.slug),
    )
  const termoidraulicoMembershipSlugs =
    resolveProfessionInterventions("termoidraulico")?.projectGroups.flatMap(
      ({ interventions }) =>
        interventions.map((intervention) => intervention.slug),
    ) ?? []

  assert.deepEqual(termoidraulicoDefaultSlugs, [
    "installare-o-sostituire-caldaia",
    "installare-o-sostituire-termosifoni",
    "installare-o-sostituire-scaldabagno",
    "fare-manutenzione-caldaia",
  ])
  assert.ok(
    termoidraulicoDefaultSlugs.every((slug) =>
      termoidraulicoMembershipSlugs.includes(slug),
    ),
  )
  assert.ok(!termoidraulicoDefaultSlugs.includes("installare-pompa-di-calore"))
  assert.ok(
    !termoidraulicoDefaultSlugs.includes(
      "installare-riscaldamento-a-pavimento",
    ),
  )
  assert.deepEqual(
    new Set(
      impresaDefaults.projectGroups.flatMap(({ interventions }) =>
        interventions.map((intervention) => intervention.slug),
      ),
    ),
    new Set([
      "ristrutturare-appartamento",
      "ristrutturare-bagno",
      "ristrutturare-casa",
      "ristrutturare-cucina",
      "aprire-o-chiudere-vano",
      "costruire-parete-o-tramezzo",
      "demolire-parete-o-tramezzo",
      "demolizioni-interne",
      "piccole-opere-murarie",
      "fare-massetto",
      "posare-o-rifare-pavimento-interno",
      "riparare-pavimento",
      "rifare-facciata",
      "ripristinare-balconi-e-ballatoi",
      "ripristino-frontalino",
    ]),
  )
})

test("Muratore onboarding defaults are conservative and within membership", () => {
  const membership = resolveProfessionInterventions("muratore")
  const defaults = resolveProfessionOnboardingDefaults("muratore")

  assert.ok(membership)
  assert.ok(defaults)
  assert.deepEqual(membership.category.onboardingDefaults, [
    "aprire-o-chiudere-vano",
    "costruire-parete-o-tramezzo",
    "demolire-parete-o-tramezzo",
    "demolizioni-interne",
    "piccole-opere-murarie",
    "fare-massetto",
  ])

  const membershipSlugs = membership.projectGroups.flatMap(
    ({ interventions }) => interventions.map((intervention) => intervention.slug),
  )
  const defaultSlugs = defaults.projectGroups.flatMap(({ interventions }) =>
    interventions.map((intervention) => intervention.slug),
  )

  assert.deepEqual(defaultSlugs, [
    "aprire-o-chiudere-vano",
    "demolire-parete-o-tramezzo",
    "costruire-parete-o-tramezzo",
    "demolizioni-interne",
    "piccole-opere-murarie",
    "fare-massetto",
  ])
  assert.ok(defaultSlugs.every((slug) => membershipSlugs.includes(slug)))
})

test("onboarding defaults preserve canonical order and fallback to full membership", () => {
  const fallback = resolveProfessionOnboardingDefaults(
    "profession-a",
    fixtureSource(),
  )
  const membership = resolveProfessionInterventions(
    "profession-a",
    fixtureSource(),
  )

  assert.deepEqual(fallback, membership)

  const source = fixtureSource()
  source.categories[0] = {
    ...source.categories[0]!,
    interventionOverrides: { include: ["published-c-1"] },
    onboardingDefaults: ["published-c-1", "published-b-1"],
  }
  const defaults = resolveProfessionOnboardingDefaults("profession-a", source)

  assert.ok(defaults)
  assert.deepEqual(
    defaults.projectGroups.map(({ projectGroup, interventions }) => ({
      group: projectGroup.slug,
      interventions: interventions.map((intervention) => intervention.slug),
    })),
    [
      { group: "group-b", interventions: ["published-b-1"] },
      { group: "group-c", interventions: ["published-c-1"] },
    ],
  )
})

test("invalid onboarding defaults fail through central frozen validation", () => {
  for (const [onboardingDefaults, expectedError] of [
    [["missing"], /Missing Intervention reference: missing/],
    [
      ["published-a", "published-a"],
      /Duplicate Intervention reference: published-a/,
    ],
    [
      ["published-c-1"],
      /not in the effective profession membership: published-c-1/,
    ],
    [["draft-b"], /not in the effective profession membership: draft-b/],
  ] as const) {
    const source = fixtureSource()
    source.categories[0] = {
      ...source.categories[0]!,
      onboardingDefaults,
    }
    assert.throws(
      () => resolveProfessionOnboardingDefaults("profession-a", source),
      expectedError,
    )
  }

  const excludedSource = fixtureSource()
  excludedSource.categories[0] = {
    ...excludedSource.categories[0]!,
    interventionOverrides: { exclude: ["published-b-1"] },
    onboardingDefaults: ["published-b-1"],
  }
  assert.throws(
    () =>
      resolveProfessionOnboardingDefaults("profession-a", excludedSource),
    /not in the effective profession membership: published-b-1/,
  )
})

test("the resolver preserves source order and excludes draft interventions", () => {
  const resolved = resolveProfessionInterventions(
    " profession-a ",
    fixtureSource(),
  )

  assert.ok(resolved)
  assert.deepEqual(
    resolved.projectGroups.map(({ projectGroup }) => projectGroup.slug),
    ["group-b", "group-a"],
  )
  assert.deepEqual(
    resolved.projectGroups[0]?.interventions.map(
      (intervention) => intervention.slug,
    ),
    ["published-b-2", "published-b-1"],
  )
})

test("exclude removes defaults and include appends external groups deterministically", () => {
  const source = fixtureSource()
  source.categories[0]!.interventionOverrides = {
    exclude: ["published-b-2"],
    include: ["published-a", "published-c-1", "draft-c", "published-c-2"],
  }

  const resolved = resolveProfessionInterventions("profession-a", source)

  assert.ok(resolved)
  assert.deepEqual(
    resolved.projectGroups.map(({ projectGroup }) => projectGroup.slug),
    ["group-b", "group-a", "group-c"],
  )
  assert.deepEqual(
    resolved.projectGroups.map(({ interventions }) =>
      interventions.map((intervention) => intervention.slug),
    ),
    [["published-b-1"], ["published-a"], ["published-c-2", "published-c-1"]],
  )

  const interventionSlugs = resolved.projectGroups.flatMap(
    ({ interventions }) => interventions.map((intervention) => intervention.slug),
  )
  assert.equal(interventionSlugs.length, new Set(interventionSlugs).size)
})

test("the canonical resolver matches the previous direct derivation", () => {
  const categoriesWithoutOverrides = {
    ...frozenTaxonomySource,
    categories: frozenTaxonomySource.categories.filter(
      (category) => category.interventionOverrides === undefined,
    ),
  }

  assert.deepEqual(
    resolvedPublishedDerivation(categoriesWithoutOverrides),
    directPublishedDerivation(categoriesWithoutOverrides),
  )
})

test("an unknown Category returns null", () => {
  assert.equal(resolveProfessionInterventions("missing-profession"), null)
})

test("invalid and duplicate ProjectGroup references fail clearly", () => {
  const missingGroupSource = fixtureSource()
  missingGroupSource.categories[0]!.projectGroups = ["missing-group"]

  assert.throws(
    () =>
      resolveProfessionInterventions("profession-a", missingGroupSource),
    /Missing projectGroups reference: missing-group/,
  )

  const duplicateGroupSource = fixtureSource()
  duplicateGroupSource.categories[0]!.projectGroups = ["group-a", "group-a"]

  assert.throws(
    () =>
      resolveProfessionInterventions("profession-a", duplicateGroupSource),
    /Duplicate ProjectGroup reference: group-a/,
  )
})

test("invalid Intervention overrides fail through the shared validator", () => {
  const missingInterventionSource = fixtureSource()
  missingInterventionSource.categories[0]!.interventionOverrides = {
    include: ["missing-intervention"],
  }

  assert.throws(
    () =>
      resolveProfessionInterventions(
        "profession-a",
        missingInterventionSource,
      ),
    /Missing Intervention reference: missing-intervention/,
  )

  const duplicateInterventionSource = fixtureSource()
  duplicateInterventionSource.categories[0]!.interventionOverrides = {
    exclude: ["published-a", "published-a"],
  }

  assert.throws(
    () =>
      resolveProfessionInterventions(
        "profession-a",
        duplicateInterventionSource,
      ),
    /Duplicate Intervention reference: published-a/,
  )

  const conflictingInterventionSource = fixtureSource()
  conflictingInterventionSource.categories[0]!.interventionOverrides = {
    include: ["published-a"],
    exclude: ["published-a"],
  }

  assert.throws(
    () =>
      resolveProfessionInterventions(
        "profession-a",
        conflictingInterventionSource,
      ),
    /Intervention cannot be both included and excluded: published-a/,
  )
})
