import type {
  ReactNode,
} from "react";

import type {
  ConversationThread,
} from "@esigenta/db";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  tokens,
} from "@esigenta/ui";

type SupportThreadProps = {
  thread: ConversationThread;
  actions?: ReactNode;
  children?: ReactNode;
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function SupportThread({
  thread,
  actions,
  children,
}: SupportThreadProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>
                {thread.company?.name ?? "Impresa"}
              </CardTitle>

              <Badge
                variant={thread.isResolved ? "success" : "warning"}
                size="sm"
              >
                {thread.isResolved ? "Risolta" : "Aperta"}
              </Badge>
            </div>

            <CardDescription>
              Assistenza Esigenta - Ultimo aggiornamento{" "}
              {formatDateTime(thread.updatedAt)}
            </CardDescription>

            {thread.resolvedAt ? (
              <p className="text-xs text-text-muted">
                Risolta il {formatDateTime(thread.resolvedAt)}
                {thread.resolvedBy
                  ? ` da ${
                      thread.resolvedBy.name ??
                      thread.resolvedBy.email
                    }`
                  : ""}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="shrink-0">
              {actions}
            </div>
          ) : null}
        </div>
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
              const isAdmin =
                message.senderActorType === "ADMIN";

              return (
                <article
                  key={message.id}
                  className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`${tokens.layout.messaging.bubble} border px-4 py-3 ${
                      isAdmin
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
                          isAdmin
                            ? "text-brand-on-primary"
                            : "text-text-muted"
                        }`}
                      >
                        {formatDateTime(message.createdAt)}
                      </time>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                      {message.body}
                    </p>
                  </div>
                </article>
              );
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
  );
}
