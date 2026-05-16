import type {
  CompanyMemberRole,
} from "@prisma/client"

import {
  prisma,
} from "../prisma/client"

export type CompanyMembershipForUser = {
  id: string
  companyId: string
  userId: string
  role: CompanyMemberRole
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
      "Questo account risulta collegato a più imprese. Per la release FixPro supporta una sola impresa per account.",
    )
    this.name =
      "AmbiguousCompanyMembershipError"
  }
}

export async function listCompanyMembershipsForUser(
  userId: string,
): Promise<CompanyMembershipForUser[]> {
  return prisma.companyMembership.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      companyId: true,
      userId: true,
      role: true,
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
  return prisma.companyMembership.findUnique({
    where: {
      companyId_userId: {
        companyId,
        userId,
      },
    },
    select: {
      id: true,
      companyId: true,
      userId: true,
      role: true,
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

