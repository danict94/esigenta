import type { CompanyMarketplaceState } from "@esigenta/auth"
import { readCompanyMarketplaceCapabilitySnapshot } from "@esigenta/database"

export type CompanyMarketplaceCapabilitySnapshot = {
  companyId: string
  marketplaceState: CompanyMarketplaceState
  coordinates: {
    latitude: number
    longitude: number
  } | null
  operatingRadiusKm: number
  enabledCategoryIds: readonly string[]
  enabledCategoryProjectGroupIds: readonly string[]
  selectedInterventionIds: readonly string[]
}

function unique(values: readonly string[]): string[] {
  return Array.from(new Set(values))
}

export async function getCompanyMarketplaceCapabilitySnapshot(
  companyId: string,
): Promise<CompanyMarketplaceCapabilitySnapshot | null> {
  const row = await readCompanyMarketplaceCapabilitySnapshot(companyId)
  if (!row) return null

  return {
    companyId: row.id,
    marketplaceState: {
      isActive: row.isActive,
      deletedAt: row.deletedAt,
      status: row.status,
    },
    coordinates: row.geoLocation,
    operatingRadiusKm: row.operatingRadiusKm,
    enabledCategoryIds: unique(row.categories.map((item) => item.categoryId)),
    enabledCategoryProjectGroupIds: unique(
      row.categories.flatMap((item) => item.category.projectGroupIds),
    ),
    selectedInterventionIds: unique(
      row.interventions.map((item) => item.interventionId),
    ),
  }
}
