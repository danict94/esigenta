import {
  Button,
  PageShell,
} from "@esigenta/ui"

import { getCompanyNotificationsPage } from "@esigenta/domain"

import { requireAreaImpresaAccess } from "../../../../auth/server"
import {
  areaLog,
  areaTimestamp,
  isAreaMonitoringEnabled,
} from "../../../../platform/monitoring/area-monitoring"
import { createPerfTrace } from "../../../monitoring/area-impresa-perf-trace"

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "../actions/mark-notification-read-action"
import { NotificationsList } from "./notifications-list"

export async function NotificationsPage() {
  const actor = await requireAreaImpresaAccess()

  const monitored = isAreaMonitoringEnabled()
  const pageStart = areaTimestamp()
  const trace = createPerfTrace({ scope: "notifications-page" })

  if (monitored) {
    areaLog("area.model.notifications.start", {})
  }

  const { notifications, unreadCount } = await trace.measure("data", () =>
    getCompanyNotificationsPage(actor, trace.add),
  )

  trace.finish({})

  if (monitored) {
    areaLog("area.model.notifications.end", {
      result: "ok",
      count: notifications.length,
      unreadCount,
      durationMs: Math.round(areaTimestamp() - pageStart),
    })
  }

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <section className="space-y-7">
        <div className="flex items-end justify-between pt-4">
          <div>
            <p className="text-sm font-medium text-eg-text-muted">
              Dashboard impresa
            </p>

            <h1 className="mt-1 text-xl font-semibold tracking-tight text-eg-ink">
              Notifiche
            </h1>

            <p className="mt-1 text-sm text-eg-text-muted">
              {unreadCount} non lette
            </p>
          </div>

          {unreadCount > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <Button type="submit" variant="ghost" size="sm">
                Segna tutte come lette
              </Button>
            </form>
          ) : null}
        </div>

        <NotificationsList
          notifications={notifications}
          markReadAction={markNotificationReadAction}
        />
      </section>
    </PageShell>
  )
}
