import type { PriceRow } from "../market-data/shared/types";
import { costGuidePricePresentationBySlug } from "../pages/costi/price-presentation";
import type {
  CostGuidePricePresentation,
  ResolvedCostGuidePricePresentation,
} from "../pages/costi/types";

const emptyPresentation: ResolvedCostGuidePricePresentation = {
  scenarios: [],
  extras: [],
  breakdownRowIds: [],
};

function assertUniqueRowIds(
  entries: readonly { rowId: string }[],
  section: string,
  guideSlug: string,
): void {
  const ids = new Set<string>();

  for (const entry of entries) {
    if (ids.has(entry.rowId)) {
      throw new Error(`Cost guide "${guideSlug}" has duplicate ${section} presentation rowId "${entry.rowId}"`);
    }
    ids.add(entry.rowId);
  }
}

export function resolveCostGuidePricePresentationConfig(
  guideSlug: string,
  rows: readonly PriceRow[],
  presentation: CostGuidePricePresentation | undefined,
): ResolvedCostGuidePricePresentation {
  if (!presentation) return emptyPresentation;

  const byId = new Map(rows.map((row) => [row.id, row]));
  const scenarios = presentation.scenarios ?? [];
  const extras = presentation.extras ?? [];
  const breakdown = presentation.breakdown ?? [];

  assertUniqueRowIds(scenarios, "scenario", guideSlug);
  assertUniqueRowIds(extras, "extra", guideSlug);
  assertUniqueRowIds(breakdown, "breakdown", guideSlug);

  const resolveRow = (rowId: string): PriceRow => {
    const row = byId.get(rowId);
    if (!row) throw new Error(`Cost guide "${guideSlug}" presentation references missing PriceRow "${rowId}"`);
    return row;
  };

  return {
    scenarios: scenarios.map((item) => ({ row: resolveRow(item.rowId), presentation: item })),
    extras: extras.map((item) => {
      resolveRow(item.rowId);
      return item;
    }),
    breakdownRowIds: breakdown.filter((item) => item.show).map((item) => resolveRow(item.rowId).id),
  };
}

export function resolveCostGuidePricePresentation(
  guideSlug: string,
  rows: readonly PriceRow[],
): ResolvedCostGuidePricePresentation {
  return resolveCostGuidePricePresentationConfig(
    guideSlug,
    rows,
    costGuidePricePresentationBySlug[guideSlug],
  );
}
