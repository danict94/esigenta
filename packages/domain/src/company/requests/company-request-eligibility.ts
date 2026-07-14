import { prisma, resolveInterventionsForCategoryIdsWithClient } from "@esigenta/database"
import type { CategoryInterventionRow } from "@esigenta/database"

/**
 * THE canonical "which interventions can this company see requests for"
 * computation — see docs/domain-invariants/03_REQUEST_VISIBILITY.md.
 * Used by both the browse list (get-requests-list-page.ts) and the detail
 * page (get-request-detail-page.ts) so they can never disagree about which
 * interventions are in scope for a company. Marketplace visibility/ranking
 * is Intervention-only (Phase 14): no Service, CategoryService,
 * CompanyService, or RequestRequiredService anywhere here. Category has no
 * direct relation to Intervention — the only path is
 * Category.projectGroupIds (a plain string[] column, no join) ->
 * Intervention.projectGroupId.
 */

export type EligibilityInterventionRow = CategoryInterventionRow

export type CompanyRequestEligibility = {
  resolvedCategoryIds: string[]
  selectedInterventionIds: Set<string>
  operationalInterventionIds: Set<string>
  /**
   * Same definition as CompanyConfigured (Phase 1,
   * docs/domain-invariants/01_CONFIGURATION_CONSOLIDATION.md): at least one
   * real CompanyCategory row AND at least one resolvable operational
   * intervention. Gates whether browsing/visibility happens at all.
   */
  isConfigured: boolean
}

// Category -> ProjectGroup -> Intervention traversal, shared with
// @esigenta/auth's onboarding bootstrap via @esigenta/database (which
// cannot be @esigenta/domain — see packages/database/src/index.ts) so
// there is exactly one implementation of this expansion, not two.
export async function loadInterventionsForCategoryIds(
  categoryIds: string[],
): Promise<{
  projectGroupIds: string[]
  interventions: EligibilityInterventionRow[]
}> {
  return resolveInterventionsForCategoryIdsWithClient(prisma, categoryIds)
}

/**
 * The one place that computes "what is this company configured/eligible
 * for." Both readers of CompanyConfigured-adjacent visibility data
 * (browse list, request detail) call this — neither recomputes it
 * independently.
 */
export async function resolveCompanyRequestEligibility(
  companyId: string,
): Promise<CompanyRequestEligibility> {
  const [companyCategoryRows, companyInterventionRows] = await Promise.all([
    prisma.companyCategory.findMany({
      where: { companyId },
      select: { categoryId: true },
    }),
    prisma.companyIntervention.findMany({
      where: { companyId },
      select: { interventionId: true },
    }),
  ])

  const resolvedCategoryIds = companyCategoryRows.map((cc) => cc.categoryId)
  const selectedInterventionIds = new Set(
    companyInterventionRows.map((ci) => ci.interventionId),
  )

  const { interventions: operationalInterventions } =
    await loadInterventionsForCategoryIds(resolvedCategoryIds)

  const operationalInterventionIds = new Set(
    operationalInterventions.map((iv) => iv.id),
  )

  return {
    resolvedCategoryIds,
    selectedInterventionIds,
    operationalInterventionIds,
    isConfigured:
      resolvedCategoryIds.length > 0 && operationalInterventionIds.size > 0,
  }
}

/**
 * The "no filter applied" default visibility set — union of directly
 * selected (CompanyIntervention) and category-derived (CompanyCategory ->
 * ProjectGroup -> Intervention) interventions. Dispatch (CompanyIntervention
 * only, no category broadening) is deliberately narrower than this — see
 * docs/domain-invariants/03_REQUEST_VISIBILITY.md Task 7. The dashboard
 * must not be stricter than dispatch, or a company stops seeing requests
 * it's actually being notified about.
 */
export function getDefaultVisibilityInterventionIds(
  eligibility: CompanyRequestEligibility,
): Set<string> {
  return new Set([
    ...eligibility.selectedInterventionIds,
    ...eligibility.operationalInterventionIds,
  ])
}
