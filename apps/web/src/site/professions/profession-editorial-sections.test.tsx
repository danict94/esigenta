import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ProfessionEditorialSections } from "./profession-editorial-sections";

test("sezioni editoriali assenti non producono markup", () => {
  assert.equal(
    renderToStaticMarkup(<ProfessionEditorialSections sections={[]} />),
    "",
  );
});

test("sezioni editoriali future conservano paragrafi e punti nell'ordine dichiarato", () => {
  const html = renderToStaticMarkup(
    <ProfessionEditorialSections
      sections={[
        {
          heading: "Quando rivolgersi a un professionista",
          paragraphs: ["Primo paragrafo."],
        },
        {
          kind: "how-to-choose",
          heading: "Come scegliere un professionista",
          items: [
            "Primo criterio.",
            "Secondo criterio.",
            "Terzo criterio.",
          ],
        },
      ]}
    />,
  );

  assert.match(html, /data-profession-editorial-sections=""/);
  assert.ok(
    html.indexOf("Quando rivolgersi a un professionista") <
      html.indexOf("Come scegliere un professionista"),
  );
  assert.ok(html.indexOf("Primo criterio.") < html.indexOf("Secondo criterio."));
  assert.ok(html.indexOf("Secondo criterio.") < html.indexOf("Terzo criterio."));
  assert.match(html, /lucide-shield-check/);
  assert.match(html, /lucide-file-text/);
  assert.match(html, /lucide-badge-check/);
});
