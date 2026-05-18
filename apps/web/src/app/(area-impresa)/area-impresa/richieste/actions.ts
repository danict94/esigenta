"use server"

import {
  revalidatePath,
} from "next/cache"

import {
  toggleCompanySavedRequest,
} from "@fixpro/db"

import {
  requireDefaultCompanyMembership,
} from "../../../../auth/server"

export async function toggleSavedRequestAction(
  formData: FormData,
) {
  const membership =
    await requireDefaultCompanyMembership()
  const requestId = String(
    formData.get("requestId") ?? "",
  ).trim()

  const result =
    await toggleCompanySavedRequest({
      companyId: membership.companyId,
      requestId,
    })

  if (!result.ok) {
    throw new Error(result.message)
  }

  revalidatePath("/area-impresa/richieste")
  revalidatePath("/area-impresa/richieste-salvate")
  revalidatePath(
    "/area-impresa/richieste-acquistate",
  )
  revalidatePath(
    `/area-impresa/richieste/${requestId}`,
  )
}
