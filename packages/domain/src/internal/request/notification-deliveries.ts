import type {
  NotificationDeliveryStatus,
} from "@prisma/client"

import { prisma } from "@esigenta/database"
import { normalizeRequiredText } from "@esigenta/shared"

const MAX_ERROR_MESSAGE_LENGTH = 2_000
const RETRY_DELAY_MS = 15 * 60 * 1_000

export type PendingEmailNotificationDelivery = {
  id: string
  requestDispatchId: string
  recipient: string | null
  idempotencyKey: string
  attemptCount: number
  request: {
    id: string
    requestCode: string | null
    interventionSlug: string | null
    city: string | null
    postalCode: string | null
    createdAt: Date
  }
}

export type NotificationDeliveryTransitionResult =
  | {
      ok: true
      deliveryId: string
    }
  | {
      ok: false
      code:
        | "invalid_delivery_id"
        | "delivery_not_transitioned"
      message: string
    }

export type MarkNotificationDeliverySentInput = {
  deliveryId: string
  provider: string
  providerMessageId?: string | null
}

export type MarkNotificationDeliveryFailedInput = {
  deliveryId: string
  errorMessage: string
  retryable?: boolean
}

function truncateErrorMessage(
  value: string,
) {
  const trimmed = value.trim()

  if (!trimmed) {
    return "Unknown notification delivery error."
  }

  return trimmed.slice(
    0,
    MAX_ERROR_MESSAGE_LENGTH,
  )
}

function createTransitionResult({
  count,
  deliveryId,
  targetStatus,
}: {
  count: number
  deliveryId: string
  targetStatus: NotificationDeliveryStatus
}): NotificationDeliveryTransitionResult {
  if (count === 1) {
    return {
      ok: true,
      deliveryId,
    }
  }

  return {
    ok: false,
    code: "delivery_not_transitioned",
    message:
      `Notification delivery could not transition to ${targetStatus}.`,
  }
}

function createInvalidDeliveryResult(): NotificationDeliveryTransitionResult {
  return {
    ok: false,
    code: "invalid_delivery_id",
    message: "Notification delivery id is required.",
  }
}

export async function listPendingEmailNotificationDeliveriesForRequest(
  requestId: string,
): Promise<PendingEmailNotificationDelivery[]> {
  const normalizedRequestId =
    normalizeRequiredText(requestId)

  if (!normalizedRequestId) {
    return []
  }

  const deliveries =
    await prisma.notificationDelivery.findMany({
      where: {
        channel: "EMAIL",
        status: "PENDING",
        requestDispatch: {
          requestId: normalizedRequestId,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        requestDispatchId: true,
        recipient: true,
        idempotencyKey: true,
        attemptCount: true,
        requestDispatch: {
          select: {
            request: {
              select: {
                id: true,
                requestCode: true,
                interventionSlug: true,
                geoLocation: {
                  select: { city: true, postalCode: true },
                },
                createdAt: true,
              },
            },
          },
        },
      },
    })

  return deliveries.map((delivery) => ({
    id: delivery.id,
    requestDispatchId:
      delivery.requestDispatchId,
    recipient: delivery.recipient,
    idempotencyKey:
      delivery.idempotencyKey,
    attemptCount: delivery.attemptCount,
    request: {
      id: delivery.requestDispatch.request.id,
      requestCode: delivery.requestDispatch.request.requestCode,
      interventionSlug: delivery.requestDispatch.request.interventionSlug,
      city: delivery.requestDispatch.request.geoLocation?.city ?? null,
      postalCode:
        delivery.requestDispatch.request.geoLocation?.postalCode ?? null,
      createdAt: delivery.requestDispatch.request.createdAt,
    },
  }))
}

export async function markNotificationDeliverySending(
  deliveryId: string,
): Promise<NotificationDeliveryTransitionResult> {
  const normalizedDeliveryId =
    normalizeRequiredText(deliveryId)

  if (!normalizedDeliveryId) {
    return createInvalidDeliveryResult()
  }

  const result =
    await prisma.notificationDelivery.updateMany({
      where: {
        id: normalizedDeliveryId,
        channel: "EMAIL",
        status: "PENDING",
      },
      data: {
        status: "SENDING",
      },
    })

  return createTransitionResult({
    count: result.count,
    deliveryId: normalizedDeliveryId,
    targetStatus: "SENDING",
  })
}

export async function markNotificationDeliverySent({
  deliveryId,
  provider,
  providerMessageId,
}: MarkNotificationDeliverySentInput): Promise<NotificationDeliveryTransitionResult> {
  const normalizedDeliveryId =
    normalizeRequiredText(deliveryId)
  const normalizedProvider =
    normalizeRequiredText(provider)

  if (!normalizedDeliveryId) {
    return createInvalidDeliveryResult()
  }

  const result =
    await prisma.notificationDelivery.updateMany({
      where: {
        id: normalizedDeliveryId,
        channel: "EMAIL",
        status: "SENDING",
      },
      data: {
        status: "SENT",
        provider: normalizedProvider,
        providerMessageId:
          providerMessageId ?? null,
        lastError: null,
        nextAttemptAt: null,
        sentAt: new Date(),
      },
    })

  return createTransitionResult({
    count: result.count,
    deliveryId: normalizedDeliveryId,
    targetStatus: "SENT",
  })
}

export async function markNotificationDeliveryFailed({
  deliveryId,
  errorMessage,
  retryable = true,
}: MarkNotificationDeliveryFailedInput): Promise<NotificationDeliveryTransitionResult> {
  const normalizedDeliveryId =
    normalizeRequiredText(deliveryId)

  if (!normalizedDeliveryId) {
    return createInvalidDeliveryResult()
  }

  const result =
    await prisma.notificationDelivery.updateMany({
      where: {
        id: normalizedDeliveryId,
        channel: "EMAIL",
        status: "SENDING",
      },
      data: {
        status: "FAILED",
        attemptCount: {
          increment: 1,
        },
        lastError:
          truncateErrorMessage(
            errorMessage,
          ),
        nextAttemptAt: retryable
          ? new Date(
              Date.now() + RETRY_DELAY_MS,
            )
          : null,
      },
    })

  return createTransitionResult({
    count: result.count,
    deliveryId: normalizedDeliveryId,
    targetStatus: "FAILED",
  })
}
