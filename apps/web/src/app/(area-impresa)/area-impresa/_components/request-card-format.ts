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

export function getDescription(
  structuredData: Record<string, unknown> | null,
) {
  if (!structuredData) {
    return null
  }

  if (typeof structuredData.description === "string") {
    return structuredData.description
  }

  if (typeof structuredData.message === "string") {
    return structuredData.message
  }

  if (typeof structuredData.details === "string") {
    return structuredData.details
  }

  return null
}

export function getSurfaceArea(
  structuredData: Record<string, unknown> | null,
) {
  if (!structuredData) {
    return null
  }

  const value =
    structuredData.surfaceArea ??
    structuredData["surface-area"]

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
