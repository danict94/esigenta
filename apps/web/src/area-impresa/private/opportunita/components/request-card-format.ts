export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
  }).format(date)
}

export function formatFreshness(date: Date) {
  const now = Date.now()
  const diffMs = Math.max(0, now - date.getTime())
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (hours < 1) {
    return "Ora"
  }

  if (hours < 24) {
    return `${hours} h fa`
  }

  if (days === 1) {
    return "1 gg fa"
  }

  if (days < 30) {
    return `${days} gg fa`
  }

  return formatDate(date)
}

export function formatInterventionLabel(
  slug?: string | null,
) {
  if (!slug) {
    return "Richiesta"
  }

  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function getStructuredData(value: unknown) {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  )
}

function getRawAnswers(
  structuredData: Record<string, unknown>,
) {
  if (
    isRecord(structuredData.draft) &&
    isRecord(structuredData.draft.rawAnswers)
  ) {
    return structuredData.draft.rawAnswers
  }

  if (isRecord(structuredData.rawAnswers)) {
    return structuredData.rawAnswers
  }

  return structuredData
}

function findNumericSuperficie(rawAnswers: unknown): number | string | null {
  if (!rawAnswers || typeof rawAnswers !== "object") {
    return null
  }

  for (const [key, value] of Object.entries(
    rawAnswers as Record<string, unknown>,
  )) {
    if (!key.endsWith(":superficie")) {
      continue
    }
    if (typeof value === "number") {
      return value
    }
    if (
      typeof value === "string" &&
      value.trim() !== "" &&
      Number.isFinite(Number(value.replace(",", ".")))
    ) {
      return value
    }
  }

  return null
}

export function getSurfaceArea(
  structuredData: Record<string, unknown> | null,
) {
  if (!structuredData) {
    return null
  }

  const rawAnswers =
    getRawAnswers(structuredData)

  // Surface travels on a ":superficie" step id (numeric m²). Legacy keys kept
  // as a read fallback for requests persisted before the migration.
  const value =
    findNumericSuperficie(rawAnswers) ??
    structuredData.surfaceArea ??
    structuredData["surface-area"] ??
    rawAnswers.surfaceArea ??
    rawAnswers["surface-area"]

  return typeof value === "string" ||
    typeof value === "number"
    ? value
    : null
}

function extractProvinceFromAddress(
  address?: string | null,
) {
  if (!address) {
    return null
  }

  const match = address
    .toUpperCase()
    .match(/\b([A-Z]{2})\b\s*$/)

  return match?.[1] ?? null
}

export function formatLocationLabel({
  city,
  postalCode,
  address,
}: {
  city?: string | null
  postalCode?: string | null
  address?: string | null
}) {
  const province =
    extractProvinceFromAddress(address)
  const cityWithProvince = [
    city,
    province,
  ]
    .filter(Boolean)
    .join(" ")

  if (cityWithProvince && postalCode) {
    return `${cityWithProvince} - ${postalCode}`
  }

  return (
    cityWithProvince ||
    postalCode ||
    "Località non specificata"
  )
}
