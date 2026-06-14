import type {
  Prisma,
} from "@prisma/client"

export type RequestDispatchFailureCode =
  | "request_not_found"
  | "request_missing_coordinates"
  | "request_services_not_resolved"

export type RequestDispatchFailure = {
  ok: false
  code: RequestDispatchFailureCode
  message: string
}

export type RequestDispatchServiceSource =
  | "request_required_service"
  | "intervention_service"

export type RequestDispatchCandidate = {
  companyId: string
  recipientEmail: string | null
  distanceKm: number
  operatingRadiusKm: number
  matchedServiceIds: string[]
  matchReason: Prisma.InputJsonObject
}

export type ResolveRequestDispatchCandidatesResult =
  | {
      ok: true
      requestId: string
      requestCode: string | null
      interventionSlug: string | null
      city: string | null
      resolvedServiceIds: string[]
      resolvedServiceCount: number
      eligibleCompanyCount: number
      candidates: RequestDispatchCandidate[]
    }
  | RequestDispatchFailure

export type CreateRequestDispatchesForRequestResult =
  | {
      ok: true
      requestId: string
      resolvedServiceCount: number
      eligibleCompanyCount: number
      dispatchCreatedCount: number
      appNotificationCreatedCount: number
      emailDeliveryCreatedCount: number
      skippedNoRecipientCount: number
    }
  | RequestDispatchFailure
