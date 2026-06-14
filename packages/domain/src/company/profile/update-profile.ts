import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

type PerfRecorder = (label: string, ms: number) => void

const ALLOWED_RADIUS_KM = [10, 20, 30, 50, 75, 100] as const

export type UpdateCompanyProfileErrorCode =
  | "invalid_website"
  | "invalid_radius"
  | "invalid_coordinates"
  | "company_not_found"

export type UpdateCompanyProfileResult =
  | { ok: true }
  | { ok: false; code: UpdateCompanyProfileErrorCode }

export type UpdateCompanyProfileInput = {
  website: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  province: string | null
  latitude: string | null
  longitude: string | null
  operatingRadiusKm: string | null
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

function normalizeCoordinate(raw: string | null): number | null | undefined {
  const normalized = raw?.trim()
  if (!normalized) return null

  const n = Number(normalized.replace(",", "."))
  return Number.isFinite(n) ? n : undefined
}

function normalizeOptional(raw: string | null): string | null {
  const s = raw?.trim()
  return s || null
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

  const latitude = normalizeCoordinate(input.latitude)
  const longitude = normalizeCoordinate(input.longitude)

  if (
    latitude === undefined ||
    longitude === undefined ||
    (latitude === null && longitude !== null) ||
    (latitude !== null && longitude === null)
  ) {
    return { ok: false, code: "invalid_coordinates" }
  }

  const t0 = performance.now()

  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    UPDATE "Company"
    SET
      "website"           = ${website},
      "address"           = ${normalizeOptional(input.address)},
      "city"              = ${normalizeOptional(input.city)},
      "postalCode"        = ${normalizeOptional(input.postalCode)},
      "province"          = ${normalizeOptional(input.province)},
      "latitude"          = ${latitude}::double precision,
      "longitude"         = ${longitude}::double precision,
      "operatingRadiusKm" = ${radiusValue},
      "updatedAt"         = now()
    WHERE "id" = ${actor.company.id}
    RETURNING "id"
  `

  recordPerf?.("profile-update", Math.round(performance.now() - t0))

  if (rows.length === 0) return { ok: false, code: "company_not_found" }

  return { ok: true }
}
