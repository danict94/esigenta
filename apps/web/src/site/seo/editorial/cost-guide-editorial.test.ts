import assert from "node:assert/strict";
import test from "node:test";

import { buildCostGuideArticleJsonLd } from "../engine/schema-builder";
import { listSeoIndexablePaths } from "../engine/sitemap";
import { listCostGuides } from "../pages/costi";
import { resolveCostGuideEditorial } from "./cost-guide-editorial";

test("every cost guide has chronological editorial dates shared by metadata and Article JSON-LD", () => {
  const guides = listCostGuides();
  const sitemapLastModifiedByPath = new Map(
    listSeoIndexablePaths().map((entry) => [entry.path, entry.lastModified]),
  );
  assert.equal(guides.length, 7);

  for (const guide of guides) {
    const editorial = resolveCostGuideEditorial(guide.editorial, guide.lastModified);
    assert.ok(editorial.datePublished, `${guide.slug}: missing datePublished`);
    assert.ok(editorial.dateModified, `${guide.slug}: missing dateModified`);
    assert.ok(
      editorial.datePublished <= editorial.dateModified,
      `${guide.slug}: datePublished must not be after dateModified`,
    );

    const article = buildCostGuideArticleJsonLd({
      guide,
      datePublished: editorial.datePublished,
      dateModified: editorial.dateModified,
    }) as { datePublished: string; dateModified: string };

    assert.equal(article.datePublished, editorial.datePublished);
    assert.equal(article.dateModified, guide.lastModified);
    assert.equal(sitemapLastModifiedByPath.get(guide.canonicalPath), guide.lastModified);
  }
});
