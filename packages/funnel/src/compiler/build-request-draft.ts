/**
 * Esigenta V2 - Request Draft Builder
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
  RuntimeCapability,
} from "../types/capability"

import type {
  RuntimeAnswers,
} from "../runtime/resolve-step-visibility"

import type {
  RuntimeProfile,
} from "../types/runtime-profile"

import type {
  ResolvedIntervention,
} from "../types/runtime-profile"

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
   * Ordered step definitions for this funnel run. Used to build a
   * human-readable answerDisplay for select-based answers (the funnel owns the
   * chip labels), so consumers don't need to know each intervention's options.
   */
  stepDefinitions?: RuntimeCapability[]

  /**
   * Test-friendly timestamp override.
   */
  createdAt?: Date
}

function buildAnswerDisplay(
  stepDefinitions: RuntimeCapability[] | undefined,
  rawAnswers: RequestDraft["rawAnswers"],
): RequestDraft["answerDisplay"] {
  if (!stepDefinitions) {
    return undefined
  }

  const display: NonNullable<
    RequestDraft["answerDisplay"]
  > = {}

  for (const step of stepDefinitions) {
    const options = step.options

    if (!options || options.length === 0) {
      continue
    }

    if (
      !Object.prototype.hasOwnProperty.call(
        rawAnswers,
        step.id,
      )
    ) {
      continue
    }

    const value = rawAnswers[step.id]

    if (value === undefined || value === null) {
      continue
    }

    const labelFor = (raw: unknown): string =>
      options.find(
        (option) => option.value === raw,
      )?.label ?? String(raw)

    const valueText = Array.isArray(value)
      ? value.map(labelFor).filter(Boolean).join(", ")
      : labelFor(value)

    if (!valueText) {
      continue
    }

    display[step.id] = {
      label: step.question,
      value: valueText,
    }
  }

  return Object.keys(display).length > 0
    ? display
    : undefined
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
  stepDefinitions,
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

  const answerDisplay =
    buildAnswerDisplay(
      stepDefinitions,
      rawAnswers,
    )

  if (answerDisplay) {
    draft.answerDisplay = answerDisplay
  }

  return enrichRequestDraft(
    draft,
    {
      complexity:
        runtimeProfile.complexity,
    },
  )
}
