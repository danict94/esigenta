import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { RequestCtaPanel } from "../../../templates/request-cta-panel";
import { rifareImpiantoElettricoLanding } from "./content";

test("la landing rifare impianto elettrico mantiene ownership sull'intervento", () => {
  assert.equal(
    rifareImpiantoElettricoLanding.metaTitle,
    "Rifare l’impianto elettrico: intervento e preventivi | Esigenta",
  );
  assert.equal(
    rifareImpiantoElettricoLanding.h1,
    "Rifare l’impianto elettrico: cosa comprende il lavoro",
  );
  assert.equal(
    rifareImpiantoElettricoLanding.geoSection.title,
    "Preventivi per rifare il tuo impianto elettrico",
  );

  const ownershipCopy = [
    rifareImpiantoElettricoLanding.metaTitle,
    rifareImpiantoElettricoLanding.metaDescription,
    rifareImpiantoElettricoLanding.h1,
    rifareImpiantoElettricoLanding.description,
    rifareImpiantoElettricoLanding.geoSection.title,
    rifareImpiantoElettricoLanding.geoSection.summary,
  ].join(" ");

  assert.doesNotMatch(
    ownershipCopy,
    /trova elettricist|cerca elettricist|elettricisti nella tua zona|tariffa elettricista/iu,
  );
});

test("il pannello usa l'override locale senza cambiare il fallback condiviso", () => {
  const overrideHtml = renderToStaticMarkup(
    <RequestCtaPanel
      requestHref="/richiesta/rifare-impianto-elettrico"
      ctaLabel="Richiedi preventivi"
      title={rifareImpiantoElettricoLanding.requestPanelTitle}
    />,
  );
  const fallbackHtml = renderToStaticMarkup(
    <RequestCtaPanel
      requestHref="/richiesta/intervento-test"
      ctaLabel="Richiedi preventivi"
    />,
  );

  assert.match(overrideHtml, /Completa la richiesta per questo intervento/);
  assert.doesNotMatch(overrideHtml, /Trova professionisti nella tua zona/);
  assert.match(fallbackHtml, /Trova professionisti nella tua zona/);
});
