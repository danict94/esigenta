import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

type PerfRecorder = (label: string, ms: number) => void

type CompanyConfigRow = {
  id: string
  name: string
  onboarding_category_slug: string | null
  category_ids: string[] | null
  service_ids: string[] | null
}

type CategoryRow = {
  id: string
  slug: string
  name: string
  sector_name: string | null
  services: Array<{
    id: string
    name: string
    description: string | null
  }>
}

export type CompanyServicesConfigurationState = {
  id: string
  name: string
  onboardingCategorySlug: string | null
  categoryIds: string[]
  serviceIds: string[]
}

export type ConfigurableServiceCategory = {
  id: string
  slug: string
  name: string
  sector: { name: string } | null
  services: Array<{
    id: string
    name: string
    description: string | null
  }>
}

export type GetCompanyServicesConfigurationPageResult = {
  company: CompanyServicesConfigurationState | null
  categories: ConfigurableServiceCategory[]
}

export async function getCompanyServicesConfigurationPage(
  actor: CompanyActor,
  recordPerf?: PerfRecorder,
): Promise<GetCompanyServicesConfigurationPageResult> {
  const t0 = performance.now()

  // 2 SQL queries in parallel → 1 round-trip wall time
  const [companyRows, categoryRows] = await Promise.all([
    // Company + active categories + active services (aggregated)
    prisma.$queryRaw<Array<CompanyConfigRow>>`
      SELECT
        c."id"                      AS id,
        c."name"                    AS name,
        c."onboardingCategorySlug"  AS onboarding_category_slug,
        (
          SELECT COALESCE(json_agg(cc."categoryId"), '[]'::json)
          FROM "CompanyCategory" cc
          WHERE cc."companyId" = c."id"
        )                           AS category_ids,
        (
          SELECT COALESCE(json_agg(cs."serviceId"), '[]'::json)
          FROM "CompanyService" cs
          WHERE cs."companyId" = c."id"
        )                           AS service_ids
      FROM "Company" c
      WHERE c."id" = ${actor.company.id}
    `,

    // All categories with sector + services (taxonomy read — full list)
    prisma.$queryRaw<Array<CategoryRow>>`
      SELECT
        cat."id"             AS id,
        cat."slug"           AS slug,
        cat."name"           AS name,
        sec."name"           AS sector_name,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'id',          svc."id",
              'name',        svc."name",
              'description', svc."description"
            ) ORDER BY svc."name"
          ) FILTER (WHERE svc."id" IS NOT NULL),
          '[]'::json
        )                    AS services
      FROM "Category" cat
      JOIN "Sector" sec ON sec."id" = cat."sectorId"
      LEFT JOIN "CategoryService" catsvc ON catsvc."categoryId" = cat."id"
      LEFT JOIN "Service" svc ON svc."id" = catsvc."serviceId"
      GROUP BY cat."id", cat."slug", cat."name", sec."name"
      ORDER BY cat."name"
    `,
  ])

  recordPerf?.("services-config-queries", Math.round(performance.now() - t0))

  const companyRow = companyRows[0] ?? null

  const company: CompanyServicesConfigurationState | null = companyRow
    ? {
        id: companyRow.id,
        name: companyRow.name,
        onboardingCategorySlug: companyRow.onboarding_category_slug,
        categoryIds: (companyRow.category_ids as string[] | null) ?? [],
        serviceIds: (companyRow.service_ids as string[] | null) ?? [],
      }
    : null

  const categories: ConfigurableServiceCategory[] = categoryRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    sector: row.sector_name ? { name: row.sector_name } : null,
    services: (row.services as ConfigurableServiceCategory["services"]) ?? [],
  }))

  return { company, categories }
}
