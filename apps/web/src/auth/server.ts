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
  const user =
    await requireUser()

  return resolveCompanyActorFromUser(
    user,
  )
}
