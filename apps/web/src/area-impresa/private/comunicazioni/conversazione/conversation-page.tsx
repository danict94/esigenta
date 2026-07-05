import {
  redirect,
} from "next/navigation"

import {
  getCompanyConversationThreadPage,
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
} from "../../../../platform/monitoring/area-monitoring"
import {
  createPerfTrace,
} from "../../../monitoring/area-impresa-perf-trace"

import {
  MessageThread,
} from "../../../../ui/messaging/message-thread"
import {
  SendMessageForm,
} from "../../../../ui/messaging/send-message-form"

import {
  sendMessageAction,
} from "../actions/send-message-action"
import {
  markConversationReadAction,
} from "../actions/mark-conversation-read-action"
import {
  buildCompanyConversationHref,
  getThreadStatusMessage,
  readSearchParam,
} from "../view-models/conversation-view-model"

type ConversationThreadKind =
  | "SUPPORT"
  | "CUSTOMER"

export type ConversationPageProps = {
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

export async function ConversationPage({
  params,
  searchParams,
  kind,
  eyebrow,
  title,
  hrefBase,
  listPath,
}: ConversationPageProps) {
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

    markConversationReadAction({ conversationId, actor })
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
    getThreadStatusMessage({
      sent: readSearchParam(
        resolvedSearchParams.sent,
      ),
      error: readSearchParam(
        resolvedSearchParams.error,
      ),
    })

  trace.finish({
    conversationId,
    result: result.ok ? "ok" : result.code,
    threadKind: kind,
  })

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <section className="space-y-6">
        <div className="pt-4">
          <p className="text-sm font-medium text-eg-ardesia">
            {eyebrow}
          </p>

          <h1 className="mt-1 text-xl font-semibold tracking-tight text-eg-terra">
            {title}
          </h1>
        </div>

        {statusMessage ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-eg-ardesia">
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
              action={sendMessageAction.bind(
                null,
                conversationId,
                hrefBase,
                listPath,
              )}
            />
          </MessageThread>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-eg-ardesia">
                {result.message}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </PageShell>
  )
}
