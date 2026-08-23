import {
  isGeoPlace,
} from "@esigenta/shared"

import type {
  RuntimeCapability,
} from "../types/capability"

import type {
  RequestContactDraft,
  RequestGeoDraft,
} from "../types/request-draft"

import type {
  RuntimeAnswers,
} from "../runtime/resolve-step-visibility"

import type {
  RuntimeCapabilityId,
} from "../types/runtime-profile"

export type RuntimeContactAnswerField =
  | "firstName"
  | "lastName"
  | "name"
  | "phone"
  | "email"

export type RuntimeContactAnswerPresence = {
  shape: string
  hasName: boolean
  hasFirstName: boolean
  hasLastName: boolean
  hasPhone: boolean
  hasEmail: boolean
}

export type RuntimeLocationAnswerPresence = {
  shape: string
  isCompleteGeoPlace: boolean
  isManualLocationPreview: boolean
}

function isRuntimeRecord(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value),
  )
}

function readRawString(
  value: unknown,
): string | undefined {
  return typeof value === "string"
    ? value
    : undefined
}

export function normalizeRuntimeText(
  value: unknown,
): string | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed =
    value.trim()

  return trimmed || undefined
}

function splitLegacyContactName(
  value: string,
): {
  firstName?: string
  lastName?: string
} {
  const parts =
    value.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return {}
  }

  if (parts.length === 1) {
    const firstName = parts[0]

    if (!firstName) {
      return {}
    }

    return {
      firstName,
    }
  }

  const firstName = parts[0]

  return {
    ...(firstName
      ? {
          firstName,
        }
      : {}),
    lastName: parts.slice(1).join(" "),
  }
}

export function buildRuntimeContactName({
  firstName,
  lastName,
  name,
}: {
  firstName: string | undefined
  lastName: string | undefined
  name?: string | undefined
}): string | undefined {
  const hasStructuredName =
    Boolean(firstName || lastName)

  if (!hasStructuredName) {
    return name
  }

  return [firstName, lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ") || undefined
}

export function readRuntimeContactAnswer(
  value: unknown,
): RequestContactDraft {
  const text =
    readRawString(value)

  if (text) {
    return text.includes("@")
      ? {
          email: text,
        }
      : {
          phone: text,
        }
  }

  if (!isRuntimeRecord(value)) {
    return {}
  }

  const legacyName =
    readRawString(value.name) ?? ""

  const legacyParts =
    splitLegacyContactName(legacyName)

  const firstName =
    readRawString(value.firstName) ??
    readRawString(value.nome) ??
    legacyParts.firstName ??
    ""

  const lastName =
    readRawString(value.lastName) ??
    readRawString(value.cognome) ??
    readRawString(value.surname) ??
    readRawString(value.familyName) ??
    legacyParts.lastName ??
    ""

  const name =
    buildRuntimeContactName({
      firstName,
      lastName,
      name: legacyName,
    }) ?? legacyName

  return {
    firstName,
    lastName,
    name,
    phone:
      readRawString(value.phone) ?? "",
    email:
      readRawString(value.email) ?? "",
  }
}

export function normalizeRuntimeContactAnswer(
  value: unknown,
): RequestContactDraft {
  const readable =
    readRuntimeContactAnswer(value)

  const firstName =
    normalizeRuntimeText(
      readable.firstName,
    )

  const lastName =
    normalizeRuntimeText(
      readable.lastName,
    )

  const name =
    normalizeRuntimeText(
      buildRuntimeContactName({
        firstName,
        lastName,
        name: normalizeRuntimeText(
          readable.name,
        ),
      }),
    )

  const phone =
    normalizeRuntimeText(
      readable.phone,
    )

  const email =
    normalizeRuntimeText(
      readable.email,
    )

  return {
    ...(firstName
      ? {
          firstName,
        }
      : {}),
    ...(lastName
      ? {
          lastName,
        }
      : {}),
    ...(name
      ? {
          name,
        }
      : {}),
    ...(phone
      ? {
          phone,
        }
      : {}),
    ...(email
      ? {
          email,
        }
      : {}),
  }
}

export function updateRuntimeContactAnswerField(
  value: unknown,
  field: RuntimeContactAnswerField,
  fieldValue: string,
): RequestContactDraft {
  const nextContact = {
    ...readRuntimeContactAnswer(value),
    [field]: fieldValue,
  }

  const name =
    buildRuntimeContactName({
      firstName:
        nextContact.firstName,
      lastName:
        nextContact.lastName,
      name:
        nextContact.name,
    }) ?? nextContact.name

  return {
    ...nextContact,
    ...(name
      ? {
          name,
        }
      : {}),
  }
}

/**
 * FASE 8D — the funnel's "location" capability answer can be either a
 * complete GeoPlace (a real Google Places selection — see RequestGeoDraft)
 * OR a RuntimeManualLocationAnswer (the user typed a CAP/Comune, found no
 * Google suggestion, and confirmed the server-resolved preview from
 * POST /api/geo/resolve — see LocationCapabilityInput). Anything else (a
 * typed-but-unselected string, a partial object from a stale client) is
 * not a complete location answer at all.
 *
 * draft.geo itself (RequestGeoDraft) stays GeoPlace | null — a manual
 * answer NEVER becomes draft.geo client-side; only
 * resolveGeoForCreation's own server-side re-resolution (FASE 8B.2) may
 * ever produce a MANUAL_RESOLVED GeoPlace. See readRuntimeLocationManualQuery
 * for how draft.geoManualQuery is populated instead.
 */
export type RuntimeManualLocationAnswer = {
  kind: "manual_location_preview"
  /** The raw query the user typed — the ONLY thing ever re-resolved server-side at submit time. Never trusted as-is. */
  query: string
  /**
   * Display-only preview from POST /api/geo/resolve, shown to the user for
   * confirmation. Never read authoritatively anywhere server-side — see
   * resolveGeoForCreation, which re-derives everything from `query` alone.
   */
  preview: {
    city: string
    postalCode: string | null
    province: string | null
    formattedAddress: string
  }
}

export function isManualLocationAnswer(
  value: unknown,
): value is RuntimeManualLocationAnswer {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  if (candidate.kind !== "manual_location_preview") {
    return false
  }

  if (
    typeof candidate.query !== "string" ||
    candidate.query.trim().length === 0
  ) {
    return false
  }

  const preview = candidate.preview

  if (!preview || typeof preview !== "object") {
    return false
  }

  const previewCandidate = preview as Record<string, unknown>

  return (
    typeof previewCandidate.city === "string" &&
    previewCandidate.city.length > 0 &&
    typeof previewCandidate.formattedAddress === "string" &&
    previewCandidate.formattedAddress.length > 0
  )
}

/**
 * The funnel's "location" answer used to be a complete GeoPlace or
 * nothing — see RequestGeoDraft. draft.geo keeps exactly that contract:
 * a manual location answer (see RuntimeManualLocationAnswer above) is
 * NOT a GeoPlace and normalizes to null here, same as any other
 * incomplete/invalid value — see readRuntimeLocationManualQuery for how
 * that case is carried into the draft instead.
 */
export function readRuntimeLocationAnswer(
  value: unknown,
): RequestGeoDraft {
  return isGeoPlace(value) ? value : null
}

export function normalizeRuntimeLocationAnswer(
  value: unknown,
): RequestGeoDraft {
  return readRuntimeLocationAnswer(value)
}

/**
 * Extracts the raw manual query from a confirmed
 * RuntimeManualLocationAnswer, for populating draft.geoManualQuery
 * (see build-request-draft.ts). undefined for anything else — including a
 * real GeoPlace answer, where geoManualQuery has no meaning.
 */
export function readRuntimeLocationManualQuery(
  value: unknown,
): string | undefined {
  return isManualLocationAnswer(value) ? value.query : undefined
}

export function readRuntimeAnswers(
  value: unknown,
): RuntimeAnswers {
  if (!isRuntimeRecord(value)) {
    return {}
  }

  return value as RuntimeAnswers
}

export function normalizeRuntimeAnswer(
  capabilityId: RuntimeCapabilityId,
  value: unknown,
): unknown {
  switch (capabilityId) {
    case "contact":
      return normalizeRuntimeContactAnswer(
        value,
      )

    case "location":
      return normalizeRuntimeLocationAnswer(
        value,
      )

    default:
      return value
  }
}

export function normalizeRuntimeAnswers(
  answers: RuntimeAnswers,
): RuntimeAnswers {
  const normalized: RuntimeAnswers = {}

  for (const [key, value] of Object.entries(
    answers,
  ) as Array<
    [RuntimeCapabilityId, unknown]
  >) {
    normalized[key] =
      normalizeRuntimeAnswer(
        key,
        value,
      )
  }

  return normalized
}

export function isRuntimeAnswerFilled(
  value: unknown,
): boolean {
  if (Array.isArray(value)) {
    return value.length > 0
  }

  if (typeof value === "string") {
    return value.trim().length > 0
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
  }

  return Boolean(value)
}

export function isRuntimeContactAnswerComplete(
  value: unknown,
): boolean {
  const contact =
    readRuntimeContactAnswer(value)

  const hasExplicitFirstName =
    isRuntimeRecord(value) &&
    isRuntimeAnswerFilled(
      value.firstName,
    )

  const hasExplicitLastName =
    isRuntimeRecord(value) &&
    isRuntimeAnswerFilled(
      value.lastName,
    )

  const hasStructuredName =
    isRuntimeAnswerFilled(
      contact.firstName,
    ) &&
    isRuntimeAnswerFilled(
      contact.lastName,
    )

  const hasLegacyName =
    isRuntimeRecord(value) &&
    !hasExplicitFirstName &&
    !hasExplicitLastName &&
    isRuntimeAnswerFilled(value.name)

  return (
    (hasStructuredName || hasLegacyName) &&
    isRuntimeAnswerFilled(
      contact.phone,
    ) &&
    isRuntimeAnswerFilled(
      contact.email,
    )
  )
}

export function isRuntimeLocationAnswerComplete(
  value: unknown,
): boolean {
  return isGeoPlace(value) || isManualLocationAnswer(value)
}

export function isRuntimeCapabilityAnswerComplete(
  capability: RuntimeCapability,
  value: unknown,
): boolean {
  if (capability.type === "location") {
    return isRuntimeLocationAnswerComplete(
      value,
    )
  }

  if (capability.type === "contact") {
    return isRuntimeContactAnswerComplete(
      value,
    )
  }

  return isRuntimeAnswerFilled(value)
}

export function countCompleteRuntimeAnswers(
  answers: RuntimeAnswers,
): number {
  return Object.entries(answers).filter(
    ([capabilityId, value]) =>
      capabilityId === "location"
        ? isRuntimeLocationAnswerComplete(
            value,
          )
        : capabilityId === "contact"
          ? isRuntimeContactAnswerComplete(
              value,
            )
          : isRuntimeAnswerFilled(
              value,
            ),
  ).length
}

export function describeRuntimeContactAnswerPresence(
  value: unknown,
): RuntimeContactAnswerPresence {
  if (!isRuntimeRecord(value)) {
    return {
      shape: typeof value,
      hasName: false,
      hasFirstName: false,
      hasLastName: false,
      hasPhone: false,
      hasEmail: false,
    }
  }

  return {
    shape: "object",
    hasName:
      Boolean(
        normalizeRuntimeText(value.name),
      ),
    hasFirstName:
      Boolean(
        normalizeRuntimeText(
          value.firstName,
        ),
      ),
    hasLastName:
      Boolean(
        normalizeRuntimeText(
          value.lastName,
        ),
      ),
    hasPhone:
      Boolean(
        normalizeRuntimeText(value.phone),
      ),
    hasEmail:
      Boolean(
        normalizeRuntimeText(value.email),
      ),
  }
}

export function describeRuntimeLocationAnswerPresence(
  value: unknown,
): RuntimeLocationAnswerPresence {
  return {
    shape:
      value === null
        ? "null"
        : typeof value,
    isCompleteGeoPlace:
      isGeoPlace(value),
    isManualLocationPreview:
      isManualLocationAnswer(value),
  }
}
