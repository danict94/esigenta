import type { CompanyActor } from "@esigenta/auth"
import { prisma, writeCompanyServiceConfigurationWithClient } from "@esigenta/database"

type PerfRecorder = (label: string, ms: number) => void

const MAX_CATEGORIES = 6

export type UpdateServicesConfigurationInput = {
  selectedCategoryIds: string[]
  selectedInterventionIds: string[]
}

export type UpdateServicesConfigurationResult =
  | { ok: true }
  | {
      ok: false
      code:
        | "missing_categories"
        | "too_many_categories"
        | "invalid_categories"
        | "missing_interventions"
        | "invalid_interventions"
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
  const selectedInterventionIds = normalizeIds(input.selectedInterventionIds)

  if (selectedCategoryIds.length === 0) {
    return { ok: false, code: "missing_categories" }
  }

  if (selectedCategoryIds.length > MAX_CATEGORIES) {
    return { ok: false, code: "too_many_categories" }
  }

  // CompanyIntervention is the sole source of truth for matching (Phase 10)
  // and the marketplace dashboard (Phase 14). An empty submission would
  // otherwise wipe every existing row via the `!= ALL(...)` CTE below, so
  // it must be rejected before any database round trip.
  if (selectedInterventionIds.length === 0) {
    return { ok: false, code: "missing_interventions" }
  }

  // Round-trip 1: validate that the submitted ids actually exist. Category
  // and Intervention are validated independently — the frozen model has no
  // Category<->Intervention relation to cross-check against (see
  // docs/taxonomy.md: Category never participates in matching or
  // authorization).
  const t0 = performance.now()
  const [foundCategories, foundInterventions] = await Promise.all([
    prisma.category.findMany({
      where: { id: { in: selectedCategoryIds } },
      select: { id: true },
    }),
    prisma.intervention.findMany({
      where: { id: { in: selectedInterventionIds } },
      select: { id: true },
    }),
  ])
  recordPerf?.("services-config-validate", Math.round(performance.now() - t0))

  if (foundCategories.length !== selectedCategoryIds.length) {
    return { ok: false, code: "invalid_categories" }
  }

  if (foundInterventions.length !== selectedInterventionIds.length) {
    return { ok: false, code: "invalid_interventions" }
  }

  const companyId = actor.company.id

  // Round-trip 2: atomic write CTE, shared with @esigenta/auth's onboarding
  // bootstrap via @esigenta/database (which cannot be @esigenta/domain —
  // see packages/database/src/index.ts) so both writers use the exact same
  // replace-set semantics instead of two independently-maintained copies.
  // - CompanyCategory <- selectedCategoryIds (replace set)
  // - CompanyIntervention <- selectedInterventionIds (replace set) — the
  //   sole frozen-model source of truth for matching (Phase 10) and the
  //   marketplace dashboard (Phase 14).
  // CompanyService is no longer written here (Phase 15A): verified via
  // repo-wide search that nothing reads it anymore — not matching, not
  // the dashboard, not the profile page. See
  // docs/archive-legacy/refoundation/taxonomy-refoundation/15A_IMMEDIATE_REMOVALS_REPORT.md.
  const t1 = performance.now()
  await writeCompanyServiceConfigurationWithClient(prisma, {
    companyId,
    categoryIds: selectedCategoryIds,
    interventionIds: selectedInterventionIds,
  })
  recordPerf?.("services-config-write", Math.round(performance.now() - t1))

  return { ok: true }
}
