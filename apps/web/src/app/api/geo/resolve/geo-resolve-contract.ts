/**
 * FASE 8C — pure request/response contract for POST /api/geo/resolve.
 *
 * Deliberately separate from route.ts: that file imports resolveManualLocation
 * from @esigenta/domain, whose package barrel transitively pulls in
 * @esigenta/funnel/server (server-only-guarded) — fine inside Next's own
 * server runtime, but importing route.ts directly from a bare `node --import
 * tsx --test` process throws ("This module cannot be imported from a Client
 * Component module"), since that guard's check has no Next build context to
 * recognize. No other route.ts in this repo is unit-tested directly for the
 * same reason — the pure logic lives in a plain module instead, exactly like
 * every other domain function's pure/testable pieces (see e.g.
 * resolve-manual-location.ts). This file has zero dependency on
 * @esigenta/domain, so it can be imported freely from a test.
 */

// A real CAP/Comune/"CAP Comune" query is never remotely close to this —
// generous but bounded. Longer input is rejected outright (treated the
// same as "won't resolve") rather than silently truncated, which could
// turn a genuine query into a different, wrong one.
export const MAX_QUERY_LENGTH = 200

export type GeoResolveResponseCode =
  | "empty_input"
  | "unresolvable"
  | "location_mismatch"
  | "provider_error"

export type MappedGeoResolveError = {
  status: number
  code: GeoResolveResponseCode
  error: string
}

/**
 * Pure. Extracts and validates the query from a parsed request body,
 * without ever touching the network. Returns the trimmed query on
 * success, or the already-mapped error to return to the client
 * otherwise — an implausibly long query is rejected as "unresolvable"
 * (never forwarded to the provider) rather than silently truncated or
 * given a new, undocumented error code.
 */
export function extractGeoResolveQuery(
  body: unknown,
): { ok: true; query: string } | { ok: false; error: MappedGeoResolveError } {
  const rawQuery =
    body && typeof body === "object" ? (body as Record<string, unknown>).query : undefined
  const query = typeof rawQuery === "string" ? rawQuery.trim() : ""

  if (!query) {
    return { ok: false, error: mapResolverFailure("empty_input") }
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return { ok: false, error: mapResolverFailure("unresolvable") }
  }

  return { ok: true, query }
}

/**
 * Maps resolveManualLocation's internal result codes onto the stable,
 * client-facing contract — collapsing "not_configured" (our own server
 * misconfiguration) into the same client-visible "provider_error" code as
 * a genuine Google API failure (the distinction isn't actionable by the
 * client either way), while still giving each a different HTTP status for
 * our own logs/monitoring. Never includes provider/error details in the
 * message.
 */
export function mapResolverFailure(code: string): MappedGeoResolveError {
  switch (code) {
    case "empty_input":
      return {
        status: 400,
        code: "empty_input",
        error: "Inserisci un CAP o un Comune.",
      }
    case "unresolvable":
      return {
        status: 422,
        code: "unresolvable",
        error: "Non troviamo questa località. Prova con un CAP o un Comune diverso.",
      }
    case "location_mismatch":
      return {
        status: 422,
        code: "location_mismatch",
        error: "Il CAP e il Comune indicati non corrispondono alla stessa località.",
      }
    case "not_configured":
      return {
        status: 500,
        code: "provider_error",
        error: "Non riusciamo a verificare questa località ora. Riprova più tardi.",
      }
    default:
      return {
        status: 502,
        code: "provider_error",
        error: "Non riusciamo a verificare questa località ora. Riprova più tardi.",
      }
  }
}
