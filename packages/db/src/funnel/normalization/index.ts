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
  hasAddress: boolean
  hasCity: boolean
  hasCoordinates: boolean
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

export function normalizeRuntimeNumber(
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

export function readRuntimeLocationAnswer(
  value: unknown,
): RequestGeoDraft {
  const text =
    readRawString(value)

  if (text) {
    return {
      address: text,
    }
  }

  if (!isRuntimeRecord(value)) {
    return {}
  }

  const latitude =
    normalizeRuntimeNumber(
      value.latitude,
    ) ??
    normalizeRuntimeNumber(value.lat)

  const longitude =
    normalizeRuntimeNumber(
      value.longitude,
    ) ??
    normalizeRuntimeNumber(value.lng)

  return {
    address:
      readRawString(value.address) ?? "",
    city:
      readRawString(value.city) ?? "",
    postalCode:
      readRawString(value.postalCode) ??
      readRawString(value.cap) ??
      "",
    ...(latitude !== undefined
      ? {
          latitude,
        }
      : {}),
    ...(longitude !== undefined
      ? {
          longitude,
        }
      : {}),
  }
}

export function normalizeRuntimeLocationAnswer(
  value: unknown,
): RequestGeoDraft {
  const readable =
    readRuntimeLocationAnswer(value)

  const address =
    normalizeRuntimeText(
      readable.address,
    )

  const city =
    normalizeRuntimeText(
      readable.city,
    )

  const postalCode =
    normalizeRuntimeText(
      readable.postalCode,
    )

  return {
    ...(address
      ? {
          address,
        }
      : {}),
    ...(city
      ? {
          city,
        }
      : {}),
    ...(postalCode
      ? {
          postalCode,
        }
      : {}),
    ...(readable.latitude !== undefined
      ? {
          latitude:
            readable.latitude,
        }
      : {}),
    ...(readable.longitude !== undefined
      ? {
          longitude:
            readable.longitude,
        }
      : {}),
  }
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
  const location =
    readRuntimeLocationAnswer(value)

  return Boolean(
    location.address &&
      location.city &&
      typeof location.latitude ===
        "number" &&
      Number.isFinite(
        location.latitude,
      ) &&
      typeof location.longitude ===
        "number" &&
      Number.isFinite(
        location.longitude,
      ),
  )
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
  const text =
    normalizeRuntimeText(value)

  if (!isRuntimeRecord(value)) {
    return {
      shape: typeof value,
      hasAddress:
        Boolean(text),
      hasCity: false,
      hasCoordinates: false,
    }
  }

  return {
    shape: "object",
    hasAddress:
      Boolean(
        normalizeRuntimeText(
          value.address,
        ),
      ),
    hasCity:
      Boolean(
        normalizeRuntimeText(value.city),
      ),
    hasCoordinates:
      normalizeRuntimeNumber(
        value.latitude,
      ) !== undefined &&
      normalizeRuntimeNumber(
        value.longitude,
      ) !== undefined,
  }
}
