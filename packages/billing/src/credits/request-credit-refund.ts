import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"
import { Prisma } from "@prisma/client"

type PerfRecorder = (label: string, ms: number) => void

type RefundReason =
  | "CUSTOMER_NOT_RESPONDING"
  | "INVALID_CONTACTS"
  | "REQUEST_ALREADY_RESOLVED"
  | "INVALID_OR_SPAM_REQUEST"
  | "DUPLICATE_REQUEST"
  | "OTHER"

const VALID_REFUND_REASONS: readonly RefundReason[] = [
  "CUSTOMER_NOT_RESPONDING",
  "INVALID_CONTACTS",
  "REQUEST_ALREADY_RESOLVED",
  "INVALID_OR_SPAM_REQUEST",
  "DUPLICATE_REQUEST",
  "OTHER",
]

function isRefundReason(value: string): value is RefundReason {
  return VALID_REFUND_REASONS.includes(value as RefundReason)
}

export type RequestCreditRefundInput = {
  requestUnlockId: string
  reason: string
  description: string
  companyContactAttempted?: boolean
  lastContactAttemptAt?: Date | null
}

export type RequestCreditRefundErrorCode =
  | "invalid_request_unlock_id"
  | "invalid_refund_reason"
  | "invalid_refund_description"
  | "request_unlock_not_found"
  | "request_unlock_not_owned"
  | "request_unlock_already_refunded"
  | "credit_refund_request_already_exists"

export type RequestCreditRefundResult =
  | { ok: true; data: { refundRequestId: string } }
  | { ok: false; code: RequestCreditRefundErrorCode; message: string }

export async function requestCompanyCreditRefund(
  actor: CompanyActor,
  input: RequestCreditRefundInput,
  recordPerf?: PerfRecorder,
): Promise<RequestCreditRefundResult> {
  const normalizedUnlockId = input.requestUnlockId.trim()
  if (!normalizedUnlockId) {
    return { ok: false, code: "invalid_request_unlock_id", message: "Sblocco richiesta non valido." }
  }

  const normalizedReason = input.reason.trim()
  if (!normalizedReason || !isRefundReason(normalizedReason)) {
    return { ok: false, code: "invalid_refund_reason", message: "Motivo rimborso non valido." }
  }

  const normalizedDescription = input.description.trim()
  if (!normalizedDescription || normalizedDescription.length < 20) {
    return {
      ok: false,
      code: "invalid_refund_description",
      message: "Descrivi il motivo della richiesta rimborso con almeno 20 caratteri.",
    }
  }

  const t0 = performance.now()

  // Single read: unlock ownership + refund state + existing refund request
  const rows = await prisma.$queryRaw<
    Array<{
      unlock_id: string | null
      unlock_company_id: string | null
      refunded_at: Date | null
      refund_transaction_id: string | null
      existing_refund_id: string | null
      request_id: string | null
      credit_transaction_id: string | null
    }>
  >`
    SELECT
      ru."id"                    AS unlock_id,
      ru."companyId"             AS unlock_company_id,
      ru."refundedAt"            AS refunded_at,
      ru."refundTransactionId"   AS refund_transaction_id,
      ru."requestId"             AS request_id,
      ru."creditTransactionId"   AS credit_transaction_id,
      (SELECT "id" FROM "CreditRefundRequest" WHERE "requestUnlockId" = ru."id" LIMIT 1) AS existing_refund_id
    FROM "RequestUnlock" ru
    WHERE ru."id" = ${normalizedUnlockId}
  `

  const row = rows[0]

  if (!row?.unlock_id) {
    recordPerf?.("credit-refund", Math.round(performance.now() - t0))
    return { ok: false, code: "request_unlock_not_found", message: "Sblocco richiesta non trovato." }
  }

  if (row.unlock_company_id !== actor.company.id) {
    recordPerf?.("credit-refund", Math.round(performance.now() - t0))
    return { ok: false, code: "request_unlock_not_owned", message: "Non puoi richiedere il rimborso per questo sblocco." }
  }

  if (row.refunded_at || row.refund_transaction_id) {
    recordPerf?.("credit-refund", Math.round(performance.now() - t0))
    return { ok: false, code: "request_unlock_already_refunded", message: "I crediti di questo sblocco risultano già rimborsati." }
  }

  if (row.existing_refund_id) {
    recordPerf?.("credit-refund", Math.round(performance.now() - t0))
    return { ok: false, code: "credit_refund_request_already_exists", message: "Esiste già una richiesta rimborso per questo sblocco." }
  }

  try {
    const insertRows = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO "CreditRefundRequest" (
        "id", "requestUnlockId", "requestId", "companyId", "creditTransactionId",
        "status", "reason", "description", "companyContactAttempted", "lastContactAttemptAt",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${normalizedUnlockId},
        ${row.request_id},
        ${actor.company.id},
        ${row.credit_transaction_id},
        'PENDING_REVIEW'::"CreditRefundRequestStatus",
        ${normalizedReason}::"CreditRefundRequestReason",
        ${normalizedDescription},
        ${input.companyContactAttempted ?? false},
        ${input.lastContactAttemptAt ?? null},
        now(), now()
      )
      RETURNING "id"
    `

    recordPerf?.("credit-refund", Math.round(performance.now() - t0))

    return { ok: true, data: { refundRequestId: insertRows[0]!.id } }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      recordPerf?.("credit-refund", Math.round(performance.now() - t0))
      return {
        ok: false,
        code: "credit_refund_request_already_exists",
        message: "Esiste già una richiesta rimborso per questo sblocco.",
      }
    }
    throw error
  }
}
