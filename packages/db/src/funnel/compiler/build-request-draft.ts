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
  RequestContactDraft,
  RequestDraft,
  RequestGeoDraft,
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

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value),
  )
}

function asString(
  value: unknown,
): string | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed =
    value.trim()

  return trimmed
    ? trimmed
    : undefined
}

function asNumber(
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

function buildFullName({
  firstName,
  lastName,
}: {
  firstName: string | undefined
  lastName: string | undefined
}): string | undefined {
  const fullName =
    [firstName, lastName]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(" ")

  return fullName || undefined
}

function normalizeGeo(
  value: unknown,
): RequestGeoDraft {
  const geo: RequestGeoDraft = {}

  const address =
    asString(value)

  if (address) {
    geo.address = address

    return geo
  }

  if (!isRecord(value)) {
    return geo
  }

  const normalizedAddress =
    asString(value.address)

  const city =
    asString(value.city)

  const cap =
    asString(value.postalCode) ??
    asString(value.cap)

  const lat =
    asNumber(value.latitude) ??
    asNumber(value.lat)

  const lng =
    asNumber(value.longitude) ??
    asNumber(value.lng)

  if (normalizedAddress) {
    geo.address =
      normalizedAddress
  }

  if (city) {
    geo.city = city
  }

  if (cap) {
    geo.postalCode = cap
  }

  if (lat !== undefined) {
    geo.latitude = lat
  }

  if (lng !== undefined) {
    geo.longitude = lng
  }

  return geo
}

function normalizeContact(
  value: unknown,
): RequestContactDraft {
  const contact: RequestContactDraft = {}

  const text =
    asString(value)

  if (text) {
    if (text.includes("@")) {
      contact.email = text
    } else {
      contact.phone = text
    }

    return contact
  }

  if (!isRecord(value)) {
    return contact
  }

  const name =
    asString(value.name)

  const firstName =
    asString(value.firstName) ??
    asString(value.nome)

  const lastName =
    asString(value.lastName) ??
    asString(value.cognome) ??
    asString(value.surname) ??
    asString(value.familyName)

  const normalizedFirstName =
    firstName

  const normalizedLastName =
    lastName

  const fullName =
    buildFullName({
      firstName:
        normalizedFirstName,
      lastName:
        normalizedLastName,
    }) ?? name

  const phone =
    asString(value.phone)

  const email =
    asString(value.email)

  if (normalizedFirstName) {
    contact.firstName =
      normalizedFirstName
  }

  if (normalizedLastName) {
    contact.lastName =
      normalizedLastName
  }

  if (fullName) {
    contact.name = fullName
  }

  if (phone) {
    contact.phone = phone
  }

  if (email) {
    contact.email = email
  }

  return contact
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
    normalizeContact(
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
      normalizeGeo(
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
    asString(originalQuery)

  if (query) {
    draft.originalQuery = query
  }

  const description =
    asString(customerDescription)

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
