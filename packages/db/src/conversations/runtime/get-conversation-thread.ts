import type { CompanyActor } from "../../identity/company/actor"
import {
  getAdminProfileForUser,
} from "../../identity"
import {
  prisma,
} from "../../prisma/client"

import {
  resolveCustomerConversationAccessByToken,
} from "../customer/resolve-customer-conversation-access"
import {
  ensureSupportAdminParticipant,
} from "../support/support-admin-participants"
import type {
  ConversationThread,
  GetAdminConversationThreadInput,
  GetAdminConversationThreadResult,
  GetCompanyConversationThreadInput,
  GetCompanyConversationThreadResult,
  GetCustomerConversationThreadByTokenInput,
  GetCustomerConversationThreadByTokenResult,
} from "../types"

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

type LoadedConversationThread = NonNullable<
  Awaited<ReturnType<typeof loadConversationThread>>
>

function mapConversationThread(
  loaded: LoadedConversationThread,
): ConversationThread {
  const companyParticipant =
    loaded.participants.find(
      (p) => p.actorType === "COMPANY",
    )
  const customerParticipant =
    loaded.participants.find(
      (p) => p.actorType === "CUSTOMER",
    )

  return {
    id: loaded.id,
    type: loaded.type,
    requestId: loaded.requestId,
    requestUnlockId: loaded.requestUnlockId,
    createdAt: loaded.createdAt,
    updatedAt: loaded.updatedAt,
    isResolved: loaded.isResolved,
    resolvedAt: loaded.resolvedAt,
    resolvedBy: loaded.resolvedBy,
    request: loaded.request,
    company:
      companyParticipant?.company ?? null,
    customer:
      customerParticipant?.customer ?? null,
    messages: [...loaded.messages]
      .reverse()
      .map((message) => ({
        id: message.id,
        body: message.body,
        createdAt: message.createdAt,
        senderActorType: message.senderActorType,
        senderLabel: message.senderLabel,
      })),
  }
}

async function loadConversationThread(
  conversationId: string,
) {
  // Phase 1: conversation metadata + participants + messages, all independent
  const [conversation, participantRows, messages] =
    await Promise.all([
      prisma.conversation.findUnique({
        where: { id: conversationId },
        select: {
          id: true,
          type: true,
          requestId: true,
          requestUnlockId: true,
          resolvedById: true,
          createdAt: true,
          updatedAt: true,
          isResolved: true,
          resolvedAt: true,
        },
      }),
      prisma.conversationParticipant.findMany({
        where: { conversationId },
        select: {
          id: true,
          actorType: true,
          userId: true,
          companyId: true,
          customerId: true,
        },
      }),
      prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "desc" },
        take: threadMessageLimit,
        select: {
          id: true,
          body: true,
          createdAt: true,
          senderParticipantId: true,
        },
      }),
    ])

  if (!conversation) {
    return null
  }

  // Phase 2: related entities, all independent and parallel
  const companyIds = participantRows
    .map((p) => p.companyId)
    .filter((id): id is string => id !== null)
  const customerIds = participantRows
    .map((p) => p.customerId)
    .filter((id): id is string => id !== null)
  const userIds = participantRows
    .map((p) => p.userId)
    .filter((id): id is string => id !== null)

  const [
    requestData,
    requestUnlockData,
    resolvedByUser,
    companies,
    customers,
    users,
  ] = await Promise.all([
    conversation.requestId
      ? prisma.request.findUnique({
          where: { id: conversation.requestId },
          select: {
            id: true,
            requestCode: true,
            status: true,
            interventionSlug: true,
            city: true,
            createdAt: true,
          },
        })
      : Promise.resolve(null),
    conversation.requestUnlockId
      ? prisma.requestUnlock.findUnique({
          where: { id: conversation.requestUnlockId },
          select: { refundedAt: true },
        })
      : Promise.resolve(null),
    conversation.resolvedById
      ? prisma.user.findUnique({
          where: { id: conversation.resolvedById },
          select: { id: true, name: true, email: true },
        })
      : Promise.resolve(null),
    companyIds.length > 0
      ? prisma.company.findMany({
          where: { id: { in: companyIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([] as Array<{ id: string; name: string }>),
    customerIds.length > 0
      ? prisma.customer.findMany({
          where: { id: { in: customerIds } },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        })
      : Promise.resolve(
          [] as Array<{
            id: string
            email: string
            name: string | null
            phone: string | null
          }>,
        ),
    userIds.length > 0
      ? prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([] as Array<{ id: string; name: string | null }>),
  ])

  // Build lookup maps
  const companyMap = new Map(
    companies.map((c) => [c.id, c]),
  )
  const customerMap = new Map(
    customers.map((c) => [c.id, c]),
  )
  const userMap = new Map(
    users.map((u) => [u.id, u]),
  )

  // Enrich participants and build label map in one pass
  const participantLabelMap = new Map<
    string,
    { actorType: string; label: string }
  >()
  const participants = participantRows.map((p) => {
    const company =
      p.companyId ? (companyMap.get(p.companyId) ?? null) : null
    const customer =
      p.customerId ? (customerMap.get(p.customerId) ?? null) : null
    const user =
      p.userId ? (userMap.get(p.userId) ?? null) : null

    let label: string
    if (p.actorType === "COMPANY") {
      label = company?.name ?? "Impresa"
    } else if (p.actorType === "CUSTOMER") {
      label = customer?.name ?? "Cliente"
    } else if (p.actorType === "ADMIN") {
      label = user?.name ?? "Admin"
    } else {
      label = user?.name ?? "Operatore"
    }

    participantLabelMap.set(p.id, {
      actorType: p.actorType,
      label,
    })

    return {
      id: p.id,
      actorType: p.actorType,
      userId: p.userId,
      companyId: p.companyId,
      customerId: p.customerId,
      company,
      customer,
      user,
    }
  })

  // Annotate messages with sender info from map (no extra DB queries)
  const enrichedMessages = messages.map((m) => {
    const sender = participantLabelMap.get(
      m.senderParticipantId,
    )
    return {
      id: m.id,
      body: m.body,
      createdAt: m.createdAt,
      senderActorType: (sender?.actorType ??
        "CUSTOMER") as import("@prisma/client").ConversationActorType,
      senderLabel: sender?.label ?? "Utente",
    }
  })

  return {
    id: conversation.id,
    type: conversation.type,
    requestId: conversation.requestId,
    requestUnlockId: conversation.requestUnlockId,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    isResolved: conversation.isResolved,
    resolvedAt: conversation.resolvedAt,
    resolvedBy: resolvedByUser ?? null,
    request: requestData,
    requestUnlock: requestUnlockData,
    participants,
    messages: enrichedMessages,
  }
}

export async function getCompanyConversationThread({
  authorizedActor,
  companyId,
  userId,
  conversationId,
}: GetCompanyConversationThreadInput & { authorizedActor: CompanyActor }): Promise<GetCompanyConversationThreadResult> {
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

  const actor = authorizedActor

  if (!actor) {
    return {
      ok: false,
      code: "unauthorized",
      message:
        "Non hai i permessi per questo canale messaggi.",
    }
  }

  const loaded =
    await loadConversationThread(
      normalizedConversationId,
    )

  if (!loaded) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  const hasCompanyParticipant =
    loaded.participants.some(
      (p) =>
        p.actorType === "COMPANY" &&
        p.companyId === normalizedCompanyId,
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
    loaded.type === "COMPANY_CUSTOMER" &&
    (!loaded.requestUnlock ||
      loaded.requestUnlock.refundedAt)
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
    thread: mapConversationThread(loaded),
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

  const loaded =
    await loadConversationThread(
      normalizedConversationId,
    )

  if (!loaded) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  const hasAdminParticipant =
    loaded.participants.some(
      (p) =>
        p.actorType === "ADMIN" &&
        p.userId === normalizedUserId,
    )

  if (
    !hasAdminParticipant &&
    loaded.type === "SUPPORT"
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
    thread: mapConversationThread(loaded),
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

  const loaded =
    await loadConversationThread(
      access.conversationId,
    )

  if (!loaded) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  return {
    ok: true,
    access,
    thread: mapConversationThread(loaded),
  }
}

