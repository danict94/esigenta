import {
  createCompanyForUser,
} from "@fixpro/db"
import type {
  CreateCompanyProfileInput,
} from "@fixpro/db"

import {
  requireUser,
} from "../../auth/server"

export type CreateCompanyForCurrentUserInput = {
  serviceIds?: string[]
  company: CreateCompanyProfileInput
}

export type CreateCompanyForCurrentUserResult =
  Awaited<
    ReturnType<
      typeof createCompanyForUser
    >
  >

export async function createCompanyForCurrentUser({
  company,
  serviceIds,
}: CreateCompanyForCurrentUserInput): Promise<CreateCompanyForCurrentUserResult> {
  const user =
    await requireUser()

  return createCompanyForUser({
    userId:
      user.id,
    company,
    serviceIds,
  })
}
