import { normalizeComparableText, type GeoPlace } from "@esigenta/shared"

/**
 * Esigenta — Manual geo resolver (FASE 8B)
 *
 * Turns a free-text input (a CAP, a Comune name, or "CAP Comune" together)
 * into a canonical GeoPlace with source "MANUAL_RESOLVED" — the ONLY
 * function in the codebase allowed to produce that source (mirrors
 * resolvePlaceFromGooglePlace being the only constructor of
 * source "GOOGLE_PLACES", see packages/shared/src/geo.ts).
 *
 * This is server-only: it reads process.env.GOOGLE_MAPS_API_KEY (the
 * non-public server-side key — distinct from
 * NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, which is the client-side key used by
 * CityAutocomplete's Places JS widget, see
 * apps/web/src/ui/location/city-autocomplete.tsx). Nothing in any client
 * bundle imports this module — there is no code path by which a browser
 * can cause a MANUAL_RESOLVED GeoPlace to be constructed; it can only be
 * declared (as raw JSON) by a hand-crafted request, exactly as already
 * true today for a hand-crafted GOOGLE_PLACES-shaped body (see FASE 8B
 * report §"client non può auto-dichiarare una località manuale trusted"
 * for why this is not a regression versus the existing trust model).
 *
 * Reuses the SAME Google provider already trusted for GOOGLE_PLACES
 * captures (Geocoding API, not Places API — a different endpoint of the
 * same Google Maps Platform product, billed against the same key/project),
 * restricted to Italy exactly like CityAutocomplete's
 * componentRestrictions: {country: 'it'}. Not yet wired to any HTTP
 * route or client UI — see FASE 8B scope ("non serve ancora collegarlo
 * alla UI del funnel").
 *
 * NOT wired to setRequestLocationWithClient by this phase either — that
 * function's isResolvedGeoPlace gate is ready to accept whatever this
 * resolver produces, once a future phase calls it from a real endpoint.
 *
 * FASE 8B.1 — COHERENCE VALIDATION
 *
 * Google's Geocoding API does a best-effort match on the whole free-text
 * query and can silently prioritize one explicit token over another: e.g.
 * "95022 Aci Bonaccorsi" was found to resolve to the geocode for Aci
 * Bonaccorsi itself, discarding the (real, different) CAP 95022 — which
 * actually belongs to the neighboring comune Aci Catena. Trusting
 * whatever Google calls its best match, without checking it against what
 * the user explicitly typed, could silently produce a real, valid-looking
 * GeoPlace for the WRONG location.
 *
 * The fix: after extracting a GeoPlace from Google's result, this module
 * separately re-derives what the user explicitly asserted (parseManualLocationQuery)
 * and checks it against the resolved result (checkLocationCoherence) —
 * an explicit CAP must come back verbatim in place.postalCode; an
 * explicit city/comune must match place.city after accent/case/
 * apostrophe/whitespace-insensitive normalization. Either mismatch (or a
 * missing field where one was asserted) rejects with "location_mismatch"
 * rather than fuzzy-matching or guessing — see the module doc-comments on
 * parseManualLocationQuery/checkLocationCoherence below.
 *
 * The public signature stays a single free-text string (unchanged from
 * FASE 8B) rather than a structured {postalCode, city} input: this
 * resolver has no real caller yet (not wired to any UI/route), so
 * committing a two-field contract now would be speculative, and the
 * coherence guarantee doesn't actually require it — parseManualLocationQuery
 * extracts the same two pieces internally, is itself pure and fully unit
 * tested, and a future structured caller can simply skip parsing and
 * construct a ParsedManualLocationQuery directly if that ever turns out
 * to be needed.
 */

const GEOCODING_ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json"

export type GoogleGeocodingAddressComponent = {
  long_name?: string
  short_name?: string
  types?: string[]
}

export type GoogleGeocodingResult = {
  place_id?: string
  formatted_address?: string
  address_components?: GoogleGeocodingAddressComponent[]
  geometry?: {
    location?: { lat?: number; lng?: number }
  }
}

export type GoogleGeocodingResponse = {
  status?: string
  results?: GoogleGeocodingResult[]
}

export type ResolveManualLocationResult =
  | { ok: true; place: GeoPlace }
  | {
      ok: false
      code:
        | "empty_input"
        | "not_configured"
        | "unresolvable"
        | "provider_error"
        | "location_mismatch"
    }

/**
 * Pure — exported for unit testing. Rejects empty/whitespace-only input
 * without ever making a network call.
 */
export function sanitizeManualLocationQuery(rawInput: unknown): string | null {
  if (typeof rawInput !== "string") {
    return null
  }

  const trimmed = rawInput.trim()

  return trimmed.length > 0 ? trimmed : null
}

const ITALIAN_POSTAL_CODE_PATTERN = /\b\d{5}\b/

export type ParsedManualLocationQuery = {
  postalCode: string | null
  city: string | null
}

function stripEdgePunctuation(value: string): string {
  return value.trim().replace(/^[\s,;.\-]+/, "").replace(/[\s,;.\-]+$/, "")
}

/**
 * Pure — exported for unit testing. Splits a free-text query into an
 * explicit Italian CAP (a standalone 5-digit token, wherever it appears
 * in the string) and whatever text remains once that token is removed
 * (trimmed of leftover punctuation/whitespace) — the explicit comune/
 * locality, if any. Either piece can be null: "95022" has no city text,
 * "Aci Bonaccorsi" has no CAP.
 *
 * This does NOT resolve or validate either piece against any provider —
 * it only identifies what the user explicitly asserted, so
 * resolveManualLocation can later check Google's result against it (see
 * checkLocationCoherence). Expects an already-sanitized, non-empty query
 * (see sanitizeManualLocationQuery) — behavior on "" is not part of this
 * function's contract.
 */
export function parseManualLocationQuery(query: string): ParsedManualLocationQuery {
  const match = ITALIAN_POSTAL_CODE_PATTERN.exec(query)

  if (!match) {
    const city = stripEdgePunctuation(query)
    return { postalCode: null, city: city.length > 0 ? city : null }
  }

  const postalCode = match[0]
  const remainder =
    query.slice(0, match.index) + query.slice(match.index + postalCode.length)
  const city = stripEdgePunctuation(remainder)

  return { postalCode, city: city.length > 0 ? city : null }
}

/**
 * Pure — exported for unit testing. Compares what the user explicitly
 * asserted (parseManualLocationQuery's output) against the GeoPlace
 * Google actually resolved to. Deliberately strict, not fuzzy: an
 * asserted CAP must match place.postalCode EXACTLY (a missing
 * place.postalCode where one was asserted is a mismatch, not a pass); an
 * asserted city must match place.city after
 * normalizeComparableText (case/accent/apostrophe/whitespace-insensitive
 * equality only — never a partial/substring/fuzzy match). Either piece
 * being null (not explicitly asserted by the user) skips that check —
 * this function only ever rejects a CONTRADICTION, never an absence.
 */
export function checkLocationCoherence(
  parsed: ParsedManualLocationQuery,
  place: GeoPlace,
): boolean {
  if (parsed.postalCode !== null && parsed.postalCode !== place.postalCode) {
    return false
  }

  if (
    parsed.city !== null &&
    normalizeComparableText(parsed.city) !== normalizeComparableText(place.city)
  ) {
    return false
  }

  return true
}

function findAddressComponent(
  components: GoogleGeocodingAddressComponent[] | undefined,
  types: string[],
): GoogleGeocodingAddressComponent | undefined {
  return components?.find((component) =>
    types.some((type) => component.types?.includes(type)),
  )
}

/**
 * Pure — exported for unit testing against fixture Google Geocoding API
 * responses, with no network call. Mirrors resolvePlaceFromGooglePlace's
 * own field-extraction rules (same address-component type priority for
 * city/postalCode/province) applied to the Geocoding REST API's response
 * shape instead of the Places JS SDK's object shape — the two provider
 * endpoints return address_components in the same general form, but this
 * resolver does NOT reuse resolvePlaceFromGooglePlace itself: that
 * function always sets source "GOOGLE_PLACES" and requires a placeId,
 * neither of which is correct here (this always sets "MANUAL_RESOLVED",
 * and placeId is optional). Returns null — never a partial GeoPlace — if
 * formattedAddress, city, or a finite latitude/longitude is missing.
 */
export function extractGeoPlaceFromGeocodingResult(
  result: GoogleGeocodingResult,
  resolvedAt: Date = new Date(),
): GeoPlace | null {
  const formattedAddress = result.formatted_address?.trim()
  const city = findAddressComponent(result.address_components, [
    "locality",
    "postal_town",
    "administrative_area_level_3",
    "administrative_area_level_2",
  ])?.long_name
  const postalCode =
    findAddressComponent(result.address_components, ["postal_code"])?.long_name ?? null
  const province =
    findAddressComponent(result.address_components, ["administrative_area_level_2"])
      ?.short_name ?? null
  const latitude = result.geometry?.location?.lat
  const longitude = result.geometry?.location?.lng

  if (
    !formattedAddress ||
    !city ||
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude)
  ) {
    return null
  }

  return {
    placeId: result.place_id?.trim() || null,
    formattedAddress,
    city,
    postalCode,
    province,
    latitude,
    longitude,
    source: "MANUAL_RESOLVED",
    resolvedAt: resolvedAt.toISOString(),
  }
}

/**
 * Pure — exported for unit testing against fixture Google Geocoding API
 * response bodies, with no network call. This is ALL of
 * resolveManualLocation's interesting logic (status handling, extraction,
 * coherence validation) in one place, so every FASE 8B.1 scenario —
 * including "unresolvable" (ZERO_RESULTS) and "location_mismatch" — is
 * directly unit-testable without touching the network. `query` must be
 * the already-sanitized, non-empty string that produced `body` (i.e.
 * whatever was sent as the `address` param) — it is re-parsed here via
 * parseManualLocationQuery purely for the coherence check.
 */
export function interpretGeocodingResponse(
  body: GoogleGeocodingResponse,
  query: string,
  resolvedAt: Date = new Date(),
): ResolveManualLocationResult {
  if (body.status !== "OK") {
    // ZERO_RESULTS is the expected "not resolvable" outcome; anything
    // else (OVER_QUERY_LIMIT, REQUEST_DENIED, INVALID_REQUEST,
    // UNKNOWN_ERROR) is also treated as unresolvable from the caller's
    // point of view — there is no partial/retry contract at this layer.
    return { ok: false, code: "unresolvable" }
  }

  const firstResult = body.results?.[0]

  if (!firstResult) {
    return { ok: false, code: "unresolvable" }
  }

  const place = extractGeoPlaceFromGeocodingResult(firstResult, resolvedAt)

  if (!place) {
    return { ok: false, code: "unresolvable" }
  }

  const parsed = parseManualLocationQuery(query)

  if (!checkLocationCoherence(parsed, place)) {
    return { ok: false, code: "location_mismatch" }
  }

  return { ok: true, place }
}

/**
 * The orchestrator: validates input, calls Google's Geocoding API
 * server-side, and delegates everything else to interpretGeocodingResponse.
 * Never throws — every failure mode (empty input, missing API key, a
 * network/HTTP error) returns a distinct `ok: false` code instead. Not
 * unit-tested itself (it touches the network and process.env), consistent
 * with every other network/DB-touching orchestrator in this package (see
 * create-request.ts, cleanup-orphan-request-photos.ts) — its interesting
 * logic is fully delegated to the pure, tested functions above.
 */
export async function resolveManualLocation(
  rawInput: string,
): Promise<ResolveManualLocationResult> {
  const query = sanitizeManualLocationQuery(rawInput)

  if (!query) {
    return { ok: false, code: "empty_input" }
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return { ok: false, code: "not_configured" }
  }

  let body: GoogleGeocodingResponse

  try {
    const url = new URL(GEOCODING_ENDPOINT)
    url.searchParams.set("address", query)
    url.searchParams.set("region", "it")
    url.searchParams.set("components", "country:IT")
    url.searchParams.set("key", apiKey)

    const response = await fetch(url.toString())

    if (!response.ok) {
      return { ok: false, code: "provider_error" }
    }

    body = (await response.json()) as GoogleGeocodingResponse
  } catch (error) {
    console.error("[resolveManualLocation] Geocoding API call failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    })

    return { ok: false, code: "provider_error" }
  }

  return interpretGeocodingResponse(body, query)
}
