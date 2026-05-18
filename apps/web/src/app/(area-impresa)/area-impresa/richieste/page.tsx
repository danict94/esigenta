import Link from "next/link"

import {
  Button,
  Card,
  Input,
  PageShell,
} from "@fixpro/ui"

import { listAvailableRequestsForCompany } from "@fixpro/db"

import { requireDefaultCompanyMembership } from "../../../../auth/server"

import { RequestListCard } from "../_components/request-list-card"

export const dynamic = "force-dynamic"

function formatFreshness(date: Date) {
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

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
  }).format(date)
}

function formatInterventionLabel(slug?: string | null) {
  if (!slug) {
    return "Richiesta"
  }

  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getStructuredData(value: unknown) {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null
}

function getDescription(structuredData: Record<string, unknown> | null) {
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

function getSurfaceArea(structuredData: Record<string, unknown> | null) {
  if (!structuredData) {
    return null
  }

  const value = structuredData.surfaceArea ?? structuredData["surface-area"]

  return typeof value === "string" || typeof value === "number" ? value : null
}

function extractProvinceFromAddress(address?: string | null) {
  if (!address) {
    return null
  }

  const match = address.toUpperCase().match(/\b([A-Z]{2})\b\s*$/)

  return match?.[1] ?? null
}

function formatLocationLabel({
  city,
  postalCode,
  address,
}: {
  city?: string | null
  postalCode?: string | null
  address?: string | null
}) {
  const province = extractProvinceFromAddress(address)
  const cityWithProvince = [city, province].filter(Boolean).join(" ")

  if (cityWithProvince && postalCode) {
    return `${cityWithProvince} - ${postalCode}`
  }

  return cityWithProvince || postalCode || "Località non specificata"
}

function getMatchLabel(matchLevel: "selected_service" | "category") {
  return matchLevel === "selected_service"
    ? "Molto compatibile"
    : "Nella tua categoria"
}

export default async function RichiestePage() {
  const membership = await requireDefaultCompanyMembership()

  const result = await listAvailableRequestsForCompany({
    companyId: membership.companyId,
  })

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <section className="space-y-7">
        <div className="flex flex-col gap-5">
          <Button
            type="button"
            variant="secondary"
            className="w-fit gap-2"
          >
            Nel tuo raggio operativo
            <span className="text-text-secondary" aria-hidden="true">
              ⌄
            </span>
          </Button>

          <div className="relative">
            <span
              className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-brand-primary"
              aria-hidden="true"
            >
              ⌕
            </span>

            <Input
              type="search"
              placeholder="Cerca per parola chiave, posizione, materiale..."
              className="h-14 pl-14 pr-5 text-base"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
            >
              Servizi
              <span className="text-text-secondary" aria-hidden="true">
                ⌄
              </span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-4">
          <div>
            <p className="text-sm font-medium text-text-secondary">
              Dashboard impresa
            </p>

            <h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
              Nuove richieste disponibili
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              {result.ok ? result.requests.length : 0} richieste
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="gap-3"
          >
            <span aria-hidden="true">↕</span>
            Ordina per
            <span className="text-text-secondary" aria-hidden="true">
              ⌄
            </span>
          </Button>
        </div>

        {!result.ok ? (
          <Card className="p-8">
            <p className="text-base font-semibold text-text-primary">
              {result.code === "missing_category"
                ? "Categoria impresa non configurata"
                : "Sede operativa incompleta"}
            </p>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              {result.message}
            </p>

            <Link
              href={
                result.code === "missing_category"
                  ? "/area-impresa/configura-servizi"
                  : "/area-impresa/richieste"
              }
              className="mt-5 inline-flex text-sm font-medium text-brand-primary"
            >
              {result.code === "missing_category"
                ? "Vai alla configurazione servizi"
                : "Torna alla dashboard"}
            </Link>
          </Card>
        ) : (
          <>
            {!result.hasSelectedServices ? (
              <Card className="bg-surface-secondary p-5">
                <p className="text-sm font-semibold text-text-primary">
                  Seleziona i servizi che offri per vedere prima le richieste
                  più adatte.
                </p>

                <Link
                  href="/area-impresa/configura-servizi"
                  className="mt-3 inline-flex text-sm font-medium text-brand-primary"
                >
                  Configura servizi
                </Link>
              </Card>
            ) : null}

            {result.requests.length === 0 ? (
              <Card className="p-8">
                <p className="text-sm text-text-secondary">
                  Nessuna richiesta disponibile al momento.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {result.requests.map((request) => {
                  const structuredData = getStructuredData(
                    request.structuredData,
                  )
                  const description = getDescription(structuredData)
                  const surfaceArea = getSurfaceArea(structuredData)

                  return (
                    <RequestListCard
                      key={request.id}
                      id={request.id}
                      intervention={formatInterventionLabel(
                        request.interventionSlug,
                      )}
                      location={formatLocationLabel({
                        city: request.city,
                        postalCode: request.postalCode,
                        address: request.address,
                      })}
                      createdAt={formatFreshness(request.createdAt)}
                      matchLabel={getMatchLabel(request.matchLevel)}
                      description={description}
                      surfaceArea={surfaceArea}
                      creditCost={request.creditCost}
                      maxUnlocks={request.maxUnlocks}
                      unlockCount={request.unlockCount}
                    />
                  )
                })}
              </div>
            )}
          </>
        )}
      </section>
    </PageShell>
  )
}
