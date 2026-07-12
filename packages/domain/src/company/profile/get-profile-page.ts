import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"
import { getCompanyCreditSummary } from "@esigenta/billing"
import type { GeoPlace } from "@esigenta/shared"

import { deriveCompanyConfigurationStatus } from "../configuration/company-configuration-status"
import {
  deriveCompanyProfileCompleteness,
  type CompanyProfileCompleteness,
} from "./derive-company-profile-completeness"

type PerfRecorder = (label: string, ms: number) => void

type CompanyProfileRow = {
  id: string
  name: string
  vat_number: string
  phone: string
  website: string | null
  geo_place_id: string | null
  geo_place_id_external: string | null
  geo_formatted_address: string | null
  geo_city: string | null
  geo_postal_code: string | null
  geo_province: string | null
  geo_latitude: number | null
  geo_longitude: number | null
  geo_source: "GOOGLE_PLACES" | "LEGACY_BACKFILL" | null
  geo_resolved_at: Date | null
  operating_radius_km: number
  categories: Array<{ id: string; name: string }> | null
  interventions: Array<{ id: string; name: string }> | null
  public_name: string | null
  public_slug: string | null
  short_description: string | null
  full_description: string | null
  years_of_experience: number | null
  public_profile_consent_at: Date | null
}

type ContactChangeRow = {
  id: string
  field: string
  current_value: string | null
  requested_value: string
  created_at: Date
}

export type CompanyProfileData = {
  id: string
  name: string
  vatNumber: string
  phone: string
  website: string | null
  geoPlace: GeoPlace | null
  operatingRadiusKm: number
  isConfigured: boolean
  publicName: string | null
  publicSlug: string | null
  shortDescription: string | null
  fullDescription: string | null
  yearsOfExperience: number | null
  publicProfileConsentAt: Date | null
  profileCompleteness: CompanyProfileCompleteness
}

export type CompanyProfileCategory = { id: string; name: string }
export type CompanyProfileIntervention = { id: string; name: string }

export type CompanyContactChangePendingRequest = {
  id: string
  field: string
  currentValue: string | null
  requestedValue: string
  createdAt: Date
}

export type CompanyProfileCreditSummary = {
  balance: number
  expiresAt: Date | null
} | null

export type GetCompanyProfilePageResult = {
  company: CompanyProfileData | null
  categories: CompanyProfileCategory[]
  interventions: CompanyProfileIntervention[]
  contactChangeRequests: CompanyContactChangePendingRequest[]
  credit: CompanyProfileCreditSummary
}

function rowToGeoPlace(row: CompanyProfileRow): GeoPlace | null {
  if (
    !row.geo_place_id ||
    !row.geo_formatted_address ||
    !row.geo_city ||
    row.geo_latitude === null ||
    row.geo_longitude === null ||
    !row.geo_source ||
    !row.geo_resolved_at
  ) {
    return null
  }

  return {
    placeId: row.geo_place_id_external,
    formattedAddress: row.geo_formatted_address,
    city: row.geo_city,
    postalCode: row.geo_postal_code,
    province: row.geo_province,
    latitude: row.geo_latitude,
    longitude: row.geo_longitude,
    source: row.geo_source,
    resolvedAt: row.geo_resolved_at.toISOString(),
  }
}

async function getCreditSummary(
  companyId: string,
  now: Date,
): Promise<CompanyProfileCreditSummary> {
  // Always derives from CreditLot (the financial source of truth, D-011):
  // never reads/writes CompanyCreditAccount directly. expiresAt here is the
  // nearest active lot expiry — the date meaningful to show a company on
  // its profile, not the cache's MAX-of-all-lots safety value.
  const summary = await getCompanyCreditSummary(companyId, now)
  return { balance: summary.balance, expiresAt: summary.nearestExpiresAt }
}

export async function getCompanyProfilePage(
  actor: CompanyActor,
  recordPerf?: PerfRecorder,
): Promise<GetCompanyProfilePageResult> {
  const t0 = performance.now()
  const now = new Date()

  const [companyRows, contactRows, credit] = await Promise.all([
    // Company + geo location + categories + interventions
    prisma.$queryRaw<Array<CompanyProfileRow>>`
      SELECT
        c."id"                     AS id,
        c."name"                   AS name,
        c."vatNumber"              AS vat_number,
        c."phone"                  AS phone,
        c."website"                AS website,
        gl."id"                    AS geo_place_id,
        gl."placeId"               AS geo_place_id_external,
        gl."formattedAddress"      AS geo_formatted_address,
        gl."city"                  AS geo_city,
        gl."postalCode"            AS geo_postal_code,
        gl."province"              AS geo_province,
        gl."latitude"              AS geo_latitude,
        gl."longitude"             AS geo_longitude,
        gl."source"                AS geo_source,
        gl."resolvedAt"            AS geo_resolved_at,
        c."operatingRadiusKm"      AS operating_radius_km,
        c."publicName"             AS public_name,
        c."publicSlug"             AS public_slug,
        c."shortDescription"       AS short_description,
        c."fullDescription"        AS full_description,
        c."yearsOfExperience"      AS years_of_experience,
        c."publicProfileConsentAt" AS public_profile_consent_at,
        (
          SELECT COALESCE(
            json_agg(jsonb_build_object('id', cat."id", 'name', cat."name") ORDER BY cc."createdAt"),
            '[]'::json
          )
          FROM "CompanyCategory" cc
          JOIN "Category" cat ON cat."id" = cc."categoryId"
          WHERE cc."companyId" = c."id"
        )                          AS categories,
        (
          SELECT COALESCE(
            json_agg(jsonb_build_object('id', iv."id", 'name', iv."name") ORDER BY iv."name"),
            '[]'::json
          )
          FROM "CompanyIntervention" ci
          JOIN "Intervention" iv ON iv."id" = ci."interventionId"
          WHERE ci."companyId" = c."id"
        )                          AS interventions
      FROM "Company" c
      LEFT JOIN "GeoLocation" gl ON gl."id" = c."geoLocationId"
      WHERE c."id" = ${actor.company.id}
    `,

    // Pending contact change requests
    prisma.$queryRaw<Array<ContactChangeRow>>`
      SELECT
        "id"             AS id,
        "field"::text    AS field,
        "currentValue"   AS current_value,
        "requestedValue" AS requested_value,
        "createdAt"      AS created_at
      FROM "CompanyContactChangeRequest"
      WHERE "companyId" = ${actor.company.id}
        AND "status" = 'PENDING_REVIEW'::"CompanyContactChangeStatus"
      ORDER BY "createdAt" DESC
    `,

    getCreditSummary(actor.company.id, now),
  ])

  recordPerf?.("profile-queries", Math.round(performance.now() - t0))

  const row = companyRows[0] ?? null

  if (!row) {
    return {
      company: null,
      categories: [],
      interventions: [],
      contactChangeRequests: [],
      credit,
    }
  }

  // Real saved configuration only — no onboardingCategorySlug fallback.
  // See docs/domain-invariants/01_CONFIGURATION_CONSOLIDATION.md.
  const categories: CompanyProfileCategory[] =
    (row.categories as Array<{ id: string; name: string }> | null) ?? []

  const interventions: CompanyProfileIntervention[] =
    (row.interventions as Array<{ id: string; name: string }> | null) ?? []

  const { isConfigured } = deriveCompanyConfigurationStatus({
    categoryIds: categories.map((c) => c.id),
    interventionIds: interventions.map((i) => i.id),
  })

  const contactChangeRequests: CompanyContactChangePendingRequest[] = contactRows.map(
    (r) => ({
      id: r.id,
      field: r.field,
      currentValue: r.current_value,
      requestedValue: r.requested_value,
      createdAt: r.created_at,
    }),
  )

  const geoPlace = rowToGeoPlace(row)
  const operatingRadiusKm = Number(row.operating_radius_km)

  const profileCompleteness = deriveCompanyProfileCompleteness({
    publicName: row.public_name,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    website: row.website,
    yearsOfExperience: row.years_of_experience,
    hasGeoLocation: geoPlace !== null,
    operatingRadiusKm,
    categoryCount: categories.length,
    interventionCount: interventions.length,
    phone: row.phone,
    vatNumber: row.vat_number,
  })

  const company: CompanyProfileData = {
    id: row.id,
    name: row.name,
    vatNumber: row.vat_number,
    phone: row.phone,
    website: row.website,
    geoPlace,
    operatingRadiusKm,
    isConfigured,
    publicName: row.public_name,
    publicSlug: row.public_slug,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    yearsOfExperience: row.years_of_experience,
    publicProfileConsentAt: row.public_profile_consent_at,
    profileCompleteness,
  }

  return { company, categories, interventions, contactChangeRequests, credit }
}
