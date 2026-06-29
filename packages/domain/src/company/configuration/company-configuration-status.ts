import { prisma } from "@esigenta/database"

/**
 * THE canonical answer to "is this company configured?" — see
 * docs/domain-invariants/01_CONFIGURATION_CONSOLIDATION.md. Sourced only
 * from CompanyCategory and CompanyIntervention, the two tables
 * update-services-configuration.ts is the sole writer of.
 *
 * Company.onboardingCategorySlug is never read here and must never be —
 * it is onboarding memory only, not configuration (see
 * docs/archive-legacy/refoundation/company-configuration/ONBOARDING_CONFIGURATION_REFOUNDATION_AUDIT.md).
 */
export type CompanyConfigurationStatus = {
  categoryIds: string[]
  interventionIds: string[]
  isConfigured: boolean
}

/**
 * Pure derivation — the single definition of "configured." Every caller
 * that already has categoryIds/interventionIds (e.g. from its own batched
 * query) must compute isConfigured through this function, not by
 * reimplementing the length check inline.
 */
export function deriveCompanyConfigurationStatus({
  categoryIds,
  interventionIds,
}: {
  categoryIds: string[]
  interventionIds: string[]
}): CompanyConfigurationStatus {
  return {
    categoryIds,
    interventionIds,
    isConfigured: categoryIds.length > 0 && interventionIds.length > 0,
  }
}

/**
 * Convenience fetch-and-derive for callers that don't already have
 * categoryIds/interventionIds from their own query.
 */
export async function getCompanyConfigurationStatus(
  companyId: string,
): Promise<CompanyConfigurationStatus> {
  const [categories, interventions] = await Promise.all([
    prisma.companyCategory.findMany({
      where: { companyId },
      select: { categoryId: true },
    }),
    prisma.companyIntervention.findMany({
      where: { companyId },
      select: { interventionId: true },
    }),
  ])

  return deriveCompanyConfigurationStatus({
    categoryIds: categories.map((c) => c.categoryId),
    interventionIds: interventions.map((i) => i.interventionId),
  })
}
