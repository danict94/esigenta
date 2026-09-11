import type { CompanyActor } from "@esigenta/auth"

import { prisma } from "@esigenta/database"

import {
  deriveCompanyRequestAccess,
} from "./derive-company-request-access"
import { getCompanyMarketplaceCapabilitySnapshot } from "./company-marketplace-capability-snapshot"

const PREVIEW_LIMIT = 20

export type CompanyRequestPreview = {
  id: string
  interventionSlug: string
  interventionName: string
  city: string | null
  province: string | null
  createdAt: Date
  matchLevel: "selected_intervention"
}

export type CompanyRequestPreviewCompany = {
  name: string
  city: string | null
  province: string | null
  operatingRadiusKm: number | null
  activeInterventionCount: number
}

export type ListCompanyRequestPreviewsResult =
  | {
      ok: true
      company: CompanyRequestPreviewCompany
      requests: CompanyRequestPreview[]
      limit: number
      hasMore: boolean
    }
  | {
      ok: false
      code:
        | "preview_not_available"
        | "company_not_found"
        | "missing_category"
        | "missing_location"
      message: string
      activeInterventionCount: number
    }

type PreviewRow = {
  id: string
  intervention_slug: string
  intervention_name: string
  city: string | null
  province: string | null
  created_at: Date
  match_level: "selected_intervention"
}

function hasFiniteNumber(
  value: number | null,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  )
}

/**
 * Strict preview projection for active PENDING_REVIEW companies. Deliberately
 * excludes request codes, addresses, postal codes, coordinates, structured
 * data, customer fields, photos, grants, saves, unlocks and dispatches.
 */
export async function listCompanyRequestPreviews(
  actor: CompanyActor,
): Promise<ListCompanyRequestPreviewsResult> {
  const access =
    deriveCompanyRequestAccess(actor.company)

  if (access.mode !== "preview_locked") {
    return {
      ok: false,
      code: "preview_not_available",
      message:
        "La preview richieste non è disponibile per questo profilo.",
      activeInterventionCount: 0,
    }
  }

  const [company, capabilitySnapshot] =
    await Promise.all([
      prisma.company.findUnique({
        where: { id: actor.company.id },
        select: {
          name: true,
          operatingRadiusKm: true,
          geoLocation: {
            select: {
              city: true,
              province: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      }),
      getCompanyMarketplaceCapabilitySnapshot(actor.company.id),
    ])

  const activeInterventionCount =
    capabilitySnapshot?.selectedInterventionIds.length ?? 0

  if (!company || !capabilitySnapshot) {
    return {
      ok: false,
      code: "company_not_found",
      message: "Impresa non trovata.",
      activeInterventionCount,
    }
  }

  if (!capabilitySnapshot.isConfigured) {
    return {
      ok: false,
      code: "missing_category",
      message:
        "Configura i servizi per vedere richieste compatibili.",
      activeInterventionCount,
    }
  }

  const latitude =
    company.geoLocation?.latitude ?? null
  const longitude =
    company.geoLocation?.longitude ?? null
  const operatingRadiusKm =
    company.operatingRadiusKm

  if (
    !hasFiniteNumber(latitude) ||
    !hasFiniteNumber(longitude) ||
    !hasFiniteNumber(operatingRadiusKm) ||
    operatingRadiusKm <= 0
  ) {
    return {
      ok: false,
      code: "missing_location",
      message:
        "Completa sede e raggio operativo per vedere richieste compatibili.",
      activeInterventionCount,
    }
  }

  const selectedInterventionIds = Array.from(
    capabilitySnapshot.selectedInterventionIds,
  )
  if (selectedInterventionIds.length === 0) {
    return {
      ok: true,
      company: {
        name: company.name,
        city: company.geoLocation?.city ?? null,
        province:
          company.geoLocation?.province ?? null,
        operatingRadiusKm,
        activeInterventionCount,
      },
      requests: [],
      limit: PREVIEW_LIMIT,
      hasMore: false,
    }
  }

  const radiusMeters = operatingRadiusKm * 1000

  const rows = await prisma.$queryRaw<
    PreviewRow[]
  >`
    SELECT
      r."id" AS id,
      COALESCE(r."interventionSlug", iv."slug") AS intervention_slug,
      iv."name" AS intervention_name,
      rg."city" AS city,
      rg."province" AS province,
      r."createdAt" AS created_at,
      'selected_intervention'::text AS match_level
    FROM "Request" r
    JOIN "GeoLocation" rg
      ON rg."id" = r."geoLocationId"
    JOIN "Intervention" iv
      ON iv."id" = r."interventionId"
    WHERE r."status" IN ('APPROVED', 'PUBLISHED')
      AND r."archivedAt" IS NULL
      AND r."deletedAt" IS NULL
      AND r."interventionId" = ANY(${selectedInterventionIds}::text[])
      AND earth_box(
        ll_to_earth(${latitude}, ${longitude}),
        ${radiusMeters}
      ) @> ll_to_earth(rg."latitude", rg."longitude")
      AND earth_distance(
        ll_to_earth(${latitude}, ${longitude}),
        ll_to_earth(rg."latitude", rg."longitude")
      ) <= ${radiusMeters}
    ORDER BY r."createdAt" DESC
    LIMIT ${PREVIEW_LIMIT + 1}
  `

  const hasMore = rows.length > PREVIEW_LIMIT
  const visibleRows = hasMore
    ? rows.slice(0, PREVIEW_LIMIT)
    : rows

  return {
    ok: true,
    company: {
      name: company.name,
      city: company.geoLocation?.city ?? null,
      province:
        company.geoLocation?.province ?? null,
      operatingRadiusKm,
      activeInterventionCount,
    },
    requests: visibleRows.map((row) => ({
      id: row.id,
      interventionSlug:
        row.intervention_slug,
      interventionName:
        row.intervention_name,
      city: row.city,
      province: row.province,
      createdAt: row.created_at,
      matchLevel: row.match_level,
    })),
    limit: PREVIEW_LIMIT,
    hasMore,
  }
}
