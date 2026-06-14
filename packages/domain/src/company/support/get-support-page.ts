import type { CompanyActor } from "@esigenta/auth"

import { getCompanySupportConversation } from "./get-support-conversation"
import type { CompanyConversationListItem } from "../../internal/conversation/types"

type PerfRecorder = (label: string, ms: number) => void

export type GetCompanySupportPageResult = {
  supportConversation: CompanyConversationListItem | null
}

export async function getCompanySupportPage(
  actor: CompanyActor,
  recordPerf?: PerfRecorder,
): Promise<GetCompanySupportPageResult> {
  const t0 = performance.now()

  const supportConversation = await getCompanySupportConversation(actor)

  recordPerf?.("support-page", Math.round(performance.now() - t0))

  return { supportConversation }
}
