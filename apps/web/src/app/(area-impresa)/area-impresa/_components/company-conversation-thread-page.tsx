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
} from "@esigenta/db"
import {
  Card,
  CardContent,
  PageShell,
} from "@esigenta/ui"

import {
  requireCompanyActor,
} from "../../../../auth/server"
import {
  areaLog,
  areaTimestamp,
  isAreaMonitoringEnabled,
  shortId,
} from "../../../../lib/area-monitoring"
import {
  MessageThread,
} from "./message-thread"
import {
  SendMessageForm,
} from "./send-message-form"

import {
  buildCompanyConversationHref,
} from "../_lib/conversation-routes"

type ConversationThreadKind =
  | "SUPPORT"
  | "CUSTOMER"

type CompanyConversationThreadPageProps = {
  params: Promise<{
    conversationId: string
  }>
  searchParams: Promise<{
    sent?: string | string[]
    error?: string | string[]
  }>
  kind: ConversationThreadKind
  eyebrow: string
  title: string
  hrefBase: string
  listPath: string
}

function readSearchParam(
  value?: string | string[],
) {
  return Array.isArray(value)
    ? value[0]
    : value
}

function buildThreadHref({
  hrefBase,
  conversationId,
  params,
}: {
  hrefBase: string
  conversationId: string
  params?: Record<string, string>
}) {
  const query =
    params &&
    new URLSearchParams(params).toString()

  return query
    ? `${hrefBase}/${encodeURIComponent(
        conversationId,
      )}?${query}`
    : `${hrefBase}/${encodeURIComponent(
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

export async function CompanyConversationThreadPage({
  params,
  searchParams,
  kind,
  eyebrow,
  title,
  hrefBase,
  listPath,
}: CompanyConversationThreadPageProps) {
  const monitored = isAreaMonitoringEnabled()
  const pageStart = areaTimestamp()

  if (monitored) {
    areaLog("area.model.conversationThread.start", {})
  }

  const [
    resolvedParams,
    resolvedSearchParams,
    actor,
  ] = await Promise.all([
    params,
    searchParams,
    requireCompanyActor(),
  ])
  const { conversationId } =
    resolvedParams

  const threadStart = areaTimestamp()
  const result =
    await getCompanyConversationThread({
      conversationId,
      companyId: actor.company.id,
      userId: actor.user.id,
    authorizedActor: actor,
    })
  const threadMs = Math.round(areaTimestamp() - threadStart)

  if (result.ok) {
    const isSupportThread =
      result.thread.type === "SUPPORT"
    const isWrongSupportRoute =
      kind === "SUPPORT" && !isSupportThread
    const isWrongCustomerRoute =
      kind === "CUSTOMER" && isSupportThread

    if (
      isWrongSupportRoute ||
      isWrongCustomerRoute
    ) {
      if (monitored) {
        areaLog("area.model.conversationThread.end", {
          conversationIdSafe: shortId(conversationId),
          result: "wrong-route-redirect",
          durationMs: Math.round(areaTimestamp() - pageStart),
          threadMs,
        })
      }
      redirect(
        buildCompanyConversationHref({
          conversationId,
          conversationType: result.thread.type,
        }),
      )
    }

    await markConversationRead({
      conversationId,
      reader: {
        actorType: "COMPANY",
        companyId: actor.company.id,
        userId: actor.user.id,
      },
      authorizedActor: actor,
    })
  }

  if (monitored) {
    areaLog("area.model.conversationThread.end", {
      conversationIdSafe: shortId(conversationId),
      result: result.ok ? "ok" : result.code,
      threadKind: kind,
      durationMs: Math.round(areaTimestamp() - pageStart),
      threadMs,
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

    const sendMonitored = isAreaMonitoringEnabled()
    const sendStart = areaTimestamp()

    if (sendMonitored) {
      areaLog("area.message.send.start", {
        conversationIdSafe: shortId(conversationId),
      })
    }

    const currentActor =
      await requireCompanyActor()
    const body =
      String(formData.get("body") ?? "")
    const sendResult =
      await sendConversationMessage({
        conversationId,
        body,
        sender: {
          actorType: "COMPANY",
          companyId:
            currentActor.company.id,
          userId:
            currentActor.user.id,
        },
      })

    if (!sendResult.ok) {
      if (sendMonitored) {
        areaLog("area.message.send.end", {
          conversationIdSafe: shortId(conversationId),
          result: sendResult.code,
          durationMs: Math.round(areaTimestamp() - sendStart),
        })
      }
      redirect(
        buildThreadHref({
          hrefBase,
          conversationId,
          params: {
            error: sendResult.code,
          },
        }),
      )
    }

    if (sendMonitored) {
      areaLog("area.message.send.end", {
        conversationIdSafe: shortId(conversationId),
        result: "ok",
        durationMs: Math.round(areaTimestamp() - sendStart),
      })
    }

    revalidatePath(listPath)
    revalidatePath(
      buildThreadHref({
        hrefBase,
        conversationId,
      }),
    )
    revalidatePath(
      "/area-impresa",
      "layout",
    )

    redirect(
      buildThreadHref({
        hrefBase,
        conversationId,
        params: {
          sent: "1",
        },
      }),
    )
  }

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <section className="space-y-6">
        <div className="pt-4">
          <p className="text-sm font-medium text-text-secondary">
            {eyebrow}
          </p>

          <h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
            {title}
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
