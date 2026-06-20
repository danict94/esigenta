import "server-only"

import { unstable_cache } from "next/cache"

import type { CompanyActor } from "@esigenta/auth"
import {
  getAreaImpresaShellCounts,
  type AreaImpresaShellCounts,
} from "@esigenta/domain"

/**
 * Shell counts (sidebar badges) are owned by packages/domain:
 * - unreadNotificationCount: CompanyNotification.readAt (company/notifications)
 * - unreadContactCount / unreadSupportCount: Conversation + Message +
 *   ConversationParticipant.lastReadAt (internal/conversation)
 *
 * This cache layer is an apps/web concern (Next.js caching is a framework
 * detail, not a domain concept — see auth/server.ts for the same pattern
 * with React cache()). It exists only to let the sidebar avoid an
 * unconditional layout-wide revalidatePath on every notification/message
 * mutation (D-016): the badge data is cached per company (tags option,
 * compatible with revalidateTag per the "Previous Model" caching guide —
 * this app does not set the cacheComponents flag), invalidated precisely
 * by the actions that change it via revalidateTag(tag, { expire: 0 })
 * (immediate expiration, not stale-while-revalidate — and per cacheLife.md,
 * calling a revalidation function from a Server Action also clears the
 * client-side router cache immediately, so the sidebar refetches on the
 * very next render).
 *
 * Bounded staleness (revalidate: 30s) is a deliberate safety net, not a
 * cerotto: some mutations that affect these counts cannot call
 * revalidateTag at all (markConversationReadAction runs inside Next's
 * after() during a Server Component render — revalidateTag/revalidatePath
 * are only documented for Server Functions and Route Handlers) or run in a
 * different Next.js deployment entirely (apps/admin approving a request
 * triggers CompanyNotification creation in packages/domain, but admin and
 * web are separate Next.js apps with separate, unshared Data Caches — admin
 * cannot invalidate web's cache without a remote endpoint, which would be
 * disproportionate complexity for a sidebar badge). For those paths, the
 * 30s TTL bounds the staleness instead of leaving it unbounded or building
 * a cross-app invalidation mechanism.
 */
const SHELL_COUNTS_REVALIDATE_SECONDS = 30

export function shellCountsTag(companyId: string): string {
  return `shell-counts:${companyId}`
}

export function getAreaImpresaShellCountsCached(
  actor: CompanyActor,
): Promise<AreaImpresaShellCounts> {
  return unstable_cache(
    () => getAreaImpresaShellCounts(actor),
    [`area-impresa-shell-counts:${actor.company.id}:${actor.user.id}`],
    {
      tags: [shellCountsTag(actor.company.id)],
      revalidate: SHELL_COUNTS_REVALIDATE_SECONDS,
    },
  )()
}
