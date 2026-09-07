import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { buildCostHubCategoryGroups } from "../engine/cost-hub";
import {
  CostHubCatalog,
  filterCostHubCategories,
  type CostHubCatalogCategory,
} from "./cost-hub-catalog";

const categories: readonly CostHubCatalogCategory[] = [
  {
    slug: "ristrutturazioni",
    name: "Ristrutturazioni",
    guides: [
      {
        slug: "bagno",
        href: "/costi/bagno",
        title: "Quanto costa ristrutturare un bagno?",
        summary: "Summary bagno.",
        sourceType: "mixed",
      },
    ],
  },
  {
    slug: "tetti",
    name: "Tetti",
    guides: [
      {
        slug: "tetto",
        href: "/costi/tetto",
        title: "Quanto costa rifare un tetto?",
        summary: "Summary tetto.",
        sourceType: "official",
      },
    ],
  },
];

test("il filtro mostra tutte le famiglie o soltanto quella selezionata", () => {
  assert.deepEqual(filterCostHubCategories(categories, "all"), categories);
  assert.deepEqual(filterCostHubCategories(categories, "tetti"), [categories[1]]);
  assert.deepEqual(filterCostHubCategories(categories, "sconosciuta"), []);
});

test("famiglie e conteggi pubblici sono derivati dal registry reale", () => {
  const realCategories = buildCostHubCategoryGroups();

  assert.equal(realCategories.length, 4);
  assert.equal(
    realCategories.reduce(
      (total, category) => total + category.guides.length,
      0,
    ),
    7,
  );
  assert.deepEqual(
    realCategories.map(({ slug }) => slug),
    [
      "ristrutturazioni",
      "tetti-e-facciate",
      "impianti-e-manutenzioni-elettriche",
      "pavimenti-e-rivestimenti",
    ],
  );
});

test("il catalogo iniziale rende guide, href e fonte solo quando ufficiale", () => {
  const html = renderToStaticMarkup(<CostHubCatalog categories={categories} />);

  assert.match(html, /Tutte le guide/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /href="\/costi\/bagno"/);
  assert.match(html, /href="\/costi\/tetto"/);
  assert.equal((html.match(/prezzario ufficiale/g) ?? []).length, 1);
  assert.doesNotMatch(html, /Fascia orientativa/);
});
