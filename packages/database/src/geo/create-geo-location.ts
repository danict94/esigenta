import type { Prisma } from "@prisma/client"
import type { GeoPlace } from "@esigenta/shared"

/**
 * The only INSERT statement for GeoLocation anywhere in the codebase. Not
 * itself a "company write path" or "request write path" — it's shared
 * plumbing, the same way every domain function shares `prisma`. The actual
 * write boundaries are set-company-location.ts and set-request-location.ts,
 * which are the only callers.
 */
export async function createGeoLocationWithClient(
  tx: Prisma.TransactionClient,
  place: GeoPlace,
): Promise<{ id: string }> {
  return tx.geoLocation.create({
    data: {
      placeId: place.placeId,
      formattedAddress: place.formattedAddress,
      city: place.city,
      postalCode: place.postalCode,
      province: place.province,
      latitude: place.latitude,
      longitude: place.longitude,
      source: place.source,
      resolvedAt: new Date(place.resolvedAt),
    },
    select: { id: true },
  })
}
