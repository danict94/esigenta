import type {
  CompanyMemberRole,
  CompanyStatus,
} from "@prisma/client"

import {
  prisma,
} from "../prisma/client"

import type {
  CompanyActor,
} from "./company-actor"

type CompanyMembershipRecord = {
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

function mapCompanyMembershipRecordToActor(
  membership: CompanyMembershipRecord,
): CompanyActor {
  return {
    userId: membership.userId,
    companyId: membership.companyId,
    role: membership.role,
    companyStatus:
      membership.company.status,
  }
}

async function listCompanyMembershipRecordsForUser(
  userId: string,
): Promise<CompanyMembershipRecord[]> {
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

async function getCompanyMembershipRecordForUser({
  userId,
  companyId,
}: {
  userId: string
  companyId: string
}): Promise<CompanyMembershipRecord | null> {
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

export async function listCompanyActorsForUser(
  userId: string,
): Promise<CompanyActor[]> {
  const memberships =
    await listCompanyMembershipRecordsForUser(
      userId,
    )

  return memberships.map(
    mapCompanyMembershipRecordToActor,
  )
}

export async function getCompanyActorForUser({
  userId,
  companyId,
}: {
  userId: string
  companyId: string
}): Promise<CompanyActor | null> {
  const membership =
    await getCompanyMembershipRecordForUser({
      userId,
      companyId,
    })

  return membership
    ? mapCompanyMembershipRecordToActor(
        membership,
      )
    : null
}

export async function requireCompanyMemberFromUser(
  user: {
    id: string
  },
  companyId: string,
): Promise<CompanyActor> {
  const actor =
    await getCompanyActorForUser({
      userId: user.id,
      companyId,
    })

  if (!actor) {
    throw new CompanyAuthorizationError()
  }

  return actor
}

export async function requireCompanyOwnerFromUser(
  user: {
    id: string
  },
  companyId: string,
): Promise<CompanyActor> {
  const actor =
    await requireCompanyMemberFromUser(
      user,
      companyId,
    )

  if (actor.role !== "OWNER") {
    throw new CompanyAuthorizationError(
      "Company owner authorization required.",
    )
  }

  return actor
}
