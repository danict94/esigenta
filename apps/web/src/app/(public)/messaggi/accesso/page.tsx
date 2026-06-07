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
} from "@esigenta/db"
import {
  Card,
  CardContent,
  Container,
} from "@esigenta/ui"

import { PublicShell } from "../../../../components/layout/public-shell"
import {
  MessageThread,
} from "../../../(area-impresa)/area-impresa/_components/message-thread"
import {
  SendMessageForm,
} from "../../../(area-impresa)/area-impresa/_components/send-message-form"

export const dynamic = "force-dynamic"

type CustomerConversationAccessPageProps = {
  searchParams: Promise<{
    token?: string | string[]
    sent?: string | string[]
    error?: string | string[]
  }>
}

function readSearchParam(
  value?: string | string[],
) {
  return Array.isArray(value)
    ? value[0]
    : value
}

function buildCustomerThreadHref({
  token,
  params,
}: {
  token: string
  params?: Record<string, string>
}) {
  const query = new URLSearchParams({
    token,
    ...(params ?? {}),
  })

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

export default async function CustomerConversationAccessPage({
  searchParams,
}: CustomerConversationAccessPageProps) {
  const resolvedSearchParams =
    await searchParams
  const token =
    readSearchParam(
      resolvedSearchParams.token,
    ) ?? ""
  const result =
    token
      ? await getCustomerConversationThreadByToken({
          token,
        })
      : {
          ok: false as const,
          code: "invalid_token" as const,
          message:
            "Il link non contiene un token valido.",
        }
  const statusMessage =
    getStatusMessage({
      sent: readSearchParam(
        resolvedSearchParams.sent,
      ),
      error: readSearchParam(
        resolvedSearchParams.error,
      ),
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

  async function sendCustomerMessageAction(
    formData: FormData,
  ) {
    "use server"

    const accessResult =
      await getCustomerConversationThreadByToken({
        token,
      })

    if (!accessResult.ok) {
      redirect(
        buildCustomerThreadHref({
          token,
          params: {
            error: accessResult.code,
          },
        }),
      )
    }

    const body =
      String(formData.get("body") ?? "")
    const sendResult =
      await sendConversationMessage({
        conversationId:
          accessResult.thread.id,
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
          params: {
            error: sendResult.code,
          },
        }),
      )
    }

    revalidatePath(
      "/area-impresa",
      "layout",
    )

    redirect(
      buildCustomerThreadHref({
        token,
        params: {
          sent: "1",
        },
      }),
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
