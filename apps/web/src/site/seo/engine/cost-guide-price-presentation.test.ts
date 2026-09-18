import assert from "node:assert/strict";
import test from "node:test";

import { basePriceRangesByFamily } from "../market-data/pricing/registry";
import { costGuidePricePresentationBySlug } from "../pages/costi/price-presentation";
import { classifyPriceRows } from "../templates/cost-guide-price-model";
import {
  resolveCostGuidePricePresentation,
  resolveCostGuidePricePresentationConfig,
} from "./cost-guide-price-presentation";

test("cost-guide price presentation: every configured rowId resolves to an economic PriceRow", () => {
  for (const [slug, presentation] of Object.entries(costGuidePricePresentationBySlug)) {
    const rows = basePriceRangesByFamily[`costGuide:${slug}`]?.priceRows;
    assert.ok(rows, `missing economic rows for ${slug}`);
    const resolved = resolveCostGuidePricePresentation(slug, rows);
    assert.equal(resolved.scenarios.length, presentation.scenarios?.length ?? 0);
    assert.deepEqual(resolved.extras.map((item) => item.rowId), presentation.extras?.map((item) => item.rowId) ?? []);

    const classification = classifyPriceRows(rows, resolved.breakdownRowIds);
    assert.deepEqual(
      resolved.scenarios.map(({ row }) => row.id),
      classification.scenarioCards.map((row) => row.id),
      `scenario order changed for ${slug}`,
    );
    assert.deepEqual(
      resolved.breakdownRowIds,
      classification.breakdown
        .filter((row) => resolved.breakdownRowIds.includes(row.id))
        .map((row) => row.id),
      `breakdown selection changed for ${slug}`,
    );
  }
});

test("cost-guide price presentation: duplicate rowId in the same section fails fast", () => {
  const rows = basePriceRangesByFamily["costGuide:rifare-tetto"]!.priceRows;
  assert.throws(
    () => resolveCostGuidePricePresentationConfig("test", rows, {
      scenarios: [
        { rowId: "tetto-sostituzione-manto", label: "Comprende", items: [] },
        { rowId: "tetto-sostituzione-manto", label: "Comprende", items: [] },
      ],
    }),
    /duplicate scenario presentation rowId/,
  );
});

test("cost-guide price presentation: missing rowId fails fast", () => {
  const rows = basePriceRangesByFamily["costGuide:rifare-tetto"]!.priceRows;
  assert.throws(
    () => resolveCostGuidePricePresentationConfig("test", rows, {
      extras: [{ rowId: "missing-row", description: "x" }],
    }),
    /references missing PriceRow/,
  );
});
