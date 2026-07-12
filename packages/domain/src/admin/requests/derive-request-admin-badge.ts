import type { RequestStatus } from "@prisma/client"

export type RequestAdminBadgeColor =
  | "green"
  | "orange"
  | "yellow"
  | "red"
  | "gray"
  | "blue"

export type RequestAdminBadgeSeverity =
  | "ok"
  | "warning"
  | "danger"
  | "neutral"
  | "info"

export type RequestAdminSecondaryBadge = {
  color: RequestAdminBadgeColor
  label: string
  reasons: string[]
  severity: RequestAdminBadgeSeverity
}

export type RequestAdminBadge = RequestAdminSecondaryBadge & {
  secondaryBadges: RequestAdminSecondaryBadge[]
}

type RequestAdminBadgeInput = {
  status: RequestStatus
  maxUnlocks: number | null
  unlockCount: number
}

function deriveSecondaryBadges({
  maxUnlocks,
  unlockCount,
}: Pick<
  RequestAdminBadgeInput,
  "maxUnlocks" | "unlockCount"
>): RequestAdminSecondaryBadge[] {
  if (
    maxUnlocks === null ||
    unlockCount < maxUnlocks
  ) {
    return []
  }

  return [
    {
      color: "orange",
      label: "Esaurita",
      reasons: [
        `Limite di ${maxUnlocks} sblocchi raggiunto`,
      ],
      severity: "warning",
    },
  ]
}

/**
 * Pure admin UX derivation. Request.status remains the lifecycle source of
 * truth; the secondary sold-out badge is informational and never changes
 * marketplace visibility or unlock eligibility.
 */
export function deriveRequestAdminBadge({
  status,
  maxUnlocks,
  unlockCount,
}: RequestAdminBadgeInput): RequestAdminBadge {
  const secondaryBadges =
    deriveSecondaryBadges({
      maxUnlocks,
      unlockCount,
    })

  const primaryBadge: RequestAdminSecondaryBadge =
    (() => {
      switch (status) {
        case "DRAFT":
          return {
            color: "gray",
            label: "Bozza",
            reasons: [],
            severity: "neutral",
          }

        case "PENDING_VERIFICATION":
          return {
            color: "gray",
            label: "Non verificata",
            reasons: [
              "Il cliente non ha ancora confermato la richiesta",
            ],
            severity: "neutral",
          }

        case "PENDING_REVIEW":
          return {
            color: "yellow",
            label: "Da approvare",
            reasons: [
              "Richiesta verificata, in attesa di revisione admin",
            ],
            severity: "warning",
          }

        case "APPROVED":
          return {
            color: "blue",
            label: "Approvata",
            reasons: [
              "Approvata, non ancora pubblicata",
            ],
            severity: "info",
          }

        case "PUBLISHED":
          return {
            color: "green",
            label: "Pubblicata",
            reasons: ["Visibile alle imprese"],
            severity: "ok",
          }

        case "REJECTED":
          return {
            color: "red",
            label: "Rifiutata",
            reasons: [],
            severity: "danger",
          }

        case "CLOSED":
          return {
            color: "gray",
            label: "Chiusa",
            reasons: [],
            severity: "neutral",
          }
      }
    })()

  return {
    ...primaryBadge,
    secondaryBadges,
  }
}
