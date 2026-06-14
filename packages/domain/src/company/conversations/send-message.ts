import type {
  ConversationType,
} from "@prisma/client"

import {
  prisma,
} from "@esigenta/database"

import {
  normalizeRequiredText,
} from "@esigenta/shared"

import type {
  CompanyActor,
} from "@esigenta/auth"

export type SendCompanyConversationMessageResult =
  | {
      ok: true
      messageId: string
      conversationId: string
    }
  | {
      ok: false
      code:
        | "conversation_not_found"
        | "empty_message"
        | "request_unlock_not_valid"
        | "unauthorized"
      message: string
    }

type AccessRow = {
  conv_id: string
  conv_type: ConversationType
  ru_company_id: string | null
  ru_refunded_at: Date | null
  cp_id: string | null
}

export async function sendCompanyConversationMessage(
  actor: CompanyActor,
  conversationId: string,
  body: string,
  recordPerf?: (label: string, ms: number) => void,
  now = new Date(),
): Promise<SendCompanyConversationMessageResult> {
  const normalizedConversationId =
    normalizeRequiredText(conversationId)
  const normalizedBody =
    normalizeRequiredText(body)

  if (!normalizedConversationId) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  if (!normalizedBody) {
    return {
      ok: false,
      code: "empty_message",
      message: "Il messaggio non può essere vuoto.",
    }
  }

  // Round-trip 1: access check + participant lookup (single SQL JOIN, replaces 3 ORM queries)
  const t0 = performance.now()
  const rows = await prisma.$queryRaw<Array<AccessRow>>`
    SELECT
      c."id"          AS conv_id,
      c."type"        AS conv_type,
      ru."companyId"  AS ru_company_id,
      ru."refundedAt" AS ru_refunded_at,
      cp."id"         AS cp_id
    FROM "Conversation" c
    LEFT JOIN "RequestUnlock" ru
      ON  ru."id" = c."requestUnlockId"
    LEFT JOIN "ConversationParticipant" cp
      ON  cp."conversationId" = c."id"
      AND cp."actorType"      = 'COMPANY'::"ConversationActorType"
      AND cp."companyId"      = ${actor.company.id}
    WHERE c."id" = ${normalizedConversationId}
    LIMIT 1
  `
  recordPerf?.(
    "access-check",
    Math.round(performance.now() - t0),
  )

  const row = rows[0] ?? null

  if (!row) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  if (
    row.conv_type === "COMPANY_CUSTOMER" &&
    (!row.ru_company_id || row.ru_refunded_at !== null)
  ) {
    return {
      ok: false,
      code: "request_unlock_not_valid",
      message: "Lo sblocco di questa richiesta non è più valido.",
    }
  }

  if (
    row.conv_type === "COMPANY_CUSTOMER" &&
    row.ru_company_id !== actor.company.id
  ) {
    return {
      ok: false,
      code: "unauthorized",
      message: "Non hai i permessi per questo canale messaggi.",
    }
  }

  if (!row.cp_id) {
    return {
      ok: false,
      code: "unauthorized",
      message: "Non hai i permessi per questo canale messaggi.",
    }
  }

  const participantId = row.cp_id

  // Round-trip 2: 3-write CTE in 1 SQL query (replaces 5-op Prisma interactive transaction)
  // gen_random_uuid()::text produces a UUID-format ID — functionally identical to cuid for this use case.
  const t1 = performance.now()
  const writeRows = await prisma.$queryRaw<Array<{ msg_id: string }>>`
    WITH
      inserted_msg AS (
        INSERT INTO "Message" ("id", "conversationId", "senderParticipantId", "body", "createdAt")
        VALUES (
          gen_random_uuid()::text,
          ${normalizedConversationId},
          ${participantId},
          ${normalizedBody},
          ${now}
        )
        RETURNING "id" AS msg_id
      ),
      _conv AS (
        UPDATE "Conversation"
        SET
          "updatedAt"    = ${now},
          "isResolved"   = false,
          "resolvedAt"   = NULL,
          "resolvedById" = NULL
        WHERE "id" = ${normalizedConversationId}
      ),
      _part AS (
        UPDATE "ConversationParticipant"
        SET "lastReadAt" = ${now}
        WHERE "id" = ${participantId}
      )
    SELECT msg_id FROM inserted_msg
  `
  recordPerf?.(
    "write-cte",
    Math.round(performance.now() - t1),
  )

  const messageId = writeRows[0]?.msg_id
  if (!messageId) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Errore durante l'invio del messaggio.",
    }
  }

  return {
    ok: true,
    messageId,
    conversationId: normalizedConversationId,
  }
}
