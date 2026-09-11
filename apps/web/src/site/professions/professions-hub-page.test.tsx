import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { listPublicProfessionHubItems } from "@esigenta/taxonomy/public-professions";

import { ProfessionDirectoryItem } from "./professions-hub-page";

const professions = listPublicProfessionHubItems();

test("catalogo hub conserva tutte le professioni frozen e i relativi href", () => {
  assert.equal(professions.length, 17);
  for (const slug of [
    "termoidraulico",
    "muratore",
    "architetto",
    "ingegnere",
  ]) {
    assert.ok(professions.some((profession) => profession.slug === slug));
  }

  for (const profession of professions) {
    const html = renderToStaticMarkup(
      <ProfessionDirectoryItem profession={profession} />,
    );

    assert.match(html, new RegExp(`href="/professionisti/${profession.slug}"`));
    assert.match(html, new RegExp(profession.shortDescription));
    assert.match(html, new RegExp(`${profession.interventionCount} interventi?`));
    assert.doesNotMatch(html, /→|&rarr;|lucide-arrow/i);
  }
});

test("impresa edile mostra tre ambiti reali e il conteggio residuo", () => {
  const profession = professions.find(({ slug }) => slug === "impresa-edile");
  assert.ok(profession);

  const html = renderToStaticMarkup(
    <ProfessionDirectoryItem profession={profession} />,
  );

  assert.equal(profession.projectGroups.length, 6);
  assert.match(html, /Ristrutturazioni/);
  assert.match(html, /Facciate e balconi/);
  assert.match(html, /Pavimentazioni/);
  assert.match(html, /\+3/);
});
