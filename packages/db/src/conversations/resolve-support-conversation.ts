import {
  getAdminProfileForUser,
} from "../identity"
import {
  prisma,
} from "../prisma/client"

import {
  ensureSupportAdminParticipant,
} from "./support-admin-participants"
import type {
  ResolveSupportConversationInput,
  ResolveSupportConversationResult,
} from "./types"

function normalizeRequiredText(
  value: string,
): string | null {
  const normalized =
    value.trim()

  return normalized
    ? normalized
    : null
}

export async function resolveSupportConversation({
  conversationId,
  userId,
  now = new Date(),
}: ResolveSupportConversationInput): Promise<ResolveSupportConversationResult> {
  const normalizedConversationId =
    normalizeRequiredText(conversationId)
  const normalizedUserId =
    normalizeRequiredText(userId)

  if (!normalizedConversationId) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  if (!normalizedUserId) {
    return {
      ok: false,
      code: "invalid_user_id",
      message: "Utente non valido.",
    }
  }

  const adminProfile =
    await getAdminProfileForUser(
      normalizedUserId,
    )

  if (!adminProfile) {
    return {
      ok: false,
      code: "unauthorized",
      message:
        "Non hai i permessi admin.",
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
      },
    })

  if (!conversation) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  if (conversation.type !== "SUPPORT") {
    return {
      ok: false,
      code: "invalid_conversation",
      message:
        "Solo i canali di assistenza possono essere chiusi.",
    }
  }

  await ensureSupportAdminParticipant({
    conversationId:
      normalizedConversationId,
    userId: normalizedUserId,
  })

  await prisma.conversation.update({
    where: {
      id: normalizedConversationId,
    },
    data: {
      isResolved: true,
      resolvedAt: now,
      resolvedBy: {
        connect: {
          id: normalizedUserId,
        },
      },
      updatedAt: now,
    },
    select: {
      id: true,
    },
  })

  return {
    ok: true,
    conversationId:
      normalizedConversationId,
    resolvedAt: now,
    resolvedById:
      normalizedUserId,
  }
}
