import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"
import { debitCompanyCreditsInTransaction } from "@esigenta/billing"
import { ensureCompanyCustomerConversationForUnlock } from "../../internal/conversation"

type PerfRecorder = (label: string, ms: number) => void

export type UnlockCompanyRequestErrorCode =
  | "company_not_approved"
  | "invalid_request_id"
  | "request_not_found"
  | "request_not_available"
  | "request_not_commercially_configured"
  | "customer_not_found"
  | "request_unlock_limit_reached"
  | "request_already_unlocked"
  | "insufficient_credits"
  | "request_unlock_not_found"
  | "request_unlock_not_valid"
  | "conversation_error"

export type UnlockCompanyRequestResult =
  | {
      ok: true
      data: {
        requestUnlockId: string
        creditTransactionId: string
        balanceAfter: number
        unlockCount: number
        maxUnlocks: number
        conversationId: string
        customerConversationAccessToken: string
        customerConversationAccessTokenExpiresAt: Date
      }
    }
  | { ok: false; code: UnlockCompanyRequestErrorCode; message: string }

type RequestRow = {
  id: string | null
  status: string | null
  credit_cost: number | null
  max_unlocks: number | null
  unlock_count: number | null
  customer_id: string | null
  customer_email: string | null
  existing_unlock_id: string | null
}

const UNLOCKABLE_STATUSES = ["APPROVED", "PUBLISHED"]

export async function unlockCompanyRequest(
  actor: CompanyActor,
  requestId: string,
  recordPerf?: PerfRecorder,
): Promise<UnlockCompanyRequestResult> {
  if (actor.company.status !== "APPROVED") {
    return {
      ok: false,
      code: "company_not_approved",
      message: "Il profilo impresa deve essere approvato per sbloccare richieste.",
    }
  }

  const normalizedRequestId = requestId.trim()
  if (!normalizedRequestId) {
    return { ok: false, code: "invalid_request_id", message: "Richiesta non valida." }
  }

  const t0 = performance.now()
  const now = new Date()

  return prisma.$transaction(async (tx) => {
    // Lock request row + read data + check existing unlock in one query
    const rows = await tx.$queryRaw<Array<RequestRow>>`
      SELECT
        r."id",
        r."status",
        r."creditCost"         AS credit_cost,
        r."maxUnlocks"         AS max_unlocks,
        r."unlockCount"        AS unlock_count,
        r."customerId"         AS customer_id,
        r."customerEmail"      AS customer_email,
        (
          SELECT ru."id"
          FROM "RequestUnlock" ru
          WHERE ru."requestId" = r."id"
            AND ru."companyId" = ${actor.company.id}
          LIMIT 1
        ) AS existing_unlock_id
      FROM "Request" r
      WHERE r."id" = ${normalizedRequestId}
      FOR UPDATE
    `

    const req = rows[0]

    if (!req?.id) {
      return { ok: false, code: "request_not_found", message: "Richiesta non trovata." }
    }

    if (!req.status || !UNLOCKABLE_STATUSES.includes(req.status)) {
      return {
        ok: false,
        code: "request_not_available",
        message: "Questa richiesta non è disponibile per lo sblocco.",
      }
    }

    const creditCost = Number(req.credit_cost)
    const maxUnlocks = Number(req.max_unlocks)
    const unlockCount = Number(req.unlock_count)

    if (!Number.isInteger(creditCost) || creditCost < 1 || !Number.isInteger(maxUnlocks) || maxUnlocks < 1) {
      return {
        ok: false,
        code: "request_not_commercially_configured",
        message: "Questa richiesta non è ancora pronta per lo sblocco.",
      }
    }

    if (!req.customer_id) {
      return {
        ok: false,
        code: "customer_not_found",
        message: "Cliente non disponibile per questo canale messaggi.",
      }
    }

    if (unlockCount >= maxUnlocks) {
      return {
        ok: false,
        code: "request_unlock_limit_reached",
        message: "Il limite di imprese per questa richiesta è stato raggiunto.",
      }
    }

    if (req.existing_unlock_id) {
      return { ok: false, code: "request_already_unlocked", message: "Hai già sbloccato questa richiesta." }
    }

    const debitResult = await debitCompanyCreditsInTransaction(tx, {
      companyId: actor.company.id,
      amount: creditCost,
      requestId: normalizedRequestId,
      idempotencyKey: `request-unlock:${normalizedRequestId}:${actor.company.id}`,
      reason: "Sblocco richiesta",
      now,
    })

    if (!debitResult.ok) {
      return {
        ok: false,
        code: debitResult.code as UnlockCompanyRequestErrorCode,
        message: debitResult.message,
      }
    }

    const unlockRows = await tx.$queryRaw<Array<{ id: string }>>`
      INSERT INTO "RequestUnlock" ("id", "requestId", "companyId", "creditCost", "creditTransactionId", "createdAt")
      VALUES (gen_random_uuid()::text, ${normalizedRequestId}, ${actor.company.id}, ${creditCost}, ${debitResult.data.transactionId}, now())
      RETURNING "id"
    `

    const requestUnlockId = unlockRows[0]!.id

    await tx.$executeRaw`
      UPDATE "Request"
      SET "unlockCount" = "unlockCount" + 1, "updatedAt" = now()
      WHERE "id" = ${normalizedRequestId}
    `

    const conversationResult = await ensureCompanyCustomerConversationForUnlock({
      tx,
      requestUnlockId,
      now,
    })

    recordPerf?.("unlock-request", Math.round(performance.now() - t0))

    if (!conversationResult.ok) {
      return {
        ok: false,
        code: "conversation_error",
        message: conversationResult.message,
      }
    }

    return {
      ok: true,
      data: {
        requestUnlockId,
        creditTransactionId: debitResult.data.transactionId,
        balanceAfter: debitResult.data.balanceAfter,
        unlockCount: unlockCount + 1,
        maxUnlocks,
        conversationId: conversationResult.conversationId,
        customerConversationAccessToken: conversationResult.customerConversationAccessToken,
        customerConversationAccessTokenExpiresAt: conversationResult.customerConversationAccessTokenExpiresAt,
      },
    }
  })
}
