import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  compactProfessionInterventionSummary,
  ProfessionInterventionItem,
} from "./profession-intervention-item";

const baseProps = {
  slug: "intervento-test",
  name: "Intervento test",
  summary: "Summary editoriale esistente.",
  requestHref: "/richiesta/intervento-test",
  landingHref: null,
  costGuideHref: null,
} as const;

test("profession item mostra solo la CTA richiesta quando non esistono approfondimenti", () => {
  const html = renderToStaticMarkup(
    <ProfessionInterventionItem {...baseProps} />,
  );

  assert.match(html, /Intervento test/);
  assert.match(html, /data-profession-intervention-item=""/);
  assert.match(html, /Summary editoriale esistente\./);
  assert.match(html, /href="\/richiesta\/intervento-test"/);
  assert.doesNotMatch(html, />Scopri</);
  assert.doesNotMatch(html, /Guida ai costi/);
});

test("profession item mostra landing, costi e richiesta nell'ordine previsto", () => {
  const html = renderToStaticMarkup(
    <ProfessionInterventionItem
      {...baseProps}
      landingHref="/interventi/intervento-test"
      costGuideHref="/costi/intervento-test"
    />,
  );

  const discoverPosition = html.indexOf(">Scopri</a>");
  const costPosition = html.indexOf(">Guida ai costi</a>");
  const requestPosition = html.indexOf("Richiedi preventivi");

  assert.ok(discoverPosition >= 0);
  assert.ok(discoverPosition < costPosition);
  assert.ok(costPosition < requestPosition);
});

test("summary professione rimuove solo boilerplate ed esempi senza cambiare il significato", () => {
  assert.equal(
    compactProfessionInterventionSummary(
      "Il percorso giusto per realizzare un impianto elettrico completamente nuovo, ad esempio in una costruzione da zero.",
    ),
    "Realizzare un impianto elettrico completamente nuovo.",
  );
  assert.equal(
    compactProfessionInterventionSummary(
      "Usa questo percorso per un intervento urgente in caso di guasto elettrico, come mancanza di corrente o cortocircuito.",
    ),
    "Un intervento urgente in caso di guasto elettrico.",
  );
  assert.equal(
    compactProfessionInterventionSummary(
      "Descrizione già diretta e compatta.",
    ),
    "Descrizione già diretta e compatta.",
  );
});
