import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ProfessionBusinessCta } from "./profession-business-cta";

test("CTA professionista usa la route reale di iscrizione", () => {
  const html = renderToStaticMarkup(
    <ProfessionBusinessCta professionName="Elettricista" />,
  );

  assert.match(html, /Sei un elettricista\?/);
  assert.match(
    html,
    /Fai conoscere la tua attività su Esigenta e ricevi opportunità\s+compatibili con i lavori che svolgi\./,
  );
  assert.match(html, /bg-eg-header/);
  assert.match(html, /bg-eg-header-action/);
  assert.match(html, /href="\/area-impresa\/iscriviti"/);
});

test("CTA professionista gestisce l'articolo di impresa edile", () => {
  const html = renderToStaticMarkup(
    <ProfessionBusinessCta professionName="Impresa edile" />,
  );

  assert.match(html, /Sei un’impresa edile\?/);
});
