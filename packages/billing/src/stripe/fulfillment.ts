import { prisma } from "@esigenta/database"
import { markCreditCheckoutCreated } from "../checkout/checkout-order"
import { logStripeDebug } from "./stripe-config"

export type FulfillCreditOrderInput = {
  checkoutSessionId: string
  clientReferenceId?: string | null
  paymentIntentId?: string | null
  paymentStatus?: string | null
  metadata?: Record<string, string | null | undefined> | null
  providerEventId?: string | null
  eventType?: string | null
  now?: Date
}

export type FulfillCreditOrderData = {
  creditOrderId: string
  companyId: string
  orderStatus: string
  paymentStatus: string | null
  fulfilled: boolean
  alreadyFulfilled: boolean
  checkoutUpdateOk: boolean | null
  grantCreditsOk: boolean | null
  reconciled: boolean
  transactionId: string | null
  balanceAfter: number | null
  expiresAtAfter: Date | null
  idempotencyKey: string
}

export type FulfillCreditOrderResult =
  | { ok: true; data: FulfillCreditOrderData }
  | { ok: false; code: string; message: string }

function getCreditOrderIdFromSession({
  clientReferenceId,
  metadata,
}: {
  clientReferenceId?: string | null | undefined
  metadata?: Record<string, string | null | undefined> | null | undefined
}): string | null {
  const fromMeta = metadata?.creditOrderId?.trim() || null
  if (fromMeta) return fromMeta
  return clientReferenceId?.trim() || null
}

type OrderSnapshot = {
  id: string
  company_id: string
  status: string
  credits: number
  package_validity_days: number | null
  tx_id: string | null
  tx_balance_after: number | null
  tx_expires_at_after: Date | null
}

async function getOrderFulfillmentSnapshot(creditOrderId: string): Promise<OrderSnapshot | null> {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string
      company_id: string
      status: string
      credits: bigint
      package_validity_days: number | null
      tx_id: string | null
      tx_balance_after: bigint | null
      tx_expires_at_after: Date | null
    }>
  >`
    SELECT
      co.id,
      co."companyId"       AS company_id,
      co.status::text,
      co.credits,
      cp."validityDays"    AS package_validity_days,
      tx.id                AS tx_id,
      tx."balanceAfter"    AS tx_balance_after,
      tx."expiresAtAfter"  AS tx_expires_at_after
    FROM "CreditOrder" co
    LEFT JOIN "CreditPackage" cp ON cp.id = co."packageId"
    LEFT JOIN "CompanyCreditTransaction" tx
      ON tx."creditOrderId" = co.id
      AND tx.type = 'PACKAGE_PURCHASE'
      AND tx.status = 'COMPLETED'
    WHERE co.id = ${creditOrderId}
    ORDER BY tx."createdAt" ASC NULLS LAST
    LIMIT 1
  `
  const row = rows[0]
  if (!row) return null
  return {
    id: row.id,
    company_id: row.company_id,
    status: row.status,
    credits: Number(row.credits),
    package_validity_days: row.package_validity_days,
    tx_id: row.tx_id,
    tx_balance_after: row.tx_balance_after !== null ? Number(row.tx_balance_after) : null,
    tx_expires_at_after: row.tx_expires_at_after,
  }
}

type TxRow = {
  id: string
  balance_after: bigint
  expires_at_after: Date | null
}

type AccountRow = {
  id: string
  balance: bigint
  expires_at: Date | null
}

type GrantResult =
  | { ok: true; data: { transactionId: string; balanceAfter: number; expiresAtAfter: Date } }
  | { ok: false; code: string; message: string }

async function grantCreditOrderFulfillment(
  creditOrderId: string,
  companyId: string,
  credits: number,
  validityDays: number,
  idempotencyKey: string,
  now: Date,
): Promise<GrantResult> {
  // Pre-check idempotency by key (outside tx, fast path)
  const existingByKey = await prisma.$queryRaw<Array<TxRow>>`
    SELECT id, "balanceAfter" AS balance_after, "expiresAtAfter" AS expires_at_after
    FROM "CompanyCreditTransaction"
    WHERE "idempotencyKey" = ${idempotencyKey}
    LIMIT 1
  `
  if (existingByKey[0]) {
    const r = existingByKey[0]
    return { ok: true, data: { transactionId: r.id, balanceAfter: Number(r.balance_after), expiresAtAfter: r.expires_at_after ?? now } }
  }

  // Pre-check by completed order transaction (outside tx)
  const existingByOrder = await prisma.$queryRaw<Array<TxRow>>`
    SELECT id, "balanceAfter" AS balance_after, "expiresAtAfter" AS expires_at_after
    FROM "CompanyCreditTransaction"
    WHERE "creditOrderId" = ${creditOrderId}
      AND type = 'PACKAGE_PURCHASE'
      AND status = 'COMPLETED'
    ORDER BY "createdAt" ASC
    LIMIT 1
  `
  if (existingByOrder[0]) {
    const r = existingByOrder[0]
    return { ok: true, data: { transactionId: r.id, balanceAfter: Number(r.balance_after), expiresAtAfter: r.expires_at_after ?? now } }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Re-check inside tx before acquiring lock
      const txByKey = await tx.$queryRaw<Array<TxRow>>`
        SELECT id, "balanceAfter" AS balance_after, "expiresAtAfter" AS expires_at_after
        FROM "CompanyCreditTransaction"
        WHERE "idempotencyKey" = ${idempotencyKey}
        LIMIT 1
      `
      if (txByKey[0]) {
        const r = txByKey[0]
        return { transactionId: r.id, balanceAfter: Number(r.balance_after), expiresAtAfter: r.expires_at_after ?? now }
      }

      const txByOrder = await tx.$queryRaw<Array<TxRow>>`
        SELECT id, "balanceAfter" AS balance_after, "expiresAtAfter" AS expires_at_after
        FROM "CompanyCreditTransaction"
        WHERE "creditOrderId" = ${creditOrderId}
          AND type = 'PACKAGE_PURCHASE'
          AND status = 'COMPLETED'
        ORDER BY "createdAt" ASC
        LIMIT 1
      `
      if (txByOrder[0]) {
        const r = txByOrder[0]
        return { transactionId: r.id, balanceAfter: Number(r.balance_after), expiresAtAfter: r.expires_at_after ?? now }
      }

      // Upsert + lock account
      await tx.$executeRaw`
        INSERT INTO "CompanyCreditAccount" ("id", "companyId", "balance", "expiresAt", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, ${companyId}, 0, NULL, now(), now())
        ON CONFLICT ("companyId") DO NOTHING
      `

      const accountRows = await tx.$queryRaw<Array<AccountRow>>`
        SELECT id, balance, "expiresAt" AS expires_at
        FROM "CompanyCreditAccount"
        WHERE "companyId" = ${companyId}
        FOR UPDATE
      `
      const account = accountRows[0]
      if (!account) throw new Error("Credit account lock failed.")

      // Expire stale account
      if (account.expires_at !== null && account.expires_at <= now) {
        const balance = Number(account.balance)
        if (balance > 0) {
          const expKey = `credit-expiration:${companyId}:${account.expires_at.toISOString()}`
          await tx.$executeRaw`
            INSERT INTO "CompanyCreditTransaction" (
              "id","companyId","accountId","type","status","amount","balanceBefore","balanceAfter",
              "expiresAtBefore","expiresAtAfter","idempotencyKey","reason","createdAt"
            ) VALUES (
              gen_random_uuid()::text,${companyId},${account.id},
              'CREDIT_EXPIRATION','COMPLETED',
              ${-balance},${balance},0,${account.expires_at},NULL,${expKey},'Scadenza crediti',now()
            )
            ON CONFLICT ("idempotencyKey") DO NOTHING
          `
        }
        await tx.$executeRaw`
          UPDATE "CompanyCreditAccount" SET "balance"=0,"expiresAt"=NULL,"updatedAt"=now()
          WHERE "id"=${account.id}
        `
        account.balance = 0n
        account.expires_at = null
      }

      // Re-check by order after acquiring lock
      const txAfterLock = await tx.$queryRaw<Array<TxRow>>`
        SELECT id, "balanceAfter" AS balance_after, "expiresAtAfter" AS expires_at_after
        FROM "CompanyCreditTransaction"
        WHERE "creditOrderId" = ${creditOrderId}
          AND type = 'PACKAGE_PURCHASE'
          AND status = 'COMPLETED'
        ORDER BY "createdAt" ASC
        LIMIT 1
      `
      if (txAfterLock[0]) {
        const r = txAfterLock[0]
        return { transactionId: r.id, balanceAfter: Number(r.balance_after), expiresAtAfter: r.expires_at_after ?? now }
      }

      const balanceBefore = Number(account.balance)
      const balanceAfter = balanceBefore + credits
      const expiresAtBefore = account.expires_at
      const expirationBase = expiresAtBefore && expiresAtBefore > now ? expiresAtBefore : now
      const expiresAtAfter = new Date(expirationBase.getTime() + validityDays * 24 * 60 * 60 * 1000)

      const newTxRows = await tx.$queryRaw<Array<{ id: string }>>`
        INSERT INTO "CompanyCreditTransaction" (
          "id","companyId","accountId","type","status","amount","balanceBefore","balanceAfter",
          "expiresAtBefore","expiresAtAfter","creditOrderId","idempotencyKey","createdAt"
        ) VALUES (
          gen_random_uuid()::text,${companyId},${account.id},
          'PACKAGE_PURCHASE','COMPLETED',
          ${credits},${balanceBefore},${balanceAfter},
          ${expiresAtBefore},${expiresAtAfter},${creditOrderId},${idempotencyKey},now()
        )
        RETURNING id
      `

      const txId = newTxRows[0]?.id
      if (!txId) throw new Error("Failed to create credit transaction.")

      await tx.$executeRaw`
        UPDATE "CompanyCreditAccount"
        SET "balance"=${balanceAfter},"expiresAt"=${expiresAtAfter},"updatedAt"=now()
        WHERE "id"=${account.id}
      `

      await tx.$executeRaw`
        UPDATE "CreditOrder"
        SET "status"='PAID',
            "paidAt"=COALESCE("paidAt",${now}),
            "validFrom"=${expirationBase},
            "validUntil"=${expiresAtAfter},
            "updatedAt"=now()
        WHERE "id"=${creditOrderId}
      `

      return { transactionId: txId, balanceAfter, expiresAtAfter }
    })

    return { ok: true, data: result }
  } catch {
    // Idempotency retry on concurrent unique constraint violation
    const retryByKey = await prisma.$queryRaw<Array<TxRow>>`
      SELECT id, "balanceAfter" AS balance_after, "expiresAtAfter" AS expires_at_after
      FROM "CompanyCreditTransaction"
      WHERE "idempotencyKey" = ${idempotencyKey}
      LIMIT 1
    `
    const retryRow =
      retryByKey[0] ??
      (
        await prisma.$queryRaw<Array<TxRow>>`
          SELECT id, "balanceAfter" AS balance_after, "expiresAtAfter" AS expires_at_after
          FROM "CompanyCreditTransaction"
          WHERE "creditOrderId" = ${creditOrderId}
            AND type = 'PACKAGE_PURCHASE'
            AND status = 'COMPLETED'
          ORDER BY "createdAt" ASC
          LIMIT 1
        `
      )[0]

    if (retryRow) {
      return {
        ok: true,
        data: {
          transactionId: retryRow.id,
          balanceAfter: Number(retryRow.balance_after),
          expiresAtAfter: retryRow.expires_at_after ?? now,
        },
      }
    }

    throw new Error("grantCreditOrderFulfillment: unexpected transaction failure")
  }
}

export async function fulfillCreditOrderFromStripeCheckoutSession({
  checkoutSessionId,
  clientReferenceId,
  paymentIntentId,
  paymentStatus,
  metadata,
  providerEventId,
  eventType,
  now = new Date(),
}: FulfillCreditOrderInput): Promise<FulfillCreditOrderResult> {
  const normalizedSessionId = checkoutSessionId.trim()
  const creditOrderId = getCreditOrderIdFromSession({ clientReferenceId, metadata })

  if (!normalizedSessionId) {
    return { ok: false, code: "invalid_checkout_session_id", message: "Sessione Stripe Checkout non valida." }
  }
  if (!creditOrderId) {
    return { ok: false, code: "missing_credit_order_id", message: "Ordine crediti mancante nella sessione Stripe." }
  }

  const idempotencyKey = `credit-order:${creditOrderId}:package-purchase`

  logStripeDebug("fulfillment.start", {
    checkoutSessionId: normalizedSessionId,
    creditOrderId,
    paymentIntentId: paymentIntentId ?? null,
    paymentStatus: paymentStatus ?? null,
    providerEventId: providerEventId ?? null,
    eventType: eventType ?? null,
    idempotencyKey,
  })

  const order = await getOrderFulfillmentSnapshot(creditOrderId)

  if (!order) {
    logStripeDebug("fulfillment.order_not_found", {
      checkoutSessionId: normalizedSessionId,
      creditOrderId,
      idempotencyKey,
      eventType: eventType ?? null,
    })
    return { ok: false, code: "credit_order_not_found", message: "Ordine crediti non trovato." }
  }

  // Already fulfilled — idempotent return
  if (order.tx_id) {
    return {
      ok: true,
      data: {
        creditOrderId: order.id,
        companyId: order.company_id,
        orderStatus: order.status,
        paymentStatus: paymentStatus ?? null,
        fulfilled: true,
        alreadyFulfilled: true,
        checkoutUpdateOk: null,
        grantCreditsOk: true,
        reconciled: false,
        transactionId: order.tx_id,
        balanceAfter: order.tx_balance_after,
        expiresAtAfter: order.tx_expires_at_after,
        idempotencyKey,
      },
    }
  }

  if (order.package_validity_days === null) {
    logStripeDebug("fulfillment.package_not_found", {
      checkoutSessionId: normalizedSessionId,
      creditOrderId: order.id,
      idempotencyKey,
      eventType: eventType ?? null,
    })
    return { ok: false, code: "credit_package_not_found", message: "Pacchetto crediti non trovato per questo ordine." }
  }

  if (paymentStatus !== "paid") {
    logStripeDebug("fulfillment.not_paid", {
      checkoutSessionId: normalizedSessionId,
      creditOrderId: order.id,
      companyId: order.company_id,
      orderStatus: order.status,
      paymentStatus: paymentStatus ?? null,
      idempotencyKey,
      eventType: eventType ?? null,
    })
    return {
      ok: true,
      data: {
        creditOrderId: order.id,
        companyId: order.company_id,
        orderStatus: order.status,
        paymentStatus: paymentStatus ?? null,
        fulfilled: false,
        alreadyFulfilled: false,
        checkoutUpdateOk: null,
        grantCreditsOk: false,
        reconciled: false,
        transactionId: null,
        balanceAfter: null,
        expiresAtAfter: null,
        idempotencyKey,
      },
    }
  }

  // Attach checkout session ID to order
  const attachResult = await markCreditCheckoutCreated({
    creditOrderId: order.id,
    providerCheckoutId: normalizedSessionId,
    providerPaymentIntentId: paymentIntentId ?? null,
  })

  if (!attachResult.ok) {
    logStripeDebug("fulfillment.checkout_update_failed", {
      checkoutSessionId: normalizedSessionId,
      creditOrderId: order.id,
      companyId: order.company_id,
      code: attachResult.code,
      checkoutUpdateOk: false,
      grantCreditsOk: null,
      idempotencyKey,
      eventType: eventType ?? null,
    })
    return attachResult
  }

  // Grant credits transactionally
  const grantResult = await grantCreditOrderFulfillment(
    order.id,
    order.company_id,
    order.credits,
    order.package_validity_days,
    idempotencyKey,
    now,
  )

  if (!grantResult.ok) {
    logStripeDebug("fulfillment.grant_failed", {
      checkoutSessionId: normalizedSessionId,
      creditOrderId: order.id,
      companyId: order.company_id,
      code: grantResult.code,
      checkoutUpdateOk: true,
      grantCreditsOk: false,
      idempotencyKey,
      eventType: eventType ?? null,
    })
    return grantResult
  }

  logStripeDebug("fulfillment.completed", {
    checkoutSessionId: normalizedSessionId,
    creditOrderId: order.id,
    companyId: order.company_id,
    orderStatus: "PAID",
    paymentStatus: paymentStatus ?? null,
    checkoutUpdateOk: true,
    grantCreditsOk: true,
    transactionId: grantResult.data.transactionId,
    idempotencyKey,
    eventType: eventType ?? null,
  })

  return {
    ok: true,
    data: {
      creditOrderId: order.id,
      companyId: order.company_id,
      orderStatus: "PAID",
      paymentStatus: paymentStatus ?? null,
      fulfilled: true,
      alreadyFulfilled: false,
      checkoutUpdateOk: true,
      grantCreditsOk: true,
      reconciled: true,
      transactionId: grantResult.data.transactionId,
      balanceAfter: grantResult.data.balanceAfter,
      expiresAtAfter: grantResult.data.expiresAtAfter,
      idempotencyKey,
    },
  }
}
