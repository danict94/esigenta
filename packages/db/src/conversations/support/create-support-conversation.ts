import type {
  Prisma,
} from "@prisma/client"

import {
  getCompanyActorForUser,
} from "../../identity"
import {
  prisma,
} from "../../prisma/client"

import type {
  CreateSupportConversationInput,
  CreateSupportConversationResult,
} from "../types"

function normalizeRequiredText(
  value: string,
): string | null {
  const normalized =
    value.trim()

  return normalized
    ? normalized
    : null
}

async function lockSupportConversationCreation({
  tx,
  companyId,
}: {
  tx: Prisma.TransactionClient
  companyId: string
}) {
  await tx.$queryRaw<
    Array<{
      locked: boolean
    }>
  >`
    SELECT TRUE AS locked
    FROM (
      SELECT pg_advisory_xact_lock(hashtext(${`support-conversation:${companyId}`}))
    ) AS support_conversation_lock
  `
}

async function resolveAdminUserId({
  tx,
  adminUserId,
}: {
  tx: Prisma.TransactionClient
  adminUserId: string | null
}): Promise<
  | {
      ok: true
      userId: string
    }
  | {
      ok: false
      code:
        | "admin_not_found"
        | "invalid_admin_user_id"
      message: string
    }
> {
  if (adminUserId) {
    const adminProfile =
      await tx.adminProfile.findFirst({
        where: {
          userId: adminUserId,
          user: {
            isActive: true,
            deletedAt: null,
          },
        },
        select: {
          userId: true,
        },
      })

    if (!adminProfile) {
      return {
        ok: false,
        code: "admin_not_found",
        message:
          "Operatore supporto non trovato.",
      }
    }

    return {
      ok: true,
      userId: adminProfile.userId,
    }
  }

  const defaultAdmin =
    await tx.adminProfile.findFirst({
      where: {
        user: {
          isActive: true,
          deletedAt: null,
        },
      },
      orderBy: [
        {
          role: "desc",
        },
        {
          createdAt: "asc",
        },
      ],
      select: {
        userId: true,
      },
    })

  if (!defaultAdmin) {
    return {
      ok: false,
      code: "admin_not_found",
      message:
        "Nessun operatore supporto disponibile.",
    }
  }

  return {
    ok: true,
    userId: defaultAdmin.userId,
  }
}

function getParticipantId(
  conversation: {
    participants: Array<{
      id: string
      actorType: string
      companyId: string | null
      userId: string | null
    }>
  },
  actor: {
    actorType: "COMPANY" | "ADMIN"
    companyId?: string
    userId?: string
  },
) {
  return conversation.participants.find(
    (participant) =>
      participant.actorType ===
        actor.actorType &&
      (actor.actorType === "COMPANY"
        ? participant.companyId ===
          actor.companyId
        : participant.userId ===
          actor.userId),
  )?.id
}

export async function createSupportConversation({
  companyId,
  userId,
  adminUserId,
}: CreateSupportConversationInput): Promise<CreateSupportConversationResult> {
  const normalizedCompanyId =
    normalizeRequiredText(companyId)
  const normalizedUserId =
    normalizeRequiredText(userId)
  const normalizedAdminUserId =
    adminUserId
      ? normalizeRequiredText(adminUserId)
      : null

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

  if (
    adminUserId !== undefined &&
    adminUserId !== null &&
    !normalizedAdminUserId
  ) {
    return {
      ok: false,
      code: "invalid_admin_user_id",
      message:
        "Operatore supporto non valido.",
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

  return prisma.$transaction(async (tx) => {
    await lockSupportConversationCreation({
      tx,
      companyId: normalizedCompanyId,
    })

    const admin =
      await resolveAdminUserId({
        tx,
        adminUserId:
          normalizedAdminUserId,
      })

    if (!admin.ok) {
      return admin
    }

    const existingConversation =
      await tx.conversation.findFirst({
        where: {
          type: "SUPPORT",
          participants: {
            some: {
              actorType: "COMPANY",
              companyId:
                normalizedCompanyId,
            },
          },
        },
        select: {
          id: true,
          participants: {
            select: {
              id: true,
              actorType: true,
              companyId: true,
              userId: true,
            },
          },
        },
      })

    if (existingConversation) {
      let adminParticipantId =
        getParticipantId(
          existingConversation,
          {
            actorType: "ADMIN",
            userId: admin.userId,
          },
        )

      if (!adminParticipantId) {
        const adminParticipant =
          await tx.conversationParticipant.create({
            data: {
              conversation: {
                connect: {
                  id:
                    existingConversation.id,
                },
              },
              actorType: "ADMIN",
              user: {
                connect: {
                  id: admin.userId,
                },
              },
            },
            select: {
              id: true,
            },
          })

        adminParticipantId =
          adminParticipant.id
      }

      const companyParticipantId =
        getParticipantId(
          existingConversation,
          {
            actorType: "COMPANY",
            companyId:
              normalizedCompanyId,
          },
        )

      if (!companyParticipantId) {
        return {
          ok: false,
          code: "unauthorized",
          message:
            "Partecipante impresa non trovato.",
        } as const
      }

      return {
        ok: true,
        conversationId:
          existingConversation.id,
        companyId: normalizedCompanyId,
        adminUserId: admin.userId,
        companyParticipantId,
        adminParticipantId,
        created: false,
      } as const
    }

    const conversation =
      await tx.conversation.create({
        data: {
          type: "SUPPORT",
          participants: {
            create: [
              {
                actorType: "COMPANY",
                company: {
                  connect: {
                    id:
                      normalizedCompanyId,
                  },
                },
              },
              {
                actorType: "ADMIN",
                user: {
                  connect: {
                    id: admin.userId,
                  },
                },
              },
            ],
          },
        },
        select: {
          id: true,
          participants: {
            select: {
              id: true,
              actorType: true,
              companyId: true,
              userId: true,
            },
          },
        },
      })

    const companyParticipantId =
      getParticipantId(conversation, {
        actorType: "COMPANY",
        companyId: normalizedCompanyId,
      })
    const adminParticipantId =
      getParticipantId(conversation, {
        actorType: "ADMIN",
        userId: admin.userId,
      })

    if (
      !companyParticipantId ||
      !adminParticipantId
    ) {
      return {
        ok: false,
        code: "unauthorized",
        message:
          "Partecipanti supporto non creati.",
      } as const
    }

    return {
      ok: true,
      conversationId: conversation.id,
      companyId: normalizedCompanyId,
      adminUserId: admin.userId,
      companyParticipantId,
      adminParticipantId,
      created: true,
    } as const
  })
}
