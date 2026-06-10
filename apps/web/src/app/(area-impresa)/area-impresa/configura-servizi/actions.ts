"use server"

import {
  redirect,
} from "next/navigation"

import {
  updateCompanyServiceConfiguration,
} from "@esigenta/db"

import {
  requireCompanyActor,
} from "../../../../auth/server"

function normalizeServiceIds(
  values: FormDataEntryValue[],
) {
  return Array.from(
    new Set(
      values
        .map((value) =>
          typeof value === "string"
            ? value.trim()
            : "",
        )
        .filter(Boolean),
    ),
  )
}

function normalizeCategoryIds(
  values: FormDataEntryValue[],
) {
  return Array.from(
    new Set(
      values
        .map((value) =>
          typeof value === "string"
            ? value.trim()
            : "",
        )
        .filter(Boolean),
    ),
  )
}

function redirectWithError(code: string): never {
  redirect(
    `/area-impresa/configura-servizi?error=${encodeURIComponent(code)}`,
  )
}

export async function saveCompanyServicesAction(
  formData: FormData,
) {
  const actor =
    await requireCompanyActor()

  const selectedServiceIds =
    normalizeServiceIds(
      formData.getAll("serviceIds"),
    )
  const selectedCategoryIds =
    normalizeCategoryIds(
      formData.getAll("categoryIds"),
    )

  const requestedRequestMatchingMode =
    formData.get("requestMatchingMode") ===
    "SELECTED_SERVICES_ONLY"
      ? "SELECTED_SERVICES_ONLY"
      : "CATEGORY_WITH_SERVICE_PRIORITY"

  const result =
    await updateCompanyServiceConfiguration({
      companyId: actor.company.id,
      selectedCategoryIds,
      selectedServiceIds,
      requestedRequestMatchingMode,
    })

  if (!result.ok) {
    redirectWithError(result.code)
  }

  redirect("/area-impresa/richieste")
}
