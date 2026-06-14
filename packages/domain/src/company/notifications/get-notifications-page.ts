import type { CompanyActor } from "@esigenta/auth"

import { listCompanyNotifications } from "./notifications"
import type { CompanyNotificationListItem } from "./notifications"

type PerfRecorder = (label: string, ms: number) => void

export type GetCompanyNotificationsPageResult = {
  notifications: CompanyNotificationListItem[]
  unreadCount: number
}

export async function getCompanyNotificationsPage(
  actor: CompanyActor,
  recordPerf?: PerfRecorder,
): Promise<GetCompanyNotificationsPageResult> {
  const t0 = performance.now()

  const notifications = await listCompanyNotifications(actor.company.id)
  const unreadCount = notifications.filter((n) => n.readAt === null).length

  recordPerf?.("notifications-page", Math.round(performance.now() - t0))

  return { notifications, unreadCount }
}
