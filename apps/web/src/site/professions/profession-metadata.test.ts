import assert from "node:assert/strict";
import test from "node:test";

import { listPublicProfessionCategorySlugs } from "@esigenta/taxonomy/public-professions";

import { buildProfessionSeoMetadata } from "./profession-metadata";
import { resolveProfessionDetailViewModel } from "./resolve-profession-detail";

test("elettricista usa l'override SEO editoriale approvato", () => {
  const page = resolveProfessionDetailViewModel("elettricista");
  assert.ok(page);

  assert.deepEqual(buildProfessionSeoMetadata(page), {
    title: "Trova un elettricista e confronta preventivi | Esigenta",
    description:
      "Trova un elettricista per i lavori di casa, consulta la tariffa oraria indicativa e richiedi preventivi per confrontare le soluzioni disponibili.",
    canonical: "/professionisti/elettricista",
  });
});

test("le altre professioni usano un fallback neutro senza elenchi di interventi", () => {
  for (const categorySlug of listPublicProfessionCategorySlugs()) {
    if (categorySlug === "elettricista") continue;

    const page = resolveProfessionDetailViewModel(categorySlug);
    assert.ok(page);

    const metadata = buildProfessionSeoMetadata(page);

    assert.equal(
      metadata.title,
      `${page.category.name}: ambiti, interventi e preventivi | Esigenta`,
    );
    assert.equal(
      metadata.description,
      `Scopri gli ambiti e gli interventi associati alla categoria professionale “${page.category.name}” e richiedi preventivi per i lavori di casa.`,
    );
    assert.equal(metadata.canonical, `/professionisti/${categorySlug}`);

    for (const intervention of page.groups.flatMap(
      (group) => group.interventions,
    )) {
      assert.equal(
        metadata.description
          .toLocaleLowerCase("it")
          .includes(intervention.name.toLocaleLowerCase("it")),
        false,
      );
    }
  }
});
