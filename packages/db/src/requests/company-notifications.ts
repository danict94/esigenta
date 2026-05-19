import type {
  CompanyNotificationType,
} from "@prisma/client"

import {
  prisma,
} from "../prisma/client"

export type CompanyNotificationListItem = {
  id: string
  type: CompanyNotificationType
  title: string
  body: string
  readAt: Date | null
  createdAt: Date
  requestId: string | null
  requestDispatchId: string | null
  request: {
    id: string
    requestCode: string | null
    interventionSlug: string | null
    city: string | null
    postalCode: string | null
    createdAt: Date
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

function normalizeRequiredText(
  value: string,
): string | null {
  const trimmed = value.trim()

  return trimmed ? trimmed : null
}

export async function listCompanyNotifications(
  companyId: string,
): Promise<CompanyNotificationListItem[]> {
  const normalizedCompanyId =
    normalizeRequiredText(companyId)

  if (!normalizedCompanyId) {
    return []
  }

  return prisma.companyNotification.findMany({
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
      request: {
        select: {
          id: true,
          requestCode: true,
          interventionSlug: true,
          city: true,
          postalCode: true,
          createdAt: true,
        },
      },
    },
  })
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
