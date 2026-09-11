import assert from "node:assert/strict";
import test from "node:test";

import { listPublicProfessionsForProjectGroup } from "@esigenta/taxonomy";

import { listSeoGroupLandings } from "../pages/gruppi";
import { resolveGroupLandingPage } from "./resolve-group-page";

test("all 20 service pages use the canonical public profession membership", () => {
  const groupLandings = listSeoGroupLandings();

  assert.equal(groupLandings.length, 20);

  for (const groupLanding of groupLandings) {
    const page = resolveGroupLandingPage(groupLanding.slug);
    const expected = listPublicProfessionsForProjectGroup(
      groupLanding.slug,
    ).map((category) => ({
      slug: category.slug,
      name: category.name,
      href: `/professionisti/${category.slug}`,
    }));

    assert.ok(page);
    assert.deepEqual(page.professionalCategories, expected);
  }

  assert.deepEqual(
    resolveGroupLandingPage("riscaldamento")?.professionalCategories.map(
      ({ slug }) => slug,
    ),
    ["idraulico", "termoidraulico"],
  );
  assert.deepEqual(
    resolveGroupLandingPage("opere-murarie-e-demolizioni")?.professionalCategories.map(
      ({ slug }) => slug,
    ),
    ["impresa-edile", "muratore"],
  );
  assert.deepEqual(
    resolveGroupLandingPage("tecnici-e-pratiche-edilizie")?.professionalCategories.map(
      ({ slug }) => slug,
    ),
    ["geometra", "architetto", "ingegnere"],
  );
});
