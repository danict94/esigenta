import Link from "next/link"

import type {
  CompanyNotificationListItem,
} from "@esigenta/domain"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  cn,
} from "@esigenta/ui"

import {
  buildCompanyConversationHref,
} from "../../comunicazioni/view-models/conversation-view-model"

type NotificationCardProps = {
  notification: CompanyNotificationListItem
  markReadAction: (formData: FormData) => Promise<void>
}

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

export function NotificationCard({
  notification,
  markReadAction,
}: NotificationCardProps) {
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
            <form action={markReadAction}>
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
}
