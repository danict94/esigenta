import {
  headers,
} from "next/headers"

import {
  requireCompanyMemberFromUser,
  requireCompanyOwnerFromUser,
  resolveCompanyActorFromUser,
} from "@esigenta/db"

import {
  getCurrentUserFromHeaders,
  requireUserFromHeaders,
} from "@esigenta/db/auth"

export async function getCurrentUser() {
  return getCurrentUserFromHeaders(
    await headers(),
  )
}

export async function requireUser() {
  return requireUserFromHeaders(
    await headers(),
  )
}

export async function requireCompanyMember(
  companyId: string,
) {
  const user =
    await requireUser()

  return requireCompanyMemberFromUser(
    user,
    companyId,
  )
}

export async function requireCompanyOwner(
  companyId: string,
) {
  const user =
    await requireUser()

  return requireCompanyOwnerFromUser(
    user,
    companyId,
  )
}

export async function requireCompanyActor() {
  const startedAt =
    Date.now()

  const userStartedAt =
    Date.now()

  const user =
    await requireUser()

  const userMs =
    Date.now() - userStartedAt

  const actorStartedAt =
    Date.now()

  const actor =
    await resolveCompanyActorFromUser(
      user,
    )

  const actorMs =
    Date.now() - actorStartedAt

  const totalMs =
    Date.now() - startedAt

  if (totalMs >= 100) {
    console.info(
      `[esigenta-perf] [require-company-actor] requireUser=${userMs}ms resolveCompanyActor=${actorMs}ms total=${totalMs}ms`,
    )
  }

  return actor
}
