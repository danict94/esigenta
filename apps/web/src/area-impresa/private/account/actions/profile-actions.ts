"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  deactivateCompanyAccount,
  requestCompanyPhoneContactChange,
  updateCompanyProfile,
} from "@esigenta/domain"

import { requireAreaImpresaAccess } from "../../../../auth/server"
import { isAreaMonitoringEnabled } from "../../../../platform/monitoring/area-monitoring"


function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : ""
}

function redirectWithError(code: string): never {
  redirect(`/area-impresa/profilo?error=${encodeURIComponent(code)}`)
}

export async function updateCompanyProfileAction(formData: FormData) {
  const monitored = isAreaMonitoringEnabled()
  const t0 = performance.now()

  const actor = await requireAreaImpresaAccess()
  const actorMs = Math.round(performance.now() - t0)

  const result = await updateCompanyProfile(
    actor,
    {
      website: normalizeText(formData.get("website")) || null,
      address: normalizeText(formData.get("address")) || null,
      city: normalizeText(formData.get("city")) || null,
      postalCode: normalizeText(formData.get("postalCode")) || null,
      province: normalizeText(formData.get("province")) || null,
      latitude: normalizeText(formData.get("latitude")) || null,
      longitude: normalizeText(formData.get("longitude")) || null,
      operatingRadiusKm: normalizeText(formData.get("operatingRadiusKm")) || null,
    },
    monitored
      ? (label, ms) =>
          console.info(`[esigenta-perf] [profile-update-action] ${label}=${ms}ms`)
      : undefined,
  )

  if (monitored) {
    console.info(
      `[esigenta-perf] [profile-update-action] actor=${actorMs}ms total=${Math.round(performance.now() - t0)}ms result=${result.ok ? "ok" : result.code}`,
    )
  }

  if (!result.ok) redirectWithError(result.code)

  revalidatePath("/area-impresa/profilo")
  redirect("/area-impresa/profilo?saved=1")
}

export async function requestCompanyContactChangeAction(formData: FormData) {
  const monitored = isAreaMonitoringEnabled()
  const t0 = performance.now()

  const actor = await requireAreaImpresaAccess()
  const actorMs = Math.round(performance.now() - t0)

  const result = await requestCompanyPhoneContactChange(
    actor,
    { requestedPhone: normalizeText(formData.get("phone")) || null },
    monitored
      ? (label, ms) =>
          console.info(`[esigenta-perf] [profile-phone-action] ${label}=${ms}ms`)
      : undefined,
  )

  if (monitored) {
    console.info(
      `[esigenta-perf] [profile-phone-action] actor=${actorMs}ms total=${Math.round(performance.now() - t0)}ms result=${result.ok ? "ok" : result.code}`,
    )
  }

  if (!result.ok) redirectWithError(result.code)

  revalidatePath("/area-impresa/profilo")
  redirect("/area-impresa/profilo?contactRequested=1")
}

export async function deactivateAccountAction() {
  const monitored = isAreaMonitoringEnabled()
  const t0 = performance.now()

  const actor = await requireAreaImpresaAccess()
  const actorMs = Math.round(performance.now() - t0)

  const result = await deactivateCompanyAccount(
    actor,
    monitored
      ? (label, ms) =>
          console.info(`[esigenta-perf] [profile-deactivate-action] ${label}=${ms}ms`)
      : undefined,
  )

  if (monitored) {
    console.info(
      `[esigenta-perf] [profile-deactivate-action] actor=${actorMs}ms total=${Math.round(performance.now() - t0)}ms result=${result.ok ? "ok" : result.code}`,
    )
  }

  if (!result.ok) throw new Error(result.message)

  redirect("/")
}
