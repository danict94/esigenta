import type {
  CompanyMemberRole,
  CompanyStatus,
} from "@prisma/client"

import {
  prisma,
} from "../../prisma/client"

import {
  AmbiguousCompanyMembershipError,
  CompanyAuthorizationError,
} from "./errors"

export type CompanyActor = {
  user: {
    id: string
    name: string | null
    email: string
  }
  company: {
    id: string
    status: CompanyStatus
  }
  role: CompanyMemberRole
}

type CompanyMembershipRecord = {
  id: string
  role: CompanyMemberRole
  user: {
    id: string
    name: string | null
    email: string
  }
  company: {
    id: string
    status: CompanyStatus
  }
}

function mapCompanyMembershipRecordToActor(
  membership: CompanyMembershipRecord,
): CompanyActor {
  return {
    user: {
      id: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
    },
    company: {
      id: membership.company.id,
      status: membership.company.status,
    },
    role: membership.role,
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
      role: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      company: {
        select: {
          id: true,
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
      role: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      company: {
        select: {
          id: true,
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

export async function resolveCompanyActorFromUser(
  user: {
    id: string
  },
): Promise<CompanyActor> {
  const actors =
    await listCompanyActorsForUser(
      user.id,
    )

  if (actors.length === 0) {
    throw new CompanyAuthorizationError()
  }

  if (actors.length > 1) {
    throw new AmbiguousCompanyMembershipError()
  }

  const actor =
    actors[0]

  if (!actor) {
    throw new CompanyAuthorizationError()
  }

  return actor
}
