import {
  prisma,
} from "@esigenta/database"

export async function ensureSupportAdminParticipant({
  conversationId,
  userId,
}: {
  conversationId: string
  userId: string
}) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw<
      Array<{
        locked: boolean
      }>
    >`
      SELECT TRUE AS locked
      FROM (
        SELECT pg_advisory_xact_lock(hashtext(${`support-admin-participant:${conversationId}:${userId}`}))
      ) AS support_admin_participant_lock
    `

    const existingParticipant =
      await tx.conversationParticipant.findFirst({
        where: {
          conversationId,
          actorType: "ADMIN",
          userId,
        },
        select: {
          id: true,
        },
      })

    if (existingParticipant) {
      return existingParticipant
    }

    return tx.conversationParticipant.create({
      data: {
        conversation: {
          connect: {
            id: conversationId,
          },
        },
        actorType: "ADMIN",
        user: {
          connect: {
            id: userId,
          },
        },
      },
      select: {
        id: true,
      },
    })
  })
}
