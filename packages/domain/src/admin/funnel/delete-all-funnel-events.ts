/**
 * Esigenta — Admin: hard-delete ALL FunnelEvent rows (FASE 9G)
 *
 * DESTRUCTIVE, IRREVERSIBLE — genuinely different from every other
 * "delete" already in this codebase. Every existing admin delete
 * (packages/domain/src/admin/requests/soft-delete-request.ts) is a SOFT
 * delete: it sets deletedAt/deletedByAdminUserId/deleteReason and never
 * removes a row. This function is a real, physical
 * `DELETE FROM "FunnelEvent"` — there is no undo, no trash, no restore
 * path. It exists ONLY to let an admin wipe funnel analytics telemetry
 * end-to-end; nothing else in this codebase should ever call it.
 *
 * SAFE BY CONSTRUCTION, not merely by care: FunnelEvent has no
 * `@relation` field of its own, and grepping schema.prisma confirms no
 * OTHER model references FunnelEvent either — no foreign key, no
 * onDelete cascade is even possible in either direction. A
 * `prisma.funnelEvent.deleteMany({})` can therefore never touch Request,
 * Customer, or any other row in this database — not because this
 * function is careful, but because the schema itself has no path from
 * FunnelEvent to anything else. See the FunnelEvent model comment in
 * schema.prisma (FASE 6B/6C: "deliberately NOT linked to Request").
 *
 * No WHERE clause of any kind, no soft-delete flag, no period/
 * intervention/provenance filter: an unconditional wipe of the entire
 * table, matching the admin UI's own confirmation copy verbatim
 * ("Verranno eliminati definitivamente tutti i dati di analisi del
 * funnel"). The admin panel's period/intervention/provenance filters
 * (packages/domain/src/admin/funnel/admin-funnel-metrics.ts) are a VIEW
 * concern only, unrelated to what this function deletes — deliberately
 * NOT threaded through here.
 *
 * Auth is NOT this function's job: the caller (the Server Action in
 * apps/admin/src/app/(protected)/funnel/page.tsx) must call requireAdmin()
 * BEFORE invoking this — same division of responsibility already used by
 * every other admin mutation in this app (see e.g. approveCompanyForMarketplace).
 * This function trusts its caller completely and performs no
 * authorization check of its own.
 */

import { prisma } from "@esigenta/database"

export type DeleteAllFunnelEventsInput = {
  /** Who triggered the wipe — logged only, never used for authorization here (see module comment: the caller already verified this before calling). */
  adminUserId: string
}

export type DeleteAllFunnelEventsResult =
  | { ok: true; deletedCount: number }
  | { ok: false; code: "delete_failed"; message: string }

export async function deleteAllFunnelEvents({
  adminUserId,
}: DeleteAllFunnelEventsInput): Promise<DeleteAllFunnelEventsResult> {
  try {
    const { count } = await prisma.funnelEvent.deleteMany({})

    // Single audit line, same minimal style as createRequestFromDraft's
    // one success log (packages/domain/src/public/requests/create-request.ts)
    // — no funnel session ids, no step data, nothing beyond what is needed
    // to answer "who wiped funnel analytics, when, how many rows".
    console.info("[deleteAllFunnelEvents] FunnelEvent table wiped", {
      adminUserId,
      deletedCount: count,
    })

    return { ok: true, deletedCount: count }
  } catch (error) {
    console.error("[deleteAllFunnelEvents] delete failed", {
      adminUserId,
      errorName: error instanceof Error ? error.name : "UnknownError",
    })

    return {
      ok: false,
      code: "delete_failed",
      message: "Non è stato possibile eliminare i dati del funnel. Riprova.",
    }
  }
}
