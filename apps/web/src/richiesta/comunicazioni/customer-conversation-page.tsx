import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getCustomerConversationThreadByToken,
  markConversationRead,
  sendConversationMessage,
} from "@esigenta/domain";

import { PublicShell } from "../../site/shell/public-shell";
import { MessageThread } from "../../ui/messaging/message-thread";
import { SendMessageForm } from "../../ui/messaging/send-message-form";

type CustomerConversationPageProps = {
  token: string;
  sent?: string;
  error?: string;
};

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function buildCustomerThreadHref({
  token,
  params,
}: {
  token: string;
  params?: Record<string, string>;
}) {
  const query = new URLSearchParams({ token, ...(params ?? {}) });
  return `/messaggi/accesso?${query.toString()}`;
}

function getStatusMessage({
  sent,
  error,
}: {
  sent?: string;
  error?: string;
}) {
  if (sent === "1") {
    return "Messaggio inviato.";
  }

  if (error) {
    return "Non siamo riusciti a inviare il messaggio.";
  }

  return null;
}

export async function CustomerConversationPage({
  token,
  sent,
  error,
}: CustomerConversationPageProps) {
  const result = token
    ? await getCustomerConversationThreadByToken({ token })
    : {
        ok: false as const,
        code: "invalid_token" as const,
        message: "Il link non contiene un token valido.",
      };

  const statusMessage = getStatusMessage({
    sent: readParam(sent),
    error: readParam(error),
  });

  if (result.ok) {
    await markConversationRead({
      conversationId: result.thread.id,
      reader: {
        actorType: "CUSTOMER",
        token,
      },
    });
  }

  async function sendCustomerMessageAction(formData: FormData) {
    "use server";

    const accessResult = await getCustomerConversationThreadByToken({ token });

    if (!accessResult.ok) {
      redirect(
        buildCustomerThreadHref({
          token,
          params: { error: accessResult.code },
        }),
      );
    }

    const body = String(formData.get("body") ?? "");
    const sendResult = await sendConversationMessage({
      conversationId: accessResult.thread.id,
      body,
      sender: {
        actorType: "CUSTOMER",
        token,
      },
    });

    if (!sendResult.ok) {
      redirect(
        buildCustomerThreadHref({
          token,
          params: { error: sendResult.code },
        }),
      );
    }

    // D-010 RESOLVED: revalidate only the specific company conversation.
    revalidatePath(`/area-impresa/contatti/${accessResult.thread.id}`);
    revalidatePath("/area-impresa/contatti");

    redirect(buildCustomerThreadHref({ token, params: { sent: "1" } }));
  }

  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <div className="eg-thread" aria-hidden="true" />

        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container">
            <div className="mx-auto max-w-[920px]">
              <div>
                <p className="eg-eyebrow">Messaggi</p>

                <h1 className="eg-h1 mt-5">Messaggi richiesta</h1>

                <p className="eg-body-muted mt-5 max-w-[44ch]">
                  Rispondi senza creare un account.
                </p>
              </div>

              {statusMessage ? (
                <div className="eg-panel mt-8 p-5">
                  <p className="eg-body-muted">{statusMessage}</p>
                </div>
              ) : null}

              <div className="mt-8">
                {result.ok ? (
                  <MessageThread
                    thread={result.thread}
                    currentActorType="CUSTOMER"
                  >
                    <SendMessageForm
                      action={sendCustomerMessageAction}
                      submitLabel="Rispondi"
                    />
                  </MessageThread>
                ) : (
                  <div className="eg-panel p-5">
                    <p className="eg-body-muted">{result.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
