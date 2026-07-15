export type RequestFormDetail = {
  label: string
  value: string
}

type JsonRecord = Record<string, unknown>

type RequestDetailViewModelSource = {
  hasUnlocked: boolean
  requestUnlockRefund: {
    refundedAt: Date | null
    refundTransactionId: string | null
    refundRequest: {
      id: string
      status: string
      createdAt: Date
    } | null
  } | null
  customerContact: {
    name: string | null
    email: string | null
    phone: string | null
  } | null
  interventionSlug: string | null
  address: string | null
  structuredData: unknown
  city: string | null
}

const italianProvinceCodes = new Set([
  "AG",
  "AL",
  "AN",
  "AO",
  "AP",
  "AQ",
  "AR",
  "AT",
  "AV",
  "BA",
  "BG",
  "BI",
  "BL",
  "BN",
  "BO",
  "BR",
  "BS",
  "BT",
  "BZ",
  "CA",
  "CB",
  "CE",
  "CH",
  "CI",
  "CL",
  "CN",
  "CO",
  "CR",
  "CS",
  "CT",
  "CZ",
  "EN",
  "FC",
  "FE",
  "FG",
  "FI",
  "FM",
  "FR",
  "GE",
  "GO",
  "GR",
  "IM",
  "IS",
  "KR",
  "LC",
  "LE",
  "LI",
  "LO",
  "LT",
  "LU",
  "MB",
  "MC",
  "ME",
  "MI",
  "MN",
  "MO",
  "MS",
  "MT",
  "NA",
  "NO",
  "NU",
  "OG",
  "OR",
  "OT",
  "PA",
  "PC",
  "PD",
  "PE",
  "PG",
  "PI",
  "PN",
  "PO",
  "PR",
  "PT",
  "PU",
  "PV",
  "PZ",
  "RA",
  "RC",
  "RE",
  "RG",
  "RI",
  "RM",
  "RN",
  "RO",
  "SA",
  "SI",
  "SO",
  "SP",
  "SR",
  "SS",
  "SU",
  "SV",
  "TA",
  "TE",
  "TN",
  "TO",
  "TP",
  "TR",
  "TS",
  "TV",
  "UD",
  "VA",
  "VB",
  "VC",
  "VE",
  "VI",
  "VR",
  "VS",
  "VT",
  "VV",
])

const detailLabels: Record<string, string> = {
  timing: "Tempistiche",
  property: "Immobile",
  propertytype: "Tipo immobile",
  surfacearea: "Superficie",
  rooms: "Stanze",
  budget: "Budget",
  photos: "Foto",
}

const detailSortOrder: Record<string, number> = {
  timing: 10,
  property: 30,
  propertytype: 35,
  surfacearea: 40,
  rooms: 50,
  budget: 60,
  photos: 70,
}

const valueLabels: Record<string, string> = {
  as_soon_as_possible: "Il prima possibile",
  within_30_days: "Entro 30 giorni",
  flexible: "Flessibile",
  evaluating: "Sto valutando",
  appartamento: "Appartamento",
  villa: "Villa",
  ufficio: "Ufficio",
  negozio: "Negozio",
  condominio: "Condominio",
  garage: "Garage",
  magazzino: "Magazzino",
  altro: "Altro",
}

const omittedDetailKeys = new Set([
  "location",
  "contact",
  "description",
  "descrizione",
  "message",
  "notes",
  "details",
  "city",
  "address",
  "postalcode",
  "cap",
  "where",
  "dove",
  "luogo",
  "indirizzo",
  "province",
  "provincecode",
  "provincia",
  "intervention",
  "interventionslug",
  "service",
  "serviceslug",
  "worktype",
  "jobtype",
  "typeofwork",
  "photos",
])

const descriptionKeys = new Set([
  "description",
  "descrizione",
  "details",
  "detail",
  "message",
  "note",
  "notes",
  "customerdescription",
  "requestdescription",
  "problemdescription",
  "additionalinfo",
  "additionalinformation",
])

const provinceKeys = new Set([
  "province",
  "provincecode",
  "provincia",
])

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value),
  )
}

function normalizeKey(key: string) {
  return key.replace(/[-_\s]/g, "").toLowerCase()
}

export function formatInterventionLabel(slug?: string | null) {
  if (!slug) {
    return "Richiesta"
  }

  const readable = slug.replace(/[-_]/g, " ").trim().toLowerCase()

  return readable.charAt(0).toUpperCase() + readable.slice(1)
}

function formatKey(key: string) {
  const formatted = key
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function formatPrimitive(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return ""
  }

  if (typeof value === "string") {
    const trimmed = value.trim()

    return (
      valueLabels[trimmed] ??
      valueLabels[trimmed.toLowerCase()] ??
      trimmed
    )
  }

  if (typeof value === "number") {
    return String(value)
  }

  if (typeof value === "boolean") {
    return value ? "Si" : "No"
  }

  return ""
}

function formatStructuredValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return ""
    }

    if (value.every(isRecord)) {
      const names = value
        .map((item) =>
          typeof item.name === "string" ? item.name : undefined,
        )
        .filter(Boolean)

      return names.length > 0
        ? `${value.length} file: ${names.join(", ")}`
        : `${value.length} elementi`
    }

    return value.map(formatStructuredValue).filter(Boolean).join(", ")
  }

  if (isRecord(value)) {
    const entries = Object.entries(value)
      .map(([key, entryValue]) => {
        const formatted = formatStructuredValue(entryValue)

        if (!formatted) {
          return null
        }

        return `${formatKey(key)}: ${formatted}`
      })
      .filter(Boolean)

    return entries.join("; ")
  }

  return formatPrimitive(value)
}

function getRawAnswers(structuredData: unknown): JsonRecord {
  if (!isRecord(structuredData)) {
    return {}
  }

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

/**
 * Human-readable labels/values for select-based intervention answers, built by
 * the funnel at draft time (it owns the chip labels). Keeps this view generic:
 * no per-intervention label tables to maintain here.
 */
function getAnswerDisplay(
  structuredData: unknown,
): Record<string, { label: string; value: string }> {
  const source =
    isRecord(structuredData) && isRecord(structuredData.draft)
      ? structuredData.draft.answerDisplay
      : isRecord(structuredData)
        ? structuredData.answerDisplay
        : undefined

  if (!isRecord(source)) {
    return {}
  }

  const result: Record<string, { label: string; value: string }> = {}

  for (const [key, entry] of Object.entries(source)) {
    if (
      isRecord(entry) &&
      typeof entry.label === "string" &&
      typeof entry.value === "string"
    ) {
      result[key] = { label: entry.label, value: entry.value }
    }
  }

  return result
}

function getProvinceCode(value: unknown): string | null {
  if (typeof value === "string") {
    const code = value.trim().toUpperCase()

    return /^[A-Z]{2}$/.test(code) && italianProvinceCodes.has(code)
      ? code
      : null
  }

  if (!isRecord(value)) {
    return null
  }

  for (const [key, entryValue] of Object.entries(value)) {
    if (["code", "provincecode", "sigla"].includes(normalizeKey(key))) {
      const code = getProvinceCode(entryValue)

      if (code) {
        return code
      }
    }
  }

  return null
}

function resolveProvinceFromStructuredData(
  value: unknown,
): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = resolveProvinceFromStructuredData(item)

      if (found) {
        return found
      }
    }

    return null
  }

  if (!isRecord(value)) {
    return null
  }

  for (const [key, entryValue] of Object.entries(value)) {
    if (provinceKeys.has(normalizeKey(key))) {
      const code = getProvinceCode(entryValue)

      if (code) {
        return code
      }
    }
  }

  for (const entryValue of Object.values(value)) {
    const found = resolveProvinceFromStructuredData(entryValue)

    if (found) {
      return found
    }
  }

  return null
}

function resolveProvinceFromAddress(
  address?: string | null,
): string | null {
  if (!address) {
    return null
  }

  const normalizedAddress = address.replace(/\bitalia\b\.?$/i, "").trim()
  const match = normalizedAddress.match(/\b([A-Za-z]{2})\b\s*[\])}.,;:]*$/)

  return match ? getProvinceCode(match[1]) : null
}

function resolveProvince({
  address,
  structuredData,
}: {
  address?: string | null
  structuredData: unknown
}): string | null {
  return (
    resolveProvinceFromAddress(address) ??
    resolveProvinceFromStructuredData(structuredData)
  )
}

function findDescriptionInValue(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findDescriptionInValue(item)

      if (found) {
        return found
      }
    }

    return null
  }

  if (!isRecord(value)) {
    return null
  }

  for (const [key, entryValue] of Object.entries(value)) {
    if (
      descriptionKeys.has(normalizeKey(key)) &&
      typeof entryValue === "string"
    ) {
      const trimmed = entryValue.trim()

      if (trimmed.length > 0) {
        return trimmed
      }
    }
  }

  for (const entryValue of Object.values(value)) {
    const found = findDescriptionInValue(entryValue)

    if (found) {
      return found
    }
  }

  return null
}

function findDescription(structuredData: unknown): string | null {
  const rawAnswers = getRawAnswers(structuredData)

  return (
    findDescriptionInValue(rawAnswers) ??
    findDescriptionInValue(structuredData)
  )
}

function getDetailLabel(key: string) {
  return detailLabels[normalizeKey(key)] ?? formatKey(key)
}

function shouldOmitDetailKey(key: string) {
  return omittedDetailKeys.has(normalizeKey(key))
}

function getDetailSortValue(key: string, index: number) {
  return detailSortOrder[normalizeKey(key)] ?? 1000 + index
}

function buildFormDetails(
  structuredData: unknown,
): RequestFormDetail[] {
  const rawAnswers = getRawAnswers(structuredData)
  const answerDisplay = getAnswerDisplay(structuredData)
  const seenLabels = new Set<string>()

  return Object.entries(rawAnswers)
    .map(([key, value], index) => ({ key, value, index }))
    .filter(({ key }) => !shouldOmitDetailKey(key))
    .sort(
      (left, right) =>
        getDetailSortValue(left.key, left.index) -
        getDetailSortValue(right.key, right.index),
    )
    .flatMap(({ key, value }) => {
      // Intervention-specific steps carry their own readable label/value from
      // the funnel (answerDisplay); common keys use the generic formatting.
      const display = answerDisplay[key]
      const label = display ? display.label : getDetailLabel(key)
      const normalizedLabel = label.toLowerCase()
      const formattedValue = display
        ? display.value
        : formatStructuredValue(value)

      if (!formattedValue || seenLabels.has(normalizedLabel)) {
        return []
      }

      seenLabels.add(normalizedLabel)

      return [
        {
          label,
          value: formattedValue,
        },
      ]
    })
}

function buildTitle({
  intervention,
  city,
  province,
}: {
  intervention: string
  city?: string | null
  province?: string | null
}) {
  const place = [city, province]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ")

  return place ? `${intervention} a ${place}` : intervention
}

export function buildRequestDetailViewModel({
  request,
}: {
  request: RequestDetailViewModelSource
}) {
  const hasUnlocked = request.hasUnlocked
  const requestUnlockRefundState = request.requestUnlockRefund
  const customerContact = request.customerContact
  const intervention = formatInterventionLabel(request.interventionSlug)
  const province = resolveProvince({
    address: request.address,
    structuredData: request.structuredData,
  })
  const title = buildTitle({
    intervention,
    city: request.city,
    province,
  })
  const description = findDescription(request.structuredData)
  const formDetails = buildFormDetails(request.structuredData)

  return {
    customerContact,
    description,
    formDetails,
    hasUnlocked,
    province,
    requestUnlockRefundState,
    title,
  }
}
