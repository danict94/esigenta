import type { Prisma } from "@prisma/client"
import { isResolvedGeoPlace, type GeoPlace } from "@esigenta/shared"

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
 *
 * FASE 8B: gated by isResolvedGeoPlace, not isFreshGeoPlace — a Request's
 * location may come from either a real Google Places capture OR the
 * server-side manual CAP/Comune resolver. This is a deliberately
 * Request-only widening: setCompanyLocationWithClient (the equivalent
 * write boundary for Company) still gates on isFreshGeoPlace alone.
 */
export async function setRequestLocationWithClient(
  tx: Prisma.TransactionClient,
  requestId: string,
  place: GeoPlace,
): Promise<SetRequestLocationResult> {
  if (!isResolvedGeoPlace(place)) {
    return { ok: false, code: "invalid_location" }
  }

  const created = await createGeoLocationWithClient(tx, place)

  await tx.request.update({
    where: { id: requestId },
    data: { geoLocationId: created.id },
  })

  return { ok: true, geoLocationId: created.id }
}
