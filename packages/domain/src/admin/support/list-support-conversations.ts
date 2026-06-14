import {
  getAdminProfileForUser,
} from "@esigenta/auth"
import {
  prisma,
} from "@esigenta/database"
import { normalizeRequiredText } from "@esigenta/shared"

import type {
  AdminSupportConversationListItem,
  ListAdminSupportConversationsInput,
  ListAdminSupportConversationsResult,
} from "../../internal/conversation/types"

const defaultLimit = 50
const maxLimit = 100

function normalizeLimit(
  limit: number | undefined,
): number {
  if (
    typeof limit !== "number" ||
    !Number.isInteger(limit) ||
    limit < 1
  ) {
    return defaultLimit
  }

  return Math.min(limit, maxLimit)
}

export async function listAdminSupportConversations({
  userId,
  limit,
  includeResolved = true,
}: ListAdminSupportConversationsInput): Promise<ListAdminSupportConversationsResult> {
  const normalizedUserId =
    normalizeRequiredText(userId)

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

  const conversations =
    await prisma.conversation.findMany({
      where: {
        type: "SUPPORT",
        ...(includeResolved
          ? {}
          : {
              isResolved: false,
            }),
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: normalizeLimit(limit),
      select: {
        id: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        isResolved: true,
        resolvedAt: true,
        participants: {
          select: {
            id: true,
            actorType: true,
            userId: true,
            lastReadAt: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            body: true,
            createdAt: true,
            senderParticipant: {
              select: {
                id: true,
                actorType: true,
              },
            },
          },
        },
      },
    })

  return {
    ok: true,
    conversations:
      conversations.map<AdminSupportConversationListItem>(
        (conversation) => {
          const company =
            conversation.participants.find(
              (participant) =>
                participant.actorType ===
                  "COMPANY" &&
                participant.company,
            )?.company ?? null
          const adminParticipant =
            conversation.participants.find(
              (participant) =>
                participant.actorType ===
                  "ADMIN" &&
                participant.userId ===
                  normalizedUserId,
            ) ?? null
          const lastMessage =
            conversation.messages[0] ?? null
          const hasUnread =
            Boolean(
              lastMessage &&
                lastMessage.senderParticipant
                  .actorType !== "ADMIN" &&
                (!adminParticipant?.lastReadAt ||
                  lastMessage.createdAt >
                    adminParticipant.lastReadAt),
            )

          return {
            id: conversation.id,
            type: "SUPPORT",
            createdAt:
              conversation.createdAt,
            updatedAt:
              conversation.updatedAt,
            isResolved:
              conversation.isResolved,
            resolvedAt:
              conversation.resolvedAt,
            company,
            lastMessage: lastMessage
              ? {
                  id: lastMessage.id,
                  body: lastMessage.body,
                  createdAt:
                    lastMessage.createdAt,
                  senderActorType:
                    lastMessage
                      .senderParticipant
                      .actorType,
                }
              : null,
            hasUnread,
          }
        },
      ),
  }
}
