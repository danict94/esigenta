import assert from "node:assert/strict";
import test from "node:test";

import {
  getPublicProfessionDetail,
  listPublicProfessionCategorySlugs,
  type PublicProfessionDetail,
} from "@esigenta/taxonomy/public-professions";

import {
  composeProfessionDetailViewModel,
  resolveProfessionDetailViewModel,
  type ProfessionDetailComposerDependencies,
} from "./resolve-profession-detail";

function createDetail(
  interventionSlugs: readonly string[],
): PublicProfessionDetail {
  return {
    category: {
      slug: "test-profession",
      name: "Test profession",
      description: null,
    },
    projectGroups: [
      {
        slug: "test-group",
        name: "Test group",
        description: null,
        interventions: interventionSlugs.map((slug) => ({
          slug,
          name: `Name ${slug}`,
          description: null,
        })),
      },
    ],
  };
}

function createDependencies(
  overrides: Partial<ProfessionDetailComposerDependencies> = {},
): ProfessionDetailComposerDependencies {
  return {
    getEditorialContent: () => null,
    getEditorialGroup: (slug) => ({
      slug,
      interventionSummaries: {
        "only-funnel": "Summary only funnel",
        "landing-only": "Summary landing only",
        "landing-cost": "Summary landing and cost",
        "different-cost-slug": "Summary different cost slug",
      },
    }),
    getPublishedInterventionLanding: () => null,
    getPublishedCostGuide: () => null,
    ...overrides,
  };
}

test("composer resolves an Intervention with funnel only", () => {
  const result = composeProfessionDetailViewModel(
    createDetail(["only-funnel"]),
    createDependencies(),
  );

  assert.deepEqual(result.groups[0]?.interventions[0], {
    slug: "only-funnel",
    name: "Name only-funnel",
    summary: "Summary only funnel",
    requestHref: "/richiesta/only-funnel",
    landingHref: null,
    costGuideHref: null,
  });
});

test("composer exposes editorial intro and pricing without deriving content", () => {
  const result = composeProfessionDetailViewModel(
    createDetail(["only-funnel"]),
    createDependencies({
      getEditorialContent: (categorySlug) => ({
        categorySlug,
        intro: {
          paragraphs: ["Primo paragrafo.", "Secondo paragrafo."],
        },
        pricing: {
          heading: "Pricing fixture",
          rows: [
            {
              label: "Tariffa fixture",
              value: "Valore fixture",
            },
          ],
        },
      }),
    }),
  );

  assert.deepEqual(result.editorialContent?.intro?.paragraphs, [
    "Primo paragrafo.",
    "Secondo paragrafo.",
  ]);
  assert.deepEqual(result.editorialContent?.pricing?.rows, [
    { label: "Tariffa fixture", value: "Valore fixture" },
  ]);
});

test("composer resolves a published landing and funnel without inventing a cost guide", () => {
  const result = composeProfessionDetailViewModel(
    createDetail(["landing-only"]),
    createDependencies({
      getPublishedInterventionLanding: (slug) => ({ slug }),
    }),
  );

  assert.equal(
    result.groups[0]?.interventions[0]?.landingHref,
    "/interventi/landing-only",
  );
  assert.equal(result.groups[0]?.interventions[0]?.costGuideHref, null);
  assert.equal(
    result.groups[0]?.interventions[0]?.requestHref,
    "/richiesta/landing-only",
  );
});

test("composer resolves landing, published cost guide and funnel", () => {
  const result = composeProfessionDetailViewModel(
    createDetail(["landing-cost"]),
    createDependencies({
      getPublishedInterventionLanding: (slug) => ({
        slug,
        costSlug: "landing-cost",
      }),
      getPublishedCostGuide: (slug) => ({
        slug,
        interventionSeoSlug: "landing-cost",
      }),
    }),
  );

  assert.deepEqual(result.groups[0]?.interventions[0], {
    slug: "landing-cost",
    name: "Name landing-cost",
    summary: "Summary landing and cost",
    requestHref: "/richiesta/landing-cost",
    landingHref: "/interventi/landing-cost",
    costGuideHref: "/costi/landing-cost",
  });
});

test("cost guide href follows landing.costSlug when it differs from the Intervention slug", () => {
  const result = composeProfessionDetailViewModel(
    createDetail(["different-cost-slug"]),
    createDependencies({
      getPublishedInterventionLanding: (slug) => ({
        slug,
        costSlug: "editorial-cost-slug",
      }),
      getPublishedCostGuide: (slug) => ({
        slug,
        interventionSeoSlug: "different-cost-slug",
      }),
    }),
  );

  assert.equal(
    result.groups[0]?.interventions[0]?.costGuideHref,
    "/costi/editorial-cost-slug",
  );
});

test("a missing or blank editorial summary fails fast", () => {
  const dependencies = createDependencies({
    getEditorialGroup: (slug) => ({
      slug,
      interventionSummaries: { "only-funnel": "   " },
    }),
  });

  assert.throws(
    () =>
      composeProfessionDetailViewModel(
        createDetail(["only-funnel"]),
        dependencies,
      ),
    /Missing editorial summary for Intervention: only-funnel/,
  );
});

test("an incoherent landing or cost registry fails fast", () => {
  assert.throws(
    () =>
      composeProfessionDetailViewModel(
        createDetail(["landing-only"]),
        createDependencies({
          getPublishedInterventionLanding: () => ({ slug: "wrong-landing" }),
        }),
      ),
    /Intervention landing mismatch/,
  );

  assert.throws(
    () =>
      composeProfessionDetailViewModel(
        createDetail(["landing-cost"]),
        createDependencies({
          getPublishedInterventionLanding: (slug) => ({
            slug,
            costSlug: "landing-cost",
          }),
          getPublishedCostGuide: (slug) => ({
            slug,
            interventionSeoSlug: "another-intervention",
          }),
        }),
      ),
    /belongs to another-intervention, not landing-cost/,
  );
});

test("frozen group and Intervention order is preserved", () => {
  const firstGroup = createDetail(["landing-cost", "only-funnel"])
    .projectGroups[0]!;
  const detail: PublicProfessionDetail = {
    category: {
      slug: "test-profession",
      name: "Test profession",
      description: null,
    },
    projectGroups: [
      { ...firstGroup, slug: "first-group", name: "First group" },
      {
        ...firstGroup,
        slug: "second-group",
        name: "Second group",
        interventions: [firstGroup.interventions[1]!],
      },
    ],
  };
  const result = composeProfessionDetailViewModel(
    detail,
    createDependencies(),
  );

  assert.deepEqual(
    result.groups.map((group) => group.slug),
    ["first-group", "second-group"],
  );
  assert.deepEqual(
    result.groups[0]?.interventions.map((intervention) => intervention.slug),
    ["landing-cost", "only-funnel"],
  );
});

test("real registry resolves summaries for all 101 published profession Interventions", () => {
  const details = listPublicProfessionCategorySlugs().map((categorySlug) => {
    const source = getPublicProfessionDetail(categorySlug);
    const resolved = resolveProfessionDetailViewModel(categorySlug);

    assert.ok(source);
    assert.ok(resolved);
    if (categorySlug === "elettricista") {
      assert.equal(resolved.editorialContent?.intro?.paragraphs.length, 2);
      assert.equal(resolved.editorialContent?.pricing?.rows.length, 1);
    } else {
      assert.equal(resolved.editorialContent, null);
    }

    return { source, resolved };
  });

  const sourceCount = details.reduce(
    (total, { source }) =>
      total +
      source.projectGroups.reduce(
        (groupTotal, group) => groupTotal + group.interventions.length,
        0,
      ),
    0,
  );
  const resolvedInterventions = details.flatMap(({ resolved }) =>
    resolved.groups.flatMap((group) => group.interventions),
  );

  assert.equal(sourceCount, 101);
  assert.equal(resolvedInterventions.length, 101);
  assert.ok(
    resolvedInterventions.every((intervention) =>
      Boolean(intervention.summary.trim()),
    ),
  );
});

test("real registry keeps the pavement landing linked to /costi/rifare-pavimenti", () => {
  const detail = resolveProfessionDetailViewModel("impresa-edile");
  assert.ok(detail);

  const intervention = detail.groups
    .flatMap((group) => group.interventions)
    .find(
      (item) => item.slug === "posare-o-rifare-pavimento-interno",
    );

  assert.equal(intervention?.landingHref, "/interventi/posare-o-rifare-pavimento-interno");
  assert.equal(intervention?.costGuideHref, "/costi/rifare-pavimenti");
  assert.equal(
    intervention?.requestHref,
    "/richiesta/posare-o-rifare-pavimento-interno",
  );
});
