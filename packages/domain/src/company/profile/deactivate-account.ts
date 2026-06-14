import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"

type PerfRecorder = (label: string, ms: number) => void

export type DeactivateAccountErrorCode =
  | "membership_not_found"
  | "not_owner"

export type DeactivateAccountResult =
  | { ok: true }
  | { ok: false; code: DeactivateAccountErrorCode; message: string }

export async function deactivateCompanyAccount(
  actor: CompanyActor,
  recordPerf?: PerfRecorder,
): Promise<DeactivateAccountResult> {
  const t0 = performance.now()

  const rows = await prisma.$queryRaw<
    Array<{
      role: string | null
      company_updated: bigint
    }>
  >`
    WITH check_owner AS (
      SELECT "role"::text AS role
      FROM "CompanyMembership"
      WHERE "companyId" = ${actor.company.id}
        AND "userId"    = ${actor.user.id}
    ), upd_company AS (
      UPDATE "Company"
      SET "isActive" = false, "deletedAt" = now(), "updatedAt" = now()
      WHERE "id" = ${actor.company.id}
        AND EXISTS (SELECT 1 FROM check_owner WHERE role = 'OWNER')
      RETURNING "id"
    ), upd_user AS (
      UPDATE "User"
      SET "isActive" = false, "deletedAt" = now(), "updatedAt" = now()
      WHERE "id" = ${actor.user.id}
        AND EXISTS (SELECT 1 FROM check_owner WHERE role = 'OWNER')
    ), del_sessions AS (
      DELETE FROM "Session"
      WHERE "userId" = ${actor.user.id}
        AND EXISTS (SELECT 1 FROM check_owner WHERE role = 'OWNER')
    )
    SELECT
      (SELECT role FROM check_owner)         AS role,
      (SELECT COUNT(*) FROM upd_company)     AS company_updated
  `

  recordPerf?.("deactivate-account", Math.round(performance.now() - t0))

  const row = rows[0]

  if (!row?.role) {
    return { ok: false, code: "membership_not_found", message: "Membership non trovata." }
  }

  if (row.role !== "OWNER") {
    return { ok: false, code: "not_owner", message: "Solo il proprietario può eliminare l'account." }
  }

  return { ok: true }
}
