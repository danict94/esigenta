import type { CompanyActor } from "@esigenta/auth"
import {
  prisma,
} from "@esigenta/database"
import { normalizeRequiredText } from "@esigenta/shared"

import type {
  CompanyConversationListItem,
  ListCompanyConversationsInput,
  ListCompanyConversationsResult,
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

export async function listCompanyConversations({
  authorizedActor,
  companyId,
  userId,
  limit,
  excludeType,
}: ListCompanyConversationsInput & { authorizedActor: CompanyActor }): Promise<ListCompanyConversationsResult> {
  const normalizedCompanyId =
    normalizeRequiredText(companyId)
  const normalizedUserId =
    normalizeRequiredText(userId)

  if (!normalizedCompanyId) {
    return {
      ok: false,
      code: "invalid_company_id",
      message: "Impresa non valida.",
    }
  }

  if (!normalizedUserId) {
    return {
      ok: false,
      code: "invalid_user_id",
      message: "Utente non valido.",
    }
  }

  const actor = authorizedActor

  if (!actor) {
    return {
      ok: false,
      code: "unauthorized",
      message:
        "Non hai i permessi per questa impresa.",
    }
  }

  const conversations =
    await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            actorType: "COMPANY",
            companyId:
              normalizedCompanyId,
          },
        },
        ...(excludeType
          ? {
              type: {
                not: excludeType,
              },
            }
          : {}),
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: normalizeLimit(limit),
      select: {
        id: true,
        type: true,
        requestId: true,
        requestUnlockId: true,
        createdAt: true,
        updatedAt: true,
        request: {
          select: {
            id: true,
            requestCode: true,
            status: true,
            interventionSlug: true,
            city: true,
            createdAt: true,
          },
        },
        participants: {
          select: {
            id: true,
            actorType: true,
            companyId: true,
            lastReadAt: true,
            customer: {
              select: {
                id: true,
                email: true,
                name: true,
                phone: true,
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
      conversations.map<CompanyConversationListItem>(
        (conversation) => {
          const customer =
            conversation.participants.find(
              (participant) =>
                participant.actorType ===
                "CUSTOMER",
            )?.customer ?? null
          const companyParticipant =
            conversation.participants.find(
              (participant) =>
                participant.actorType ===
                  "COMPANY" &&
                participant.companyId ===
                  normalizedCompanyId,
            ) ?? null
          const lastMessage =
            conversation.messages[0] ?? null
          const hasUnread =
            Boolean(
              lastMessage &&
                companyParticipant &&
                lastMessage.senderParticipant
                  .id !==
                  companyParticipant.id &&
                (!companyParticipant.lastReadAt ||
                  lastMessage.createdAt >
                    companyParticipant.lastReadAt),
            )

          return {
            id: conversation.id,
            type: conversation.type,
            requestId:
              conversation.requestId,
            requestUnlockId:
              conversation.requestUnlockId,
            createdAt:
              conversation.createdAt,
            updatedAt:
              conversation.updatedAt,
            request:
              conversation.request,
            customer,
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
