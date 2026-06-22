import type {
  CompanyNotificationType,
} from "@prisma/client"

import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"
import { normalizeRequiredText } from "@esigenta/shared"

type PerfRecorder = (label: string, ms: number) => void

export type CompanyNotificationListItem = {
  id: string
  type: CompanyNotificationType
  title: string
  body: string
  readAt: Date | null
  createdAt: Date
  requestId: string | null
  requestDispatchId: string | null
  conversationId: string | null
  messageId: string | null
  request: {
    id: string
    requestCode: string | null
    interventionSlug: string | null
    city: string | null
    postalCode: string | null
    createdAt: Date
  } | null
  conversation: {
    id: string
    type: string
    updatedAt: Date
  } | null
}

export type MarkCompanyNotificationReadInput = {
  companyId: string
  notificationId: string
}

export type MarkCompanyNotificationReadResult =
  | {
      ok: true
      notificationId: string
      readAt: Date
      alreadyRead: boolean
    }
  | {
      ok: false
      code:
        | "invalid_company_id"
        | "invalid_notification_id"
        | "notification_not_found"
      message: string
    }

export async function listCompanyNotifications(
  companyId: string,
): Promise<CompanyNotificationListItem[]> {
  const normalizedCompanyId =
    normalizeRequiredText(companyId)

  if (!normalizedCompanyId) {
    return []
  }

  const notifications = await prisma.companyNotification.findMany({
    where: {
      companyId: normalizedCompanyId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      readAt: true,
      createdAt: true,
      requestId: true,
      requestDispatchId: true,
      conversationId: true,
      messageId: true,
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
      conversation: {
        select: {
          id: true,
          type: true,
          updatedAt: true,
        },
      },
    },
  })

  return notifications.map((notification) => ({
    ...notification,
    request: notification.request
      ? {
          id: notification.request.id,
          requestCode: notification.request.requestCode,
          interventionSlug: notification.request.interventionSlug,
          city: notification.request.geoLocation?.city ?? null,
          postalCode: notification.request.geoLocation?.postalCode ?? null,
          createdAt: notification.request.createdAt,
        }
      : null,
  }))
}

export async function countUnreadCompanyNotifications(
  companyId: string,
): Promise<number> {
  const normalizedCompanyId =
    normalizeRequiredText(companyId)

  if (!normalizedCompanyId) {
    return 0
  }

  return prisma.companyNotification.count({
    where: {
      companyId: normalizedCompanyId,
      readAt: null,
    },
  })
}

export async function markCompanyNotificationRead({
  companyId,
  notificationId,
}: MarkCompanyNotificationReadInput): Promise<MarkCompanyNotificationReadResult> {
  const normalizedCompanyId =
    normalizeRequiredText(companyId)
  const normalizedNotificationId =
    normalizeRequiredText(notificationId)

  if (!normalizedCompanyId) {
    return {
      ok: false,
      code: "invalid_company_id",
      message: "Impresa non valida.",
    }
  }

  if (!normalizedNotificationId) {
    return {
      ok: false,
      code: "invalid_notification_id",
      message: "Notifica non valida.",
    }
  }

  const readAt = new Date()
  const updated =
    await prisma.companyNotification.updateMany({
      where: {
        id: normalizedNotificationId,
        companyId: normalizedCompanyId,
        readAt: null,
      },
      data: {
        readAt,
      },
    })

  if (updated.count === 1) {
    return {
      ok: true,
      notificationId:
        normalizedNotificationId,
      readAt,
      alreadyRead: false,
    }
  }

  const existing =
    await prisma.companyNotification.findFirst({
      where: {
        id: normalizedNotificationId,
        companyId: normalizedCompanyId,
      },
      select: {
        id: true,
        readAt: true,
      },
    })

  if (!existing) {
    return {
      ok: false,
      code: "notification_not_found",
      message: "Notifica non trovata.",
    }
  }

  return {
    ok: true,
    notificationId:
      normalizedNotificationId,
    readAt: existing.readAt ?? readAt,
    alreadyRead: true,
  }
}

export type MarkCompanyNotificationReadByActorResult = MarkCompanyNotificationReadResult

export async function markCompanyNotificationReadByActor(
  actor: CompanyActor,
  notificationId: string,
  recordPerf?: PerfRecorder,
): Promise<MarkCompanyNotificationReadByActorResult> {
  const t0 = performance.now()
  const result = await markCompanyNotificationRead({
    companyId: actor.company.id,
    notificationId,
  })
  recordPerf?.("mark-notification-read", Math.round(performance.now() - t0))
  return result
}

export type MarkAllCompanyNotificationsReadResult =
  | { ok: true; count: number }
  | { ok: false; code: "invalid_company_id"; message: string }

export async function markAllCompanyNotificationsRead(
  actor: CompanyActor,
  recordPerf?: PerfRecorder,
): Promise<MarkAllCompanyNotificationsReadResult> {
  const companyId = normalizeRequiredText(actor.company.id)
  if (!companyId) {
    return { ok: false, code: "invalid_company_id", message: "Impresa non valida." }
  }

  const t0 = performance.now()

  const updated = await prisma.companyNotification.updateMany({
    where: { companyId, readAt: null },
    data: { readAt: new Date() },
  })

  recordPerf?.("mark-all-notifications-read", Math.round(performance.now() - t0))

  return { ok: true, count: updated.count }
}
