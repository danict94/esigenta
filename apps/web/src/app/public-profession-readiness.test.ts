import assert from "node:assert/strict";
import test from "node:test";

import { listPublicProfessionCategorySlugs } from "@esigenta/taxonomy/public-professions";

import { generateStaticParams } from "./professionisti/[categorySlug]/page";
import sitemap from "./sitemap";

test("profession static params use the canonical public profession list", () => {
  const expectedSlugs = [...listPublicProfessionCategorySlugs()];

  assert.equal(expectedSlugs.length, 17);
  assert.ok(expectedSlugs.includes("termoidraulico"));
  assert.ok(expectedSlugs.includes("muratore"));
  assert.ok(expectedSlugs.includes("architetto"));
  assert.ok(expectedSlugs.includes("ingegnere"));
  assert.deepEqual(
    generateStaticParams().map(({ categorySlug }) => categorySlug),
    expectedSlugs,
  );
});

test("profession sitemap entries use the canonical public profession list", () => {
  const expectedPaths = listPublicProfessionCategorySlugs().map(
    (slug) => `/professionisti/${slug}`,
  );
  const professionPaths = sitemap()
    .map((entry) => new URL(entry.url).pathname)
    .filter((path) => path.startsWith("/professionisti/"));

  assert.equal(expectedPaths.length, 17);
  assert.ok(professionPaths.includes("/professionisti/termoidraulico"));
  assert.ok(professionPaths.includes("/professionisti/muratore"));
  assert.ok(professionPaths.includes("/professionisti/architetto"));
  assert.ok(professionPaths.includes("/professionisti/ingegnere"));
  assert.deepEqual(professionPaths, expectedPaths);
});
