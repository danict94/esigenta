import type { Prisma } from "@prisma/client"
import { isFreshGeoPlace, type GeoPlace } from "@esigenta/shared"

import { createGeoLocationWithClient } from "./create-geo-location"

export type SetRequestLocationResult =
  | { ok: true; geoLocationId: string }
  | { ok: false; code: "invalid_location" }

/**
 * THE ONLY WRITE PATH for a request's job-site location
 * (docs/archive-legacy/refoundation/geo-refoundation/01_DESIGN.md §2.3/§8). A request's location is set
 * exactly once, at creation (create-request.ts) — a job site does not move
 * afterward, so unlike setCompanyLocationWithClient there is no replace
 * case here. If that ever changes, it must still go through this file and
 * nowhere else.
 */
export async function setRequestLocationWithClient(
  tx: Prisma.TransactionClient,
  requestId: string,
  place: GeoPlace,
): Promise<SetRequestLocationResult> {
  if (!isFreshGeoPlace(place)) {
    return { ok: false, code: "invalid_location" }
  }

  const created = await createGeoLocationWithClient(tx, place)

  await tx.request.update({
    where: { id: requestId },
    data: { geoLocationId: created.id },
  })

  return { ok: true, geoLocationId: created.id }
}
