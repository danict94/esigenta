"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  deactivateCompanyAccount,
  requestCompanyPhoneContactChange,
  updateCompanyProfile,
  updateCompanyPublicProfile,
} from "@esigenta/domain"

import { isGeoPlace } from "@esigenta/shared"

import { requireAreaImpresaAccess } from "../../../../auth/server"
import { isAreaMonitoringEnabled } from "../../../../platform/monitoring/area-monitoring"


function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : ""
}

function parseGeoPlace(value: FormDataEntryValue | null) {
  const raw = normalizeText(value)

  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    return isGeoPlace(parsed) ? parsed : null
  } catch {
    return null
  }
}

function redirectWithError(code: string): never {
  redirect(`/area-impresa/profilo?error=${encodeURIComponent(code)}`)
}

export async function updateCompanyProfileAction(formData: FormData) {
  const monitored = isAreaMonitoringEnabled()
  const t0 = performance.now()

  const actor = await requireAreaImpresaAccess()
  const actorMs = Math.round(performance.now() - t0)

  const geoPlace = parseGeoPlace(formData.get("geoPlace"))

  if (!geoPlace) {
    redirectWithError("invalid_location")
  }

  const result = await updateCompanyProfile(
    actor,
    {
      website: normalizeText(formData.get("website")) || null,
      operatingRadiusKm: normalizeText(formData.get("operatingRadiusKm")) || null,
      geoPlace,
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

export async function updateCompanyPublicProfileAction(formData: FormData) {
  const monitored = isAreaMonitoringEnabled()
  const t0 = performance.now()

  const actor = await requireAreaImpresaAccess()
  const actorMs = Math.round(performance.now() - t0)

  const result = await updateCompanyPublicProfile(
    actor,
    {
      publicName: normalizeText(formData.get("publicName")) || null,
      shortDescription: normalizeText(formData.get("shortDescription")) || null,
      fullDescription: normalizeText(formData.get("fullDescription")) || null,
      yearsOfExperience: normalizeText(formData.get("yearsOfExperience")) || null,
      publicProfileConsent: formData.get("publicProfileConsent") === "on",
    },
    monitored
      ? (label, ms) =>
          console.info(`[esigenta-perf] [public-profile-update-action] ${label}=${ms}ms`)
      : undefined,
  )

  if (monitored) {
    console.info(
      `[esigenta-perf] [public-profile-update-action] actor=${actorMs}ms total=${Math.round(performance.now() - t0)}ms result=${result.ok ? "ok" : result.code}`,
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
