/**
 * Esigenta V2 - Request Structured Data
 *
 * Helpers for MVP request structuredData JSON.
 */

import type {
  Prisma,
} from "@prisma/client"

import type {
  RequestDraft,
} from "../funnel/types/request-draft"

export type RequestVerificationSnapshot = {
  tokenHash: string | null
  expiresAt: string
  sentAt: string
  verifiedAt?: string
  usedAt?: string
}

export type RequestStructuredData = {
  draft: Prisma.JsonValue | null
  verification?: RequestVerificationSnapshot
}

export function toRequestStructuredData({
  draft,
  verification,
}: {
  draft: RequestDraft
  verification?: RequestVerificationSnapshot
}): Prisma.InputJsonObject {
  const serializedDraft =
    JSON.parse(
      JSON.stringify(draft),
    ) as Prisma.InputJsonValue

  return {
    draft:
      serializedDraft,
    ...(verification
      ? {
          verification:
            verification as Prisma.InputJsonValue,
        }
      : {}),
  }
}

export function readRequestStructuredData(
  value: unknown,
): RequestStructuredData {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {
      draft: null,
    }
  }

  return value as RequestStructuredData
}
