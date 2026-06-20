import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"
import { getCompanyCreditSummary } from "@esigenta/billing"

type PerfRecorder = (label: string, ms: number) => void

type CompanyProfileRow = {
  id: string
  name: string
  vat_number: string
  phone: string
  website: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  province: string | null
  latitude: number | null
  longitude: number | null
  operating_radius_km: number
  onboarding_category_slug: string | null
  categories: Array<{ id: string; name: string }> | null
  services: Array<{ id: string; name: string }> | null
  fallback_category: { id: string; name: string } | null
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
  address: string | null
  city: string | null
  postalCode: string | null
  province: string | null
  latitude: number | null
  longitude: number | null
  operatingRadiusKm: number
  onboardingCategorySlug: string | null
}

export type CompanyProfileCategory = { id: string; name: string }
export type CompanyProfileService = { id: string; name: string }

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
  services: CompanyProfileService[]
  contactChangeRequests: CompanyContactChangePendingRequest[]
  credit: CompanyProfileCreditSummary
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
    // Company + categories + services (fallback category included)
    prisma.$queryRaw<Array<CompanyProfileRow>>`
      SELECT
        c."id"                     AS id,
        c."name"                   AS name,
        c."vatNumber"              AS vat_number,
        c."phone"                  AS phone,
        c."website"                AS website,
        c."address"                AS address,
        c."city"                   AS city,
        c."postalCode"             AS postal_code,
        c."province"               AS province,
        c."latitude"               AS latitude,
        c."longitude"              AS longitude,
        c."operatingRadiusKm"      AS operating_radius_km,
        c."onboardingCategorySlug" AS onboarding_category_slug,
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
            json_agg(jsonb_build_object('id', svc."id", 'name', svc."name") ORDER BY svc."name"),
            '[]'::json
          )
          FROM "CompanyService" cs
          JOIN "Service" svc ON svc."id" = cs."serviceId"
          WHERE cs."companyId" = c."id"
        )                          AS services,
        (
          SELECT jsonb_build_object('id', fc."id", 'name', fc."name")
          FROM "Category" fc
          WHERE fc."slug" = c."onboardingCategorySlug"
            AND NOT EXISTS (
              SELECT 1 FROM "CompanyCategory" cc2
              WHERE cc2."companyId" = c."id"
            )
        )                          AS fallback_category
      FROM "Company" c
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
      services: [],
      contactChangeRequests: [],
      credit,
    }
  }

  const rawCategories = (row.categories as Array<{ id: string; name: string }> | null) ?? []
  const fallback = row.fallback_category as { id: string; name: string } | null

  const categories: CompanyProfileCategory[] =
    rawCategories.length > 0
      ? rawCategories
      : fallback
        ? [fallback]
        : []

  const services: CompanyProfileService[] =
    (row.services as Array<{ id: string; name: string }> | null) ?? []

  const contactChangeRequests: CompanyContactChangePendingRequest[] = contactRows.map(
    (r) => ({
      id: r.id,
      field: r.field,
      currentValue: r.current_value,
      requestedValue: r.requested_value,
      createdAt: r.created_at,
    }),
  )

  const company: CompanyProfileData = {
    id: row.id,
    name: row.name,
    vatNumber: row.vat_number,
    phone: row.phone,
    website: row.website,
    address: row.address,
    city: row.city,
    postalCode: row.postal_code,
    province: row.province,
    latitude: row.latitude,
    longitude: row.longitude,
    operatingRadiusKm: Number(row.operating_radius_km),
    onboardingCategorySlug: row.onboarding_category_slug,
  }

  return { company, categories, services, contactChangeRequests, credit }
}
