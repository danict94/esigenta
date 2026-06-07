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
} from "@fixpro/uploads"

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

function toNumber(
  value: unknown,
): number | undefined {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value
  }

  if (typeof value !== "string") {
    return undefined
  }

  const parsed = Number(
    value.replace(",", "."),
  )

  return Number.isFinite(parsed)
    ? parsed
    : undefined
}

function resolveProjectScale(
  draft: RequestDraft,
): RequestDerivedSignals["projectScale"] {
  const surfaceArea =
    toNumber(
      draft.rawAnswers["surface-area"],
    )

  const rooms =
    toNumber(
      draft.rawAnswers.rooms,
    )

  if (
    (surfaceArea !== undefined && surfaceArea >= 80) ||
    (rooms !== undefined && rooms >= 4)
  ) {
    return "large"
  }

  if (
    (surfaceArea !== undefined && surfaceArea >= 25) ||
    (rooms !== undefined && rooms >= 2)
  ) {
    return "medium"
  }

  if (
    (surfaceArea !== undefined && surfaceArea > 0) ||
    (rooms !== undefined && rooms > 0)
  ) {
    return "small"
  }

  return undefined
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
  return Boolean(
    draft.geo.latitude !== undefined ||
      draft.geo.longitude !== undefined ||
      draft.geo.address ||
      draft.geo.city ||
      draft.geo.postalCode,
  )
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

function resolveUrgency(
  draft: RequestDraft,
): RequestDerivedSignals["urgency"] {
  const timing =
    draft.rawAnswers.timing

  switch (timing) {
    case "as_soon_as_possible":
      return "high"

    case "within_7_days":
      return "medium"

    case "within_30_days":
      return "low"

    case "flexible":
    case "evaluating":
      return "low"

    default:
      return undefined
  }
}

function resolveRoutingSignals(
  draft: RequestDraft,
  derivedSignals: RequestDerivedSignals,
): RequestRoutingSignals {
  const timing =
    draft.rawAnswers.timing

  const emergency =
    derivedSignals.urgency === "high" ||
    timing === "as_soon_as_possible"

  const inspectionSuggested =
    derivedSignals.projectScale === "large" ||
    derivedSignals.estimatedComplexity === "high" ||
    draft.rawAnswers.budget === "over_15000"

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
  const projectScale =
    resolveProjectScale(draft)

  const estimatedComplexity =
    resolveComplexity(
      projectScale,
      options.complexity,
    )

  const urgency =
    resolveUrgency(draft)

  const derivedSignals: RequestDerivedSignals = {
    ...draft.derivedSignals,
  }

  if (urgency) {
    derivedSignals.urgency =
      urgency
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
