import type {
  RequestStatus,
} from "@prisma/client"

import { prisma } from "../prisma/client"

export type ReviewRequestDecision =
  | "APPROVED"
  | "REJECTED"

export type ReviewRequestInput = {
  requestId: string
  status: ReviewRequestDecision
}

export type ReviewRequestResult = {
  id: string
  status: RequestStatus
}

export async function reviewRequest({
  requestId,
  status,
}: ReviewRequestInput): Promise<ReviewRequestResult> {
  return prisma.request.update({
    where: {
      id: requestId,
    },
    data: {
      status,
    },
    select: {
      id: true,
      status: true,
    },
  })
}
