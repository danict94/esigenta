import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

import { deriveCompanyConfigurationStatus } from "../configuration/company-configuration-status"
import { resolveConfigurableCategorySuggestions } from "./resolve-configurable-category-suggestions"

type PerfRecorder = (label: string, ms: number) => void

type CompanyConfigRow = {
  id: string
  name: string
  category_ids: string[] | null
  intervention_ids: string[] | null
}

type CategoryRow = {
  id: string
  slug: string
  name: string
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
  categoryIds: string[]
  interventionIds: string[]
  isConfigured: boolean
}

export type ConfigurableCategory = {
  id: string
  slug: string
  name: string
  suggestedInterventionIds: string[]
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
  // docs/archive-legacy/refoundation/taxonomy-refoundation/09_COMPANY_CONFIGURATION_CUTOVER.md §C.
  const [companyRows, categoryRows, projectGroupRows] = await Promise.all([
    prisma.$queryRaw<Array<CompanyConfigRow>>`
      SELECT
        c."id"                      AS id,
        c."name"                    AS name,
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
        cat."name"                     AS name
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
      -- Publication gate: a draft Intervention must not appear as a
      -- selectable service in company onboarding/configuration, same rule
      -- as the customer-facing surfaces (search, /richiesta, /servizi).
      LEFT JOIN "Intervention" iv
        ON iv."projectGroupId" = pg."id"
        AND iv."publicationStatus" = 'PUBLISHED'
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
        ...deriveCompanyConfigurationStatus({
          categoryIds: (companyRow.category_ids as string[] | null) ?? [],
          interventionIds: (companyRow.intervention_ids as string[] | null) ?? [],
        }),
      }
    : null

  const projectGroups: ConfigurableProjectGroup[] = projectGroupRows.map(
    (row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      interventions:
        (row.interventions as ConfigurableProjectGroup["interventions"]) ?? [],
    }),
  )

  const categories: ConfigurableCategory[] =
    resolveConfigurableCategorySuggestions(categoryRows, projectGroups)

  return { company, categories, projectGroups }
}
