import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ProfessionHeroCopy } from "./profession-hero-copy";

test("hero professione conserva lead, continuazione e nota in elementi separati", () => {
  const html = renderToStaticMarkup(
    <ProfessionHeroCopy
      intro={{
        lead: "Lead principale.",
        paragraphs: ["Continuazione."],
        note: "Nota secondaria.",
      }}
    />,
  );

  assert.match(html, /data-profession-hero-copy=""/);
  assert.equal((html.match(/<p/g) ?? []).length, 3);
  assert.ok(html.indexOf("Lead principale.") < html.indexOf("Continuazione."));
  assert.ok(html.indexOf("Continuazione.") < html.indexOf("Nota secondaria."));
  assert.doesNotMatch(html, /<br/);
});
