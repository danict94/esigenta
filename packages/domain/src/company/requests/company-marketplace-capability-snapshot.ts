import type { CompanyMarketplaceState } from "@esigenta/auth"
import {
  readCompanyMarketplaceCapabilitySnapshot,
  type CompanyMarketplaceCapabilitySnapshotRow,
} from "@esigenta/database"

import { deriveCompanyConfigurationStatus } from "../configuration/company-configuration-status"

export type CompanyMarketplaceCapabilitySnapshot = {
  companyId: string
  marketplaceState: CompanyMarketplaceState
  coordinates: {
    latitude: number
    longitude: number
  } | null
  operatingRadiusKm: number
  enabledCategoryIds: readonly string[]
  selectedInterventionIds: readonly string[]
  isConfigured: boolean
}

function unique(values: readonly string[]): string[] {
  return Array.from(new Set(values))
}

export async function getCompanyMarketplaceCapabilitySnapshot(
  companyId: string,
  readSnapshot: (
    companyId: string,
  ) => Promise<CompanyMarketplaceCapabilitySnapshotRow | null> =
    readCompanyMarketplaceCapabilitySnapshot,
): Promise<CompanyMarketplaceCapabilitySnapshot | null> {
  const row = await readSnapshot(companyId)
  if (!row) return null

  const enabledCategoryIds = unique(
    row.categories.map((item) => item.categoryId),
  )
  const selectedInterventionIds = unique(
    row.interventions.map((item) => item.interventionId),
  )
  const { isConfigured } = deriveCompanyConfigurationStatus({
    categoryIds: enabledCategoryIds,
    interventionIds: selectedInterventionIds,
  })
  return {
    companyId: row.id,
    marketplaceState: {
      isActive: row.isActive,
      deletedAt: row.deletedAt,
      status: row.status,
    },
    coordinates: row.geoLocation,
    operatingRadiusKm: row.operatingRadiusKm,
    enabledCategoryIds,
    selectedInterventionIds,
    isConfigured,
  }
}
