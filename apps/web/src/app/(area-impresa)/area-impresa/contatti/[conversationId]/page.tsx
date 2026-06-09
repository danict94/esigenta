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
  requireDefaultCompanyMembership,
} from "../../../../../auth/server"
import {
  MessageThread,
} from "../../_components/message-thread"
import {
  SendMessageForm,
} from "../../_components/send-message-form"
import {
  createPerfTrace,
} from "../../_lib/perf-log"

export const dynamic = "force-dynamic"

type CompanyContactThreadPageProps = {
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

function buildContactThreadHref(
  conversationId: string,
  params?: Record<string, string>,
) {
  const query =
    params &&
    new URLSearchParams(params).toString()

  return query
    ? `/area-impresa/contatti/${encodeURIComponent(
        conversationId,
      )}?${query}`
    : `/area-impresa/contatti/${encodeURIComponent(
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

export default async function CompanyContactThreadPage({
  params,
  searchParams,
}: CompanyContactThreadPageProps) {
  const trace = createPerfTrace({
    scope: "conversation-page",
  })
  const [
    resolvedParams,
    resolvedSearchParams,
  ] = await Promise.all([
    params,
    searchParams,
  ])
  const { conversationId } =
    resolvedParams
  const membership = await trace.measure(
    "membership",
    () => requireDefaultCompanyMembership(),
  )
  const result =
    await trace.measure(
      "conversation-query",
      () =>
        getCompanyConversationThread({
          conversationId,
          companyId: membership.companyId,
          userId: membership.userId,
        }),
    )

  if (
    result.ok &&
    result.thread.type === "SUPPORT"
  ) {
    const redirectHref =
      trace.measureSync(
        "redirect",
        () =>
          `/area-impresa/assistenza/${encodeURIComponent(
            conversationId,
          )}`,
      )

    trace.finish({
      conversationId,
      redirect: redirectHref,
      status: "support-redirect",
    })
    redirect(
      redirectHref,
    )
  }

  if (result.ok) {
    await trace.measure("mark-read", () =>
      markConversationRead({
        conversationId,
        reader: {
          actorType: "COMPANY",
          companyId: membership.companyId,
          userId: membership.userId,
        },
      }),
    )
  }

  const statusMessage =
    trace.measureSync("render-final", () =>
      getStatusMessage({
        sent: readSearchParam(
          resolvedSearchParams.sent,
        ),
        error: readSearchParam(
          resolvedSearchParams.error,
        ),
      }),
    )

  trace.finish({
    conversationId,
    status: result.ok ? "ok" : result.code,
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
        buildContactThreadHref(conversationId, {
          error: sendResult.code,
        }),
      )
    }

    revalidatePath("/area-impresa/contatti")
    revalidatePath(
      buildContactThreadHref(conversationId),
    )
    revalidatePath(
      "/area-impresa",
      "layout",
    )

    redirect(
      buildContactThreadHref(conversationId, {
        sent: "1",
      }),
    )
  }

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <section className="space-y-6">
        <div className="pt-4">
          <p className="text-sm font-medium text-text-secondary">
            Contatti
          </p>

          <h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
            Messaggi cliente
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
