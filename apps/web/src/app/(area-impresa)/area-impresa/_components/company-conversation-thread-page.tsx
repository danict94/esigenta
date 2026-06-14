import {
  revalidatePath,
} from "next/cache"
import {
  redirect,
} from "next/navigation"

import {
  getCompanyConversationThreadPage,
  markConversationRead,
  processConversationMessageSideEffects,
  sendCompanyConversationMessage,
} from "@esigenta/domain"
import {
  Card,
  CardContent,
  PageShell,
} from "@esigenta/ui"

import {
  requireAreaImpresaAccess,
} from "../../../../auth/server"
import {
  areaLog,
  areaTimestamp,
  isAreaMonitoringEnabled,
  shortId,
} from "../../../../lib/area-monitoring"
import {
  traceSideEffect,
} from "../../../../lib/area-monitoring.server"
import {
  MessageThread,
} from "./message-thread"
import {
  SendMessageForm,
} from "./send-message-form"

import {
  buildCompanyConversationHref,
} from "../_lib/conversation-routes"
import {
  createPerfTrace,
} from "../_lib/perf-log"

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
  const trace = createPerfTrace({ scope: "contact-thread-page" })

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
    trace.measure("actor", () => requireAreaImpresaAccess()),
  ])
  const { conversationId } =
    resolvedParams

  const threadStart = areaTimestamp()
  const result = await trace.measure(
    "thread-data",
    () => getCompanyConversationThreadPage(actor, conversationId, trace.add),
  )
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
      trace.finish({ conversationId, result: "wrong-route-redirect" })
      redirect(
        buildCompanyConversationHref({
          conversationId,
          conversationType: result.thread.type,
        }),
      )
    }

    traceSideEffect("markConversationRead", () =>
      markConversationRead({
        conversationId,
        reader: {
          actorType: "COMPANY",
          companyId: actor.company.id,
          userId: actor.user.id,
        },
        authorizedActor: actor,
      }),
    )
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

    const actorStart = areaTimestamp()
    const currentActor =
      await requireAreaImpresaAccess()
    const actorMs = Math.round(areaTimestamp() - actorStart)

    const body =
      String(formData.get("body") ?? "")

    const cmdStart = areaTimestamp()
    const sendResult =
      await sendCompanyConversationMessage(
        currentActor,
        conversationId,
        body,
        (label, ms) =>
          console.info(
            `[esigenta-perf] [send-command-detail] ${label}=${ms}ms`,
          ),
      )
    const cmdMs = Math.round(areaTimestamp() - cmdStart)

    console.info(
      `[esigenta-perf] [send-company-action] actor=${actorMs}ms send-command=${cmdMs}ms total=${Math.round(areaTimestamp() - sendStart)}ms`,
    )

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

    traceSideEffect("processConversationMessageSideEffects", () =>
      processConversationMessageSideEffects({
        messageId: sendResult.messageId,
        sender: {
          actorType: "COMPANY",
          companyId:
            currentActor.company.id,
          userId:
            currentActor.user.id,
        },
      }),
    )

    revalidatePath(listPath)
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

  trace.finish({
    conversationId,
    result: result.ok ? "ok" : result.code,
    threadKind: kind,
  })

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
