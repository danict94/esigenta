import { frozenTaxonomySource } from "./source"
import { validateFrozenTaxonomySource } from "./shared/validators"

import type { FrozenCategory, FrozenTaxonomySource } from "./source"

/**
 * Canonical company-facing profession catalog. Public SEO readiness is not a
 * company-operability gate: every valid frozen Category is selectable by a
 * company, including professions whose public page is not ready yet.
 */
export function listCompanyProfessions(
  source: FrozenTaxonomySource = frozenTaxonomySource,
): readonly FrozenCategory[] {
  validateFrozenTaxonomySource(source)

  return source.categories
}
