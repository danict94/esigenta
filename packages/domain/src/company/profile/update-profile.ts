import type { CompanyActor } from "@esigenta/auth"
import { prisma, setCompanyLocationWithClient } from "@esigenta/database"
import { isFreshGeoPlace, type GeoPlace } from "@esigenta/shared"

type PerfRecorder = (label: string, ms: number) => void

const ALLOWED_RADIUS_KM = [10, 20, 30, 50, 75, 100] as const

export type UpdateCompanyProfileErrorCode =
  | "invalid_website"
  | "invalid_radius"
  | "invalid_location"
  | "company_not_found"

export type UpdateCompanyProfileResult =
  | { ok: true }
  | { ok: false; code: UpdateCompanyProfileErrorCode }

export type UpdateCompanyProfileInput = {
  website: string | null
  operatingRadiusKm: string | null
  geoPlace: GeoPlace
}

function normalizeWebsite(raw: string | null): string | null | undefined {
  if (!raw?.trim()) return null

  try {
    const url = new URL(raw.trim())
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined
    return url.toString()
  } catch {
    return undefined
  }
}

export async function updateCompanyProfile(
  actor: CompanyActor,
  input: UpdateCompanyProfileInput,
  recordPerf?: PerfRecorder,
): Promise<UpdateCompanyProfileResult> {
  const website = normalizeWebsite(input.website)
  if (website === undefined) return { ok: false, code: "invalid_website" }

  const radiusValue = Number(input.operatingRadiusKm?.trim())
  if (!ALLOWED_RADIUS_KM.includes(radiusValue as (typeof ALLOWED_RADIUS_KM)[number])) {
    return { ok: false, code: "invalid_radius" }
  }

  if (!isFreshGeoPlace(input.geoPlace)) {
    return { ok: false, code: "invalid_location" }
  }

  const t0 = performance.now()

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.company.updateMany({
      where: { id: actor.company.id },
      data: {
        website,
        operatingRadiusKm: radiusValue,
      },
    })

    if (updated.count === 0) {
      return { ok: false as const, code: "company_not_found" as const }
    }

    await setCompanyLocationWithClient(tx, actor.company.id, input.geoPlace)

    return { ok: true as const }
  })

  recordPerf?.("profile-update", Math.round(performance.now() - t0))

  return result
}
