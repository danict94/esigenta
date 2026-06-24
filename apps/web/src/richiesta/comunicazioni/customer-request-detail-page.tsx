import { Container, cn } from "@esigenta/ui";

import {
  RequestFlowError,
  getCustomerRequestByHistoryToken,
} from "@esigenta/domain"

import { PublicShell } from "../../site/shell/public-shell"
import { CustomerRequestsNav } from "./components/customer-requests-nav"

export const dynamic = "force-dynamic"

type CustomerRequestDetailPageProps = {
  requestId: string
  token?: string
}

type JsonRecord = Record<string, unknown>

type RequestFormDetail = {
  label: string
  value: string
}

const valueLabels: Record<string, string> = {
  yes: "Sì",
  no: "No",
  flexible: "Flessibile",
  appartamento: "Appartamento",
  villa: "Villa",
  ufficio: "Ufficio",
  negozio: "Negozio",
  condominio: "Condominio",
  garage: "Garage",
  magazzino: "Magazzino",
  altro: "Altro",
}

const detailLabels: Record<string, string> = {
  budget: "Budget",
  property: "Immobile",
  rooms: "Ambienti",
  surfacearea: "Superficie",
  timing: "Tempistiche",
}

const omittedDetailKeys = new Set([
  "location",
  "contact",
  "photos",
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
])

const descriptionKeys = new Set([
  "customerdescription",
  "requestdescription",
  "problemdescription",
  "additionalinfo",
  "additionalinformation",
  "description",
  "descrizione",
  "details",
  "detail",
  "message",
  "note",
  "notes",
])

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(
    value && typeof value === "object" && !Array.isArray(value),
  )
}

function normalizeKey(key: string) {
  return key.replace(/[-_\s]/g, "").toLowerCase()
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
  }).format(date)
}

function formatIntervention(slug: string | null) {
  if (!slug) {
    return "Richiesta"
  }

  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatStatus(status: string) {
  switch (status) {
    case "PENDING_VERIFICATION":
      return "In attesa di conferma"
    case "PENDING_REVIEW":
      return "In revisione"
    case "APPROVED":
      return "Approvata"
    case "PUBLISHED":
      return "Pubblicata"
    case "CLOSED":
      return "Chiusa"
    case "REJECTED":
      return "Non approvata"
    default:
      return status
  }
}

function formatKey(key: string) {
  const formatted = key
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()

  return (
    formatted.charAt(0).toUpperCase() + formatted.slice(1)
  )
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
    return value ? "Sì" : "No"
  }

  return ""
}

function formatStructuredValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(formatStructuredValue).filter(Boolean).join(", ")
  }

  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, entryValue]) => {
        const formatted = formatStructuredValue(entryValue)

        return formatted ? `${formatKey(key)}: ${formatted}` : ""
      })
      .filter(Boolean)
      .join("; ")
  }

  return formatPrimitive(value)
}

function getDraft(structuredData: unknown): JsonRecord {
  if (
    isRecord(structuredData) &&
    isRecord(structuredData.draft)
  ) {
    return structuredData.draft
  }

  return {}
}

function getRawAnswers(structuredData: unknown): JsonRecord {
  const draft = getDraft(structuredData)

  if (isRecord(draft.rawAnswers)) {
    return draft.rawAnswers
  }

  if (isRecord(structuredData) && isRecord(structuredData.rawAnswers)) {
    return structuredData.rawAnswers
  }

  return {}
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
  const draft = getDraft(structuredData)

  if (typeof draft.customerDescription === "string") {
    const description = draft.customerDescription.trim()

    if (description) {
      return description
    }
  }

  const rawAnswers = getRawAnswers(structuredData)

  return (
    findDescriptionInValue(rawAnswers) ??
    findDescriptionInValue(structuredData)
  )
}

function shouldOmitDetailKey(key: string) {
  return omittedDetailKeys.has(normalizeKey(key))
}

function getDetailLabel(key: string) {
  return detailLabels[normalizeKey(key)] ?? formatKey(key)
}

function buildStructuredDetails(
  structuredData: unknown,
): RequestFormDetail[] {
  const rawAnswers = getRawAnswers(structuredData)
  const seenLabels = new Set<string>()

  return Object.entries(rawAnswers)
    .filter(([key]) => !shouldOmitDetailKey(key))
    .flatMap(([key, value]) => {
      const label = getDetailLabel(key)
      const normalizedLabel = label.toLowerCase()
      const formattedValue = formatStructuredValue(value)

      if (!formattedValue || seenLabels.has(normalizedLabel)) {
        return []
      }

      seenLabels.add(normalizedLabel)

      return [{ label, value: formattedValue }]
    })
    .slice(0, 8)
}

function buildHistoryHref(token: string) {
  if (!token) {
    return "/richieste/accesso"
  }

  const params = new URLSearchParams({ token })

  return `/richieste/cliente?${params.toString()}`
}

async function loadRequest({
  token,
  requestId,
}: {
  token?: string
  requestId: string
}) {
  if (!token) {
    return {
      ok: false as const,
      message: "Il link non contiene il token necessario.",
    }
  }

  try {
    return {
      ok: true as const,
      request: await getCustomerRequestByHistoryToken({ token, requestId }),
    }
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof RequestFlowError
          ? error.message
          : "Non siamo riusciti a recuperare la richiesta.",
    }
  }
}

export async function CustomerRequestDetailPage({
  requestId,
  token,
}: CustomerRequestDetailPageProps) {
  const result = await loadRequest({ token, requestId })

  const description = result.ok
    ? findDescription(result.request.structuredData)
    : null
  const details = result.ok
    ? buildStructuredDetails(result.request.structuredData)
    : []
  const historyHref = buildHistoryHref(token ?? "")

  const primaryLinkClass =
    "inline-flex h-11 items-center justify-center rounded-md border border-cantiere-accent bg-cantiere-accent px-5 text-sm font-semibold text-cantiere-paper transition-colors hover:border-cantiere-accent-hover hover:bg-cantiere-accent-hover"

  return (
    <PublicShell>
      <section className={"py-20 md:py-28 lg:py-32"}>
        <Container size="md">
          <div className="space-y-6">
            <div className="space-y-4">
              <a
                href={historyHref}
                className="text-sm font-medium text-cantiere-accent"
              >
                Torna allo storico richieste
              </a>
              <h1
                className={cn(
                  "text-cantiere-ink",
                  "text-[clamp(1.625rem,1.1rem+2.2vw,2.375rem)] font-medium tracking-[-0.01em]",
                )}
              >
                Dettaglio richiesta
              </h1>
              <CustomerRequestsNav token={token} />
            </div>

            {!result.ok ? (
              <div className="border border-cantiere-hairline bg-cantiere-paper p-6">
                <p className="text-sm text-cantiere-ink-secondary">
                  {result.message}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border border-cantiere-hairline bg-cantiere-paper p-6">
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div className="border border-cantiere-hairline bg-cantiere-paper p-3">
                      <dt className="text-xs text-cantiere-ink-secondary">
                        Codice
                      </dt>
                      <dd className="mt-1 font-medium text-cantiere-ink">
                        {result.request.requestCode ??
                          result.request.requestId}
                      </dd>
                    </div>

                    <div className="border border-cantiere-hairline bg-cantiere-paper p-3">
                      <dt className="text-xs text-cantiere-ink-secondary">
                        Stato
                      </dt>
                      <dd className="mt-1 text-cantiere-ink">
                        {formatStatus(result.request.status)}
                      </dd>
                    </div>

                    <div className="border border-cantiere-hairline bg-cantiere-paper p-3">
                      <dt className="text-xs text-cantiere-ink-secondary">
                        Intervento
                      </dt>
                      <dd className="mt-1 text-cantiere-ink">
                        {formatIntervention(result.request.interventionSlug)}
                      </dd>
                    </div>

                    <div className="border border-cantiere-hairline bg-cantiere-paper p-3">
                      <dt className="text-xs text-cantiere-ink-secondary">
                        Città
                      </dt>
                      <dd className="mt-1 text-cantiere-ink">
                        {result.request.city ?? "Non specificata"}
                      </dd>
                    </div>

                    <div className="border border-cantiere-hairline bg-cantiere-paper p-3 sm:col-span-2">
                      <dt className="text-xs text-cantiere-ink-secondary">
                        Data
                      </dt>
                      <dd className="mt-1 text-cantiere-ink">
                        {formatDate(result.request.createdAt)}
                      </dd>
                    </div>
                  </dl>
                </div>

                {description ? (
                  <div className="border border-cantiere-hairline bg-cantiere-paper p-6">
                    <h2 className="text-sm font-semibold text-cantiere-ink">
                      Descrizione
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-cantiere-ink-secondary">
                      {description}
                    </p>
                  </div>
                ) : null}

                {details.length > 0 ? (
                  <div className="border border-cantiere-hairline bg-cantiere-paper p-6">
                    <h2 className="text-sm font-semibold text-cantiere-ink">
                      Dettagli
                    </h2>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      {details.map((detail) => (
                        <div
                          key={detail.label}
                          className="border border-cantiere-hairline bg-cantiere-paper p-3"
                        >
                          <dt className="text-xs text-cantiere-ink-secondary">
                            {detail.label}
                          </dt>
                          <dd className="mt-1 text-cantiere-ink">
                            {detail.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}

                <a
                  href={historyHref}
                  className={primaryLinkClass}
                >
                  Torna allo storico richieste
                </a>
              </div>
            )}
          </div>
        </Container>
      </section>
    </PublicShell>
  )
}
