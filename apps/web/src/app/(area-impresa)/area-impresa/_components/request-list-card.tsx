import Link from "next/link"
import {
  Bookmark,
  Clock3,
  MapPin,
  Ruler,
  UsersRound,
} from "lucide-react"

import {
  Badge,
  Button,
  Card,
  cn,
  tokens,
  type BadgeProps,
} from "@esigenta/ui"

import {
  formatCreditCost,
} from "./request-commercial-display"

export type RequestListCardProps = {
  id: string
  intervention: string
  location: string
  createdAt: string
  matchLabel?: string
  description?: string | null
  surfaceArea?: string | number | null
  creditCost: number | null
  maxUnlocks: number | null
  unlockCount: number
  isSaved?: boolean
  savedAction?: (formData: FormData) => Promise<void>
  badges?: Array<{
    label: string
    variant?: BadgeProps["variant"]
  }>
}

function formatSurfaceArea(
  value?: string | number | null,
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null
  }

  const raw = String(value).trim()

  if (!raw) {
    return null
  }

  if (/^\d+([,.]\d+)?$/.test(raw)) {
    return `${raw} mq`
  }

  return raw
}

function getLocationTitlePart(
  location: string,
) {
  const value =
    location.split(" - ")[0]?.trim()

  if (!value || value.toLowerCase().startsWith("localit")) {
    return null
  }

  return value
}

function buildTitle({
  intervention,
  location,
}: {
  intervention: string
  location: string
}) {
  const locationTitlePart =
    getLocationTitlePart(location)

  if (!locationTitlePart) {
    return intervention
  }

  return `${intervention} a ${locationTitlePart}`
}

function formatInterestCount({
  maxUnlocks,
  unlockCount,
}: {
  maxUnlocks: number | null
  unlockCount: number
}) {
  if (maxUnlocks === null) {
    return `${unlockCount} interessati`
  }

  return `${unlockCount}/${maxUnlocks} interessati`
}

function buildPreviewText({
  description,
  formattedSurface,
  intervention,
}: {
  description?: string | null
  formattedSurface: string | null
  intervention: string
}) {
  const cleanDescription =
    description?.trim()

  if (cleanDescription) {
    return cleanDescription
  }

  const interventionLabel =
    intervention.toLowerCase()

  if (formattedSurface) {
    return `Richiesta per ${interventionLabel}, superficie indicativa ${formattedSurface}.`
  }

  return `Richiesta per ${interventionLabel}.`
}

export function RequestListCard({
  id,
  intervention,
  location,
  createdAt,
  matchLabel,
  description,
  surfaceArea,
  creditCost,
  maxUnlocks,
  unlockCount,
  isSaved = false,
  savedAction,
  badges = [],
}: RequestListCardProps) {
  const title = buildTitle({
    intervention,
    location,
  })
  const formattedSurface =
    formatSurfaceArea(surfaceArea)
  const previewText =
    buildPreviewText({
      description,
      formattedSurface,
      intervention,
    })

  return (
    <Card className="border-l-4 border-l-brand-primary p-4 transition-colors hover:border-border-focus lg:p-5">
      <div className="space-y-3.5 lg:space-y-4">
        <div className="flex flex-col gap-1.5 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
          <h2 className="text-xl font-semibold leading-snug tracking-tight text-text-primary lg:text-2xl">
            {title}
          </h2>

          <span className="shrink-0 text-sm font-medium text-text-primary lg:pt-1 lg:text-lg">
            {formatCreditCost(creditCost)}
          </span>
        </div>

        {(matchLabel || badges.length > 0) ? (
          <div className="flex flex-wrap items-center gap-2">
            {matchLabel ? (
              <Badge variant="warning" size="sm">
                {matchLabel}
              </Badge>
            ) : null}

            {badges.map((badge) => (
              <Badge
                key={badge.label}
                variant={badge.variant ?? "neutral"}
                size="sm"
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        ) : null}

        <p className="line-clamp-2 max-w-3xl text-sm leading-6 text-text-primary lg:text-lg lg:leading-7">
          {previewText}{" "}
          <Link
            href={`/area-impresa/richieste/${id}`}
            className="font-medium text-brand-primary transition-colors hover:text-brand-primary-hover"
          >
            Leggi tutto
          </Link>
        </p>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3 lg:space-y-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-primary lg:gap-x-12 lg:gap-y-3 lg:text-base">
              <span className="inline-flex items-center gap-2">
                <MapPin
                  className="size-4 text-text-secondary lg:size-5"
                  aria-hidden="true"
                />
                {location}
              </span>

              <span className="inline-flex items-center gap-2">
                <Clock3
                  className="size-4 text-text-secondary lg:size-5"
                  aria-hidden="true"
                />
                {createdAt}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-primary lg:gap-x-12 lg:gap-y-3 lg:text-base">
              <span className="inline-flex items-center gap-2">
                <UsersRound
                  className="size-4 text-text-secondary lg:size-5"
                  aria-hidden="true"
                />
                {formatInterestCount({
                  maxUnlocks,
                  unlockCount,
                })}
              </span>

              {formattedSurface ? (
                <span className="inline-flex items-center gap-2">
                  <Ruler
                    className="size-4 text-text-secondary lg:size-5"
                    aria-hidden="true"
                  />
                  {formattedSurface}
                </span>
              ) : null}

              {savedAction ? (
                <form action={savedAction}>
                  <Button
                    type="submit"
                    name="requestId"
                    value={id}
                    variant="ghost"
                    size="sm"
                    className="gap-2 px-0 text-sm font-normal text-text-primary hover:bg-transparent hover:text-brand-primary lg:text-base"
                  >
                    <Bookmark
                      className="size-4 lg:size-5"
                      aria-hidden="true"
                    />
                    {isSaved ? "salvata" : "salva"}
                  </Button>
                </form>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 lg:min-w-44 lg:justify-end">
            <Link
              href={`/area-impresa/richieste/${id}`}
              className={cn(
                tokens.interactive.base,
                tokens.interactive.radius,
                tokens.interactive.sizes.md,
                tokens.interactive.variants.brand,
                "w-full gap-2 lg:w-auto",
              )}
            >
              Vedi richiesta
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}
