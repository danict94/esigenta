import {
  revalidatePath,
} from "next/cache"
import {
  redirect,
} from "next/navigation"

import {
  getCustomerConversationThreadByToken,
  markConversationRead,
  sendConversationMessage,
} from "@esigenta/domain"
import {
  Card,
  CardContent,
  Container,
} from "@esigenta/ui"

import { PublicShell } from "../../site/shell/public-shell"
import {
  MessageThread,
} from "../../ui/messaging/message-thread"
import {
  SendMessageForm,
} from "../../ui/messaging/send-message-form"

export const dynamic = "force-dynamic"

type CustomerConversationPageProps = {
  token: string
  sent?: string
  error?: string
}

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function buildCustomerThreadHref({
  token,
  params,
}: {
  token: string
  params?: Record<string, string>
}) {
  const query = new URLSearchParams({ token, ...(params ?? {}) })
  return `/messaggi/accesso?${query.toString()}`
}

function getStatusMessage({
  sent,
  error,
}: {
  sent?: string
  error?: string
}) {
  if (sent === "1") {
    return "Messaggio inviato."
  }

  if (error) {
    return "Non siamo riusciti a inviare il messaggio."
  }

  return null
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
      }

  const statusMessage = getStatusMessage({
    sent: readParam(sent),
    error: readParam(error),
  })

  if (result.ok) {
    await markConversationRead({
      conversationId: result.thread.id,
      reader: {
        actorType: "CUSTOMER",
        token,
      },
    })
  }

  async function sendCustomerMessageAction(formData: FormData) {
    "use server"

    const accessResult = await getCustomerConversationThreadByToken({ token })

    if (!accessResult.ok) {
      redirect(
        buildCustomerThreadHref({
          token,
          params: { error: accessResult.code },
        }),
      )
    }

    const body = String(formData.get("body") ?? "")
    const sendResult = await sendConversationMessage({
      conversationId: accessResult.thread.id,
      body,
      sender: {
        actorType: "CUSTOMER",
        token,
      },
    })

    if (!sendResult.ok) {
      redirect(
        buildCustomerThreadHref({
          token,
          params: { error: sendResult.code },
        }),
      )
    }

    // D-010 RESOLVED: revalidate only the specific company conversation, not the entire /area-impresa layout
    revalidatePath(`/area-impresa/contatti/${accessResult.thread.id}`)
    revalidatePath("/area-impresa/contatti")

    redirect(
      buildCustomerThreadHref({ token, params: { sent: "1" } }),
    )
  }

  return (
    <PublicShell>
      <section className="py-10 md:py-12">
        <Container size="lg">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-text-secondary">
                Messaggi
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
                Messaggi richiesta
              </h1>

              <p className="mt-1 text-sm text-text-secondary">
                Rispondi senza creare un account.
              </p>
            </div>

            {statusMessage ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-text-secondary">
                    {statusMessage}
                  </p>
                </CardContent>
              </Card>
            ) : null}

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
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-text-secondary">
                    {result.message}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </Container>
      </section>
    </PublicShell>
  )
}
