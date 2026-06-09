import {
  getAdminProfileForUser,
  getCompanyMembershipForUser,
} from "../identity"
import {
  prisma,
} from "../prisma/client"

import {
  resolveCustomerConversationAccessByToken,
} from "./resolve-customer-conversation-access"
import {
  ensureSupportAdminParticipant,
} from "./support-admin-participants"
import type {
  ConversationThread,
  GetAdminConversationThreadInput,
  GetAdminConversationThreadResult,
  GetCompanyConversationThreadInput,
  GetCompanyConversationThreadResult,
  GetCustomerConversationThreadByTokenInput,
  GetCustomerConversationThreadByTokenResult,
} from "./types"

type LoadedConversationThread =
  NonNullable<
    Awaited<
      ReturnType<typeof loadConversationThread>
    >
  >

const threadMessageLimit = 30

function normalizeRequiredText(
  value: string,
): string | null {
  const normalized =
    value.trim()

  return normalized
    ? normalized
    : null
}

function createActorLabel({
  participant,
}: {
  participant: LoadedConversationThread["messages"][number]["senderParticipant"]
}): string {
  if (participant.actorType === "COMPANY") {
    return participant.company?.name ?? "Impresa"
  }

  if (participant.actorType === "CUSTOMER") {
    return participant.customer?.name ?? "Cliente"
  }

  if (participant.actorType === "ADMIN") {
    return participant.user?.name ?? "Admin"
  }

  return participant.user?.name ?? "Operatore"
}

function mapConversationThread(
  conversation: LoadedConversationThread,
): ConversationThread {
  const companyParticipant =
    conversation.participants.find(
      (participant) =>
        participant.actorType === "COMPANY",
    )
  const customerParticipant =
    conversation.participants.find(
      (participant) =>
        participant.actorType === "CUSTOMER",
    )

  return {
    id: conversation.id,
    type: conversation.type,
    requestId: conversation.requestId,
    requestUnlockId:
      conversation.requestUnlockId,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    isResolved:
      conversation.isResolved,
    resolvedAt:
      conversation.resolvedAt,
    resolvedBy:
      conversation.resolvedBy,
    request: conversation.request,
    company:
      companyParticipant?.company ?? null,
    customer:
      customerParticipant?.customer ?? null,
    messages: [
      ...conversation.messages,
    ].reverse().map(
      (message) => ({
        id: message.id,
        body: message.body,
        createdAt: message.createdAt,
        senderActorType:
          message.senderParticipant.actorType,
        senderLabel: createActorLabel({
          participant:
            message.senderParticipant,
        }),
      }),
    ),
  }
}

async function loadConversationThread(
  conversationId: string,
) {
  return prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    select: {
      id: true,
      type: true,
      requestId: true,
      requestUnlockId: true,
      createdAt: true,
      updatedAt: true,
      isResolved: true,
      resolvedAt: true,
      resolvedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      requestUnlock: {
        select: {
          refundedAt: true,
        },
      },
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
          actorType: true,
          userId: true,
          companyId: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          customerId: true,
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
        take: threadMessageLimit,
        select: {
          id: true,
          body: true,
          createdAt: true,
          senderParticipant: {
            select: {
              actorType: true,
              company: {
                select: {
                  name: true,
                },
              },
              customer: {
                select: {
                  name: true,
                },
              },
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function getCompanyConversationThread({
  companyId,
  userId,
  conversationId,
}: GetCompanyConversationThreadInput): Promise<GetCompanyConversationThreadResult> {
  const normalizedCompanyId =
    normalizeRequiredText(companyId)
  const normalizedUserId =
    normalizeRequiredText(userId)
  const normalizedConversationId =
    normalizeRequiredText(conversationId)

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

  if (!normalizedConversationId) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  const membership =
    await getCompanyMembershipForUser({
      userId: normalizedUserId,
      companyId: normalizedCompanyId,
    })

  if (!membership) {
    return {
      ok: false,
      code: "unauthorized",
      message:
        "Non hai i permessi per questo canale messaggi.",
    }
  }

  const conversation =
    await loadConversationThread(
      normalizedConversationId,
    )

  if (!conversation) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  const hasCompanyParticipant =
    conversation.participants.some(
      (participant) =>
        participant.actorType ===
          "COMPANY" &&
        participant.companyId ===
          normalizedCompanyId,
    )

  if (!hasCompanyParticipant) {
    return {
      ok: false,
      code: "unauthorized",
      message:
        "Non hai i permessi per questo canale messaggi.",
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

  return {
    ok: true,
    thread:
      mapConversationThread(conversation),
  }
}

export async function getAdminConversationThread({
  userId,
  conversationId,
}: GetAdminConversationThreadInput): Promise<GetAdminConversationThreadResult> {
  const normalizedUserId =
    normalizeRequiredText(userId)
  const normalizedConversationId =
    normalizeRequiredText(conversationId)

  if (!normalizedUserId) {
    return {
      ok: false,
      code: "invalid_user_id",
      message: "Utente non valido.",
    }
  }

  if (!normalizedConversationId) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
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
        "Non hai i permessi admin per questo canale messaggi.",
    }
  }

  const conversation =
    await loadConversationThread(
      normalizedConversationId,
    )

  if (!conversation) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  const hasAdminParticipant =
    conversation.participants.some(
      (participant) =>
        participant.actorType === "ADMIN" &&
        participant.userId ===
          normalizedUserId,
    )

  if (
    !hasAdminParticipant &&
    conversation.type === "SUPPORT"
  ) {
    await ensureSupportAdminParticipant({
      conversationId:
        normalizedConversationId,
      userId: normalizedUserId,
    })
  } else if (!hasAdminParticipant) {
    return {
      ok: false,
      code: "unauthorized",
      message:
        "Non hai i permessi per questo canale messaggi.",
    }
  }

  return {
    ok: true,
    thread:
      mapConversationThread(conversation),
  }
}

export async function getCustomerConversationThreadByToken({
  token,
  now = new Date(),
}: GetCustomerConversationThreadByTokenInput): Promise<GetCustomerConversationThreadByTokenResult> {
  const access =
    await resolveCustomerConversationAccessByToken({
      token,
      now,
    })

  if (!access.ok) {
    return access
  }

  const conversation =
    await loadConversationThread(
      access.conversationId,
    )

  if (!conversation) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  return {
    ok: true,
    access,
    thread:
      mapConversationThread(conversation),
  }
}
