import type {
  CompanyStatus,
  Prisma,
} from "@prisma/client"

import {
  prisma,
} from "@esigenta/database"

import {
  deriveCompanyProfileCompleteness,
  type CompanyProfileCompleteness,
} from "../../company/profile/derive-company-profile-completeness"

import {
  deriveCompanyAdminBadge,
  type CompanyAdminBadge,
} from "./derive-company-admin-badge"

export type AdminCompanyStatusFilter =
  | CompanyStatus
  | "ALL"
  | "APPROVED_INCOMPLETE"

export type AdminCompanyListItem = {
  id: string
  name: string
  vatNumber: string
  phone: string
  city: string | null
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
  createdAt: Date
  updatedAt: Date
  /**
   * The company account's own email — always sourced from a real
   * CompanyMembership (owner preferred, otherwise the earliest member),
   * NEVER from statusChangedByAdminUser or AdminProfile. Null only when a
   * company genuinely has no membership at all (should not happen in
   * practice, but the UI must show "—" rather than guess).
   */
  email: string | null
  owner: {
    id: string
    email: string
    name: string | null
  } | null
  operatingRadiusKm: number
  /**
   * First category added (by createdAt), or null if none configured yet.
   * The list shows only this + interventionCount (never the full
   * intervention list) — full names live only in the detail page, to keep
   * the list query cheap.
   */
  principalCategoryName: string | null
  interventionCount: number
  profileCompleteness: CompanyProfileCompleteness
  adminBadge: CompanyAdminBadge
  /**
   * Count of CompanyDocument rows in PENDING_REVIEW for this company —
   * drives the minimal "N documenti da verificare" text signal in the
   * list. Never reflects MISSING documents (those have no row) and never
   * feeds into adminBadge or Company.status.
   */
  pendingDocumentsCount: number
}

export type AdminCompanyStatusCounts = {
  all: number
  pendingReview: number
  approved: number
  suspended: number
  blocked: number
  approvedIncomplete: number
  pendingContactChangeRequests: number
}

export type AdminCompanyStatusMutationResult =
  | {
      ok: true
      companyId: string
      status: CompanyStatus
    }
  | {
      ok: false
      code: string
      message: string
    }

const companyStatuses: CompanyStatus[] = [
  "PENDING_REVIEW",
  "APPROVED",
  "SUSPENDED",
  "BLOCKED",
]

function normalizeCompanyId(
  value: string,
) {
  const normalized =
    value.trim()

  return normalized
    ? normalized
    : null
}

function normalizeText(
  value: string | null | undefined,
) {
  const normalized =
    value?.trim() ?? ""

  return normalized.length > 0
    ? normalized
    : null
}

function isCompanyStatus(
  value: string | null | undefined,
): value is CompanyStatus {
  return companyStatuses.includes(
    value as CompanyStatus,
  )
}

export function normalizeAdminCompanyStatusFilter(
  value: string | null | undefined,
): AdminCompanyStatusFilter {
  if (value === "APPROVED_INCOMPLETE") {
    return "APPROVED_INCOMPLETE"
  }

  return isCompanyStatus(value)
    ? value
    : "ALL"
}

function mapCompanyListItem(company: {
  id: string
  name: string
  vatNumber: string
  phone: string
  website: string | null
  geoLocation: { city: string } | null
  operatingRadiusKm: number
  status: CompanyStatus
  approvedAt: Date | null
  suspendedAt: Date | null
  blockedAt: Date | null
  statusChangeReason: string | null
  statusChangedByAdminUser: {
    id: string
    email: string
    name: string | null
  } | null
  publicName: string | null
  shortDescription: string | null
  fullDescription: string | null
  yearsOfExperience: number | null
  createdAt: Date
  updatedAt: Date
  memberships: Array<{
    role: string
    user: {
      id: string
      email: string
      name: string | null
    }
  }>
  categories: Array<{
    category: { name: string }
  }>
  _count: {
    categories: number
    interventions: number
    documents: number
  }
}): AdminCompanyListItem {
  const profileCompleteness = deriveCompanyProfileCompleteness({
    publicName: company.publicName,
    shortDescription: company.shortDescription,
    fullDescription: company.fullDescription,
    website: company.website,
    yearsOfExperience: company.yearsOfExperience,
    hasGeoLocation: company.geoLocation !== null,
    operatingRadiusKm: company.operatingRadiusKm,
    categoryCount: company._count.categories,
    interventionCount: company._count.interventions,
    phone: company.phone,
    vatNumber: company.vatNumber,
  })

  // Owner preferred; otherwise the earliest member added (memberships are
  // pre-sorted by createdAt asc in the query) — never an AdminProfile user,
  // membership rows are exclusively company-side accounts.
  const owner =
    company.memberships.find((m) => m.role === "OWNER")?.user ??
    company.memberships[0]?.user ??
    null

  return {
    id: company.id,
    name: company.name,
    vatNumber: company.vatNumber,
    phone: company.phone,
    city: company.geoLocation?.city ?? null,
    status: company.status,
    approvedAt: company.approvedAt,
    suspendedAt: company.suspendedAt,
    blockedAt: company.blockedAt,
    statusChangeReason: company.statusChangeReason,
    statusChangedByAdmin: company.statusChangedByAdminUser,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
    email: owner?.email ?? null,
    owner,
    operatingRadiusKm: company.operatingRadiusKm,
    principalCategoryName: company.categories[0]?.category.name ?? null,
    interventionCount: company._count.interventions,
    profileCompleteness,
    pendingDocumentsCount: company._count.documents,
    adminBadge: deriveCompanyAdminBadge({
      status: company.status,
      statusChangeReason: company.statusChangeReason,
    }),
  }
}

function normalizeCompanySearch(
  search: string | undefined,
): string | null {
  const trimmed = search?.trim() ?? ""
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Server-side search only, no client-side filtering of a paginated list.
 * name/vatNumber/phone are scalar columns on Company (cheap). The email
 * clause reaches through the existing memberships relation via a `some`
 * filter — Prisma/Postgres translate this into a single EXISTS subquery,
 * not a separate query or N+1.
 */
function buildCompanySearchWhere(
  search: string | undefined,
): Prisma.CompanyWhereInput {
  const normalized = normalizeCompanySearch(search)

  if (!normalized) {
    return {}
  }

  return {
    OR: [
      { name: { contains: normalized, mode: "insensitive" } },
      { vatNumber: { contains: normalized, mode: "insensitive" } },
      { phone: { contains: normalized, mode: "insensitive" } },
      {
        memberships: {
          some: {
            user: {
              email: { contains: normalized, mode: "insensitive" },
            },
          },
        },
      },
    ],
  }
}

export async function listAdminCompanies({
  status,
  search,
}: {
  status?: AdminCompanyStatusFilter
  search?: string
} = {}): Promise<AdminCompanyListItem[]> {
  const normalizedStatus =
    status === "ALL"
      ? undefined
      : status === "APPROVED_INCOMPLETE"
        ? "APPROVED"
        : status

  const companies =
    await prisma.company.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...(normalizedStatus
          ? {
              status:
                normalizedStatus,
            }
          : {}),
        ...buildCompanySearchWhere(search),
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      select: {
        id: true,
        name: true,
        vatNumber: true,
        phone: true,
        website: true,
        operatingRadiusKm: true,
        geoLocation: {
          select: { city: true },
        },
        status: true,
        approvedAt: true,
        suspendedAt: true,
        blockedAt: true,
        statusChangeReason: true,
        statusChangedByAdminUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        publicName: true,
        shortDescription: true,
        fullDescription: true,
        yearsOfExperience: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            categories: true,
            interventions: true,
            documents: {
              where: { status: "PENDING_REVIEW" },
            },
          },
        },
        // Only the first category's name, never the full list or any
        // intervention names — keeps the list query cheap. Full lists live
        // only in getAdminCompanyDetail.
        categories: {
          take: 1,
          orderBy: {
            createdAt: "asc",
          },
          select: {
            category: {
              select: { name: true },
            },
          },
        },
        memberships: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            role: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    })

  const mapped = companies.map(
    mapCompanyListItem,
  )

  return status === "APPROVED_INCOMPLETE"
    ? mapped.filter(
        (company) => !company.profileCompleteness.isComplete,
      )
    : mapped
}

async function countApprovedIncompleteCompanies(): Promise<number> {
  const companies = await prisma.company.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      status: "APPROVED",
    },
    select: {
      geoLocationId: true,
      operatingRadiusKm: true,
      publicName: true,
      shortDescription: true,
      fullDescription: true,
      website: true,
      yearsOfExperience: true,
      phone: true,
      vatNumber: true,
      _count: {
        select: {
          categories: true,
          interventions: true,
        },
      },
    },
  })

  return companies.filter((company) => {
    const completeness = deriveCompanyProfileCompleteness({
      publicName: company.publicName,
      shortDescription: company.shortDescription,
      fullDescription: company.fullDescription,
      website: company.website,
      yearsOfExperience: company.yearsOfExperience,
      hasGeoLocation: company.geoLocationId !== null,
      operatingRadiusKm: company.operatingRadiusKm,
      categoryCount: company._count.categories,
      interventionCount: company._count.interventions,
      phone: company.phone,
      vatNumber: company.vatNumber,
    })

    return !completeness.isComplete
  }).length
}

export async function getAdminCompanyStatusCounts(): Promise<AdminCompanyStatusCounts> {
  const [
    all,
    pendingReview,
    approved,
    suspended,
    blocked,
    approvedIncomplete,
    pendingContactChangeRequests,
  ] = await Promise.all([
    prisma.company.count({
      where: {
        isActive: true,
        deletedAt: null,
      },
    }),
    prisma.company.count({
      where: {
        isActive: true,
        deletedAt: null,
        status: "PENDING_REVIEW",
      },
    }),
    prisma.company.count({
      where: {
        isActive: true,
        deletedAt: null,
        status: "APPROVED",
      },
    }),
    prisma.company.count({
      where: {
        isActive: true,
        deletedAt: null,
        status: "SUSPENDED",
      },
    }),
    prisma.company.count({
      where: {
        isActive: true,
        deletedAt: null,
        status: "BLOCKED",
      },
    }),
    countApprovedIncompleteCompanies(),
    prisma.companyContactChangeRequest.count({
      where: {
        status: "PENDING_REVIEW",
      },
    }),
  ])

  return {
    all,
    pendingReview,
    approved,
    suspended,
    blocked,
    approvedIncomplete,
    pendingContactChangeRequests,
  }
}

async function mutateCompanyStatus({
  companyId,
  adminUserId,
  reason,
  requireReason,
  allowedFrom,
  data,
  invalidMessage,
}: {
  companyId: string
  adminUserId: string
  reason?: string | null | undefined
  requireReason: boolean
  allowedFrom: CompanyStatus[]
  data: {
    status: CompanyStatus
    approvedAt?: Date | null
    suspendedAt?: Date | null
    blockedAt?: Date | null
  }
  invalidMessage: string
}): Promise<AdminCompanyStatusMutationResult> {
  const normalizedCompanyId =
    normalizeCompanyId(companyId)

  if (!normalizedCompanyId) {
    return {
      ok: false,
      code: "invalid_company_id",
      message: "Impresa non valida.",
    }
  }

  const normalizedAdminUserId =
    normalizeText(adminUserId)

  if (!normalizedAdminUserId) {
    return {
      ok: false,
      code: "invalid_admin_user_id",
      message: "Admin non valido.",
    }
  }

  const normalizedReason =
    normalizeText(reason)

  if (requireReason && (!normalizedReason || normalizedReason.length < 3)) {
    return {
      ok: false,
      code: "invalid_status_change_reason",
      message: "Inserisci un motivo di almeno 3 caratteri.",
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw<
      Array<{
        id: string
      }>
    >`
      SELECT "id"
      FROM "Company"
      WHERE "id" = ${normalizedCompanyId}
      FOR UPDATE
    `

    const company =
      await tx.company.findUnique({
        where: {
          id: normalizedCompanyId,
        },
        select: {
          id: true,
          status: true,
          isActive: true,
          deletedAt: true,
        },
      })

    if (!company) {
      return {
        ok: false,
        code: "company_not_found",
        message: "Impresa non trovata.",
      }
    }

    if (
      !company.isActive ||
      company.deletedAt !== null
    ) {
      return {
        ok: false,
        code: "company_not_active",
        message:
          "Questa impresa non è attiva.",
      }
    }

    if (
      !allowedFrom.includes(
        company.status,
      )
    ) {
      return {
        ok: false,
        code: "invalid_company_status_transition",
        message: invalidMessage,
      }
    }

    const updated =
      await tx.company.update({
        where: {
          id: company.id,
        },
        data: {
          ...data,
          statusChangedByAdminUserId: normalizedAdminUserId,
          statusChangeReason: normalizedReason,
        },
        select: {
          id: true,
          status: true,
        },
      })

    return {
      ok: true,
      companyId: updated.id,
      status: updated.status,
    }
  })
}

export async function approveCompanyForMarketplace({
  companyId,
  adminUserId,
  reason,
  now = new Date(),
}: {
  companyId: string
  adminUserId: string
  reason?: string | null
  now?: Date
}): Promise<AdminCompanyStatusMutationResult> {
  return mutateCompanyStatus({
    companyId,
    adminUserId,
    reason,
    requireReason: false,
    allowedFrom: [
      "PENDING_REVIEW",
      "SUSPENDED",
      "BLOCKED",
    ],
    invalidMessage:
      "Questa impresa non può essere approvata dallo stato attuale.",
    data: {
      status: "APPROVED",
      approvedAt: now,
      suspendedAt: null,
      blockedAt: null,
    },
  })
}

export async function suspendCompanyForMarketplace({
  companyId,
  adminUserId,
  reason,
  now = new Date(),
}: {
  companyId: string
  adminUserId: string
  reason?: string | null
  now?: Date
}): Promise<AdminCompanyStatusMutationResult> {
  return mutateCompanyStatus({
    companyId,
    adminUserId,
    reason,
    requireReason: true,
    allowedFrom: [
      "APPROVED",
    ],
    invalidMessage:
      "Solo un'impresa approvata può essere sospesa.",
    data: {
      status: "SUSPENDED",
      suspendedAt: now,
    },
  })
}

export async function blockCompanyForMarketplace({
  companyId,
  adminUserId,
  reason,
  now = new Date(),
}: {
  companyId: string
  adminUserId: string
  reason?: string | null
  now?: Date
}): Promise<AdminCompanyStatusMutationResult> {
  return mutateCompanyStatus({
    companyId,
    adminUserId,
    reason,
    requireReason: true,
    allowedFrom: [
      "PENDING_REVIEW",
      "APPROVED",
      "SUSPENDED",
    ],
    invalidMessage:
      "Questa impresa è già bloccata.",
    data: {
      status: "BLOCKED",
      blockedAt: now,
    },
  })
}
