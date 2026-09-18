import assert from "node:assert/strict";
import test from "node:test";

import { resolveCostGuideToc } from "./cost-guide-toc";

test("cost guide TOC follows the shared section order and omits absent blocks", () => {
  const toc = resolveCostGuideToc({
    scenarios: true,
    extras: false,
    examples: true,
    breakdown: true,
    factors: true,
    insights: true,
    faq: true,
  });

  assert.deepEqual(toc, [
    { id: "scenari-title", label: "Scenari" },
    { id: "esempi-costo-title", label: "Esempi di costo" },
    { id: "lavorazioni-title", label: "Prezzi dettagliati" },
    { id: "fattori-costo-title", label: "Fattori" },
    { id: "approfondimenti-title", label: "Approfondimenti" },
    { id: "seo-faq-title", label: "FAQ" },
  ]);
});
