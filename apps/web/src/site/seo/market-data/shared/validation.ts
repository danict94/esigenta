import type { BasePriceRange } from "./types";

const PRICE_ROW_ID_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
export function validatePriceRowIntegrity(
  byFamily: Record<string, BasePriceRange>,
): void {
  const idToFamily = new Map<string, string>();

  for (const [familyKey, range] of Object.entries(byFamily)) {
    for (const row of range.priceRows) {
      if (!row.id) {
        throw new Error(
          `PriceRow "${row.label}" in family "${familyKey}" has no id: every PriceRow must declare a stable id.`,
        );
      }
      if (!PRICE_ROW_ID_PATTERN.test(row.id)) {
        throw new Error(
          `PriceRow id "${row.id}" (family "${familyKey}") is not valid kebab-case.`,
        );
      }

      const existingFamily = idToFamily.get(row.id);
      if (existingFamily) {
        throw new Error(
          existingFamily === familyKey
            ? `Duplicate PriceRow id "${row.id}" within family "${familyKey}".`
            : `PriceRow id "${row.id}" is used in both "${existingFamily}" and "${familyKey}": ids must be globally unique across the whole SSOT.`,
        );
      }
      idToFamily.set(row.id, familyKey);
    }
  }

  for (const [familyKey, range] of Object.entries(byFamily)) {
    for (const row of range.priceRows) {
      const relations = row.relations ?? [];
      const seenRelations = new Set<string>();

      for (const relation of relations) {
        const relationKey = `${relation.type}:${relation.target}`;
        if (seenRelations.has(relationKey)) {
          throw new Error(
            `PriceRow "${row.id}" (family "${familyKey}") declares the relation "${relationKey}" more than once.`,
          );
        }
        seenRelations.add(relationKey);

        if (relation.target === row.id) {
          throw new Error(
            `PriceRow "${row.id}" (family "${familyKey}") declares a relation targeting itself.`,
          );
        }

        const targetFamily = idToFamily.get(relation.target);
        if (!targetFamily) {
          throw new Error(
            `PriceRow "${row.id}" (family "${familyKey}") declares a relation targeting unknown id "${relation.target}".`,
          );
        }
        if (targetFamily !== familyKey) {
          throw new Error(
            `PriceRow "${row.id}" (family "${familyKey}") declares a relation targeting "${relation.target}", which belongs to family "${targetFamily}": relation targets must belong to the same family.`,
          );
        }
      }

      if (row.role === "extra" && relations.length > 0) {
        const hasAddsTo = relations.some((relation) => relation.type === "addsTo");
        if (!hasAddsTo) {
          throw new Error(
            `PriceRow "${row.id}" (family "${familyKey}") has role "extra" and declares relations, but none is "addsTo".`,
          );
        }
      }
    }
  }
}

