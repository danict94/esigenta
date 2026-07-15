import type { CompanyStatus } from "@prisma/client"

import { prisma } from "../client"

export type CompanyMarketplaceCapabilitySnapshotRow = {
  id: string
  isActive: boolean
  deletedAt: Date | null
  status: CompanyStatus
  operatingRadiusKm: number
  geoLocation: {
    latitude: number
    longitude: number
  } | null
  categories: Array<{
    categoryId: string
    category: {
      projectGroupIds: string[]
    }
  }>
  interventions: Array<{
    interventionId: string
  }>
}

/**
 * Persistence projection for live marketplace matching. This is one
 * explicit Prisma operation; callers do not need to know how Company,
 * CompanyCategory, Category, CompanyIntervention and GeoLocation are stored.
 */
export async function readCompanyMarketplaceCapabilitySnapshot(
  companyId: string,
): Promise<CompanyMarketplaceCapabilitySnapshotRow | null> {
  return prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      isActive: true,
      deletedAt: true,
      status: true,
      operatingRadiusKm: true,
      geoLocation: {
        select: {
          latitude: true,
          longitude: true,
        },
      },
      categories: {
        select: {
          categoryId: true,
          category: {
            select: {
              projectGroupIds: true,
            },
          },
        },
      },
      interventions: {
        select: {
          interventionId: true,
        },
      },
    },
  })
}
