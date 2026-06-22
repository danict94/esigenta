import type {
  RequestStatus,
} from "@prisma/client"

import { prisma } from "@esigenta/database"

import {
  createRequestDispatchesForRequestWithClient,
} from "../../internal/request/dispatch"

import type {
  CreateRequestDispatchesForRequestResult,
  RequestDispatchFailureCode,
} from "../../internal/request/dispatch"

export type ReviewRequestDecision =
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"

export type ReviewRequestInput = {
  requestId: string
  status: ReviewRequestDecision
  moderationNotes?: string | null
}

export type ReviewRequestResult = {
  id: string
  status: RequestStatus
  reviewedAt: Date | null
  moderationNotes: string | null
}

export type PublishReviewedRequestResult =
  ReviewRequestResult & {
    dispatch: Extract<
      CreateRequestDispatchesForRequestResult,
      {
        ok: true
      }
    >
  }

export const requestPublishingRequirementsMissingCode =
  "REQUEST_PUBLISHING_REQUIREMENTS_MISSING"

export class RequestPublishingRequirementsError extends Error {
  readonly code =
    requestPublishingRequirementsMissingCode

  constructor(
    message = "Prima di pubblicare la richiesta devi impostare costo crediti e limite imprese.",
  ) {
    super(message)
    this.name =
      "RequestPublishingRequirementsError"
  }
}

export class RequestPublishDispatchError extends Error {
  readonly code: RequestDispatchFailureCode

  constructor({
    code,
    message,
  }: {
    code: RequestDispatchFailureCode
    message: string
  }) {
    super(message)
    this.name = "RequestPublishDispatchError"
    this.code = code
  }
}

function normalizeModerationNotes(
  value: string | null | undefined,
): string | null {
  const trimmed =
    value?.trim()

  return trimmed
    ? trimmed
    : null
}

function createDispatchFailureMessage(
  code: RequestDispatchFailureCode,
) {
  if (code === "request_missing_coordinates") {
    return "Impossibile pubblicare la richiesta: coordinate mancanti per il dispatch."
  }

  if (code === "request_intervention_not_resolved") {
    return "Impossibile pubblicare la richiesta: intervento non risolto per il dispatch."
  }

  return "Impossibile pubblicare la richiesta: richiesta non trovata."
}

function isPositiveInteger(
  value: number | null,
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1
  )
}

export async function publishReviewedRequest({
  requestId,
  moderationNotes,
}: {
  requestId: string
  moderationNotes?: string | null | undefined
}): Promise<PublishReviewedRequestResult> {
  return prisma.$transaction(async (tx) => {
    const publishingRequirements =
      await tx.request.findUnique({
        where: {
          id: requestId,
        },
        select: {
          creditCost: true,
          maxUnlocks: true,
        },
      })

    if (
      publishingRequirements &&
      (
        !isPositiveInteger(
          publishingRequirements.creditCost,
        ) ||
        !isPositiveInteger(
          publishingRequirements.maxUnlocks,
        )
      )
    ) {
      throw new RequestPublishingRequirementsError()
    }

    const request =
      await tx.request.update({
        where: {
          id: requestId,
        },
        data: {
          status: "PUBLISHED",
          reviewedAt: new Date(),
          moderationNotes:
            normalizeModerationNotes(
              moderationNotes,
            ),
        },
        select: {
          id: true,
          status: true,
          reviewedAt: true,
          moderationNotes: true,
        },
      })

    const dispatch =
      await createRequestDispatchesForRequestWithClient(
        tx,
        request.id,
      )

    if (!dispatch.ok) {
      throw new RequestPublishDispatchError({
        code: dispatch.code,
        message:
          createDispatchFailureMessage(
            dispatch.code,
          ),
      })
    }

    return {
      ...request,
      dispatch,
    }
  })
}

export async function reviewRequest({
  requestId,
  status,
  moderationNotes,
}: ReviewRequestInput): Promise<ReviewRequestResult> {
  if (
    status === "APPROVED" ||
    status === "PUBLISHED"
  ) {
    return publishReviewedRequest({
      requestId,
      moderationNotes,
    })
  }

  return prisma.request.update({
    where: {
      id: requestId,
    },
    data: {
      status,
      reviewedAt: new Date(),
      moderationNotes:
        normalizeModerationNotes(
          moderationNotes,
        ),
    },
    select: {
      id: true,
      status: true,
      reviewedAt: true,
      moderationNotes: true,
    },
  })
}
