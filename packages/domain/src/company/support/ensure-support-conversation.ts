import type { Prisma } from "@prisma/client"

import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

type PerfRecorder = (label: string, ms: number) => void

export type EnsureCompanySupportConversationResult =
  | {
      ok: true
      conversationId: string
      companyId: string
      adminUserId: string
      created: boolean
    }
  | {
      ok: false
      code: "admin_not_found"
      message: string
    }

async function lockSupportConversation(
  tx: Prisma.TransactionClient,
  companyId: string,
) {
  await tx.$queryRaw<Array<{ locked: boolean }>>`
    SELECT TRUE AS locked
    FROM (
      SELECT pg_advisory_xact_lock(hashtext(${`support-conversation:${companyId}`}))
    ) AS support_conversation_lock
  `
}

async function resolveAdminUserId(
  tx: Prisma.TransactionClient,
  adminUserId: string | null,
): Promise<{ ok: true; userId: string } | { ok: false; code: "admin_not_found"; message: string }> {
  if (adminUserId) {
    const adminProfile = await tx.adminProfile.findFirst({
      where: {
        userId: adminUserId,
        user: { isActive: true, deletedAt: null },
      },
      select: { userId: true },
    })

    if (!adminProfile) {
      return { ok: false, code: "admin_not_found", message: "Operatore supporto non trovato." }
    }

    return { ok: true, userId: adminProfile.userId }
  }

  const defaultAdmin = await tx.adminProfile.findFirst({
    where: { user: { isActive: true, deletedAt: null } },
    orderBy: [{ role: "desc" }, { createdAt: "asc" }],
    select: { userId: true },
  })

  if (!defaultAdmin) {
    return { ok: false, code: "admin_not_found", message: "Nessun operatore supporto disponibile." }
  }

  return { ok: true, userId: defaultAdmin.userId }
}

export async function ensureCompanySupportConversation(
  actor: CompanyActor,
  opts?: { adminUserId?: string | null },
  recordPerf?: PerfRecorder,
): Promise<EnsureCompanySupportConversationResult> {
  const companyId = actor.company.id
  const t0 = performance.now()

  const result = await prisma.$transaction(async (tx) => {
    await lockSupportConversation(tx, companyId)

    const admin = await resolveAdminUserId(tx, opts?.adminUserId ?? null)
    if (!admin.ok) return admin

    const existingConversation = await tx.conversation.findFirst({
      where: {
        type: "SUPPORT",
        participants: {
          some: { actorType: "COMPANY", companyId },
        },
      },
      select: {
        id: true,
        participants: {
          select: { actorType: true, userId: true },
        },
      },
    })

    if (existingConversation) {
      const hasAdminParticipant = existingConversation.participants.some(
        (p) => p.actorType === "ADMIN" && p.userId === admin.userId,
      )

      if (!hasAdminParticipant) {
        await tx.conversationParticipant.create({
          data: {
            conversation: { connect: { id: existingConversation.id } },
            actorType: "ADMIN",
            user: { connect: { id: admin.userId } },
          },
          select: { id: true },
        })
      }

      return {
        ok: true,
        conversationId: existingConversation.id,
        companyId,
        adminUserId: admin.userId,
        created: false,
      } as const
    }

    const conversation = await tx.conversation.create({
      data: {
        type: "SUPPORT",
        participants: {
          create: [
            { actorType: "COMPANY", company: { connect: { id: companyId } } },
            { actorType: "ADMIN", user: { connect: { id: admin.userId } } },
          ],
        },
      },
      select: { id: true },
    })

    return {
      ok: true,
      conversationId: conversation.id,
      companyId,
      adminUserId: admin.userId,
      created: true,
    } as const
  })

  recordPerf?.("ensure-support-conversation", Math.round(performance.now() - t0))

  return result
}
