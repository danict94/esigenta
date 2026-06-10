import {
  getAdminProfileForUser,
  getCompanyActorForUser,
} from "../../identity"
import {
  prisma,
} from "../../prisma/client"

import {
  resolveCustomerConversationAccess,
} from "../customer/resolve-customer-conversation-access"
import {
  ensureSupportAdminParticipant,
} from "../support/support-admin-participants"
import type {
  CountUnreadCompanyConversationsInput,
  CountUnreadCompanyConversationsResult,
  CountUnreadCompanyConversationSummaryInput,
  CountUnreadCompanyConversationSummaryResult,
  CountUnreadAdminConversationsInput,
  CountUnreadAdminConversationsResult,
  MarkConversationReadInput,
  MarkConversationReadResult,
} from "../types"

type CompanyUnreadScopeResult =
  | {
      ok: true
      companyId: string
    }
  | {
      ok: false
      code:
        | "invalid_company_id"
        | "invalid_user_id"
        | "unauthorized"
      message: string
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

function mapCustomerAccessFailure(
  result: Extract<
    Awaited<
      ReturnType<
        typeof resolveCustomerConversationAccess
      >
    >,
    { ok: false }
  >,
): MarkConversationReadResult {
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
    code: "invalid_reader",
    message: result.message,
  }
}

async function resolveCompanyUnreadScope({
  companyId,
  userId,
  authorizedActor,
}: CountUnreadCompanyConversationsInput): Promise<CompanyUnreadScopeResult> {
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

  if (authorizedActor) {
    return {
      ok: true,
      companyId: normalizedCompanyId,
    }
  }

  const actor =
    await getCompanyActorForUser({
      userId: normalizedUserId,
      companyId: normalizedCompanyId,
    })

  if (!actor) {
    return {
      ok: false,
      code: "unauthorized",
      message:
        "Non hai i permessi per questa impresa.",
    }
  }

  return {
    ok: true,
    companyId: normalizedCompanyId,
  }
}

async function markCompanyConversationRead({
  conversationId,
  companyId,
  userId,
  authorizedActor,
  now,
}: {
  conversationId: string
  companyId: string
  userId: string
  authorizedActor?: import("../../identity/company/actor").CompanyActor
  now: Date
}): Promise<MarkConversationReadResult> {
  const actor =
    authorizedActor ??
    (await getCompanyActorForUser({
      userId,
      companyId,
    }))

  if (!actor) {
    return {
      ok: false,
      code: "unauthorized",
      message:
        "Non hai i permessi per questo canale messaggi.",
    }
  }

  const updated =
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        actorType: "COMPANY",
        companyId,
        OR: [
          { lastReadAt: null },
          { lastReadAt: { lt: now } },
        ],
      },
      data: {
        lastReadAt: now,
      },
    })

  if (updated.count === 0) {
    const existing =
      await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          actorType: "COMPANY",
          companyId,
        },
        select: {
          id: true,
        },
      })

    if (existing) {
      return {
        ok: true,
        conversationId,
        participantId: existing.id,
        readAt: now,
      }
    }

    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        select: {
          type: true,
        },
      })

    if (conversation?.type !== "SUPPORT") {
      return {
        ok: false,
        code: "conversation_not_found",
        message: "Canale messaggi non trovato.",
      }
    }

    await ensureSupportAdminParticipant({
      conversationId,
      userId,
    })

    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        actorType: "ADMIN",
        userId,
        OR: [
          { lastReadAt: null },
          { lastReadAt: { lt: now } },
        ],
      },
      data: {
        lastReadAt: now,
      },
    })
  }

  return {
    ok: true,
    conversationId,
    participantId: "",
    readAt: now,
  }
}

async function markAdminConversationRead({
  conversationId,
  userId,
  now,
}: {
  conversationId: string
  userId: string
  now: Date
}): Promise<MarkConversationReadResult> {
  const adminProfile =
    await getAdminProfileForUser(userId)

  if (!adminProfile) {
    return {
      ok: false,
      code: "unauthorized",
      message:
        "Non hai i permessi admin per questo canale messaggi.",
    }
  }

  const updated =
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        actorType: "ADMIN",
        userId,
      },
      data: {
        lastReadAt: now,
      },
    })

  if (updated.count !== 1) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  const participant =
    await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        actorType: "ADMIN",
        userId,
      },
      select: {
        id: true,
      },
    })

  return {
    ok: true,
    conversationId,
    participantId:
      participant?.id ?? "",
    readAt: now,
  }
}

export async function markConversationRead({
  conversationId,
  reader,
  authorizedActor,
  now = new Date(),
}: MarkConversationReadInput): Promise<MarkConversationReadResult> {
  const normalizedConversationId =
    normalizeRequiredText(conversationId)

  if (!normalizedConversationId) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  if (reader.actorType === "CUSTOMER") {
    const accessResult =
      await resolveCustomerConversationAccess({
        conversationId:
          normalizedConversationId,
        token: reader.token,
        now,
      })

    if (!accessResult.ok) {
      return mapCustomerAccessFailure(
        accessResult,
      )
    }

    await prisma.conversationParticipant.update({
      where: {
        id:
          accessResult.customerParticipantId,
      },
      data: {
        lastReadAt: now,
      },
      select: {
        id: true,
      },
    })

    return {
      ok: true,
      conversationId:
        normalizedConversationId,
      participantId:
        accessResult.customerParticipantId,
      readAt: now,
    }
  }

  if (reader.actorType === "COMPANY") {
    return markCompanyConversationRead({
      conversationId:
        normalizedConversationId,
      companyId: reader.companyId,
      userId: reader.userId,
      ...(authorizedActor && { authorizedActor }),
      now,
    })
  }

  if (reader.actorType === "ADMIN") {
    return markAdminConversationRead({
      conversationId:
        normalizedConversationId,
      userId: reader.userId,
      now,
    })
  }

  return {
    ok: false,
    code: "invalid_reader",
    message:
      "Lettore non valido per questo canale messaggi.",
  }
}

export async function countUnreadAdminConversations({
  userId,
}: CountUnreadAdminConversationsInput): Promise<CountUnreadAdminConversationsResult> {
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

  const rows =
    await prisma.$queryRaw<
      Array<{
        count: bigint
      }>
    >`
      SELECT COUNT(DISTINCT c."id") AS count
      FROM "Conversation" c
      LEFT JOIN "ConversationParticipant" admin_participant
        ON admin_participant."conversationId" = c."id"
        AND admin_participant."actorType" = 'ADMIN'
        AND admin_participant."userId" = ${normalizedUserId}
      INNER JOIN "Message" m
        ON m."conversationId" = c."id"
        AND m."deletedAt" IS NULL
      INNER JOIN "ConversationParticipant" sender_participant
        ON sender_participant."id" = m."senderParticipantId"
      WHERE (
          c."type" = 'SUPPORT'
          OR admin_participant."id" IS NOT NULL
        )
        AND (
          (
            c."type" = 'SUPPORT'
            AND sender_participant."actorType" <> 'ADMIN'
          )
          OR (
            admin_participant."id" IS NOT NULL
            AND sender_participant."id" <> admin_participant."id"
          )
        )
        AND (
          admin_participant."id" IS NULL
          OR admin_participant."lastReadAt" IS NULL
          OR m."createdAt" > admin_participant."lastReadAt"
        )
    `

  return {
    ok: true,
    count: Number(rows[0]?.count ?? 0),
  }
}

export async function countUnreadCompanyConversations({
  companyId,
  userId,
  authorizedActor,
}: CountUnreadCompanyConversationsInput): Promise<CountUnreadCompanyConversationsResult> {
  const scope =
    await resolveCompanyUnreadScope({
      companyId,
      userId,
      ...(authorizedActor && { authorizedActor }),
    })

  if (!scope.ok) {
    return scope
  }

  const rows =
    await prisma.$queryRaw<
      Array<{
        count: bigint
      }>
    >`
      SELECT COUNT(DISTINCT c."id") AS count
      FROM "Conversation" c
      INNER JOIN "ConversationParticipant" company_participant
        ON company_participant."conversationId" = c."id"
        AND company_participant."actorType" = 'COMPANY'
        AND company_participant."companyId" = ${scope.companyId}
      INNER JOIN "Message" m
        ON m."conversationId" = c."id"
        AND m."deletedAt" IS NULL
      INNER JOIN "ConversationParticipant" sender_participant
        ON sender_participant."id" = m."senderParticipantId"
      WHERE sender_participant."id" <> company_participant."id"
        AND (
          company_participant."lastReadAt" IS NULL
          OR m."createdAt" > company_participant."lastReadAt"
        )
    `

  const count =
    Number(rows[0]?.count ?? 0)

  return {
    ok: true,
    count,
  }
}

export async function countUnreadCompanyConversationSummary({
  companyId,
  userId,
  authorizedActor,
}: CountUnreadCompanyConversationSummaryInput): Promise<CountUnreadCompanyConversationSummaryResult> {
  const scope =
    await resolveCompanyUnreadScope({
      companyId,
      userId,
      ...(authorizedActor && { authorizedActor }),
    })

  if (!scope.ok) {
    return scope
  }

  const rows =
    await prisma.$queryRaw<
      Array<{
        type: string
        count: bigint
      }>
    >`
      SELECT c."type" AS type, COUNT(DISTINCT c."id") AS count
      FROM "Conversation" c
      INNER JOIN "ConversationParticipant" company_participant
        ON company_participant."conversationId" = c."id"
        AND company_participant."actorType" = 'COMPANY'
        AND company_participant."companyId" = ${scope.companyId}
      INNER JOIN "Message" m
        ON m."conversationId" = c."id"
        AND m."deletedAt" IS NULL
      INNER JOIN "ConversationParticipant" sender_participant
        ON sender_participant."id" = m."senderParticipantId"
      WHERE sender_participant."id" <> company_participant."id"
        AND (
          company_participant."lastReadAt" IS NULL
          OR m."createdAt" > company_participant."lastReadAt"
        )
      GROUP BY c."type"
    `

  const supportCount =
    Number(
      rows.find((row) => row.type === "SUPPORT")
        ?.count ?? 0,
    )
  const contactsCount =
    rows.reduce((total, row) => {
      if (row.type === "SUPPORT") {
        return total
      }

      return total + Number(row.count)
    }, 0)

  return {
    ok: true,
    contactsCount,
    supportCount,
    totalCount:
      contactsCount + supportCount,
  }
}
