import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

type PerfRecorder = (label: string, ms: number) => void

const MAX_CATEGORIES = 6

export type UpdateServicesConfigurationInput = {
  selectedCategoryIds: string[]
  selectedServiceIds: string[]
  requestedRequestMatchingMode:
    | "CATEGORY_WITH_SERVICE_PRIORITY"
    | "SELECTED_SERVICES_ONLY"
}

export type UpdateServicesConfigurationResult =
  | { ok: true }
  | {
      ok: false
      code:
        | "missing_categories"
        | "too_many_categories"
        | "invalid_services"
    }

type ValidationRow = {
  category_id: string
  service_id: string | null
}

function normalizeIds(values: string[]): string[] {
  return Array.from(
    new Set(values.map((v) => v.trim()).filter(Boolean)),
  )
}

export async function updateCompanyServicesConfiguration(
  actor: CompanyActor,
  input: UpdateServicesConfigurationInput,
  recordPerf?: PerfRecorder,
): Promise<UpdateServicesConfigurationResult> {
  const selectedCategoryIds = normalizeIds(input.selectedCategoryIds)
  const selectedServiceIds  = normalizeIds(input.selectedServiceIds)

  if (selectedCategoryIds.length === 0) {
    return { ok: false, code: "missing_categories" }
  }

  if (selectedCategoryIds.length > MAX_CATEGORIES) {
    return { ok: false, code: "too_many_categories" }
  }

  const requestMatchingMode =
    selectedServiceIds.length > 0
      ? input.requestedRequestMatchingMode
      : "CATEGORY_WITH_SERVICE_PRIORITY"

  // Round-trip 1: validate categories exist + derive allowed service IDs
  const t0 = performance.now()
  const validationRows = await prisma.$queryRaw<Array<ValidationRow>>`
    SELECT
      c."id"              AS category_id,
      catsvc."serviceId"  AS service_id
    FROM "Category" c
    LEFT JOIN "CategoryService" catsvc ON catsvc."categoryId" = c."id"
    WHERE c."id" = ANY(${selectedCategoryIds}::text[])
  `
  recordPerf?.("services-config-validate", Math.round(performance.now() - t0))

  const foundCategoryIds = new Set(validationRows.map((r) => r.category_id))

  if (foundCategoryIds.size !== selectedCategoryIds.length) {
    return { ok: false, code: "missing_categories" }
  }

  const allowedServiceIds = new Set(
    validationRows.map((r) => r.service_id).filter((id): id is string => id !== null),
  )

  const hasInvalidService = selectedServiceIds.some(
    (id) => !allowedServiceIds.has(id),
  )

  if (selectedServiceIds.length > 0 && hasInvalidService) {
    return { ok: false, code: "invalid_services" }
  }

  const validSelectedServiceIds = selectedServiceIds.filter((id) =>
    allowedServiceIds.has(id),
  )

  const companyId = actor.company.id

  // Round-trip 2: atomic write CTE
  // - UPDATE Company requestMatchingMode
  // - DELETE CompanyCategory rows NOT in new set → INSERT new with ON CONFLICT DO NOTHING
  // - DELETE CompanyService rows NOT in new set → INSERT new with ON CONFLICT DO NOTHING
  const t1 = performance.now()
  await prisma.$executeRaw`
    WITH
      _upd_mode AS (
        UPDATE "Company"
        SET "requestMatchingMode" = ${requestMatchingMode}::"CompanyRequestMatchingMode"
        WHERE "id" = ${companyId}
      ),
      _del_cat AS (
        DELETE FROM "CompanyCategory"
        WHERE "companyId" = ${companyId}
          AND "categoryId" != ALL(${selectedCategoryIds}::text[])
      ),
      _del_svc AS (
        DELETE FROM "CompanyService"
        WHERE "companyId" = ${companyId}
          AND "serviceId" != ALL(${validSelectedServiceIds}::text[])
      ),
      _ins_cat AS (
        INSERT INTO "CompanyCategory" ("companyId", "categoryId")
        SELECT ${companyId}, id FROM unnest(${selectedCategoryIds}::text[]) AS id
        ON CONFLICT ("companyId", "categoryId") DO NOTHING
      ),
      _ins_svc AS (
        INSERT INTO "CompanyService" ("companyId", "serviceId")
        SELECT ${companyId}, id FROM unnest(${validSelectedServiceIds}::text[]) AS id
        ON CONFLICT ("companyId", "serviceId") DO NOTHING
      )
    SELECT 1
  `
  recordPerf?.("services-config-write", Math.round(performance.now() - t1))

  return { ok: true }
}
