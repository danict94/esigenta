import { NextResponse } from "next/server"

import { resolveManualLocation } from "@esigenta/domain"

import { extractGeoResolveQuery, mapResolverFailure } from "./geo-resolve-contract"

/**
 * FASE 8C — manual geo resolve endpoint.
 *
 * PREVIEW/VALIDATION UX ONLY. This route lets a future manual-location UI
 * show the user "did you mean <città>?" before they submit — it is NOT
 * the trust boundary. It calls resolveManualLocation() (the same
 * server-side resolver used by create-request.ts) and returns only
 * enough to render a confirmation, never coordinates and never anything
 * shaped like a GeoPlace/MANUAL_RESOLVED object.
 *
 * At submit time the client still sends the raw geoManualQuery string,
 * and createRequestFromDraft (packages/domain/src/public/requests/
 * create-request.ts) re-resolves it itself, server-side, independently of
 * whatever this endpoint returned — see resolveGeoForCreation, FASE 8B.2.
 * There is nothing in this endpoint's response a client could replay to
 * self-declare a trusted MANUAL_RESOLVED location: no source field, no
 * placeId, no lat/lng, nothing GeoPlace-shaped at all.
 *
 * See geo-resolve-contract.ts for the pure request/response mapping
 * (extracted specifically so it can be unit-tested — importing this file
 * directly from a bare test runner fails, see that file's module comment).
 */
export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    const mapped = mapResolverFailure("empty_input")
    return NextResponse.json(
      { ok: false, code: mapped.code, error: mapped.error },
      { status: mapped.status },
    )
  }

  const extracted = extractGeoResolveQuery(body)

  if (!extracted.ok) {
    return NextResponse.json(
      { ok: false, code: extracted.error.code, error: extracted.error.error },
      { status: extracted.error.status },
    )
  }

  const result = await resolveManualLocation(extracted.query)

  if (!result.ok) {
    if (result.code !== "empty_input" && result.code !== "unresolvable" && result.code !== "location_mismatch") {
      console.error("[api/geo/resolve] resolver failure", { code: result.code })
    }

    const mapped = mapResolverFailure(result.code)

    return NextResponse.json(
      { ok: false, code: mapped.code, error: mapped.error },
      { status: mapped.status },
    )
  }

  return NextResponse.json({
    ok: true,
    location: {
      city: result.place.city,
      postalCode: result.place.postalCode,
      province: result.place.province,
      formattedAddress: result.place.formattedAddress,
    },
  })
}
