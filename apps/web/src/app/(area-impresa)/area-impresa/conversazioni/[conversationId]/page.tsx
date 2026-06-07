import {
  redirect,
} from "next/navigation"

import {
  getCompanyConversationThread,
} from "@esigenta/db"

import {
  requireDefaultCompanyMembership,
} from "../../../../../auth/server"

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
    membership,
  ] = await Promise.all([
    params,
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
    result.thread.type === "SUPPORT"
  ) {
    redirect(
      `/area-impresa/assistenza/${encodeURIComponent(
        conversationId,
      )}`,
    )
  }

  redirect(
    `/area-impresa/contatti/${encodeURIComponent(
      conversationId,
    )}`,
  )
}
