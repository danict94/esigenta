import {
  randomBytes,
} from "node:crypto"

import {
  hashVerificationToken,
} from "../../requests/verification-token"

import type {
  EnsureCompanyCustomerConversationForUnlockInput,
  EnsureCompanyCustomerConversationForUnlockResult,
} from "../types"

function createRawCustomerToken({
  conversationId,
}: {
  conversationId: string
}): string {
  return [
    conversationId,
    randomBytes(32).toString("hex"),
  ].join(".")
}

function createDefaultExpiresAt(
  now: Date,
): Date {
  return new Date(
    now.getTime() + 1000 * 60 * 60 * 24 * 7,
  )
}

export async function ensureCompanyCustomerConversationForUnlock({
  tx,
  requestUnlockId,
  now = new Date(),
}: EnsureCompanyCustomerConversationForUnlockInput): Promise<EnsureCompanyCustomerConversationForUnlockResult> {
  await tx.$queryRaw<Array<{ id: string }>>`
    SELECT "id"
    FROM "RequestUnlock"
    WHERE "id" = ${requestUnlockId}
    FOR UPDATE
  `

  const requestUnlock =
    await tx.requestUnlock.findUnique({
      where: {
        id: requestUnlockId,
      },
      select: {
        id: true,
        requestId: true,
        companyId: true,
        refundedAt: true,
        request: {
          select: {
            customerId: true,
            customerEmail: true,
            customer: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    })

  if (!requestUnlock) {
    return {
      ok: false,
      code: "request_unlock_not_found",
      message:
        "La richiesta non risulta sbloccata.",
    }
  }

  if (requestUnlock.refundedAt) {
    return {
      ok: false,
      code: "request_unlock_not_valid",
      message:
        "Lo sblocco di questa richiesta non e piu valido.",
    }
  }

  const customerId =
    requestUnlock.request.customerId
  const customerEmail =
    requestUnlock.request.customer?.email ??
    requestUnlock.request.customerEmail

  if (!customerId || !customerEmail) {
    return {
      ok: false,
      code: "customer_not_found",
      message:
        "Cliente non disponibile per questo canale messaggi.",
    }
  }

  const existingConversation =
    await tx.conversation.findFirst({
      where: {
        type: "COMPANY_CUSTOMER",
        requestId:
          requestUnlock.requestId,
        AND: [
          {
            participants: {
              some: {
                actorType: "COMPANY",
                companyId:
                  requestUnlock.companyId,
              },
            },
          },
          {
            participants: {
              some: {
                actorType: "CUSTOMER",
                customerId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    })

  const conversation =
    existingConversation ??
    (await tx.conversation.create({
      data: {
        type: "COMPANY_CUSTOMER",
        request: {
          connect: {
            id: requestUnlock.requestId,
          },
        },
        requestUnlock: {
          connect: {
            id: requestUnlock.id,
          },
        },
        participants: {
          create: [
            {
              actorType: "COMPANY",
              company: {
                connect: {
                  id:
                    requestUnlock.companyId,
                },
              },
            },
            {
              actorType: "CUSTOMER",
              customer: {
                connect: {
                  id: customerId,
                },
              },
            },
          ],
        },
      },
      select: {
        id: true,
      },
    }))

  const token =
    createRawCustomerToken({
      conversationId: conversation.id,
    })
  const tokenHash =
    hashVerificationToken(token)
  const expiresAt =
    createDefaultExpiresAt(now)
  const accessToken =
    await tx.customerAccessToken.create({
      data: {
        tokenHash,
        purpose: "CONVERSATION_ACCESS",
        email: customerEmail,
        requestId:
          requestUnlock.requestId,
        expiresAt,
      },
      select: {
        id: true,
        expiresAt: true,
      },
    })

  return {
    ok: true,
    conversationId: conversation.id,
    requestId: requestUnlock.requestId,
    requestUnlockId: requestUnlock.id,
    companyId: requestUnlock.companyId,
    customerId,
    customerConversationAccessToken:
      token,
    customerConversationAccessTokenId:
      accessToken.id,
    customerConversationAccessTokenExpiresAt:
      accessToken.expiresAt,
    created: !existingConversation,
  }
}
