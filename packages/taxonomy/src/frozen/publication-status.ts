import { frozenTaxonomySource } from "./source"

import type { InterventionPublicationStatus } from "./source"

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
  for (const projectGroup of frozenTaxonomySource.projectGroups) {
    const intervention = projectGroup.interventions.find(
      (candidate) => candidate.slug === slug,
    )

    if (intervention) {
      return intervention.publicationStatus
    }
  }

  return null
}

/** Convenience boolean wrapper: true only when the slug exists AND is published. */
export function isInterventionPublished(slug: string): boolean {
  return getInterventionPublicationStatus(slug) === "published"
}
