import type { PriceRow, PriceRowId } from "./types";

export function isAlternativeTo(
  rows: readonly PriceRow[],
  a: PriceRowId,
  b: PriceRowId,
): boolean {
  const declaresAlternative = (fromId: PriceRowId, toId: PriceRowId): boolean =>
    rows.some(
      (row) =>
        row.id === fromId &&
        (row.relations ?? []).some(
          (relation) => relation.type === "alternativeTo" && relation.target === toId,
        ),
    );

  return declaresAlternative(a, b) || declaresAlternative(b, a);
}
