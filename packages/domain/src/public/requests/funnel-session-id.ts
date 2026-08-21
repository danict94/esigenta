/**
 * Esigenta — Funnel Session Id (FASE 6B)
 *
 * FOUNDATION
 *
 * IMPORTANT:
 * This is ONLY a format/length guard for a client-supplied string.
 *
 * It does NOT:
 * - generate a funnelSessionId (that happens client-side, see
 *   apps/web/src/richiesta/flow/components/resolve-funnel-session-id.ts)
 * - block Request creation if the value is missing or invalid
 * - imply any relationship with cookie consent, GA4 or Google Ads
 *
 * A funnelSessionId is a purely diagnostic, opaque correlation id: never a
 * requirement for a valid Request (unlike geo/contact — see
 * validateGeoForCreation/validateDraftForCreation in ./create-request.ts).
 * A missing or malformed value is normalized to undefined here, never
 * thrown — the same "never a new way to block the funnel" principle
 * applied throughout this project.
 */

/**
 * Matches crypto.randomUUID()'s output shape (8-4-4-4-12 lowercase hex,
 * hyphenated). Deliberately not pinned to UUID v4's version/variant nibbles
 * specifically — the goal is a sanity check on shape/length of a
 * client-supplied string, not a strict RFC 4122 conformance test.
 */
const FUNNEL_SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Normalizes a raw, untrusted `funnelSessionId` from the request body.
 * Returns the value unchanged (never re-cased/re-shaped) if it matches the
 * expected UUID shape, otherwise `undefined` — silently, never a throw.
 */
export function normalizeFunnelSessionId(
  value: unknown,
): string | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()

  return FUNNEL_SESSION_ID_PATTERN.test(trimmed) ? trimmed : undefined
}
