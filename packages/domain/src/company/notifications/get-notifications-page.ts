import type { CompanyActor } from "@esigenta/auth"

import {
  countUnreadCompanyNotifications,
  listCompanyNotifications,
} from "./notifications"
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

  // unreadCount comes from a real COUNT query, not a filter over the capped
  // (take 50) list — otherwise it undercounts once a company passes 50
  // unread notifications, and would silently disagree with the shell badge
  // (getAreaImpresaShellCounts), which already does a real count.
  const [notifications, unreadCount] = await Promise.all([
    listCompanyNotifications(actor.company.id),
    countUnreadCompanyNotifications(actor.company.id),
  ])

  recordPerf?.("notifications-page", Math.round(performance.now() - t0))

  return { notifications, unreadCount }
}
