import type { CompanyActor } from "../../identity/company/actor"

import {
  prisma,
} from "../../prisma/client"

import type {
  CreateCompanyCustomerConversationInput,
  CreateCompanyCustomerConversationResult,
} from "../types"

function normalizeRequiredId(
  value: string,
): string | null {
  const normalized =
    value.trim()

  return normalized
    ? normalized
    : null
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
  authorizedActor,
  companyId,
  requestId,
  userId,
  recordPerf,
}: CreateCompanyCustomerConversationInput & { authorizedActor: CompanyActor }): Promise<CreateCompanyCustomerConversationResult> {
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

  const actor = authorizedActor

  if (!actor) {
    return {
      ok: false,
      code: "unauthorized",
      message:
        "Non hai i permessi per questa impresa.",
    }
  }

  return prisma.$transaction(async (tx) => {
    // Single query: SELECT FOR UPDATE lock + full unlock data (replaces lock + findUnique)
    const unlockRows =
      await measurePerf(
        "unlock-lookup",
        recordPerf,
        () =>
          tx.$queryRaw<
            Array<{
              id: string
              refundedAt: Date | null
              customerId: string | null
            }>
          >`
            SELECT
              ru."id",
              ru."refundedAt",
              r."customerId"
            FROM "RequestUnlock" ru
            JOIN "Request" r ON r."id" = ru."requestId"
            WHERE ru."requestId" = ${normalizedRequestId}
              AND ru."companyId" = ${normalizedCompanyId}
            FOR UPDATE OF ru
          `,
      )

    const unlockRow =
      unlockRows[0] ?? null

    if (!unlockRow) {
      return {
        ok: false,
        code: "request_unlock_not_found",
        message:
          "La richiesta non risulta sbloccata da questa impresa.",
      }
    }

    if (unlockRow.refundedAt) {
      return {
        ok: false,
        code: "request_unlock_not_valid",
        message:
          "Lo sblocco di questa richiesta non e piu valido.",
      }
    }

    const customerId =
      unlockRow.customerId

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
            },
          }),
      )

    if (existingConversation) {
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
          unlockRow.id,
        created: false,
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
                  id: unlockRow.id,
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
            },
          }),
      )

    return {
      ok: true,
      conversationId: conversation.id,
      requestId: normalizedRequestId,
      requestUnlockId: unlockRow.id,
      created: true,
    }
  })
}
