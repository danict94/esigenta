import Link from "next/link";

import {
  Badge,
  Button,
  Card,
  type BadgeProps,
} from "@fixpro/ui";

import {
  formatCreditCost,
  formatUnlockAvailability,
  getCommercialStatusLabel,
  getRequestCommercialState,
} from "./request-commercial-display";

export type RequestListCardProps = {
  id: string;
  intervention: string;
  location: string;
  createdAt: string;
  matchLabel?: string;
  description?: string | null;
  surfaceArea?: string | number | null;
  creditCost: number | null;
  maxUnlocks: number | null;
  unlockCount: number;
  isSaved?: boolean;
  savedAction?: (formData: FormData) => Promise<void>;
  badges?: Array<{
    label: string;
    variant?: BadgeProps["variant"];
  }>;
};

function formatSurfaceArea(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const raw = String(value).trim();

  if (!raw) {
    return null;
  }

  if (/^\d+([,.]\d+)?$/.test(raw)) {
    return `${raw} mq`;
  }

  return raw;
}

function buildTitle({
  intervention,
  description,
  surfaceArea,
}: {
  intervention: string;
  description?: string | null;
  surfaceArea?: string | number | null;
}) {
  const formattedSurface = formatSurfaceArea(surfaceArea);

  const details = [formattedSurface, description]
    .filter(Boolean)
    .join("; ");

  if (details) {
    return `${intervention}: ${details}`;
  }

  return intervention;
}

function WorkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M9 7V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
      <path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
      <path d="M4 13h16" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
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
    description,
    surfaceArea,
  });
  const commercialState = getRequestCommercialState({
    creditCost,
    maxUnlocks,
    unlockCount,
  });

  return (
    <Card className="relative overflow-hidden bg-surface-primary transition-colors hover:border-border-focus">
      <span
        className="absolute inset-y-0 left-0 w-1 bg-brand-primary"
        aria-hidden="true"
      />

      <div className="px-5 py-5 pl-6 md:px-6 md:pl-7">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
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

          {savedAction ? (
            <form action={savedAction}>
              <Button
                type="submit"
                name="requestId"
                value={id}
                variant={isSaved ? "secondary" : "ghost"}
                size="sm"
              >
                {isSaved ? "Salvata" : "Salva"}
              </Button>
            </form>
          ) : null}
        </div>

        <Link href={`/area-impresa/richieste/${id}`} className="group block">

          <h2 className="line-clamp-1 text-xl font-semibold tracking-tight text-brand-primary transition-colors group-hover:text-brand-primary-hover md:text-2xl">
            {title}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-base text-text-primary">
            <span className="inline-flex items-center gap-2">
              <WorkIcon />
              <span>{intervention}</span>
            </span>

            <span className="inline-flex items-center gap-2">
              <PinIcon />
              <span>{location}</span>
            </span>

            <span className="inline-flex items-center gap-2">
              <ClockIcon />
              <span>{createdAt}</span>
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
            <Badge variant="warning" size="sm">
              {formatCreditCost(creditCost)}
            </Badge>

            <Badge variant="warning" size="sm">
              {formatUnlockAvailability(commercialState.availableUnlockSlots)}
            </Badge>

            <Badge variant="neutral" size="sm">
              {getCommercialStatusLabel(commercialState)}
            </Badge>
          </div>
        </Link>
      </div>
    </Card>
  );
}
