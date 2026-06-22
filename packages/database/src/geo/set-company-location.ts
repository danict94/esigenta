import type { Prisma } from "@prisma/client"
import { isFreshGeoPlace, type GeoPlace } from "@esigenta/shared"

import { prisma } from "../client"
import { createGeoLocationWithClient } from "./create-geo-location"

export type SetCompanyLocationResult =
  | { ok: true; geoLocationId: string }
  | { ok: false; code: "invalid_location" }

/**
 * THE ONLY WRITE PATH for a company's location (docs/geo-refoundation/01_DESIGN.md
 * §2.3/§8). Creation (onboarding.ts) and replacement (profile edit) both
 * call this — there is no other code in the repository allowed to set
 * Company.geoLocationId or insert a Company-attached GeoLocation row.
 *
 * Always replaces wholesale: a fresh GeoLocation row is created from the
 * given GeoPlace, the company is repointed at it, and whatever location it
 * previously had (if any) is deleted. There is no field-level edit of an
 * existing GeoLocation row — that would reintroduce exactly the
 * independent-fields bug this refoundation removes.
 */
export async function setCompanyLocationWithClient(
  tx: Prisma.TransactionClient,
  companyId: string,
  place: GeoPlace,
): Promise<SetCompanyLocationResult> {
  if (!isFreshGeoPlace(place)) {
    return { ok: false, code: "invalid_location" }
  }

  const previous = await tx.company.findUnique({
    where: { id: companyId },
    select: { geoLocationId: true },
  })

  const created = await createGeoLocationWithClient(tx, place)

  await tx.company.update({
    where: { id: companyId },
    data: { geoLocationId: created.id },
  })

  if (previous?.geoLocationId) {
    await tx.geoLocation.delete({
      where: { id: previous.geoLocationId },
    })
  }

  return { ok: true, geoLocationId: created.id }
}

export async function setCompanyLocation(
  companyId: string,
  place: GeoPlace,
): Promise<SetCompanyLocationResult> {
  return prisma.$transaction((tx) =>
    setCompanyLocationWithClient(tx, companyId, place),
  )
}
