import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"
import type {
  ConversationActorType,
  ConversationType,
  RequestStatus,
} from "@prisma/client"

import type {
  ConversationThread,
  ConversationThreadMessage,
} from "../../internal/conversation/types"

const MESSAGE_LIMIT = 30

type PerfRecorder = (operation: string, durationMs: number) => void

type ConvRow = {
  conv_id: string
  conv_type: ConversationType
  conv_request_id: string | null
  conv_request_unlock_id: string | null
  conv_created_at: Date
  conv_updated_at: Date
  conv_is_resolved: boolean
  conv_resolved_at: Date | null
  conv_resolved_by_id: string | null
  req_id: string | null
  req_request_code: string | null
  req_status: RequestStatus | null
  req_intervention_slug: string | null
  req_city: string | null
  req_created_at: Date | null
  ru_refunded_at: Date | null
  rbu_id: string | null
  rbu_name: string | null
  rbu_email: string | null
  participants: Array<{
    id: string
    actorType: ConversationActorType
    companyId: string | null
    customerId: string | null
    userId: string | null
    companyName: string | null
    customerEmail: string | null
    customerName: string | null
    customerPhone: string | null
    userName: string | null
  }>
}

type MsgRow = {
  msg_id: string
  msg_body: string
  msg_created_at: Date
  msg_sender_participant_id: string
  sender_actor_type: ConversationActorType
  sender_company_name: string | null
  sender_customer_name: string | null
  sender_user_name: string | null
}

export type GetCompanyConversationThreadPageResult =
  | { ok: true; thread: ConversationThread }
  | {
      ok: false
      code:
        | "conversation_not_found"
        | "request_unlock_not_valid"
        | "unauthorized"
      message: string
    }

export async function getCompanyConversationThreadPage(
  actor: CompanyActor,
  conversationId: string,
  recordPerf?: PerfRecorder,
): Promise<GetCompanyConversationThreadPageResult> {
  const companyId = actor.company.id

  const queryStart = recordPerf ? performance.now() : 0

  // 2 parallel JOIN queries → 1 Neon round-trip (down from 8 queries / 2 round-trips)
  const [convRows, msgRows] = await Promise.all([
    prisma.$queryRaw<Array<ConvRow>>`
      SELECT
        c."id"               AS conv_id,
        c."type"             AS conv_type,
        c."requestId"        AS conv_request_id,
        c."requestUnlockId"  AS conv_request_unlock_id,
        c."createdAt"        AS conv_created_at,
        c."updatedAt"        AS conv_updated_at,
        c."isResolved"       AS conv_is_resolved,
        c."resolvedAt"       AS conv_resolved_at,
        c."resolvedById"     AS conv_resolved_by_id,
        r."id"               AS req_id,
        r."requestCode"      AS req_request_code,
        r."status"           AS req_status,
        r."interventionSlug" AS req_intervention_slug,
        rgl."city"           AS req_city,
        r."createdAt"        AS req_created_at,
        ru."refundedAt"      AS ru_refunded_at,
        rbu."id"             AS rbu_id,
        rbu."name"           AS rbu_name,
        rbu."email"          AS rbu_email,
        COALESCE(
          (
            SELECT json_agg(json_build_object(
              'id',            cp."id",
              'actorType',     cp."actorType",
              'companyId',     cp."companyId",
              'customerId',    cp."customerId",
              'userId',        cp."userId",
              'companyName',   co."name",
              'customerEmail', cu."email",
              'customerName',  cu."name",
              'customerPhone', cu."phone",
              'userName',      u."name"
            ))
            FROM "ConversationParticipant" cp
            LEFT JOIN "Company"  co ON co."id" = cp."companyId"
            LEFT JOIN "Customer" cu ON cu."id" = cp."customerId"
            LEFT JOIN "User"     u  ON u."id"  = cp."userId"
            WHERE cp."conversationId" = c."id"
          ),
          '[]'::json
        ) AS participants
      FROM "Conversation" c
      LEFT JOIN "Request"     r   ON r."id"  = c."requestId"
      LEFT JOIN "GeoLocation" rgl ON rgl."id" = r."geoLocationId"
      LEFT JOIN "RequestUnlock" ru  ON ru."id" = c."requestUnlockId"
      LEFT JOIN "User"          rbu ON rbu."id" = c."resolvedById"
      WHERE c."id" = ${conversationId}
    `,
    prisma.$queryRaw<Array<MsgRow>>`
      SELECT
        m."id"                  AS msg_id,
        m."body"                AS msg_body,
        m."createdAt"           AS msg_created_at,
        m."senderParticipantId" AS msg_sender_participant_id,
        cp."actorType"          AS sender_actor_type,
        co."name"               AS sender_company_name,
        cu."name"               AS sender_customer_name,
        u."name"                AS sender_user_name
      FROM "Message" m
      JOIN "ConversationParticipant" cp ON cp."id" = m."senderParticipantId"
      LEFT JOIN "Company"  co ON co."id" = cp."companyId"
      LEFT JOIN "Customer" cu ON cu."id" = cp."customerId"
      LEFT JOIN "User"     u  ON u."id"  = cp."userId"
      WHERE m."conversationId" = ${conversationId}
      ORDER BY m."createdAt" DESC
      LIMIT ${MESSAGE_LIMIT}
    `,
  ])

  if (recordPerf) {
    recordPerf("thread-queries", Math.round(performance.now() - queryStart))
  }

  const conv = convRows[0] ?? null

  if (!conv) {
    return {
      ok: false,
      code: "conversation_not_found",
      message: "Canale messaggi non trovato.",
    }
  }

  const hasCompanyParticipant = conv.participants.some(
    (p) => p.actorType === "COMPANY" && p.companyId === companyId,
  )

  if (!hasCompanyParticipant) {
    return {
      ok: false,
      code: "unauthorized",
      message: "Non hai i permessi per questo canale messaggi.",
    }
  }

  if (
    conv.conv_type === "COMPANY_CUSTOMER" &&
    (conv.conv_request_unlock_id === null ||
      conv.ru_refunded_at !== null)
  ) {
    return {
      ok: false,
      code: "request_unlock_not_valid",
      message: "Lo sblocco di questa richiesta non è più valido.",
    }
  }

  const companyParticipant =
    conv.participants.find((p) => p.actorType === "COMPANY") ?? null
  const customerParticipant =
    conv.participants.find((p) => p.actorType === "CUSTOMER") ?? null

  const company =
    companyParticipant?.companyId
      ? {
          id: companyParticipant.companyId,
          name: companyParticipant.companyName ?? "Impresa",
        }
      : null

  const customer =
    customerParticipant?.customerId && customerParticipant.customerEmail
      ? {
          id: customerParticipant.customerId,
          email: customerParticipant.customerEmail,
          name: customerParticipant.customerName,
          phone: customerParticipant.customerPhone,
        }
      : null

  const messages: ConversationThreadMessage[] = [...msgRows]
    .reverse()
    .map((m) => ({
      id: m.msg_id,
      body: m.msg_body,
      createdAt: m.msg_created_at,
      senderActorType: m.sender_actor_type,
      senderLabel: resolveSenderLabel(m),
    }))

  const thread: ConversationThread = {
    id: conv.conv_id,
    type: conv.conv_type,
    requestId: conv.conv_request_id,
    requestUnlockId: conv.conv_request_unlock_id,
    createdAt: conv.conv_created_at,
    updatedAt: conv.conv_updated_at,
    isResolved: conv.conv_is_resolved,
    resolvedAt: conv.conv_resolved_at,
    resolvedBy:
      conv.rbu_id !== null && conv.rbu_email !== null
        ? { id: conv.rbu_id, name: conv.rbu_name, email: conv.rbu_email }
        : null,
    request:
      conv.req_id !== null &&
      conv.req_status !== null &&
      conv.req_created_at !== null
        ? {
            id: conv.req_id,
            requestCode: conv.req_request_code,
            status: conv.req_status,
            interventionSlug: conv.req_intervention_slug,
            city: conv.req_city,
            createdAt: conv.req_created_at,
          }
        : null,
    company,
    customer,
    messages,
  }

  return { ok: true, thread }
}

function resolveSenderLabel(m: MsgRow): string {
  if (m.sender_actor_type === "COMPANY")
    return m.sender_company_name ?? "Impresa"
  if (m.sender_actor_type === "CUSTOMER")
    return m.sender_customer_name ?? "Cliente"
  if (m.sender_actor_type === "ADMIN")
    return m.sender_user_name ?? "Admin"
  return m.sender_user_name ?? "Operatore"
}
