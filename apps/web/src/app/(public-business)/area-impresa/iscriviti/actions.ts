"use server"

import {
  CompanyOnboardingError,
} from "@esigenta/db"

import {
  createCompanyForCurrentUser,
} from "../../../../lib/area-impresa/create-company-for-current-user"

const allowedOperatingRadiusKm = [
  10,
  20,
  30,
  50,
  75,
  100,
] as const

export type CompleteCompanyOnboardingInput = {
  name: string
  vatNumber: string
  phone: string
  categorySlug?: string
  address?: string
  city?: string
  postalCode?: string
  latitude?: number
  longitude?: number
  operatingRadiusKm?: number
}

export type CompleteCompanyOnboardingResult =
  | {
      ok: true
      companyId: string
      membershipId: string
    }
  | {
      ok: false
      code: string
      message: string
    }

function normalizeRequiredText(
  value: string | undefined,
  message: string,
) {
  const trimmed =
    value?.trim()

  if (!trimmed) {
    return {
      ok: false as const,
      message,
    }
  }

  return {
    ok: true as const,
    value: trimmed,
  }
}

function normalizeOptionalText(
  value: string | undefined,
) {
  const trimmed =
    value?.trim()

  return trimmed
    ? trimmed
    : undefined
}

function normalizeFiniteNumber(
  value: number | undefined,
) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : undefined
}

function normalizeOperatingRadiusKm(
  value: number | undefined,
) {
  const operatingRadiusKm =
    value ?? 30

  return allowedOperatingRadiusKm.includes(
    operatingRadiusKm as (typeof allowedOperatingRadiusKm)[number],
  )
    ? operatingRadiusKm
    : null
}

export async function completeCompanyOnboardingAction(
  input: CompleteCompanyOnboardingInput,
): Promise<CompleteCompanyOnboardingResult> {
  const name =
    normalizeRequiredText(
      input.name,
      "Il nome azienda è obbligatorio.",
    )

  if (!name.ok) {
    return {
      ok: false,
      code: "invalid_company_profile",
      message: name.message,
    }
  }

  const vatNumber =
    normalizeRequiredText(
      input.vatNumber,
      "La partita IVA è obbligatoria.",
    )

  if (!vatNumber.ok) {
    return {
      ok: false,
      code: "invalid_company_profile",
      message: vatNumber.message,
    }
  }

  const phone =
    normalizeRequiredText(
      input.phone,
      "Il numero di telefono aziendale è obbligatorio.",
    )

  if (!phone.ok) {
    return {
      ok: false,
      code: "invalid_company_profile",
      message: phone.message,
    }
  }

  const onboardingCategorySlug =
    normalizeOptionalText(input.categorySlug)

  if (!onboardingCategorySlug) {
    return {
      ok: false,
      code: "invalid_company_category",
      message:
        "Seleziona la categoria professionale dalla pagina professionisti.",
    }
  }

  const operatingRadiusKm =
    normalizeOperatingRadiusKm(
      input.operatingRadiusKm,
    )

  if (!operatingRadiusKm) {
    return {
      ok: false,
      code: "invalid_operating_radius",
      message: "Seleziona un raggio d’azione valido.",
    }
  }

  const address =
    normalizeOptionalText(input.address)

  const city =
    normalizeOptionalText(input.city)

  const postalCode =
    normalizeOptionalText(input.postalCode)

  const latitude =
    normalizeFiniteNumber(input.latitude)

  const longitude =
    normalizeFiniteNumber(input.longitude)

  if (
    !city ||
    latitude === undefined ||
    longitude === undefined
  ) {
    return {
      ok: false,
      code: "invalid_company_location",
      message:
        "Seleziona la località operativa dalla pagina professionisti.",
    }
  }

  try {
    const result =
      await createCompanyForCurrentUser({
        onboardingCategorySlug,
        company: {
          name: name.value,
          vatNumber: vatNumber.value,
          phone: phone.value,
          operatingRadiusKm,

          ...(address
            ? {
                address,
              }
            : {}),

          ...(city
            ? {
                city,
              }
            : {}),

          ...(postalCode
            ? {
                postalCode,
              }
            : {}),

          ...(latitude !== undefined
            ? {
                latitude,
              }
            : {}),

          ...(longitude !== undefined
            ? {
                longitude,
              }
            : {}),
        },
      })

    if (!result.ok) {
      return {
        ok: false,
        code: result.code,
        message: result.message,
      }
    }

    return result
  } catch (error) {
    if (
      error instanceof CompanyOnboardingError
    ) {
      return {
        ok: false,
        code: error.code,
        message: error.message,
      }
    }

    throw error
  }
}
