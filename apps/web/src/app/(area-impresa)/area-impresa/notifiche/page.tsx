import Link from "next/link"

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  PageShell,
  cn,
} from "@esigenta/ui"

import { getCompanyNotificationsPage } from "@esigenta/domain"

import { requireAreaImpresaAccess } from "../../../../auth/server"
import {
  areaLog,
  areaTimestamp,
  isAreaMonitoringEnabled,
} from "../../../../lib/area-monitoring"
import { createPerfTrace } from "../_lib/perf-log"

import { buildCompanyConversationHref } from "../_lib/conversation-routes"
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "./actions"

export const dynamic = "force-dynamic"

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function formatIntervention(slug: string | null) {
  if (!slug) {
    return "Richiesta"
  }

  const readable = slug.replace(/[-_]/g, " ").trim()

  return readable
    ? readable.charAt(0).toUpperCase() + readable.slice(1)
    : "Richiesta"
}

function formatLocation({
  city,
  postalCode,
}: {
  city: string | null
  postalCode: string | null
}) {
  const location = [city, postalCode].filter(Boolean).join(" ")

  return location || "Area compatibile"
}

export default async function NotifichePage() {
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
            <p className="text-sm font-medium text-text-secondary">
              Dashboard impresa
            </p>

            <h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
              Notifiche
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              {unreadCount} non lette
            </p>
          </div>

          {unreadCount > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <Button type="submit" variant="secondary" size="sm">
                Segna tutte come lette
              </Button>
            </form>
          ) : null}
        </div>

        {notifications.length === 0 ? (
          <Card className="p-8">
            <p className="text-sm text-text-secondary">
              Non hai ancora notifiche.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const unread = notification.readAt === null
              const request = notification.request
              const requestHref = notification.requestId
                ? `/area-impresa/richieste/${notification.requestId}`
                : null
              const conversationHref =
                notification.conversationId && notification.conversation
                  ? buildCompanyConversationHref({
                      conversationId: notification.conversationId,
                      conversationType: notification.conversation.type,
                    })
                  : null
              const primaryHref = conversationHref ?? requestHref
              const primaryActionLabel = conversationHref
                ? notification.conversation?.type === "SUPPORT"
                  ? "Apri assistenza"
                  : "Apri contatto"
                : "Apri richiesta"

              return (
                <Card
                  key={notification.id}
                  className={cn(
                    "overflow-hidden transition-colors",
                    unread
                      ? "border-brand-primary bg-surface-elevated"
                      : "bg-surface-primary",
                  )}
                >
                  <CardHeader className="border-b border-border-primary">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={unread ? "success" : "neutral"}
                            size="sm"
                          >
                            {unread ? "Nuova" : "Letta"}
                          </Badge>

                          {request ? (
                            <Badge variant="warning" size="sm">
                              {formatIntervention(request.interventionSlug)}
                            </Badge>
                          ) : null}

                          {notification.type === "CONVERSATION_MESSAGE" ? (
                            <Badge variant="danger" size="sm">
                              Messaggio
                            </Badge>
                          ) : null}
                        </div>

                        <CardTitle>{notification.title}</CardTitle>

                        <CardDescription>
                          {formatDate(notification.createdAt)}
                        </CardDescription>
                      </div>

                      {unread ? (
                        <form action={markNotificationReadAction}>
                          <Input
                            type="hidden"
                            name="notificationId"
                            value={notification.id}
                          />

                          <Button type="submit" variant="secondary" size="sm">
                            Segna come letta
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-6">
                    <p className="text-sm leading-6 text-text-secondary">
                      {notification.body}
                    </p>

                    {request ? (
                      <dl className="grid gap-3 text-sm sm:grid-cols-3">
                        <div className="border border-border-primary bg-surface-secondary p-3">
                          <dt className="text-xs text-text-muted">Codice</dt>
                          <dd className="mt-1 font-medium text-text-primary">
                            {request.requestCode ?? request.id}
                          </dd>
                        </div>

                        <div className="border border-border-primary bg-surface-secondary p-3">
                          <dt className="text-xs text-text-muted">Località</dt>
                          <dd className="mt-1 font-medium text-text-primary">
                            {formatLocation({
                              city: request.city,
                              postalCode: request.postalCode,
                            })}
                          </dd>
                        </div>

                        <div className="border border-border-primary bg-surface-secondary p-3">
                          <dt className="text-xs text-text-muted">
                            Pubblicata
                          </dt>
                          <dd className="mt-1 font-medium text-text-primary">
                            {formatDate(request.createdAt)}
                          </dd>
                        </div>
                      </dl>
                    ) : null}

                    {primaryHref ? (
                      <Link
                        href={primaryHref}
                        className="inline-flex text-sm font-medium text-brand-primary transition-colors hover:text-brand-primary-hover"
                        prefetch={false}
                      >
                        {primaryActionLabel}
                      </Link>
                    ) : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </PageShell>
  )
}
