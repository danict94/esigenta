import type {
  ReactNode,
} from "react";

import type {
  ConversationThread,
} from "@esigenta/domain";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@esigenta/ui";

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
              <p className="text-xs text-eg-text-muted">
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
            <div className="border border-eg-border bg-eg-surface-muted p-4">
              <p className="text-sm text-eg-text-muted">
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
                    className={`${"max-w-[min(34rem,85%)]"} border px-4 py-3 ${
                      isAdmin
                        ? "border-eg-brand-strong bg-eg-brand-strong text-eg-on-brand"
                        : "border-eg-border bg-eg-surface-muted text-eg-ink"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs font-semibold">
                        {message.senderLabel}
                      </p>

                      <time
                        className={`text-xs ${
                          isAdmin
                            ? "text-eg-on-brand"
                            : "text-eg-text-muted"
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
          <div className="sticky bottom-0 -mx-6 border-t border-eg-border bg-eg-surface px-6 pb-6 pt-4">
            {children}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
