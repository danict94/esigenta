import { frozenTaxonomySource } from "./source"
import { validateFrozenTaxonomySource } from "./shared/validators"

import type { FrozenCategory, FrozenTaxonomySource } from "./source"

/**
 * Canonical public-readiness gate for frozen professions. Source order is
 * preserved. Absence of `isPublic` is backward-compatible and means public.
 */
export function listPublicProfessions(
  source: FrozenTaxonomySource = frozenTaxonomySource,
): readonly FrozenCategory[] {
  validateFrozenTaxonomySource(source)

  return source.categories.filter((category) => category.isPublic !== false)
}
