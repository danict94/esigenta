import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

type PerfRecorder = (label: string, ms: number) => void

export type RequestPhoneChangeErrorCode =
  | "invalid_requested_value"
  | "invalid_phone"
  | "company_not_found"
  | "company_membership_not_found"
  | "requested_value_unchanged"
  | "company_contact_change_request_already_pending"

export type RequestPhoneChangeResult =
  | { ok: true }
  | { ok: false; code: RequestPhoneChangeErrorCode }

export type RequestPhoneChangeInput = {
  requestedPhone: string | null
}

function normalizePhone(raw: string | null): string | null {
  const s = raw?.trim()
  if (!s) return null
  return s
}

function validatePhone(phone: string): RequestPhoneChangeErrorCode | null {
  if (phone.length < 5 || phone.length > 40) return "invalid_phone"
  return null
}

export async function requestCompanyPhoneContactChange(
  actor: CompanyActor,
  input: RequestPhoneChangeInput,
  recordPerf?: PerfRecorder,
): Promise<RequestPhoneChangeResult> {
  const phone = normalizePhone(input.requestedPhone)
  if (!phone) return { ok: false, code: "invalid_requested_value" }

  const phoneError = validatePhone(phone)
  if (phoneError) return { ok: false, code: phoneError }

  const t0 = performance.now()

  const result = await prisma.$transaction(async (tx) => {
    // Single read: company (with phone) + membership + pending request check
    const rows = await tx.$queryRaw<
      Array<{
        company_id: string | null
        current_phone: string | null
        membership_id: string | null
        pending_request_id: string | null
      }>
    >`
      SELECT
        c."id"          AS company_id,
        c."phone"       AS current_phone,
        cm."id"         AS membership_id,
        (
          SELECT "id" FROM "CompanyContactChangeRequest"
          WHERE "companyId" = c."id"
            AND "field" = 'PHONE'::"CompanyContactChangeField"
            AND "status" = 'PENDING_REVIEW'::"CompanyContactChangeStatus"
          LIMIT 1
        )               AS pending_request_id
      FROM "Company" c
      LEFT JOIN "CompanyMembership" cm
        ON cm."companyId" = c."id" AND cm."userId" = ${actor.user.id}
      WHERE c."id" = ${actor.company.id}
      FOR UPDATE OF c
    `

    const row = rows[0]

    if (!row?.company_id) return { ok: false, code: "company_not_found" as const }
    if (!row.membership_id) return { ok: false, code: "company_membership_not_found" as const }

    const currentPhone = row.current_phone?.trim() ?? ""
    if (currentPhone === phone) return { ok: false, code: "requested_value_unchanged" as const }

    if (row.pending_request_id) {
      return { ok: false, code: "company_contact_change_request_already_pending" as const }
    }

    await tx.$executeRaw`
      INSERT INTO "CompanyContactChangeRequest" (
        "id", "companyId", "requestedByUserId",
        "field", "currentValue", "requestedValue",
        "status", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${actor.company.id}, ${actor.user.id},
        'PHONE'::"CompanyContactChangeField",
        ${row.current_phone},
        ${phone},
        'PENDING_REVIEW'::"CompanyContactChangeStatus",
        now(), now()
      )
    `

    return { ok: true as const }
  })

  recordPerf?.("phone-change-request", Math.round(performance.now() - t0))

  return result
}
