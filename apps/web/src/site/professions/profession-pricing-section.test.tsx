import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ProfessionPricingSection } from "./profession-pricing-section";

test("pricing assente non produce markup o spazio vuoto", () => {
  assert.equal(
    renderToStaticMarkup(<ProfessionPricingSection pricing={null} />),
    "",
  );
});

test("pricing professionale usa markup semantico e conserva tutti i contenuti", () => {
  const html = renderToStaticMarkup(
    <ProfessionPricingSection
      pricing={{
        heading: "Quanto costa un elettricista?",
        intro: "Introduzione pricing.",
        rows: [
          {
            label: "Tariffa oraria indicativa",
            value: "25–50 €",
            unit: "all’ora",
            note: "Nota della tariffa.",
          },
        ],
        context: "Interventi ordinari",
        factors: ["Zona", "Complessità"],
        disclaimer: "Disclaimer pricing.",
        lastReviewed: "settembre 2026",
      }}
    />,
  );

  assert.match(html, /data-profession-pricing=""/);
  assert.match(html, /<dl/);
  assert.match(html, /<dt/);
  assert.match(html, /<dd/);
  assert.match(html, /Tariffa oraria indicativa/);
  assert.match(html, /25–50 €/);
  assert.match(html, /all’ora/);
  assert.match(html, /Interventi ordinari/);
  assert.match(html, /Può incidere:/);
  assert.match(html, /zona/);
  assert.match(html, /complessità/);
  assert.match(html, /Nota della tariffa\./);
  assert.match(html, /Disclaimer pricing\./);
  assert.match(html, /Aggiornato: settembre 2026/);
  assert.doesNotMatch(html, /<table/);
  assert.doesNotMatch(html, /overflow-x/);
});

test("pricing senza righe non produce una sezione vuota", () => {
  assert.equal(
    renderToStaticMarkup(
      <ProfessionPricingSection
        pricing={{ heading: "Pricing vuoto", rows: [] }}
      />,
    ),
    "",
  );
});
