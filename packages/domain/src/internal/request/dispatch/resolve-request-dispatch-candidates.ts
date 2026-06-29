import type {
  Prisma,
} from "@prisma/client"

import { prisma } from "@esigenta/database"
import { MAX_OPERATING_RADIUS_KM } from "@esigenta/shared"

import type {
  RequestDispatchCandidate,
  ResolveRequestDispatchCandidatesResult,
} from "./types"

type DispatchResolverClient =
  Prisma.TransactionClient

type CandidateRow = {
  company_id: string
  recipient_email: string | null
  distance_km: number
  operating_radius_km: number
}

function normalizeRequiredId(
  value: string,
): string | null {
  const trimmed = value.trim()

  return trimmed ? trimmed : null
}

function normalizeEmail(
  value: string | null,
): string | null {
  const email = value?.trim().toLowerCase()

  if (!email) {
    return null
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  )
    ? email
    : null
}

/**
 * Intervention is the only matching unit (docs/taxonomy.md). A single
 * indexed semi-join against CompanyIntervention, no Category/Service
 * traversal — see
 * docs/archive-legacy/refoundation/taxonomy-refoundation/06_MATCHING_CUTOVER_DESIGN.md §1-2 and
 * docs/archive-legacy/refoundation/taxonomy-refoundation/07_QUERY_AND_INDEX_PLAN.md §B.
 *
 * GEO REFOUNDATION (docs/archive-legacy/refoundation/geo-refoundation/01_DESIGN.md §5/§6): the radius
 * check runs in SQL via the GiST-indexed earthdistance/cube extension, not
 * as a JS-side full-table haversine scan. Each company has its own
 * operatingRadiusKm, so the index pre-filter uses the shared upper bound
 * (MAX_OPERATING_RADIUS_KM) — every company within that worst-case
 * distance is fetched index-accelerated, then the exact per-company radius
 * is applied as a second, cheap filter over that already-small set.
 */
async function resolveCandidates({
  client,
  requestLatitude,
  requestLongitude,
  interventionId,
}: {
  client: DispatchResolverClient
  requestLatitude: number
  requestLongitude: number
  interventionId: string
}): Promise<RequestDispatchCandidate[]> {
  const maxRadiusMeters = MAX_OPERATING_RADIUS_KM * 1000

  const rows = await client.$queryRaw<CandidateRow[]>`
    SELECT
      c."id" AS company_id,
      u."email" AS recipient_email,
      (
        earth_distance(
          ll_to_earth(${requestLatitude}, ${requestLongitude}),
          ll_to_earth(gl."latitude", gl."longitude")
        ) / 1000
      ) AS distance_km,
      c."operatingRadiusKm" AS operating_radius_km
    FROM "Company" c
    JOIN "GeoLocation" gl ON gl."id" = c."geoLocationId"
    JOIN "CompanyIntervention" ci
      ON ci."companyId" = c."id" AND ci."interventionId" = ${interventionId}
    LEFT JOIN "CompanyMembership" cm
      ON cm."companyId" = c."id" AND cm."role" = 'OWNER'
    LEFT JOIN "User" u ON u."id" = cm."userId"
    WHERE c."isActive" = true
      AND c."deletedAt" IS NULL
      AND c."status" = 'APPROVED'::"CompanyStatus"
      AND c."operatingRadiusKm" > 0
      AND earth_box(
        ll_to_earth(${requestLatitude}, ${requestLongitude}),
        ${maxRadiusMeters}
      ) @> ll_to_earth(gl."latitude", gl."longitude")
      AND earth_distance(
        ll_to_earth(${requestLatitude}, ${requestLongitude}),
        ll_to_earth(gl."latitude", gl."longitude")
      ) <= c."operatingRadiusKm" * 1000
    ORDER BY cm."createdAt" ASC
  `

  const seenCompanyIds = new Set<string>()

  return rows.flatMap((row) => {
    if (seenCompanyIds.has(row.company_id)) {
      return []
    }
    seenCompanyIds.add(row.company_id)

    const distanceKm = Number(row.distance_km)
    const operatingRadiusKm = Number(row.operating_radius_km)

    const matchReason: Prisma.InputJsonObject = {
      interventionId,
      distanceKm,
      operatingRadiusKm,
    }

    return [
      {
        companyId: row.company_id,
        recipientEmail: normalizeEmail(row.recipient_email),
        distanceKm,
        operatingRadiusKm,
        matchReason,
      },
    ]
  })
}

export async function resolveRequestDispatchCandidatesWithClient(
  client: DispatchResolverClient,
  requestId: string,
): Promise<ResolveRequestDispatchCandidatesResult> {
  const normalizedRequestId =
    normalizeRequiredId(requestId)

  if (!normalizedRequestId) {
    return {
      ok: false,
      code: "request_not_found",
      message: "Request not found.",
    }
  }

  const request =
    await client.request.findUnique({
      where: {
        id: normalizedRequestId,
      },
      select: {
        id: true,
        requestCode: true,
        interventionSlug: true,
        interventionId: true,
        geoLocation: {
          select: {
            city: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    })

  if (!request) {
    return {
      ok: false,
      code: "request_not_found",
      message: "Request not found.",
    }
  }

  if (!request.geoLocation) {
    return {
      ok: false,
      code: "request_missing_coordinates",
      message:
        "Request latitude and longitude are required for dispatch.",
    }
  }

  if (!request.interventionId) {
    return {
      ok: false,
      code: "request_intervention_not_resolved",
      message:
        "Request intervention could not be resolved for dispatch.",
    }
  }

  const candidates =
    await resolveCandidates({
      client,
      requestLatitude: request.geoLocation.latitude,
      requestLongitude: request.geoLocation.longitude,
      interventionId: request.interventionId,
    })

  return {
    ok: true,
    requestId: request.id,
    requestCode: request.requestCode,
    interventionSlug:
      request.interventionSlug,
    interventionId: request.interventionId,
    city: request.geoLocation.city,
    eligibleCompanyCount:
      candidates.length,
    candidates,
  }
}

export async function resolveRequestDispatchCandidates(
  requestId: string,
): Promise<ResolveRequestDispatchCandidatesResult> {
  return resolveRequestDispatchCandidatesWithClient(
    prisma,
    requestId,
  )
}
