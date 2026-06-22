function toRadians(value: number) {
  return (value * Math.PI) / 180
}

/**
 * The one canonical shape for "a resolved place" anywhere in the app.
 * Address/city/coordinates are never independently missing — that
 * invariant is what this refoundation exists to guarantee, and it's
 * always true here. `placeId` is the one exception: it is nullable only
 * because pre-refoundation records were backfilled (source
 * LEGACY_BACKFILL) without ever having captured one — see
 * docs/geo-refoundation/02_BACKFILL_AUDIT.md. Every NEW place produced by
 * resolvePlaceFromGooglePlace (the only live constructor) always has one;
 * nothing in application code can construct a LEGACY_BACKFILL GeoPlace.
 */
export type GeoPlace = {
  placeId: string | null
  formattedAddress: string
  city: string
  postalCode: string | null
  province: string | null
  latitude: number
  longitude: number
  source: GeoPlaceSource
  /** ISO 8601 — a plain string so GeoPlace survives JSON/URL transport unchanged. */
  resolvedAt: string
}

export type GeoPlaceSource = "GOOGLE_PLACES" | "LEGACY_BACKFILL"

export type GoogleAddressComponent = {
  longName: string
  shortName: string
  types: string[]
}

export type GooglePlaceResult = {
  placeId?: string
  formattedAddress?: string
  addressComponents?: GoogleAddressComponent[]
  latitude?: number
  longitude?: number
}

function getAddressComponent(
  components: GoogleAddressComponent[] | undefined,
  types: string[],
) {
  return components?.find((component) =>
    types.some((type) => component.types.includes(type)),
  )
}

/**
 * The only function in the codebase allowed to construct a GeoPlace.
 * Returns null — never a partial object — if the provider result is
 * missing any field a real place must have. This is what makes "address
 * text without coordinates" or "coordinates without placeId" structurally
 * impossible: there is no other way to produce a GeoPlace.
 */
export function resolvePlaceFromGooglePlace(
  raw: GooglePlaceResult,
  resolvedAt: Date = new Date(),
): GeoPlace | null {
  const placeId = raw.placeId?.trim()
  const formattedAddress = raw.formattedAddress?.trim()
  const city = getAddressComponent(raw.addressComponents, [
    "locality",
    "postal_town",
    "administrative_area_level_3",
    "administrative_area_level_2",
  ])?.longName
  const postalCode =
    getAddressComponent(raw.addressComponents, ["postal_code"])?.longName ??
    null
  const province =
    getAddressComponent(raw.addressComponents, [
      "administrative_area_level_2",
    ])?.shortName ?? null

  if (
    !placeId ||
    !formattedAddress ||
    !city ||
    typeof raw.latitude !== "number" ||
    !Number.isFinite(raw.latitude) ||
    typeof raw.longitude !== "number" ||
    !Number.isFinite(raw.longitude)
  ) {
    return null
  }

  return {
    placeId,
    formattedAddress,
    city,
    postalCode,
    province,
    latitude: raw.latitude,
    longitude: raw.longitude,
    source: "GOOGLE_PLACES",
    resolvedAt: resolvedAt.toISOString(),
  }
}

export function isGeoPlace(value: unknown): value is GeoPlace {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    (candidate.placeId === null ||
      (typeof candidate.placeId === "string" &&
        candidate.placeId.length > 0)) &&
    typeof candidate.formattedAddress === "string" &&
    candidate.formattedAddress.length > 0 &&
    typeof candidate.city === "string" &&
    candidate.city.length > 0 &&
    typeof candidate.latitude === "number" &&
    Number.isFinite(candidate.latitude) &&
    typeof candidate.longitude === "number" &&
    Number.isFinite(candidate.longitude) &&
    (candidate.source === "GOOGLE_PLACES" ||
      candidate.source === "LEGACY_BACKFILL") &&
    typeof candidate.resolvedAt === "string"
  )
}

/**
 * Stricter than isGeoPlace: also requires a real provider placeId and
 * GOOGLE_PLACES provenance. Use this at write boundaries
 * (setCompanyLocationWithClient / setRequestLocationWithClient) so a
 * LEGACY_BACKFILL read-back can never be re-saved as if it were a fresh,
 * fully-identified capture.
 */
export function isFreshGeoPlace(
  value: unknown,
): value is GeoPlace & { placeId: string; source: "GOOGLE_PLACES" } {
  return (
    isGeoPlace(value) &&
    value.placeId !== null &&
    value.source === "GOOGLE_PLACES"
  )
}

/**
 * Upper bound across every allowed Company.operatingRadiusKm value. Used as
 * a single shared, index-friendly pre-filter radius in matching SQL (see
 * resolve-request-dispatch-candidates.ts) — the exact per-company radius
 * check still runs after, in SQL, against each company's own column. Keep
 * in sync with the allowed-radius lists in onboarding.ts/update-profile.ts.
 */
export const MAX_OPERATING_RADIUS_KM = 100

export type GeoBoundingBox = {
  minLatitude: number
  maxLatitude: number
  minLongitude: number
  maxLongitude: number
}

/**
 * Cheap rectangular pre-filter for "within radiusKm of (lat,lng)", meant to
 * run before/alongside a precise circular distance check (see
 * resolveRequestDispatchCandidates / getCompanyRequestsListPage). Not a
 * precise distance itself — a corner of the box can be up to ~1.41x
 * radiusKm away — it only needs to be a superset of the real circle.
 */
export function getGeoBoundingBox({
  latitude,
  longitude,
  radiusKm,
}: {
  latitude: number
  longitude: number
  radiusKm: number
}): GeoBoundingBox {
  const kmPerDegreeLatitude = 111.32
  const latitudeDelta = radiusKm / kmPerDegreeLatitude
  const longitudeDelta =
    radiusKm / (kmPerDegreeLatitude * Math.cos(toRadians(latitude)))

  return {
    minLatitude: latitude - latitudeDelta,
    maxLatitude: latitude + latitudeDelta,
    minLongitude: longitude - longitudeDelta,
    maxLongitude: longitude + longitudeDelta,
  }
}

export function getDistanceKm({
  fromLatitude,
  fromLongitude,
  toLatitude,
  toLongitude,
}: {
  fromLatitude: number
  fromLongitude: number
  toLatitude: number
  toLongitude: number
}) {
  const earthRadiusKm = 6371

  const latitudeDelta = toRadians(toLatitude - fromLatitude)
  const longitudeDelta = toRadians(toLongitude - fromLongitude)

  const fromLatitudeRadians = toRadians(fromLatitude)
  const toLatitudeRadians = toRadians(toLatitude)

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitudeRadians) *
      Math.cos(toLatitudeRadians) *
      Math.sin(longitudeDelta / 2) ** 2

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine))
}
