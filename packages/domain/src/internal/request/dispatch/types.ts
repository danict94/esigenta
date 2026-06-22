import type {
  Prisma,
} from "@prisma/client"

export type RequestDispatchFailureCode =
  | "request_not_found"
  | "request_missing_coordinates"
  | "request_intervention_not_resolved"

export type RequestDispatchFailure = {
  ok: false
  code: RequestDispatchFailureCode
  message: string
}

export type RequestDispatchCandidate = {
  companyId: string
  recipientEmail: string | null
  distanceKm: number
  operatingRadiusKm: number
  matchReason: Prisma.InputJsonObject
}

export type ResolveRequestDispatchCandidatesResult =
  | {
      ok: true
      requestId: string
      requestCode: string | null
      interventionSlug: string | null
      interventionId: string
      city: string | null
      eligibleCompanyCount: number
      candidates: RequestDispatchCandidate[]
    }
  | RequestDispatchFailure

export type CreateRequestDispatchesForRequestResult =
  | {
      ok: true
      requestId: string
      eligibleCompanyCount: number
      dispatchCreatedCount: number
      appNotificationCreatedCount: number
      emailDeliveryCreatedCount: number
      skippedNoRecipientCount: number
    }
  | RequestDispatchFailure
