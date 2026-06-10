import {
  getCompanyActorForUser,
  type CompanyActor,
} from "./actor"

import {
  CompanyAuthorizationError,
} from "./errors"

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
