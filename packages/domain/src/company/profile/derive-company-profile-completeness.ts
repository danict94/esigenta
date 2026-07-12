const REQUIRED_FIELDS = [
  "publicName",
  "shortDescription",
  "geoLocation",
  "operatingRadiusKm",
  "categories",
  "interventions",
  "phone",
  "vatNumber",
] as const

const OPTIONAL_FIELDS = [
  "fullDescription",
  "website",
  "yearsOfExperience",
] as const

export type CompanyProfileCompletenessField = (typeof REQUIRED_FIELDS)[number]

/**
 * Shared Italian labels for the required-field keys above — the single copy
 * used both by the area-impresa checklist and the admin badge, so the two
 * never drift into different wording for the same field.
 */
export const companyProfileCompletenessFieldLabels: Record<
  CompanyProfileCompletenessField,
  string
> = {
  publicName: "Nome pubblico",
  shortDescription: "Descrizione breve",
  geoLocation: "Sede operativa",
  operatingRadiusKm: "Raggio operativo",
  categories: "Categorie",
  interventions: "Interventi",
  phone: "Telefono",
  vatNumber: "Partita IVA",
}

export type DeriveCompanyProfileCompletenessInput = {
  publicName: string | null
  shortDescription: string | null
  fullDescription: string | null
  website: string | null
  yearsOfExperience: number | null
  hasGeoLocation: boolean
  operatingRadiusKm: number | null
  categoryCount: number
  interventionCount: number
  phone: string | null
  vatNumber: string | null
}

export type CompanyProfileCompleteness = {
  isComplete: boolean
  missing: CompanyProfileCompletenessField[]
  completed: CompanyProfileCompletenessField[]
  score: number
}

/**
 * THE single source of truth for "is this company's profile complete" —
 * never stored on Company (no profileStatus column). Purely a read-time
 * derivation so the definition of "complete" can never drift between the
 * area-impresa checklist and the admin list. publicProfileConsentAt is
 * deliberately NOT part of this — consent to a future public vetrina is
 * its own concern, non-blocking, tracked separately.
 */
export function deriveCompanyProfileCompleteness(
  input: DeriveCompanyProfileCompletenessInput,
): CompanyProfileCompleteness {
  const requiredPresence: Record<CompanyProfileCompletenessField, boolean> = {
    publicName: Boolean(input.publicName?.trim()),
    shortDescription: Boolean(input.shortDescription?.trim()),
    geoLocation: input.hasGeoLocation,
    operatingRadiusKm: input.operatingRadiusKm !== null && input.operatingRadiusKm > 0,
    categories: input.categoryCount > 0,
    interventions: input.interventionCount > 0,
    phone: Boolean(input.phone?.trim()),
    vatNumber: Boolean(input.vatNumber?.trim()),
  }

  const missing = REQUIRED_FIELDS.filter((field) => !requiredPresence[field])
  const completed = REQUIRED_FIELDS.filter((field) => requiredPresence[field])

  const optionalPresentCount = OPTIONAL_FIELDS.filter((field) => {
    if (field === "fullDescription") return Boolean(input.fullDescription?.trim())
    if (field === "website") return Boolean(input.website?.trim())
    return input.yearsOfExperience !== null && input.yearsOfExperience >= 0
  }).length

  const totalFields = REQUIRED_FIELDS.length + OPTIONAL_FIELDS.length
  const presentFields = completed.length + optionalPresentCount

  return {
    isComplete: missing.length === 0,
    missing,
    completed,
    score: Math.round((presentFields / totalFields) * 100),
  }
}
