import type {
  CompanyStatus,
} from "@prisma/client"

import {
  prisma,
} from "@esigenta/database"

export type AdminCompanyStatusFilter =
  | CompanyStatus
  | "ALL"

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
  createdAt: Date
  updatedAt: Date
  owner: {
    id: string
    email: string
    name: string | null
  } | null
}

export type AdminCompanyStatusCounts = {
  all: number
  pendingReview: number
  approved: number
  suspended: number
  blocked: number
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
  return isCompanyStatus(value)
    ? value
    : "ALL"
}

function mapCompanyListItem(company: {
  id: string
  name: string
  vatNumber: string
  phone: string
  city: string | null
  status: CompanyStatus
  approvedAt: Date | null
  suspendedAt: Date | null
  blockedAt: Date | null
  createdAt: Date
  updatedAt: Date
  memberships: Array<{
    user: {
      id: string
      email: string
      name: string | null
    }
  }>
}): AdminCompanyListItem {
  return {
    id: company.id,
    name: company.name,
    vatNumber: company.vatNumber,
    phone: company.phone,
    city: company.city,
    status: company.status,
    approvedAt: company.approvedAt,
    suspendedAt: company.suspendedAt,
    blockedAt: company.blockedAt,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
    owner:
      company.memberships[0]?.user ??
      null,
  }
}

export async function listAdminCompanies({
  status,
}: {
  status?: AdminCompanyStatusFilter
} = {}): Promise<AdminCompanyListItem[]> {
  const normalizedStatus =
    status === "ALL"
      ? undefined
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
        city: true,
        status: true,
        approvedAt: true,
        suspendedAt: true,
        blockedAt: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
          where: {
            role: "OWNER",
          },
          orderBy: {
            createdAt: "asc",
          },
          take: 1,
          select: {
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

  return companies.map(
    mapCompanyListItem,
  )
}

export async function getAdminCompanyStatusCounts(): Promise<AdminCompanyStatusCounts> {
  const [
    all,
    pendingReview,
    approved,
    suspended,
    blocked,
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
    pendingContactChangeRequests,
  }
}

async function mutateCompanyStatus({
  companyId,
  allowedFrom,
  data,
  invalidMessage,
}: {
  companyId: string
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
        data,
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
  now = new Date(),
}: {
  companyId: string
  now?: Date
}): Promise<AdminCompanyStatusMutationResult> {
  return mutateCompanyStatus({
    companyId,
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
  now = new Date(),
}: {
  companyId: string
  now?: Date
}): Promise<AdminCompanyStatusMutationResult> {
  return mutateCompanyStatus({
    companyId,
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
  now = new Date(),
}: {
  companyId: string
  now?: Date
}): Promise<AdminCompanyStatusMutationResult> {
  return mutateCompanyStatus({
    companyId,
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
