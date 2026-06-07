import type {
  ReactNode,
} from "react"

import type {
  ConversationThread as MessageThreadData,
} from "@fixpro/db"
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  tokens,
} from "@fixpro/ui"

type MessageThreadProps = {
  thread: MessageThreadData
  currentActorType: MessageThreadData["messages"][number]["senderActorType"]
  children?: ReactNode
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function formatRequestTitle(
  thread: MessageThreadData,
) {
  if (thread.type === "SUPPORT") {
    return "Supporto operativo"
  }

  if (thread.request?.interventionSlug) {
    return thread.request.interventionSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase(),
      )
  }

  return thread.request?.requestCode
    ? `Richiesta ${thread.request.requestCode}`
    : "Richiesta"
}

function formatThreadTitle(
  thread: MessageThreadData,
) {
  if (thread.type === "SUPPORT") {
    return "Assistenza Esigenta"
  }

  return (
    thread.customer?.name ??
    thread.customer?.email ??
    "Cliente"
  )
}

export function MessageThread({
  thread,
  currentActorType,
  children,
}: MessageThreadProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>
            {formatThreadTitle(thread)}
          </CardTitle>

          <Badge size="sm">
            {formatRequestTitle(thread)}
          </Badge>
        </div>

        <CardDescription>
          {thread.request?.city
            ? `${thread.request.city} - `
            : ""}
          Ultimo aggiornamento{" "}
          {formatDateTime(thread.updatedAt)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          {thread.messages.length === 0 ? (
            <div className="border border-border-primary bg-surface-secondary p-4">
              <p className="text-sm text-text-secondary">
                Nessun messaggio ancora inviato.
              </p>
            </div>
          ) : (
            thread.messages.map((message) => {
              const isCurrentActor =
                message.senderActorType ===
                currentActorType

              return (
                <article
                  key={message.id}
                  className={`flex ${isCurrentActor ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`${tokens.layout.messaging.bubble} border px-4 py-3 ${
                      isCurrentActor
                        ? "border-brand-primary bg-brand-primary text-brand-on-primary"
                        : "border-border-primary bg-surface-secondary text-text-primary"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs font-semibold">
                        {message.senderLabel}
                      </p>

                      <time
                        className={`text-xs ${
                          isCurrentActor
                            ? "text-brand-on-primary"
                            : "text-text-muted"
                        }`}
                      >
                        {formatDateTime(
                          message.createdAt,
                        )}
                      </time>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                      {message.body}
                    </p>
                  </div>
                </article>
              )
            })
          )}
        </div>

        {children ? (
          <div className="sticky bottom-0 -mx-6 border-t border-border-primary bg-surface-elevated px-6 pb-6 pt-4">
            {children}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
