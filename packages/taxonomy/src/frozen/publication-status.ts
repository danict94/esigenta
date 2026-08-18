import { frozenTaxonomySource } from "./source"

import type { FrozenProjectGroup, InterventionPublicationStatus } from "./source"

/**
 * Test-fix 2026-08: core lookup extracted so the "draft" branch can be unit
 * tested against a synthetic fixture (see publication-status.test.ts) —
 * frozen taxonomy currently has zero draft Interventions (the one that used
 * to be the canonical example, impermeabilizzare-terrazzo, is now
 * published), so there is no real slug left to exercise this branch with.
 * Purely additive: the two functions below keep their exact original
 * signature/behavior for every real caller (always called with the real
 * frozen data), nothing about runtime behavior changes.
 */
export function findInterventionPublicationStatus(
  projectGroups: readonly FrozenProjectGroup[],
  slug: string,
): InterventionPublicationStatus | null {
  for (const projectGroup of projectGroups) {
    const intervention = projectGroup.interventions.find(
      (candidate) => candidate.slug === slug,
    )

    if (intervention) {
      return intervention.publicationStatus
    }
  }

  return null
}

/**
 * Single canonical lookup for an Intervention's publicationStatus, read
 * straight from the frozen SSOT (no DB round trip). Every build-time gate
 * that needs to know "is this intervention public" — /interventi,
 * /costi, their static params, sitemap, relatedWork validation — goes
 * through this one function instead of re-implementing the group scan.
 *
 * Returns null when the slug does not exist in the frozen taxonomy at all
 * (a genuinely different problem than "exists but draft" — callers should
 * usually treat both null and "draft" as "not publicly reachable", but the
 * distinction matters for error messages).
 */
export function getInterventionPublicationStatus(
  slug: string,
): InterventionPublicationStatus | null {
  return findInterventionPublicationStatus(frozenTaxonomySource.projectGroups, slug)
}

/** Convenience boolean wrapper: true only when the slug exists AND is published. */
export function isInterventionPublished(slug: string): boolean {
  return getInterventionPublicationStatus(slug) === "published"
}
