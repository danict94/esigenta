import type {
  CompanyMemberRole,
  CompanyStatus,
} from "@prisma/client"

import {
  AmbiguousCompanyMembershipError,
  CompanyAuthorizationError,
  listCompanyActorsForUser,
} from "./company-guards"

export type CompanyActor = {
  userId: string
  companyId: string
  role: CompanyMemberRole
  companyStatus: CompanyStatus
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

