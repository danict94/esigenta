import type {
  CompanyMemberRole,
  CompanyStatus,
} from "@prisma/client"

import {
  prisma,
} from "@esigenta/database"

import {
  AmbiguousCompanyMembershipError,
  CompanyAuthorizationError,
} from "./errors"

export type CompanyActor = {
  user: {
    id: string
    name: string | null
    email: string
  }
  company: {
    id: string
    status: CompanyStatus
  }
  role: CompanyMemberRole
}

// ── Internal row type for raw JOIN query ───────────────────────────────────────

type MembershipRow = {
  id: string
  role: CompanyMemberRole
  user_id: string
  user_name: string | null
  user_email: string
  company_id: string
  company_status: CompanyStatus
}

function rowToActor(row: MembershipRow): CompanyActor {
  return {
    user: {
      id: row.user_id,
      name: row.user_name,
      email: row.user_email,
    },
    company: {
      id: row.company_id,
      status: row.company_status,
    },
    role: row.role,
  }
}

// ── Lean JOIN queries (1 round-trip each, replaces 3-query ORM approach) ──────

async function listActiveMembershipsForUser(userId: string): Promise<CompanyActor[]> {
  const rows = await prisma.$queryRaw<Array<MembershipRow>>`
    SELECT
      cm."id"         AS id,
      cm."role"       AS role,
      u."id"          AS user_id,
      u."name"        AS user_name,
      u."email"       AS user_email,
      co."id"         AS company_id,
      co."status"     AS company_status
    FROM "CompanyMembership" cm
    JOIN "User"    u  ON u."id"  = cm."userId"
    JOIN "Company" co ON co."id" = cm."companyId"
    WHERE cm."userId"   = ${userId}
      AND co."isActive" = true
      AND co."deletedAt" IS NULL
    ORDER BY cm."createdAt" ASC
  `
  return rows.map(rowToActor)
}

async function getActiveMembershipForUser(userId: string, companyId: string): Promise<CompanyActor | null> {
  const rows = await prisma.$queryRaw<Array<MembershipRow>>`
    SELECT
      cm."id"         AS id,
      cm."role"       AS role,
      u."id"          AS user_id,
      u."name"        AS user_name,
      u."email"       AS user_email,
      co."id"         AS company_id,
      co."status"     AS company_status
    FROM "CompanyMembership" cm
    JOIN "User"    u  ON u."id"  = cm."userId"
    JOIN "Company" co ON co."id" = cm."companyId"
    WHERE cm."userId"    = ${userId}
      AND cm."companyId" = ${companyId}
      AND co."isActive"  = true
      AND co."deletedAt" IS NULL
    LIMIT 1
  `
  const row = rows[0] ?? null
  return row ? rowToActor(row) : null
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function listCompanyActorsForUser(userId: string): Promise<CompanyActor[]> {
  return listActiveMembershipsForUser(userId)
}

export async function getCompanyActorForUser({
  userId,
  companyId,
}: {
  userId: string
  companyId: string
}): Promise<CompanyActor | null> {
  return getActiveMembershipForUser(userId, companyId)
}

export async function resolveCompanyActorFromUser(
  user: { id: string },
): Promise<CompanyActor> {
  const actors = await listActiveMembershipsForUser(user.id)

  if (actors.length === 0) {
    throw new CompanyAuthorizationError()
  }

  if (actors.length > 1) {
    throw new AmbiguousCompanyMembershipError()
  }

  const actor = actors[0]

  if (!actor) {
    throw new CompanyAuthorizationError()
  }

  return actor
}
