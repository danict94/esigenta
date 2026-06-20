import type {
  CompanyActor,
} from "@esigenta/auth"
import {
  markConversationRead,
} from "@esigenta/domain"

import {
  traceSideEffect,
} from "../../../monitoring/area-impresa-monitoring.server"

// Fired during thread render. traceSideEffect defers the write via Next's
// after() so it never blocks the response — render-safe, not a GET-with-write.
// No revalidateTag/revalidatePath here on purpose (D-016): both are only
// documented for Server Functions and Route Handlers, not for callbacks
// scheduled via after() from a Server Component render. The shell counts
// cache (shell-counts-cache.ts) has a bounded 30s revalidate window that
// covers this path instead of an unsupported/unverifiable cache call here.
export function markConversationReadAction({
  conversationId,
  actor,
}: {
  conversationId: string
  actor: CompanyActor
}) {
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
