import type { CompanyStatus } from "@prisma/client"

import { prisma } from "@esigenta/database"
import { getCompanyCreditSummary } from "@esigenta/billing"

import {
  deriveCompanyProfileCompleteness,
  type CompanyProfileCompleteness,
} from "../../company/profile/derive-company-profile-completeness"

import {
  deriveCompanyAdminBadge,
  type CompanyAdminBadge,
} from "./derive-company-admin-badge"

export type AdminCompanyDetailCategory = {
  id: string
  name: string
}

export type AdminCompanyDetailIntervention = {
  id: string
  name: string
}

export type AdminCompanyDetail = {
  id: string
  name: string
  publicName: string | null
  vatNumber: string
  phone: string
  website: string | null
  createdAt: Date
  /**
   * Same email-resolution rule as the list (owner membership preferred,
   * otherwise earliest member) — never statusChangedByAdminUser, never
   * AdminProfile.
   */
  email: string | null
  owner: {
    id: string
    email: string
    name: string | null
  } | null
  status: CompanyStatus
  approvedAt: Date | null
  suspendedAt: Date | null
  blockedAt: Date | null
  statusChangeReason: string | null
  statusChangedByAdmin: {
    id: string
    email: string
    name: string | null
  } | null
  adminBadge: CompanyAdminBadge
  city: string | null
  operatingRadiusKm: number
  categories: AdminCompanyDetailCategory[]
  interventions: AdminCompanyDetailIntervention[]
  profileCompleteness: CompanyProfileCompleteness
  /** null only if the credit summary lookup itself fails to resolve an account — shown as "—" in the UI, not 0. */
  creditBalance: number | null
  unlockCount: number
  savedRequestCount: number
}

/**
 * Detail-only aggregation — deliberately heavier than listAdminCompanies
 * (full category/intervention names, credit balance, activity counts).
 * Safe here because it loads exactly one company, never a list.
 */
export async function getAdminCompanyDetail(
  companyId: string,
): Promise<AdminCompanyDetail | null> {
  const normalizedId = companyId.trim()

  if (!normalizedId) {
    return null
  }

  const company = await prisma.company.findUnique({
    where: { id: normalizedId },
    select: {
      id: true,
      name: true,
      publicName: true,
      vatNumber: true,
      phone: true,
      website: true,
      operatingRadiusKm: true,
      geoLocation: {
        select: { city: true },
      },
      shortDescription: true,
      fullDescription: true,
      yearsOfExperience: true,
      createdAt: true,
      status: true,
      approvedAt: true,
      suspendedAt: true,
      blockedAt: true,
      statusChangeReason: true,
      statusChangedByAdminUser: {
        select: { id: true, email: true, name: true },
      },
      memberships: {
        orderBy: { createdAt: "asc" },
        select: {
          role: true,
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      },
      categories: {
        orderBy: { createdAt: "asc" },
        select: {
          category: {
            select: { id: true, name: true },
          },
        },
      },
      interventions: {
        orderBy: { createdAt: "asc" },
        select: {
          intervention: {
            select: { id: true, name: true },
          },
        },
      },
      _count: {
        select: {
          requestUnlocks: true,
          savedRequests: true,
        },
      },
    },
  })

  if (!company) {
    return null
  }

  const owner =
    company.memberships.find((m) => m.role === "OWNER")?.user ??
    company.memberships[0]?.user ??
    null

  const categories = company.categories.map((c) => c.category)
  const interventions = company.interventions.map((i) => i.intervention)

  const profileCompleteness = deriveCompanyProfileCompleteness({
    publicName: company.publicName,
    shortDescription: company.shortDescription,
    fullDescription: company.fullDescription,
    website: company.website,
    yearsOfExperience: company.yearsOfExperience,
    hasGeoLocation: company.geoLocation !== null,
    operatingRadiusKm: company.operatingRadiusKm,
    categoryCount: categories.length,
    interventionCount: interventions.length,
    phone: company.phone,
    vatNumber: company.vatNumber,
  })

  // Best-effort: a credit summary lookup failure shouldn't break the whole
  // detail page — the rest of the company data is still worth showing.
  // Logged (not silenced) so a real billing-side failure doesn't go
  // unnoticed just because the UI degrades gracefully.
  const creditBalance = await getCompanyCreditSummary(company.id, new Date())
    .then((summary) => summary.balance)
    .catch((error) => {
      console.error("admin_company_detail_credit_summary_failed", {
        companyId: company.id,
        error,
      })

      return null
    })

  return {
    id: company.id,
    name: company.name,
    publicName: company.publicName,
    vatNumber: company.vatNumber,
    phone: company.phone,
    website: company.website,
    createdAt: company.createdAt,
    email: owner?.email ?? null,
    owner,
    status: company.status,
    approvedAt: company.approvedAt,
    suspendedAt: company.suspendedAt,
    blockedAt: company.blockedAt,
    statusChangeReason: company.statusChangeReason,
    statusChangedByAdmin: company.statusChangedByAdminUser,
    adminBadge: deriveCompanyAdminBadge({
      status: company.status,
      statusChangeReason: company.statusChangeReason,
    }),
    city: company.geoLocation?.city ?? null,
    operatingRadiusKm: company.operatingRadiusKm,
    categories,
    interventions,
    profileCompleteness,
    creditBalance,
    unlockCount: company._count.requestUnlocks,
    savedRequestCount: company._count.savedRequests,
  }
}
