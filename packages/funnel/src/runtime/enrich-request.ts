/**
 * Esigenta V2 - Request Enrichment
 *
 * FOUNDATION RUNTIME
 *
 * IMPORTANT:
 * This enriches structured request drafts using runtime answers.
 *
 * It does NOT:
 * - infer taxonomy meaning
 * - perform matching
 * - query providers
 * - persist requests
 * - route emergencies
 *
 * Signal interpretation (scale/action/urgency) lives in the single
 * `resolveRequestSignals` interpreter — this file only maps those primitives
 * onto the draft's derived/routing signals and computes lead quality (which
 * needs whole-draft context: geo/contact/photos/description).
 */

import type {
  RequestDraft,
  RequestDerivedSignals,
  RequestRoutingSignals,
} from "../types/request-draft"

import type {
  RuntimeComplexity,
} from "../types/runtime-profile"

import {
  hasValidRequestPhotos,
} from "@esigenta/uploads"

import {
  resolveRequestSignals,
} from "./resolve-request-signals"

export type EnrichRequestOptions = {
  /**
   * Compiler-provided runtime complexity.
   *
   * IMPORTANT:
   * This comes from acquisition strategy,
   * not frontend inference.
   */
  complexity?: RuntimeComplexity
}

function resolveComplexity(
  projectScale: RequestDerivedSignals["projectScale"],
  fallback?: RuntimeComplexity,
): RequestDerivedSignals["estimatedComplexity"] {
  if (fallback) {
    return fallback
  }

  switch (projectScale) {
    case "large":
      return "high"

    case "medium":
      return "medium"

    case "small":
      return "low"

    default:
      return undefined
  }
}

function hasGeoContext(
  draft: RequestDraft,
): boolean {
  return draft.geo !== null
}

function hasContactContext(
  draft: RequestDraft,
): boolean {
  return Boolean(
    draft.contact.phone ||
      draft.contact.email,
  )
}

function resolveLeadQuality(
  draft: RequestDraft,
  derivedSignals: RequestDerivedSignals,
): NonNullable<
  RequestDerivedSignals["leadQuality"]
> {
  let score = 0

  if (hasGeoContext(draft)) {
    score += 2
  }

  if (hasContactContext(draft)) {
    score += 2
  }

  if (
    hasValidRequestPhotos(
      draft.rawAnswers.photos,
    )
  ) {
    score += 1
  }

  if (derivedSignals.projectScale) {
    score += 1
  }

  if (draft.customerDescription) {
    score += 1
  }

  if (score >= 5) {
    return "high"
  }

  if (score >= 3) {
    return "medium"
  }

  return "low"
}

function resolveRoutingSignals(
  draft: RequestDraft,
  derivedSignals: RequestDerivedSignals,
): RequestRoutingSignals {
  const emergency =
    derivedSignals.urgency === "high"

  const inspectionSuggested =
    derivedSignals.projectScale === "large" ||
    derivedSignals.estimatedComplexity === "high"

  return {
    emergency,
    geoResolved:
      hasGeoContext(draft),
    inspectionSuggested,
  }
}

/**
 * Enrich a structured request draft with lightweight runtime signals.
 */
export function enrichRequestDraft(
  draft: RequestDraft,
  options: EnrichRequestOptions = {},
): RequestDraft {
  const signals =
    resolveRequestSignals(draft.rawAnswers)

  const projectScale = signals.scale

  const estimatedComplexity =
    resolveComplexity(
      projectScale,
      options.complexity,
    )

  const derivedSignals: RequestDerivedSignals = {
    ...draft.derivedSignals,
  }

  if (signals.urgency) {
    derivedSignals.urgency =
      signals.urgency
  }

  if (projectScale) {
    derivedSignals.projectScale =
      projectScale
  }

  if (estimatedComplexity) {
    derivedSignals.estimatedComplexity =
      estimatedComplexity
  }

  derivedSignals.leadQuality =
    resolveLeadQuality(
      draft,
      derivedSignals,
    )

  return {
    ...draft,
    derivedSignals,
    routingSignals:
      resolveRoutingSignals(
        draft,
        derivedSignals,
      ),
  }
}
