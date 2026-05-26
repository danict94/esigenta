/**
 * FixPro V2 - Request Draft Builder
 *
 * FOUNDATION COMPILER
 *
 * IMPORTANT:
 * This builds a structured request draft AFTER taxonomy resolution.
 *
 * It does NOT:
 * - resolve interventions
 * - traverse taxonomy
 * - duplicate aliases
 * - persist requests
 * - perform matching
 * - implement frontend behavior
 */

import type {
  RequestDraft,
} from "../types/request-draft"

import type {
  RuntimeAnswers,
} from "../runtime/resolve-step-visibility"

import type {
  RuntimeProfile,
} from "../types/runtime-profile"

import type {
  ResolvedIntervention,
} from "./resolve-runtime-profile"

import {
  enrichRequestDraft,
} from "../runtime/enrich-request"

import {
  assertValidRuntimeProfile,
} from "../runtime/validate-runtime"

import {
  normalizeRuntimeContactAnswer,
  normalizeRuntimeLocationAnswer,
  normalizeRuntimeText,
} from "../normalization"

export type BuildRequestDraftInput = {
  /**
   * Taxonomy semantic resolution output.
   *
   * IMPORTANT:
   * This must come from taxonomy runtime/search resolution.
   */
  resolved: ResolvedIntervention

  /**
   * Compiled runtime acquisition profile.
   */
  runtimeProfile: RuntimeProfile

  /**
   * Runtime answers collected by the adaptive wizard.
   */
  answers?: RuntimeAnswers

  /**
   * Original user query, preserved for analytics/enrichment.
   */
  originalQuery?: string

  /**
   * Free-form customer description collected near the end.
   */
  customerDescription?: string

  /**
   * Test-friendly timestamp override.
   */
  createdAt?: Date
}

function sortedUnique(
  values: string[],
): string[] {
  return Array.from(
    new Set(
      values.filter(
        (value) => value.trim(),
      ),
    ),
  ).sort()
}

function pickActiveAnswers(
  profile: RuntimeProfile,
  answers: RuntimeAnswers,
): RequestDraft["rawAnswers"] {
  const rawAnswers: RequestDraft["rawAnswers"] = {}

  for (const capability of profile.capabilities) {
    if (
      Object.prototype.hasOwnProperty.call(
        answers,
        capability,
      )
    ) {
      rawAnswers[capability] =
        answers[capability]
    }
  }

  return rawAnswers
}

/**
 * Build a normalized request draft from:
 *
 * taxonomy semantic resolution
 * + runtime acquisition profile
 * + runtime answers
 */
export function buildRequestDraft({
  resolved,
  runtimeProfile,
  answers = {},
  originalQuery,
  customerDescription,
  createdAt,
}: BuildRequestDraftInput): RequestDraft {
  assertValidRuntimeProfile(
    runtimeProfile,
  )

  if (
    runtimeProfile.interventionSlug !==
    resolved.interventionSlug
  ) {
    throw new Error(
      "Runtime profile intervention does not match taxonomy resolution.",
    )
  }

  const rawAnswers =
    pickActiveAnswers(
      runtimeProfile,
      answers,
    )

  const contact =
    normalizeRuntimeContactAnswer(
      rawAnswers.contact,
    )

  if (
    runtimeProfile.capabilities.includes(
      "contact",
    ) ||
    Object.prototype.hasOwnProperty.call(
      rawAnswers,
      "contact",
    )
  ) {
    rawAnswers.contact = contact
  }

  const draft: RequestDraft = {
    interventionSlug:
      resolved.interventionSlug,

    rawAnswers,

    geo:
      normalizeRuntimeLocationAnswer(
        rawAnswers.location,
      ),

    contact,

    derivedSignals: {},

    routingSignals: {},

    matchingSignals: {
      requiredServiceSlugs:
        sortedUnique(
          resolved.serviceSlugs,
        ),

      categorySlugs:
        sortedUnique(
          resolved.categorySlugs,
        ),
    },

    createdAt:
      createdAt ?? new Date(),
  }

  const query =
    normalizeRuntimeText(originalQuery)

  if (query) {
    draft.originalQuery = query
  }

  const description =
    normalizeRuntimeText(
      customerDescription,
    )

  if (description) {
    draft.customerDescription =
      description
  }

  return enrichRequestDraft(
    draft,
    {
      complexity:
        runtimeProfile.complexity,
    },
  )
}
