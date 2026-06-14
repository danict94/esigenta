import {
  prisma,
} from "@esigenta/database"
import { normalizeRequiredText } from "@esigenta/shared"

import {
  hashVerificationToken,
} from "../../internal/request/verification-token"
import type {
  ResolveCustomerConversationAccessByTokenInput,
  ResolveCustomerConversationAccessByTokenResult,
  ResolveCustomerConversationAccessInput,
  ResolveCustomerConversationAccessResult,
} from "../../internal/conversation/types"

function readConversationIdFromToken(
  token: string,
): string | null {
  const [conversationId, secret] =
    token.split(".", 2)

  if (!conversationId || !secret) {
    return null
  }

  return conversationId
}

export async function resolveCustomerConversationAccess({
  conversationId,
  token,
  now = new Date(),
}: ResolveCustomerConversationAccessInput): Promise<ResolveCustomerConversationAccessResult> {
  const normalizedConversationId =
    normalizeRequiredText(conversationId)
  const normalizedToken =
    normalizeRequiredText(token)

  if (!normalizedConversationId) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  if (!normalizedToken) {
    return {
      ok: false,
      code: "invalid_token",
      message:
        "Il link non e valido o e scaduto.",
    }
  }

  const tokenConversationId =
    readConversationIdFromToken(
      normalizedToken,
    )

  if (
    tokenConversationId &&
    tokenConversationId !==
      normalizedConversationId
  ) {
    return {
      ok: false,
      code: "unauthorized",
      message:
        "Il link non autorizza questo canale messaggi.",
    }
  }

  const accessToken =
    await prisma.customerAccessToken.findUnique({
      where: {
        tokenHash:
          hashVerificationToken(
            normalizedToken,
          ),
      },
      select: {
        id: true,
        purpose: true,
        email: true,
        requestId: true,
        expiresAt: true,
        usedAt: true,
      },
    })

  if (
    !accessToken ||
    accessToken.purpose !==
      "CONVERSATION_ACCESS"
  ) {
    return {
      ok: false,
      code: "invalid_token",
      message:
        "Il link non e valido o e scaduto.",
    }
  }

  if (accessToken.usedAt) {
    return {
      ok: false,
      code: "token_revoked",
      message:
        "Questo link di accesso non e piu valido.",
    }
  }

  if (accessToken.expiresAt <= now) {
    return {
      ok: false,
      code: "token_expired",
      message:
        "Questo link di accesso e scaduto.",
    }
  }

  if (!accessToken.requestId) {
    return {
      ok: false,
      code: "invalid_token",
      message:
        "Il link non e valido per questo canale messaggi.",
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
            refundedAt: true,
          },
        },
        request: {
          select: {
            customerEmail: true,
          },
        },
        participants: {
          where: {
            actorType: "CUSTOMER",
          },
          select: {
            id: true,
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

  if (
    conversation.requestId !==
    accessToken.requestId
  ) {
    return {
      ok: false,
      code: "unauthorized",
      message:
        "Il link non autorizza questo canale messaggi.",
    }
  }

  const participant =
    conversation.participants.find(
      (item) =>
        item.customer?.email ===
        accessToken.email,
    )

  if (
    !participant?.customerId ||
    conversation.request?.customerEmail !==
      accessToken.email
  ) {
    return {
      ok: false,
      code: "unauthorized",
      message:
        "Il link non autorizza questo canale messaggi.",
    }
  }

  return {
    ok: true,
    tokenId: accessToken.id,
    conversationId: conversation.id,
    requestId: accessToken.requestId,
    customerId: participant.customerId,
    customerParticipantId:
      participant.id,
    email: accessToken.email,
    expiresAt: accessToken.expiresAt,
  }
}

export async function resolveCustomerConversationAccessByToken({
  token,
  now = new Date(),
}: ResolveCustomerConversationAccessByTokenInput): Promise<ResolveCustomerConversationAccessByTokenResult> {
  const normalizedToken =
    normalizeRequiredText(token)

  if (!normalizedToken) {
    return {
      ok: false,
      code: "invalid_token",
      message:
        "Il link non e valido o e scaduto.",
    }
  }

  const conversationId =
    readConversationIdFromToken(
      normalizedToken,
    )

  if (!conversationId) {
    return {
      ok: false,
      code: "invalid_token",
      message:
        "Il link non e valido o e scaduto.",
    }
  }

  return resolveCustomerConversationAccess({
    conversationId,
    token: normalizedToken,
    now,
  })
}
