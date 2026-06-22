import type { CompanyActor } from "@esigenta/auth"
import {
  prisma,
} from "@esigenta/database"

import type {
  CompanyConversationListItem,
} from "../../internal/conversation/types"

export async function getCompanySupportConversation(
  actor: CompanyActor,
): Promise<CompanyConversationListItem | null> {
  const companyId = actor.company.id

  const conversation =
    await prisma.conversation.findFirst({
      where: {
        type: "SUPPORT",
        participants: {
          some: {
            actorType: "COMPANY",
            companyId,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
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
            geoLocation: {
              select: { city: true },
            },
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

  if (!conversation) {
    return null
  }

  const companyParticipant =
    conversation.participants.find(
      (p) =>
        p.actorType === "COMPANY" &&
        p.companyId === companyId,
    ) ?? null
  const lastMessage =
    conversation.messages[0] ?? null
  const hasUnread = Boolean(
    lastMessage &&
      companyParticipant &&
      lastMessage.senderParticipant.id !==
        companyParticipant.id &&
      (!companyParticipant.lastReadAt ||
        lastMessage.createdAt >
          companyParticipant.lastReadAt),
  )

  return {
    id: conversation.id,
    type: conversation.type,
    requestId: conversation.requestId,
    requestUnlockId:
      conversation.requestUnlockId,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    request: conversation.request
      ? {
          id: conversation.request.id,
          requestCode: conversation.request.requestCode,
          status: conversation.request.status,
          interventionSlug:
            conversation.request.interventionSlug,
          city: conversation.request.geoLocation?.city ?? null,
          createdAt: conversation.request.createdAt,
        }
      : null,
    customer: null,
    lastMessage: lastMessage
      ? {
          id: lastMessage.id,
          body: lastMessage.body,
          createdAt: lastMessage.createdAt,
          senderActorType:
            lastMessage.senderParticipant
              .actorType,
        }
      : null,
    hasUnread,
  }
}
