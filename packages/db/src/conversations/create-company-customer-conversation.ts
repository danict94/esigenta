import type {
  ConversationParticipant,
} from "@prisma/client"

import {
  getCompanyActorForUser,
} from "../identity"
import {
  prisma,
} from "../prisma/client"

import type {
  CreateCompanyCustomerConversationInput,
  CreateCompanyCustomerConversationResult,
} from "./types"

function normalizeRequiredId(
  value: string,
): string | null {
  const normalized =
    value.trim()

  return normalized
    ? normalized
    : null
}

function findParticipantId({
  participants,
  actorType,
  companyId,
  customerId,
}: {
  participants: Array<
    Pick<
      ConversationParticipant,
      | "actorType"
      | "companyId"
      | "customerId"
      | "id"
    >
  >
  actorType: "COMPANY" | "CUSTOMER"
  companyId?: string
  customerId?: string
}): string | null {
  const participant =
    participants.find((item) => {
      if (item.actorType !== actorType) {
        return false
      }

      if (actorType === "COMPANY") {
        return item.companyId === companyId
      }

      return item.customerId === customerId
    })

  return participant?.id ?? null
}

async function measurePerf<T>(
  operation: string,
  recordPerf:
    | CreateCompanyCustomerConversationInput["recordPerf"]
    | undefined,
  task: () => Promise<T>,
): Promise<T> {
  const startedAt =
    performance.now()

  try {
    return await task()
  } finally {
    recordPerf?.(
      operation,
      performance.now() - startedAt,
    )
  }
}

export async function createCompanyCustomerConversation({
  companyId,
  requestId,
  userId,
  recordPerf,
}: CreateCompanyCustomerConversationInput): Promise<CreateCompanyCustomerConversationResult> {
  const normalizedCompanyId =
    normalizeRequiredId(companyId)
  const normalizedRequestId =
    normalizeRequiredId(requestId)
  const normalizedUserId =
    normalizeRequiredId(userId)

  if (!normalizedCompanyId) {
    return {
      ok: false,
      code: "invalid_company_id",
      message: "Impresa non valida.",
    }
  }

  if (!normalizedRequestId) {
    return {
      ok: false,
      code: "invalid_request_id",
      message: "Richiesta non valida.",
    }
  }

  if (!normalizedUserId) {
    return {
      ok: false,
      code: "invalid_user_id",
      message: "Utente non valido.",
    }
  }

  const actor =
    await measurePerf(
      "authorization",
      recordPerf,
      () =>
        getCompanyActorForUser({
          userId: normalizedUserId,
          companyId: normalizedCompanyId,
        }),
    )

  if (!actor) {
    return {
      ok: false,
      code: "unauthorized",
      message:
        "Non hai i permessi per questa impresa.",
    }
  }

  return prisma.$transaction(async (tx) => {
    await measurePerf(
      "unlock-lock",
      recordPerf,
      () =>
        tx.$queryRaw<Array<{ id: string }>>`
          SELECT "id"
          FROM "RequestUnlock"
          WHERE "requestId" = ${normalizedRequestId}
            AND "companyId" = ${normalizedCompanyId}
          FOR UPDATE
        `,
    )

    const requestUnlock =
      await measurePerf(
        "unlock-lookup",
        recordPerf,
        () =>
          tx.requestUnlock.findUnique({
            where: {
              requestId_companyId: {
                requestId:
                  normalizedRequestId,
                companyId:
                  normalizedCompanyId,
              },
            },
            select: {
              id: true,
              refundedAt: true,
              request: {
                select: {
                  customerId: true,
                },
              },
            },
          }),
      )

    if (!requestUnlock) {
      return {
        ok: false,
        code: "request_unlock_not_found",
        message:
          "La richiesta non risulta sbloccata da questa impresa.",
      }
    }

    if (requestUnlock.refundedAt) {
      return {
        ok: false,
        code: "request_unlock_not_valid",
        message:
          "Lo sblocco di questa richiesta non e piu valido.",
      }
    }

    const customerId =
      requestUnlock.request.customerId

    if (!customerId) {
      return {
        ok: false,
        code: "customer_not_found",
        message:
          "Cliente non disponibile per questo canale messaggi.",
      }
    }

    const existingConversation =
      await measurePerf(
        "conversation-lookup",
        recordPerf,
        () =>
          tx.conversation.findFirst({
            where: {
              type: "COMPANY_CUSTOMER",
              requestId: normalizedRequestId,
              AND: [
                {
                  participants: {
                    some: {
                      actorType: "COMPANY",
                      companyId:
                        normalizedCompanyId,
                    },
                  },
                },
                {
                  participants: {
                    some: {
                      actorType: "CUSTOMER",
                      customerId,
                    },
                  },
                },
              ],
            },
            select: {
              id: true,
              participants: {
                select: {
                  id: true,
                  actorType: true,
                  companyId: true,
                  customerId: true,
                },
              },
            },
          }),
      )

    if (existingConversation) {
      const companyParticipantId =
        findParticipantId({
          participants:
            existingConversation.participants,
          actorType: "COMPANY",
          companyId: normalizedCompanyId,
        })
      const customerParticipantId =
        findParticipantId({
          participants:
            existingConversation.participants,
          actorType: "CUSTOMER",
          customerId,
        })

      if (
        companyParticipantId &&
        customerParticipantId
      ) {
        recordPerf?.(
          "conversation-create",
          0,
        )

        return {
          ok: true,
          conversationId:
            existingConversation.id,
          requestId:
            normalizedRequestId,
          requestUnlockId:
            requestUnlock.id,
          companyParticipantId,
          customerParticipantId,
          created: false,
        }
      }
    }

    const conversation =
      await measurePerf(
        "conversation-create",
        recordPerf,
        () =>
          tx.conversation.create({
            data: {
              type: "COMPANY_CUSTOMER",
              request: {
                connect: {
                  id: normalizedRequestId,
                },
              },
              requestUnlock: {
                connect: {
                  id: requestUnlock.id,
                },
              },
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
                    actorType: "CUSTOMER",
                    customer: {
                      connect: {
                        id: customerId,
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
                  customerId: true,
                },
              },
            },
          }),
      )

    const companyParticipantId =
      findParticipantId({
        participants:
          conversation.participants,
        actorType: "COMPANY",
        companyId: normalizedCompanyId,
      })
    const customerParticipantId =
      findParticipantId({
        participants:
          conversation.participants,
        actorType: "CUSTOMER",
        customerId,
      })

    if (
      !companyParticipantId ||
      !customerParticipantId
    ) {
      return {
        ok: false,
        code: "customer_not_found",
        message:
          "Partecipanti del canale messaggi non disponibili.",
      }
    }

    return {
      ok: true,
      conversationId: conversation.id,
      requestId: normalizedRequestId,
      requestUnlockId: requestUnlock.id,
      companyParticipantId,
      customerParticipantId,
      created: true,
    }
  })
}
