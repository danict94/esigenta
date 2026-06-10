import {
  randomBytes,
} from "node:crypto"

import {
  getAdminProfileForUser,
  getCompanyActorForUser,
} from "../../identity"
import {
  prisma,
} from "../../prisma/client"
import {
  hashVerificationToken,
} from "../../requests/verification-token"

import type {
  CreateCustomerConversationTokenInput,
  CreateCustomerConversationTokenResult,
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

function normalizeRequiredText(
  value: string,
): string | null {
  const normalized =
    value.trim()

  return normalized
    ? normalized
    : null
}

async function canRequesterIssueToken({
  requestedBy,
  companyId,
}: {
  requestedBy: CreateCustomerConversationTokenInput["requestedBy"]
  companyId: string | null
}): Promise<boolean> {
  if (requestedBy.actorType === "ADMIN") {
    const adminProfile =
      await getAdminProfileForUser(
        requestedBy.userId,
      )

    return Boolean(adminProfile)
  }

  if (!companyId) {
    return false
  }

  const actor =
    await getCompanyActorForUser({
      userId: requestedBy.userId,
      companyId: requestedBy.companyId,
    })

  return Boolean(
    actor &&
      requestedBy.companyId === companyId,
  )
}

export async function createCustomerConversationToken({
  conversationId,
  requestedBy,
  expiresAt,
  now = new Date(),
}: CreateCustomerConversationTokenInput): Promise<CreateCustomerConversationTokenResult> {
  const normalizedConversationId =
    normalizeRequiredText(conversationId)

  if (!normalizedConversationId) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  const effectiveExpiresAt =
    expiresAt ?? createDefaultExpiresAt(now)

  if (effectiveExpiresAt <= now) {
    return {
      ok: false,
      code: "invalid_expiration",
      message:
        "La scadenza del token deve essere futura.",
    }
  }

  const conversation =
    await prisma.conversation.findUnique({
      where: {
        id: normalizedConversationId,
      },
      select: {
        id: true,
        type: true,
        requestId: true,
        requestUnlock: {
          select: {
            companyId: true,
            refundedAt: true,
          },
        },
        participants: {
          select: {
            actorType: true,
            companyId: true,
            customerId: true,
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

  if (!conversation) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  if (!conversation.requestId) {
    return {
      ok: false,
      code: "invalid_conversation",
      message:
        "Il canale messaggi non e collegato a una richiesta.",
    }
  }

  if (
    conversation.type ===
      "COMPANY_CUSTOMER" &&
    (!conversation.requestUnlock ||
      conversation.requestUnlock.refundedAt)
  ) {
    return {
      ok: false,
      code: "request_unlock_not_valid",
      message:
        "Lo sblocco di questa richiesta non e piu valido.",
    }
  }

  const companyId =
    conversation.participants.find(
      (participant) =>
        participant.actorType ===
        "COMPANY",
    )?.companyId ??
    conversation.requestUnlock?.companyId ??
    null

  const requesterCanIssueToken =
    await canRequesterIssueToken({
      requestedBy,
      companyId,
    })

  if (!requesterCanIssueToken) {
    return {
      ok: false,
      code: "unauthorized",
      message:
        "Non hai i permessi per generare questo link.",
    }
  }

  const customerParticipant =
    conversation.participants.find(
      (participant) =>
        participant.actorType ===
          "CUSTOMER" &&
        participant.customerId &&
        participant.customer,
    )

  if (
    !customerParticipant?.customerId ||
    !customerParticipant.customer
  ) {
    return {
      ok: false,
      code: "customer_not_found",
      message:
        "Cliente non disponibile per questo canale messaggi.",
    }
  }

  const token =
    createRawCustomerToken({
      conversationId: conversation.id,
    })
  const tokenHash =
    hashVerificationToken(token)

  const accessToken =
    await prisma.customerAccessToken.create({
      data: {
        tokenHash,
        purpose: "CONVERSATION_ACCESS",
        email:
          customerParticipant.customer.email,
        requestId:
          conversation.requestId,
        expiresAt:
          effectiveExpiresAt,
      },
      select: {
        id: true,
        expiresAt: true,
      },
    })

  return {
    ok: true,
    token,
    tokenId: accessToken.id,
    conversationId: conversation.id,
    requestId: conversation.requestId,
    customerId:
      customerParticipant.customerId,
    expiresAt: accessToken.expiresAt,
  }
}
