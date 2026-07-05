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

// Same hand as site/shell/icons.tsx: 16x16 grid, 1.5px stroke, round
// caps/joins, currentColor only. These three sit inline next to the meta
// text they describe, so they stay structural (no accent) — the accent is
// already spent on the unread dot, it shouldn't repeat on every line.
function PinGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <path
        d="M8 14s4.3-3.7 4.3-6.9A4.3 4.3 0 0 0 3.7 7.1C3.7 10.3 8 14 8 14Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="6.9" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function TagGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <path
        d="M2.5 8.3 8.3 2.5h4.2a1 1 0 0 1 1 1v4.2L7.7 13.5a1 1 0 0 1-1.4 0L2.5 9.7a1 1 0 0 1 0-1.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10.3" cy="5.7" r="1" fill="currentColor" />
    </svg>
  )
}

function ClockGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 5.2V8l2 1.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MetaItem({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-eg-ardesia">
      <span className="text-eg-ardesia/70">{icon}</span>
      {children}
    </span>
  )
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
        "overflow-hidden transition-shadow",
        // Unread cards get the deeper "featured" lift (same token used for
        // the premium credit package) instead of just a thin border — the
        // weight of the card itself signals priority, not only a label.
        unread
          ? "border-eg-cotto shadow-eg-elevation-lg"
          : "border-eg-hairline",
      )}
    >
      <CardHeader className="border-b border-eg-hairline">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {unread ? (
                // Solid chip, not the shared outline Badge: this is the one
                // status that must be impossible to miss while scanning a
                // list, so it gets real fill instead of a thin border.
                <span className="inline-flex items-center gap-1.5 rounded-full bg-eg-cotto px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-eg-calce">
                  <span className="h-1.5 w-1.5 rounded-full bg-eg-calce" />
                  Nuova
                </span>
              ) : null}

              {request ? (
                <Badge variant="warning" size="sm">
                  {formatIntervention(request.interventionSlug)}
                </Badge>
              ) : null}

              {notification.type === "CONVERSATION_MESSAGE" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-eg-miele-tint px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-eg-terra">
                  Messaggio
                </span>
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

              <Button type="submit" variant="ghost" size="sm">
                Segna come letta
              </Button>
            </form>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        <p className="text-sm leading-6 text-eg-ardesia">
          {notification.body}
        </p>

        {request ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-eg-hairline pt-4 text-sm">
            <MetaItem icon={<PinGlyph className="h-4 w-4" />}>
              <span className="font-medium text-eg-terra">
                {formatLocation({
                  city: request.city,
                  postalCode: request.postalCode,
                })}
              </span>
            </MetaItem>

            <MetaItem icon={<ClockGlyph className="h-4 w-4" />}>
              Pubblicata {formatDate(request.createdAt)}
            </MetaItem>

            <MetaItem icon={<TagGlyph className="h-4 w-4" />}>
              {request.requestCode ?? request.id}
            </MetaItem>
          </div>
        ) : null}

        {primaryHref ? (
          <Link
            href={primaryHref}
            className="inline-flex text-sm font-medium text-eg-cotto transition-colors hover:text-eg-cotto-dark"
            prefetch={false}
          >
            {primaryActionLabel}
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}
