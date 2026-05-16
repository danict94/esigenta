/**
 * FixPro V2 - Request Verification Tokens
 *
 * Single-use token helpers.
 *
 * IMPORTANT:
 * Token hashes are stored inside Request.structuredData
 * for the MVP to avoid adding tables or schema fields.
 */

import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto"

export type RequestVerificationToken = {
  token: string
  tokenHash: string
  expiresAt: Date
}

export function hashVerificationToken(
  token: string,
): string {
  return createHash("sha256")
    .update(token)
    .digest("hex")
}

export function createRequestVerificationToken(): RequestVerificationToken {
  const token =
    randomBytes(32).toString("hex")

  const expiresAt =
    new Date(
      Date.now() + 1000 * 60 * 60 * 24,
    )

  return {
    token,
    tokenHash:
      hashVerificationToken(token),
    expiresAt,
  }
}

export function verifyTokenHash({
  token,
  tokenHash,
}: {
  token: string
  tokenHash: string
}): boolean {
  const incomingHash =
    hashVerificationToken(token)

  const expected =
    Buffer.from(tokenHash, "hex")

  const incoming =
    Buffer.from(incomingHash, "hex")

  if (expected.length !== incoming.length) {
    return false
  }

  return timingSafeEqual(
    expected,
    incoming,
  )
}
