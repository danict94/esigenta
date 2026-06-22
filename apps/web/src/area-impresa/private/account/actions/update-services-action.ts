"use server"

import {
  redirect,
} from "next/navigation"

import {
  updateCompanyServicesConfiguration,
} from "@esigenta/domain"

import {
  requireAreaImpresaAccess,
} from "../../../../auth/server"

import {
  isAreaMonitoringEnabled,
} from "../../../../platform/monitoring/area-monitoring"

function normalizeIds(values: FormDataEntryValue[]): string[] {
  return Array.from(
    new Set(
      values
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter(Boolean),
    ),
  )
}

function redirectWithError(code: string): never {
  redirect(
    `/area-impresa/configura-servizi?error=${encodeURIComponent(code)}`,
  )
}

export async function updateServicesAction(
  formData: FormData,
) {
  const monitored = isAreaMonitoringEnabled()
  const actionStart = performance.now()

  const actor = await requireAreaImpresaAccess()
  const actorMs = Math.round(performance.now() - actionStart)

  const selectedInterventionIds = normalizeIds(formData.getAll("interventionIds"))
  const selectedCategoryIds = normalizeIds(formData.getAll("categoryIds"))

  const result = await updateCompanyServicesConfiguration(
    actor,
    {
      selectedCategoryIds,
      selectedInterventionIds,
    },
    monitored
      ? (label, ms) =>
          console.info(
            `[esigenta-perf] [services-config-action] ${label}=${ms}ms`,
          )
      : undefined,
  )

  if (monitored) {
    console.info(
      `[esigenta-perf] [services-config-action] actor=${actorMs}ms total=${Math.round(performance.now() - actionStart)}ms result=${result.ok ? "ok" : result.code}`,
    )
  }

  if (!result.ok) {
    redirectWithError(result.code)
  }

  redirect("/area-impresa/richieste")
}
