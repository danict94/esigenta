import { frozenTaxonomySource } from "./source"
import {
  resolveProfessionInterventionsFromValidatedSource,
  type ResolvedProfessionInterventions,
} from "./shared/resolve-profession-interventions-from-source"
import { validateFrozenTaxonomySource } from "./shared/validators"

import type { FrozenTaxonomySource } from "./source"

export type {
  ResolvedProfessionInterventions,
  ResolvedProfessionProjectGroup,
} from "./shared/resolve-profession-interventions-from-source"

/**
 * Canonical frozen-taxonomy resolver for a profession's effective catalog.
 *
 * Category and ProjectGroup order follow the source exactly. Interventions
 * retain their order inside each ProjectGroup and are exposed only when the
 * canonical publication status is `published`. The optional source keeps the
 * resolver pure and permits focused tests; production callers use the frozen
 * source by default.
 */
export function resolveProfessionInterventions(
  categorySlug: string,
  source: FrozenTaxonomySource = frozenTaxonomySource,
): ResolvedProfessionInterventions | null {
  validateFrozenTaxonomySource(source)

  const normalizedCategorySlug = categorySlug.trim()
  const category = source.categories.find(
    (candidate) => candidate.slug === normalizedCategorySlug,
  )

  if (!category) {
    return null
  }

  return resolveProfessionInterventionsFromValidatedSource(category, source)
}
