import {
  Card,
} from "@esigenta/ui"

import {
  formatDate,
  formatFreshness,
  formatInterventionLabel,
  formatLocationLabel,
  getDescription,
  getStructuredData,
  getSurfaceArea,
} from "./request-card-format"
import {
  RequestListCard,
  type RequestListCardProps,
} from "./request-list-card"

export type CompanyRequestListMode =
  | "available"
  | "saved"
  | "purchased"

type RequestStructuredDataInput = Parameters<
  typeof getStructuredData
>[0]

type CompanyRequestListItem = {
  id: string
  interventionSlug: string | null
  city: string | null
  address: string | null
  postalCode: string | null
  structuredData: RequestStructuredDataInput
  creditCost: number | null
  maxUnlocks: number | null
  unlockCount: number
  createdAt: Date
  isSaved?: boolean
  hasUnlocked?: boolean
  requestUnlockId?: string | null
  unlockedAt?: Date | null
  refundedAt?: Date | null
  matchLevel?:
    | "selected_intervention"
    | "category"
    | "explore"
}

type CompanyRequestListProps<
  TRequest extends CompanyRequestListItem,
> = {
  requests: readonly TRequest[]
  mode: CompanyRequestListMode
  emptyMessage: string
  savedAction?: (formData: FormData) => Promise<void>
}

function getMatchLabel(
  matchLevel:
    | "selected_intervention"
    | "category"
    | "explore"
    | null
    | undefined,
) {
  if (matchLevel === "selected_intervention") {
    return "Molto compatibile"
  }

  if (matchLevel === "category") {
    return "Nella tua categoria"
  }

  if (matchLevel === "explore") {
    return "Non nel profilo"
  }

  return undefined
}

function getRequestKey(
  request: CompanyRequestListItem,
  mode: CompanyRequestListMode,
) {
  if (mode === "purchased" && request.requestUnlockId) {
    return request.requestUnlockId
  }

  return request.id
}

function getCreatedAtLabel(
  request: CompanyRequestListItem,
  mode: CompanyRequestListMode,
) {
  if (mode === "purchased" && request.unlockedAt) {
    return `Sbloccata il ${formatDate(request.unlockedAt)}`
  }

  return formatFreshness(request.createdAt)
}

function getBadges(
  request: CompanyRequestListItem,
  mode: CompanyRequestListMode,
): NonNullable<RequestListCardProps["badges"]> {
  const badges: NonNullable<RequestListCardProps["badges"]> = []

  if (mode === "saved" && request.hasUnlocked) {
    badges.push({
      label: "Acquistata",
      variant: "success",
    })
  }

  if (mode === "purchased") {
    badges.push({
      label: "Acquistata",
      variant: "success",
    })

    if (request.refundedAt) {
      badges.push({
        label: "Rimborsata",
        variant: "warning",
      })
    }
  }

  return badges
}

function getRequestMatchLabel(
  request: CompanyRequestListItem,
  mode: CompanyRequestListMode,
) {
  if (mode === "available") {
    return getMatchLabel(request.matchLevel)
  }

  if (mode === "saved") {
    return "Salvata"
  }

  return undefined
}

export function CompanyRequestList<
  TRequest extends CompanyRequestListItem,
>({
  requests,
  mode,
  emptyMessage,
  savedAction,
}: CompanyRequestListProps<TRequest>) {
  if (requests.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-sm text-eg-ardesia">
          {emptyMessage}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const structuredData =
          getStructuredData(request.structuredData)
        const description =
          getDescription(structuredData)
        const surfaceArea =
          getSurfaceArea(structuredData)

        return (
          <RequestListCard
            key={getRequestKey(request, mode)}
            id={request.id}
            intervention={formatInterventionLabel(
              request.interventionSlug,
            )}
            location={formatLocationLabel({
              city: request.city,
              postalCode: request.postalCode,
              address: request.address,
            })}
            createdAt={getCreatedAtLabel(request, mode)}
            matchLabel={getRequestMatchLabel(request, mode)}
            description={description}
            surfaceArea={surfaceArea}
            creditCost={request.creditCost}
            maxUnlocks={request.maxUnlocks}
            unlockCount={request.unlockCount}
            isSaved={request.isSaved}
            savedAction={savedAction}
            badges={getBadges(request, mode)}
          />
        )
      })}
    </div>
  )
}