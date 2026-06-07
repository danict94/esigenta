import type {
  CompanyMemberRole,
  CompanyStatus,
} from "@prisma/client"

import {
  prisma,
} from "../prisma/client"

export type CompanyMembershipForUser = {
  id: string
  companyId: string
  userId: string
  role: CompanyMemberRole
  company: {
    status: CompanyStatus
  }
}

export type CompanyMarketplaceState = {
  isActive: boolean
  deletedAt: Date | null
  status: CompanyStatus
}

export class CompanyAuthorizationError extends Error {
  constructor(message = "Company authorization required.") {
    super(message)

    this.name =
      "CompanyAuthorizationError"
  }
}

export class AmbiguousCompanyMembershipError extends Error {
  constructor() {
    super(
      "Questo account risulta collegato a più imprese. Per la release Esigenta supporta una sola impresa per account.",
    )

    this.name =
      "AmbiguousCompanyMembershipError"
  }
}

export class CompanyDeactivatedError extends Error {
  constructor() {
    super(
      "Questa impresa è stata disattivata.",
    )

    this.name =
      "CompanyDeactivatedError"
  }
}

export class CompanyMarketplaceAuthorizationError extends Error {
  code:
    | "invalid_company_id"
    | "company_not_found"
    | "company_not_active"
    | "COMPANY_NOT_APPROVED_FOR_MARKETPLACE"
    | "COMPANY_NOT_APPROVED_FOR_CREDITS"

  constructor({
    code,
    message,
  }: {
    code: CompanyMarketplaceAuthorizationError["code"]
    message: string
  }) {
    super(message)

    this.name =
      "CompanyMarketplaceAuthorizationError"
    this.code =
      code
  }
}

function normalizeCompanyId(
  companyId: string,
) {
  const normalized =
    companyId.trim()

  return normalized
    ? normalized
    : null
}

export function isCompanyMarketplaceApproved(
  company: CompanyMarketplaceState,
) {
  return (
    company.isActive &&
    company.deletedAt === null &&
    company.status === "APPROVED"
  )
}

async function loadCompanyMarketplaceState(
  companyId: string,
): Promise<CompanyMarketplaceState | null> {
  return prisma.company.findUnique({
    where: {
      id: companyId,
    },
    select: {
      isActive: true,
      deletedAt: true,
      status: true,
    },
  })
}

async function assertCompanyMarketplaceState({
  companyId,
  rejectedCode,
  rejectedMessage,
}: {
  companyId: string
  rejectedCode:
    | "COMPANY_NOT_APPROVED_FOR_MARKETPLACE"
    | "COMPANY_NOT_APPROVED_FOR_CREDITS"
  rejectedMessage: string
}) {
  const normalizedCompanyId =
    normalizeCompanyId(companyId)

  if (!normalizedCompanyId) {
    throw new CompanyMarketplaceAuthorizationError({
      code: "invalid_company_id",
      message: "Impresa non valida.",
    })
  }

  const company =
    await loadCompanyMarketplaceState(
      normalizedCompanyId,
    )

  if (!company) {
    throw new CompanyMarketplaceAuthorizationError({
      code: "company_not_found",
      message: "Impresa non trovata.",
    })
  }

  if (
    !company.isActive ||
    company.deletedAt !== null
  ) {
    throw new CompanyMarketplaceAuthorizationError({
      code: "company_not_active",
      message:
        "Questa impresa non è attiva.",
    })
  }

  if (
    !isCompanyMarketplaceApproved(
      company,
    )
  ) {
    throw new CompanyMarketplaceAuthorizationError({
      code: rejectedCode,
      message:
        rejectedMessage,
    })
  }
}

export async function assertCompanyCanUseMarketplace({
  companyId,
}: {
  companyId: string
}) {
  await assertCompanyMarketplaceState({
    companyId,
    rejectedCode:
      "COMPANY_NOT_APPROVED_FOR_MARKETPLACE",
    rejectedMessage:
      "Il profilo impresa deve essere approvato prima di usare il marketplace.",
  })
}

export async function assertCompanyCanBuyCredits({
  companyId,
}: {
  companyId: string
}) {
  await assertCompanyMarketplaceState({
    companyId,
    rejectedCode:
      "COMPANY_NOT_APPROVED_FOR_CREDITS",
    rejectedMessage:
      "Il profilo impresa deve essere approvato prima di acquistare crediti.",
  })
}

export async function listCompanyMembershipsForUser(
  userId: string,
): Promise<CompanyMembershipForUser[]> {
  return prisma.companyMembership.findMany({
    where: {
      userId,
      company: {
        is: {
          isActive: true,
          deletedAt: null,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      companyId: true,
      userId: true,
      role: true,
      company: {
        select: {
          status: true,
        },
      },
    },
  })
}

export async function getCompanyMembershipForUser({
  userId,
  companyId,
}: {
  userId: string
  companyId: string
}): Promise<CompanyMembershipForUser | null> {
  return prisma.companyMembership.findFirst({
    where: {
      companyId,
      userId,
      company: {
        is: {
          isActive: true,
          deletedAt: null,
        },
      },
    },
    select: {
      id: true,
      companyId: true,
      userId: true,
      role: true,
      company: {
        select: {
          status: true,
        },
      },
    },
  })
}

export async function requireCompanyMemberFromUser(
  user: {
    id: string
  },
  companyId: string,
): Promise<CompanyMembershipForUser> {
  const membership =
    await getCompanyMembershipForUser({
      userId: user.id,
      companyId,
    })

  if (!membership) {
    throw new CompanyAuthorizationError()
  }

  return membership
}

export async function requireCompanyOwnerFromUser(
  user: {
    id: string
  },
  companyId: string,
): Promise<CompanyMembershipForUser> {
  const membership =
    await requireCompanyMemberFromUser(
      user,
      companyId,
    )

  if (membership.role !== "OWNER") {
    throw new CompanyAuthorizationError(
      "Company owner authorization required.",
    )
  }

  return membership
}

export async function requireDefaultCompanyMembershipFromUser(
  user: {
    id: string
  },
): Promise<CompanyMembershipForUser> {
  const memberships =
    await listCompanyMembershipsForUser(
      user.id,
    )

  if (memberships.length === 0) {
    throw new CompanyAuthorizationError()
  }

  if (memberships.length > 1) {
    throw new AmbiguousCompanyMembershipError()
  }

  const [membership] =
    memberships

  if (!membership) {
    throw new CompanyAuthorizationError()
  }

  return membership
}
