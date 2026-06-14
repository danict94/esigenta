import { prisma } from "@esigenta/database"

export type MarkCreditOrderCheckoutTerminalData = {
  orderId: string
  updated: boolean
}

export type MarkCreditOrderCheckoutTerminalResult =
  | { ok: true; data: MarkCreditOrderCheckoutTerminalData }
  | { ok: false; code: string; message: string }

async function markPendingCreditOrderStatus(
  creditOrderId: string,
  status: "FAILED" | "CANCELLED",
): Promise<MarkCreditOrderCheckoutTerminalResult> {
  const normalized = creditOrderId.trim()
  if (!normalized) {
    return { ok: false, code: "invalid_credit_order_id", message: "Ordine crediti non valido." }
  }

  if (status === "FAILED") {
    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
      UPDATE "CreditOrder" SET "status" = 'FAILED', "updatedAt" = now()
      WHERE "id" = ${normalized} AND "status" = 'PENDING'
      RETURNING "id"
    `
    return { ok: true, data: { orderId: normalized, updated: rows.length > 0 } }
  }

  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    UPDATE "CreditOrder" SET "status" = 'CANCELLED', "updatedAt" = now()
    WHERE "id" = ${normalized} AND "status" = 'PENDING'
    RETURNING "id"
  `
  return { ok: true, data: { orderId: normalized, updated: rows.length > 0 } }
}

export async function markCreditOrderCheckoutFailed(input: {
  creditOrderId: string
}): Promise<MarkCreditOrderCheckoutTerminalResult> {
  return markPendingCreditOrderStatus(input.creditOrderId, "FAILED")
}

export async function markCreditOrderCheckoutCancelled(input: {
  creditOrderId: string
}): Promise<MarkCreditOrderCheckoutTerminalResult> {
  return markPendingCreditOrderStatus(input.creditOrderId, "CANCELLED")
}
