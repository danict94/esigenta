import type {
  Prisma,
} from "@prisma/client"

import {
  prisma,
} from "../../prisma/client"

import {
  resolveRequestDispatchCandidatesWithClient,
} from "./resolve-request-dispatch-candidates"

import type {
  CreateRequestDispatchesForRequestResult,
  RequestDispatchCandidate,
} from "./types"

function normalizeRequiredId(
  value: string,
): string | null {
  const trimmed = value.trim()

  return trimmed ? trimmed : null
}

function buildNotificationBody({
  city,
}: {
  city: string | null
}) {
  return city
    ? `Nuova richiesta compatibile a ${city}.`
    : "Nuova richiesta compatibile nella tua area."
}

function getIdempotencyKey({
  requestId,
  companyId,
}: {
  requestId: string
  companyId: string
}) {
  return `request-dispatch-email:${requestId}:${companyId}`
}

function toCandidateMap(
  candidates: RequestDispatchCandidate[],
) {
  return new Map(
    candidates.map((candidate) => [
      candidate.companyId,
      candidate,
    ]),
  )
}

async function lockRequestDispatchCreation({
  tx,
  requestId,
}: {
  tx: Prisma.TransactionClient
  requestId: string
}) {
  await tx.$queryRaw<
    Array<{
      locked: boolean
    }>
  >`
    SELECT TRUE AS locked
    FROM (
      SELECT pg_advisory_xact_lock(hashtext(${`request-dispatch:${requestId}`}))
    ) AS request_dispatch_lock
  `
}

export async function createRequestDispatchesForRequest(
  requestId: string,
): Promise<CreateRequestDispatchesForRequestResult> {
  const normalizedRequestId =
    normalizeRequiredId(requestId)

  if (!normalizedRequestId) {
    return {
      ok: false,
      code: "request_not_found",
      message: "Request not found.",
    }
  }

  return prisma.$transaction((tx) =>
    createRequestDispatchesForRequestWithClient(
      tx,
      normalizedRequestId,
    ),
  )
}

export async function createRequestDispatchesForRequestWithClient(
  tx: Prisma.TransactionClient,
  requestId: string,
): Promise<CreateRequestDispatchesForRequestResult> {
  const normalizedRequestId =
    normalizeRequiredId(requestId)

  if (!normalizedRequestId) {
    return {
      ok: false,
      code: "request_not_found",
      message: "Request not found.",
    }
  }

  await lockRequestDispatchCreation({
    tx,
    requestId: normalizedRequestId,
  })

  const resolved =
    await resolveRequestDispatchCandidatesWithClient(
      tx,
      normalizedRequestId,
    )

  if (!resolved.ok) {
    return resolved
  }

  const candidates =
    resolved.candidates
  const candidateCompanyIds =
    candidates.map(
      (candidate) => candidate.companyId,
    )
  const candidateByCompanyId =
    toCandidateMap(candidates)

  const dispatchCreateResult =
    candidates.length > 0
      ? await tx.requestDispatch.createMany({
          data: candidates.map(
            (candidate) => ({
              requestId: resolved.requestId,
              companyId: candidate.companyId,
              matchedServiceIds:
                candidate.matchedServiceIds,
              distanceKm:
                candidate.distanceKm,
              matchReason:
                candidate.matchReason,
            }),
          ),
          skipDuplicates: true,
        })
      : {
          count: 0,
        }

  const dispatches =
    candidateCompanyIds.length > 0
      ? await tx.requestDispatch.findMany({
          where: {
            requestId: resolved.requestId,
            companyId: {
              in: candidateCompanyIds,
            },
          },
          select: {
            id: true,
            companyId: true,
          },
        })
      : []

  const dispatchIds =
    dispatches.map(
      (dispatch) => dispatch.id,
    )

  const existingNotifications =
    dispatchIds.length > 0
      ? await tx.companyNotification.findMany({
          where: {
            requestDispatchId: {
              in: dispatchIds,
            },
            type: "NEW_REQUEST_AVAILABLE",
          },
          select: {
            requestDispatchId: true,
          },
        })
      : []

  const existingNotificationDispatchIds =
    new Set(
      existingNotifications.flatMap(
        (notification) =>
          notification.requestDispatchId
            ? [
                notification.requestDispatchId,
              ]
            : [],
      ),
    )

  const notificationTitle =
    "Nuova richiesta disponibile"
  const notificationBody =
    buildNotificationBody({
      city: resolved.city,
    })

  const notificationsToCreate =
    dispatches
      .filter(
        (dispatch) =>
          !existingNotificationDispatchIds.has(
            dispatch.id,
          ),
      )
      .map((dispatch) => ({
        companyId: dispatch.companyId,
        requestId: resolved.requestId,
        requestDispatchId: dispatch.id,
        type: "NEW_REQUEST_AVAILABLE" as const,
        title: notificationTitle,
        body: notificationBody,
      }))

  const notificationCreateResult =
    notificationsToCreate.length > 0
      ? await tx.companyNotification.createMany({
          data: notificationsToCreate,
          skipDuplicates: true,
        })
      : {
          count: 0,
        }

  const deliveryRows =
    dispatches.flatMap((dispatch) => {
      const candidate =
        candidateByCompanyId.get(
          dispatch.companyId,
        )

      if (!candidate?.recipientEmail) {
        return []
      }

      return [
        {
          requestDispatchId: dispatch.id,
          channel: "EMAIL" as const,
          recipient:
            candidate.recipientEmail,
          idempotencyKey:
            getIdempotencyKey({
              requestId: resolved.requestId,
              companyId:
                dispatch.companyId,
            }),
        },
      ]
    })

  const deliveryCreateResult =
    deliveryRows.length > 0
      ? await tx.notificationDelivery.createMany({
          data: deliveryRows,
          skipDuplicates: true,
        })
      : {
          count: 0,
        }

  return {
    ok: true,
    requestId: resolved.requestId,
    resolvedServiceCount:
      resolved.resolvedServiceCount,
    eligibleCompanyCount:
      resolved.eligibleCompanyCount,
    dispatchCreatedCount:
      dispatchCreateResult.count,
    appNotificationCreatedCount:
      notificationCreateResult.count,
    emailDeliveryCreatedCount:
      deliveryCreateResult.count,
    skippedNoRecipientCount:
      candidates.filter(
        (candidate) =>
          !candidate.recipientEmail,
      ).length,
  }
}
