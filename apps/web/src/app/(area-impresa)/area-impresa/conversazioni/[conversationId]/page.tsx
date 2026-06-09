import {
  redirect,
} from "next/navigation"

import {
  getCompanyConversationThread,
} from "@esigenta/db"

import {
  requireCompanyActor,
} from "../../../../../auth/server"
import {
  buildCompanyConversationHref,
} from "../../_lib/conversation-routes"

export const dynamic = "force-dynamic"

type LegacyCompanyConversationThreadPageProps = {
  params: Promise<{
    conversationId: string
  }>
}

export default async function LegacyCompanyConversationThreadPage({
  params,
}: LegacyCompanyConversationThreadPageProps) {
  const [
    resolvedParams,
    actor,
  ] = await Promise.all([
    params,
    requireCompanyActor(),
  ])
  const { conversationId } =
    resolvedParams
  const result =
    await getCompanyConversationThread({
      conversationId,
      companyId: actor.companyId,
      userId: actor.userId,
    })

  if (result.ok) {
    redirect(
      buildCompanyConversationHref({
        conversationId,
        conversationType: result.thread.type,
      }),
    )
  }

  redirect(
    buildCompanyConversationHref({
      conversationId,
      conversationType: "COMPANY_CUSTOMER",
    }),
  )
}
