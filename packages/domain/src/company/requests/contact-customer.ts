import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

// ─── Types ────────────────────────────────────────────────────────────────────

type PerfRecorder = (operation: string, durationMs: number) => void

export type ContactCustomerForRequestResult =
  | {
      ok: true
      conversationId: string
      created: boolean
    }
  | {
      ok: false
      code:
        | "request_unlock_not_found"
        | "request_unlock_not_valid"
        | "customer_not_found"
      message: string
    }

// ─── Perf helper ─────────────────────────────────────────────────────────────

async function measureAsync<T>(
  operation: string,
  recordPerf: PerfRecorder | undefined,
  task: () => Promise<T>,
): Promise<T> {
  if (!recordPerf) return task()
  const start = performance.now()
  try {
    return await task()
  } finally {
    recordPerf(operation, Math.round(performance.now() - start))
  }
}

// ─── Command ─────────────────────────────────────────────────────────────────

export async function contactCustomerForRequest(
  actor: CompanyActor,
  requestId: string,
  recordPerf?: PerfRecorder,
): Promise<ContactCustomerForRequestResult> {
  const companyId = actor.company.id
  const trimmedRequestId = requestId.trim()

  if (!trimmedRequestId) {
    return {
      ok: false,
      code: "request_unlock_not_found",
      message: "La richiesta non risulta sbloccata da questa impresa.",
    }
  }

  return prisma.$transaction(async (tx) => {
    // Single query: lock RequestUnlock row (FOR UPDATE prevents simultaneous
    // double-click race) + resolve customerId + check for existing conversation.
    // Reduces the common "existing conversation" path from 2 serial round trips to 1.
    const rows = await measureAsync(
      "contact-lookup",
      recordPerf,
      () =>
        tx.$queryRaw<
          Array<{
            unlockId: string
            refundedAt: Date | null
            customerId: string | null
            existingConversationId: string | null
          }>
        >`
          SELECT
            ru."id"          AS "unlockId",
            ru."refundedAt"  AS "refundedAt",
            r."customerId"   AS "customerId",
            (
              SELECT c."id"
              FROM "Conversation" c
              WHERE c."requestId" = ${trimmedRequestId}
                AND c."type"      = 'COMPANY_CUSTOMER'
                AND EXISTS (
                  SELECT 1 FROM "ConversationParticipant" cp1
                  WHERE cp1."conversationId" = c."id"
                    AND cp1."actorType"      = 'COMPANY'
                    AND cp1."companyId"      = ${companyId}
                )
                AND EXISTS (
                  SELECT 1 FROM "ConversationParticipant" cp2
                  WHERE cp2."conversationId" = c."id"
                    AND cp2."actorType"      = 'CUSTOMER'
                    AND cp2."customerId"     = r."customerId"
                )
              LIMIT 1
            ) AS "existingConversationId"
          FROM "RequestUnlock" ru
          JOIN "Request" r ON r."id" = ru."requestId"
          WHERE ru."requestId" = ${trimmedRequestId}
            AND ru."companyId" = ${companyId}
          FOR UPDATE OF ru
        `,
    )

    const row = rows[0] ?? null

    if (!row) {
      return {
        ok: false,
        code: "request_unlock_not_found",
        message: "La richiesta non risulta sbloccata da questa impresa.",
      }
    }

    if (row.refundedAt) {
      return {
        ok: false,
        code: "request_unlock_not_valid",
        message: "Lo sblocco di questa richiesta non è più valido.",
      }
    }

    if (!row.customerId) {
      return {
        ok: false,
        code: "customer_not_found",
        message: "Cliente non disponibile per questo canale messaggi.",
      }
    }

    if (row.existingConversationId) {
      recordPerf?.("contact-conversation-create", 0)
      return {
        ok: true,
        conversationId: row.existingConversationId,
        created: false,
      }
    }

    // Capture narrowed value before entering the closure
    const customerId = row.customerId

    const conversation = await measureAsync(
      "contact-conversation-create",
      recordPerf,
      () =>
        tx.conversation.create({
          data: {
            type: "COMPANY_CUSTOMER",
            requestId: trimmedRequestId,
            requestUnlockId: row.unlockId,
            participants: {
              create: [
                { actorType: "COMPANY", companyId },
                { actorType: "CUSTOMER", customerId },
              ],
            },
          },
          select: { id: true },
        }),
    )

    return {
      ok: true,
      conversationId: conversation.id,
      created: true,
    }
  })
}
