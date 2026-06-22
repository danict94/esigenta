import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

import { deriveCompanyConfigurationStatus } from "../configuration/company-configuration-status"

type PerfRecorder = (label: string, ms: number) => void

type CompanyConfigRow = {
  id: string
  name: string
  onboarding_category_slug: string | null
  category_ids: string[] | null
  intervention_ids: string[] | null
}

type CategoryRow = {
  id: string
  slug: string
  name: string
  project_group_ids: string[] | null
}

type ProjectGroupRow = {
  id: string
  slug: string
  name: string
  interventions: Array<{
    id: string
    slug: string
    name: string
    description: string | null
  }>
}

export type CompanyServicesConfigurationState = {
  id: string
  name: string
  /**
   * Onboarding memory only — a one-time signup suggestion. Never treated
   * as configuration; isConfigured below is the only real signal. See
   * docs/domain-invariants/01_CONFIGURATION_CONSOLIDATION.md.
   */
  onboardingCategorySlug: string | null
  categoryIds: string[]
  interventionIds: string[]
  isConfigured: boolean
}

export type ConfigurableCategory = {
  id: string
  slug: string
  name: string
  projectGroupIds: string[]
}

export type ConfigurableProjectGroup = {
  id: string
  slug: string
  name: string
  interventions: Array<{
    id: string
    slug: string
    name: string
    description: string | null
  }>
}

export type GetCompanyServicesConfigurationPageResult = {
  company: CompanyServicesConfigurationState | null
  categories: ConfigurableCategory[]
  projectGroups: ConfigurableProjectGroup[]
}

export async function getCompanyServicesConfigurationPage(
  actor: CompanyActor,
  recordPerf?: PerfRecorder,
): Promise<GetCompanyServicesConfigurationPageResult> {
  const t0 = performance.now()

  // 3 SQL queries in parallel -> 1 round-trip wall time. Frozen-model read
  // path only: Category, ProjectGroup, Intervention. No Service,
  // ServiceGroup, or Sector is read here — see
  // docs/taxonomy-refoundation/09_COMPANY_CONFIGURATION_CUTOVER.md §C.
  const [companyRows, categoryRows, projectGroupRows] = await Promise.all([
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
          SELECT COALESCE(json_agg(ci."interventionId"), '[]'::json)
          FROM "CompanyIntervention" ci
          WHERE ci."companyId" = c."id"
        )                           AS intervention_ids
      FROM "Company" c
      WHERE c."id" = ${actor.company.id}
    `,

    prisma.$queryRaw<Array<CategoryRow>>`
      SELECT
        cat."id"                       AS id,
        cat."slug"                     AS slug,
        cat."name"                     AS name,
        cat."projectGroupIds"          AS project_group_ids
      FROM "Category" cat
      ORDER BY cat."name"
    `,

    prisma.$queryRaw<Array<ProjectGroupRow>>`
      SELECT
        pg."id"   AS id,
        pg."slug" AS slug,
        pg."name" AS name,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'id',          iv."id",
              'slug',        iv."slug",
              'name',        iv."name",
              'description', iv."description"
            ) ORDER BY iv."name"
          ) FILTER (WHERE iv."id" IS NOT NULL),
          '[]'::json
        ) AS interventions
      FROM "ProjectGroup" pg
      LEFT JOIN "Intervention" iv ON iv."projectGroupId" = pg."id"
      GROUP BY pg."id", pg."slug", pg."name"
      ORDER BY pg."name"
    `,
  ])

  recordPerf?.("services-config-queries", Math.round(performance.now() - t0))

  const companyRow = companyRows[0] ?? null

  const company: CompanyServicesConfigurationState | null = companyRow
    ? {
        id: companyRow.id,
        name: companyRow.name,
        onboardingCategorySlug: companyRow.onboarding_category_slug,
        ...deriveCompanyConfigurationStatus({
          categoryIds: (companyRow.category_ids as string[] | null) ?? [],
          interventionIds: (companyRow.intervention_ids as string[] | null) ?? [],
        }),
      }
    : null

  const categories: ConfigurableCategory[] = categoryRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    projectGroupIds: (row.project_group_ids as string[] | null) ?? [],
  }))

  const projectGroups: ConfigurableProjectGroup[] = projectGroupRows.map(
    (row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      interventions:
        (row.interventions as ConfigurableProjectGroup["interventions"]) ?? [],
    }),
  )

  return { company, categories, projectGroups }
}
