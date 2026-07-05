import type { ReactNode } from "react";

import type { ConversationThread as MessageThreadData } from "@esigenta/domain";

type MessageThreadProps = {
  thread: MessageThreadData;
  currentActorType: MessageThreadData["messages"][number]["senderActorType"];
  children?: ReactNode;
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRequestTitle(thread: MessageThreadData) {
  if (thread.type === "SUPPORT") {
    return "Supporto operativo";
  }

  if (thread.request?.interventionSlug) {
    return thread.request.interventionSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return thread.request?.requestCode
    ? `Richiesta ${thread.request.requestCode}`
    : "Richiesta";
}

function formatThreadTitle(thread: MessageThreadData) {
  if (thread.type === "SUPPORT") {
    return "Assistenza Esigenta";
  }

  return thread.customer?.name ?? thread.customer?.email ?? "Cliente";
}

export function MessageThread({
  thread,
  currentActorType,
  children,
}: MessageThreadProps) {
  return (
    <section className="eg-panel overflow-hidden">
      <header className="border-b border-eg-hairline p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="eg-h3 text-[24px]">{formatThreadTitle(thread)}</h2>

          <span className="inline-flex min-h-8 items-center rounded-full border border-eg-hairline px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-eg-ardesia">
            {formatRequestTitle(thread)}
          </span>
        </div>

        <p className="eg-form-help mt-3">
          {thread.request?.city ? `${thread.request.city} - ` : ""}
          Ultimo aggiornamento {formatDateTime(thread.updatedAt)}
        </p>
      </header>

      <div className="space-y-6 p-5 md:p-6">
        <div className="space-y-4">
          {thread.messages.length === 0 ? (
            <div className="border border-eg-hairline bg-eg-calce-2 p-4">
              <p className="eg-form-help">Nessun messaggio ancora inviato.</p>
            </div>
          ) : (
            thread.messages.map((message) => {
              const isCurrentActor =
                message.senderActorType === currentActorType;

              return (
                <article
                  key={message.id}
                  className={`flex ${isCurrentActor ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={[
                      "max-w-[min(34rem,85%)] border px-4 py-3",
                      isCurrentActor
                        ? "border-eg-cotto bg-eg-cotto text-eg-calce"
                        : "border-eg-hairline bg-eg-calce-2 text-eg-terra",
                    ].join(" ")}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs font-medium">{message.senderLabel}</p>

                      <time
                        className={[
                          "text-xs",
                          isCurrentActor ? "text-eg-calce" : "text-eg-ardesia",
                        ].join(" ")}
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
          <div className="sticky bottom-0 -mx-5 border-t border-eg-hairline bg-eg-calce px-5 pb-5 pt-4 md:-mx-6 md:px-6 md:pb-6">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
