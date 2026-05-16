import type {
  RequestStatus,
} from "@prisma/client"

import {
  prisma,
} from "../prisma/client"

export type ReviewRequestDecision =
  | "APPROVED"
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

function normalizeModerationNotes(
  value: string | null | undefined,
): string | null {
  const trimmed =
    value?.trim()

  return trimmed
    ? trimmed
    : null
}

export async function reviewRequest({
  requestId,
  status,
  moderationNotes,
}: ReviewRequestInput): Promise<ReviewRequestResult> {
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