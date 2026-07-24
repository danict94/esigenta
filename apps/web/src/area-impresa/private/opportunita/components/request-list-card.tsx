"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { Bookmark } from "lucide-react"

import { cn, type BadgeProps } from "@esigenta/ui"

import {
  formatCreditCost,
} from "./request-commercial-format"
import {
  PendingRequestLink,
  PendingSubmitButton,
} from "./request-pending-controls"

export type RequestListCardProps = {
  id: string
  intervention: string
  location: string
  createdAt: string
  matchLabel?: string
  surfaceArea?: string | number | null
  creditCost: number | null
  /** Overrides the computed credit-cost label, e.g. for restricted-access rows. */
  costLabel?: string
  maxUnlocks: number | null
  unlockCount: number
  /** Omit to hide the "N interessati" chip (e.g. data not available yet). */
  showInterestCount?: boolean
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

function Chip({
  children,
  tone = "default",
}: {
  children: ReactNode
  tone?: "default" | "accent"
}) {
  return (
    <span
      className={cn(
        "eg-chip-text inline-flex items-center rounded-full border px-[9px] py-1",
        tone === "accent"
          ? "border-eg-brand/50 bg-eg-brand-soft text-eg-brand-strong"
          : "border-eg-border bg-eg-surface text-eg-text-muted",
      )}
    >
      {children}
    </span>
  )
}

export function RequestListCard({
  id,
  intervention,
  location,
  createdAt,
  matchLabel,
  surfaceArea,
  creditCost,
  costLabel,
  maxUnlocks,
  unlockCount,
  showInterestCount = true,
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
  const detailHref =
    `/area-impresa/richieste/${id}`
  const pathname = usePathname()
  const isActive =
    pathname === detailHref || pathname.startsWith(`${detailHref}/`)

  return (
    <div
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "relative border-b border-eg-border px-7 py-5 transition-colors",
        isActive ? "bg-eg-surface-muted" : "hover:bg-eg-surface-muted",
      )}
    >
      {isActive ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[3px] bg-eg-brand-strong"
        />
      ) : null}

      {/* Full-row click target. Must sit ABOVE the plain (non-interactive)
          content below — z-index only controls which element receives the
          pointer event, not visual stacking (this link renders nothing
          visible). Anything that needs its own independent click target
          (the save button) is raised further with a higher z-index. */}
      <PendingRequestLink
        href={detailHref}
        ariaLabel={`Apri richiesta: ${title}`}
        className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-eg-brand-strong"
      >
        <span className="sr-only">Apri richiesta: {title}</span>
      </PendingRequestLink>

      <div className="relative">
        <div className="mb-3 flex items-start justify-between gap-3">
          <span className="text-[16px] font-semibold leading-snug tracking-[-0.01em] text-eg-ink">
            {title}
          </span>

          <span className="eg-metadata shrink-0 whitespace-nowrap text-[11px]">
            {createdAt}
          </span>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <Chip>{intervention}</Chip>
          <Chip>{location}</Chip>
          <Chip tone="accent">{costLabel ?? formatCreditCost(creditCost)}</Chip>
          {formattedSurface ? <Chip>{formattedSurface}</Chip> : null}

          {badges.map((badge) => (
            <Chip
              key={badge.label}
              tone={badge.variant === "success" ? "accent" : "default"}
            >
              {badge.label}
            </Chip>
          ))}
        </div>

        <div className="flex items-center justify-between">
          {matchLabel ? (
            <span className="eg-ui-muted inline-flex items-center gap-[7px] text-[11px] tracking-[0.04em]">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-eg-brand-strong"
                aria-hidden="true"
              />
              {matchLabel}
            </span>
          ) : (
            <span />
          )}

          <div className="relative z-20 flex items-center gap-4">
            {showInterestCount ? (
              <span className="eg-metadata text-[11px]">
                {formatInterestCount({ maxUnlocks, unlockCount })}
              </span>
            ) : null}

            {savedAction ? (
              <form action={savedAction}>
                <PendingSubmitButton
                  type="submit"
                  name="requestId"
                  value={id}
                  variant="ghost"
                  size="sm"
                  className="eg-ui-muted h-auto min-h-0 gap-1 border-none p-0 text-[11px] normal-case tracking-normal hover:bg-transparent hover:text-eg-brand-strong"
                  pendingChildren={
                    <>
                      <Bookmark className="size-3.5" aria-hidden="true" />
                      Aggiorno...
                    </>
                  }
                >
                  <Bookmark className="size-3.5" aria-hidden="true" />
                  {isSaved ? "salvata" : "salva"}
                </PendingSubmitButton>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
