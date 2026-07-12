"use server"

import {
  revalidatePath,
} from "next/cache"

import {
  toggleCompanySavedRequest,
} from "@esigenta/domain"

import {
  requireAreaImpresaAccess,
} from "../../../../auth/server"

export async function toggleSavedRequestAction(
  formData: FormData,
) {
  const actor =
    await requireAreaImpresaAccess()
  const requestId = String(
    formData.get("requestId") ?? "",
  ).trim()

  const result =
    await toggleCompanySavedRequest({
      actor,
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
