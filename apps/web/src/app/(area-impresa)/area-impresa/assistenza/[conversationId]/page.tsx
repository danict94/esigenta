import {
  revalidatePath,
} from "next/cache"
import {
  redirect,
} from "next/navigation"

import {
  getCompanyConversationThread,
  markConversationRead,
  sendConversationMessage,
} from "@fixpro/db"
import {
  Card,
  CardContent,
  PageShell,
} from "@fixpro/ui"

import {
  requireDefaultCompanyMembership,
} from "../../../../../auth/server"
import {
  MessageThread,
} from "../../_components/message-thread"
import {
  SendMessageForm,
} from "../../_components/send-message-form"

export const dynamic = "force-dynamic"

type CompanySupportThreadPageProps = {
  params: Promise<{
    conversationId: string
  }>
  searchParams: Promise<{
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

function buildSupportThreadHref(
  conversationId: string,
  params?: Record<string, string>,
) {
  const query =
    params &&
    new URLSearchParams(params).toString()

  return query
    ? `/area-impresa/assistenza/${encodeURIComponent(
        conversationId,
      )}?${query}`
    : `/area-impresa/assistenza/${encodeURIComponent(
        conversationId,
      )}`
}

function getStatusMessage({
  sent,
  error,
}: {
  sent: string | undefined
  error: string | undefined
}) {
  if (sent === "1") {
    return "Messaggio inviato."
  }

  if (error) {
    return "Non siamo riusciti a inviare il messaggio."
  }

  return null
}

export default async function CompanySupportThreadPage({
  params,
  searchParams,
}: CompanySupportThreadPageProps) {
  const [
    resolvedParams,
    resolvedSearchParams,
    membership,
  ] = await Promise.all([
    params,
    searchParams,
    requireDefaultCompanyMembership(),
  ])
  const { conversationId } =
    resolvedParams
  const result =
    await getCompanyConversationThread({
      conversationId,
      companyId: membership.companyId,
      userId: membership.userId,
    })

  if (
    result.ok &&
    result.thread.type !== "SUPPORT"
  ) {
    redirect(
      `/area-impresa/contatti/${encodeURIComponent(
        conversationId,
      )}`,
    )
  }

  if (result.ok) {
    await markConversationRead({
      conversationId,
      reader: {
        actorType: "COMPANY",
        companyId: membership.companyId,
        userId: membership.userId,
      },
    })
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

  async function sendCompanyMessageAction(
    formData: FormData,
  ) {
    "use server"

    const currentMembership =
      await requireDefaultCompanyMembership()
    const body =
      String(formData.get("body") ?? "")
    const sendResult =
      await sendConversationMessage({
        conversationId,
        body,
        sender: {
          actorType: "COMPANY",
          companyId:
            currentMembership.companyId,
          userId:
            currentMembership.userId,
        },
      })

    if (!sendResult.ok) {
      redirect(
        buildSupportThreadHref(conversationId, {
          error: sendResult.code,
        }),
      )
    }

    revalidatePath("/area-impresa/assistenza")
    revalidatePath(
      buildSupportThreadHref(conversationId),
    )
    revalidatePath(
      "/area-impresa",
      "layout",
    )

    redirect(
      buildSupportThreadHref(conversationId, {
        sent: "1",
      }),
    )
  }

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <section className="space-y-6">
        <div className="pt-4">
          <p className="text-sm font-medium text-text-secondary">
            Assistenza
          </p>

          <h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
            Messaggi con FixPro
          </h1>
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
            currentActorType="COMPANY"
          >
            <SendMessageForm
              action={sendCompanyMessageAction}
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
      </section>
    </PageShell>
  )
}
