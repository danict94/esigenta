import {
  getAdminProfileForUser,
  getCompanyActorForUser,
} from "@esigenta/auth"
import {
  prisma,
} from "@esigenta/database"
import { normalizeRequiredText } from "@esigenta/shared"

import {
  resolveCustomerConversationAccess,
} from "../../customer/conversations/resolve-access"
import {
  ensureSupportAdminParticipant,
} from "./support-participants"
import type {
  CompanyActor,
  ConversationActor,
  SendConversationMessageInput,
  SendConversationMessageResult,
} from "./types"

function mapCustomerAccessFailure(
  result: Extract<
    Awaited<
      ReturnType<
        typeof resolveCustomerConversationAccess
      >
    >,
    { ok: false }
  >,
): SendConversationMessageResult {
  switch (result.code) {
    case "token_expired":
    case "token_revoked":
    case "invalid_token":
    case "unauthorized":
    case "conversation_not_found":
    case "request_unlock_not_valid":
      return {
        ok: false,
        code: result.code,
        message: result.message,
      }
  }

  return {
    ok: false,
    code: "invalid_sender",
    message: result.message,
  }
}

async function resolveSenderParticipantId({
  conversationId,
  sender,
  authorizedActor,
}: {
  conversationId: string
  sender: Exclude<
    ConversationActor,
    { actorType: "CUSTOMER" }
  >
  authorizedActor?: CompanyActor
}): Promise<
  | {
      ok: true
      participantId: string
    }
  | {
      ok: false
      code:
        | "conversation_not_found"
        | "invalid_sender"
        | "request_unlock_not_valid"
        | "unauthorized"
      message: string
    }
> {
  const conversation =
    await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      select: {
        id: true,
        type: true,
        requestUnlock: {
          select: {
            companyId: true,
            refundedAt: true,
          },
        },
        participants: {
          select: {
            id: true,
            actorType: true,
            userId: true,
            companyId: true,
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

  if (sender.actorType === "COMPANY") {
    // Skip DB re-auth when caller already verified the actor for this company/user.
    const actorAlreadyVerified =
      authorizedActor !== undefined &&
      authorizedActor.company.id === sender.companyId &&
      authorizedActor.user.id === sender.userId

    if (!actorAlreadyVerified) {
      const actor =
        await getCompanyActorForUser({
          userId: sender.userId,
          companyId: sender.companyId,
        })
      if (!actor) {
        return {
          ok: false,
          code: "unauthorized",
          message:
            "Non hai i permessi per questo canale messaggi.",
        }
      }
    }

    const participant =
      conversation.participants.find(
        (item) =>
          item.actorType ===
            "COMPANY" &&
          item.companyId ===
            sender.companyId,
      )
    const hasConversationAccess =
      conversation.type === "SUPPORT"
        ? Boolean(participant)
        : conversation.requestUnlock
            ?.companyId ===
          sender.companyId

    if (!hasConversationAccess) {
      return {
        ok: false,
        code: "unauthorized",
        message:
          "Non hai i permessi per questo canale messaggi.",
      }
    }

    if (!participant) {
      return {
        ok: false,
        code: "invalid_sender",
        message:
          "Mittente non valido per questo canale messaggi.",
      }
    }

    return {
      ok: true,
      participantId: participant.id,
    }
  }

  if (sender.actorType === "ADMIN") {
    const adminProfile =
      await getAdminProfileForUser(
        sender.userId,
      )

    if (!adminProfile) {
      return {
        ok: false,
        code: "unauthorized",
        message:
          "Non hai i permessi admin per questo canale messaggi.",
      }
    }
  }

  const participant =
    conversation.participants.find(
      (item) =>
        item.actorType ===
          sender.actorType &&
        item.userId === sender.userId,
    )

  if (
    !participant &&
    sender.actorType === "ADMIN" &&
    conversation.type === "SUPPORT"
  ) {
    const adminParticipant =
      await ensureSupportAdminParticipant({
        conversationId,
        userId: sender.userId,
      })

    return {
      ok: true,
      participantId:
        adminParticipant.id,
    }
  }

  if (!participant) {
    return {
      ok: false,
      code: "invalid_sender",
      message:
        "Mittente non valido per questo canale messaggi.",
    }
  }

  return {
    ok: true,
    participantId: participant.id,
  }
}

export async function sendConversationMessage({
  conversationId,
  sender,
  body,
  now = new Date(),
  authorizedActor,
}: SendConversationMessageInput): Promise<SendConversationMessageResult> {
  const normalizedConversationId =
    normalizeRequiredText(conversationId)
  const normalizedBody =
    normalizeRequiredText(body)

  if (!normalizedConversationId) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  if (!normalizedBody) {
    return {
      ok: false,
      code: "empty_message",
      message:
        "Il messaggio non puo essere vuoto.",
    }
  }

  let senderParticipantId: string

  if (sender.actorType === "CUSTOMER") {
    const accessResult =
      await resolveCustomerConversationAccess({
        conversationId:
          normalizedConversationId,
        token: sender.token,
        now,
      })

    if (!accessResult.ok) {
      return mapCustomerAccessFailure(
        accessResult,
      )
    }

    senderParticipantId =
      accessResult.customerParticipantId
  } else {
    const participantResult =
      await resolveSenderParticipantId({
        conversationId:
          normalizedConversationId,
        sender,
        ...(authorizedActor !== undefined && {
          authorizedActor,
        }),
      })

    if (!participantResult.ok) {
      return participantResult
    }

    senderParticipantId =
      participantResult.participantId
  }

  const message =
    await prisma.$transaction(async (tx) => {
      const createdMessage =
        await tx.message.create({
          data: {
            conversation: {
              connect: {
                id:
                  normalizedConversationId,
              },
            },
            senderParticipant: {
              connect: {
                id: senderParticipantId,
              },
            },
            body: normalizedBody,
            createdAt: now,
          },
          select: {
            id: true,
          },
        })

      await tx.conversation.update({
        where: {
          id: normalizedConversationId,
        },
        data: {
          updatedAt: now,
          ...(sender.actorType ===
          "COMPANY"
            ? {
                isResolved: false,
                resolvedAt: null,
                resolvedById: null,
              }
            : {}),
        },
        select: {
          id: true,
        },
      })

      await tx.conversationParticipant.update({
        where: {
          id: senderParticipantId,
        },
        data: {
          lastReadAt: now,
        },
        select: {
          id: true,
        },
      })

      return createdMessage
    })

  return {
    ok: true,
    messageId: message.id,
    conversationId:
      normalizedConversationId,
  }
}
