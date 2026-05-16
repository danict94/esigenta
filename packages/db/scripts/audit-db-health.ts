import { existsSync } from "node:fs"
import { resolve } from "node:path"

import { config } from "dotenv"
import {
  Pool,
  type PoolClient,
  type QueryResultRow,
} from "pg"

const candidateEnvPaths = [
  resolve(process.cwd(), "../../.env"),
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "packages/db/.env"),
]

for (const envPath of candidateEnvPaths) {
  if (existsSync(envPath)) {
    config({
      path: envPath,
      override: false,
    })
  }
}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for the read-only DB audit.")
}

const pool = new Pool({
  connectionString: databaseUrl,
})

type DbIndex = {
  tableName: string
  indexName: string
  columns: string[]
  isUnique: boolean
  isPrimary: boolean
  definition: string
}

type DbForeignKey = {
  constraintName: string
  tableName: string
  columns: string[]
  referencedTable: string
  referencedColumns: string[]
  updateAction: string
  deleteAction: string
  definition: string
}

type ExpectedIndex = {
  key: string
  tableName: string
  columns: string[]
  unique?: boolean
  exact?: boolean
}

const expectedIndexes: ExpectedIndex[] = [
  {
    key: "User.email",
    tableName: "User",
    columns: ["email"],
    unique: true,
  },
  {
    key: "AdminProfile.userId",
    tableName: "AdminProfile",
    columns: ["userId"],
    unique: true,
  },
  {
    key: "AdminProfile.role",
    tableName: "AdminProfile",
    columns: ["role"],
  },
  {
    key: "Company.vatNumber",
    tableName: "Company",
    columns: ["vatNumber"],
    unique: true,
  },
  {
    key: "Company.city",
    tableName: "Company",
    columns: ["city"],
  },
  {
    key: "Company.postalCode",
    tableName: "Company",
    columns: ["postalCode"],
  },
  {
    key: "Company.latitude/longitude",
    tableName: "Company",
    columns: ["latitude", "longitude"],
    exact: true,
  },
  {
    key: "CompanyMembership.userId",
    tableName: "CompanyMembership",
    columns: ["userId"],
  },
  {
    key: "CompanyMembership.companyId",
    tableName: "CompanyMembership",
    columns: ["companyId"],
  },
  {
    key: "CompanyMembership.companyId + role",
    tableName: "CompanyMembership",
    columns: ["companyId", "role"],
    exact: true,
  },
  {
    key: "CompanyService.companyId",
    tableName: "CompanyService",
    columns: ["companyId"],
  },
  {
    key: "CompanyService.serviceId",
    tableName: "CompanyService",
    columns: ["serviceId"],
  },
  {
    key: "Customer.email",
    tableName: "Customer",
    columns: ["email"],
    unique: true,
  },
  {
    key: "CustomerAccessToken.tokenHash",
    tableName: "CustomerAccessToken",
    columns: ["tokenHash"],
    unique: true,
  },
  {
    key: "CustomerAccessToken.email + purpose",
    tableName: "CustomerAccessToken",
    columns: ["email", "purpose"],
    exact: true,
  },
  {
    key: "CustomerAccessToken.requestId",
    tableName: "CustomerAccessToken",
    columns: ["requestId"],
  },
  {
    key: "CustomerAccessToken.purpose + expiresAt",
    tableName: "CustomerAccessToken",
    columns: ["purpose", "expiresAt"],
    exact: true,
  },
  {
    key: "Request.customerId",
    tableName: "Request",
    columns: ["customerId"],
  },
  {
    key: "Request.customerEmail",
    tableName: "Request",
    columns: ["customerEmail"],
  },
  {
    key: "Request.status",
    tableName: "Request",
    columns: ["status"],
  },
  {
    key: "Request.city",
    tableName: "Request",
    columns: ["city"],
  },
  {
    key: "Request.latitude/longitude",
    tableName: "Request",
    columns: ["latitude", "longitude"],
    exact: true,
  },
  {
    key: "Request.interventionSlug",
    tableName: "Request",
    columns: ["interventionSlug"],
  },
]

function quoteIdent(value: string) {
  return `"${value.replace(/"/g, `""`)}"`
}

function asNumber(value: unknown): number {
  return Number(value ?? 0)
}

function actionName(value: string): string {
  switch (value) {
    case "a":
      return "NO ACTION"
    case "r":
      return "RESTRICT"
    case "c":
      return "CASCADE"
    case "n":
      return "SET NULL"
    case "d":
      return "SET DEFAULT"
    default:
      return value
  }
}

async function query<T extends QueryResultRow>(
  client: PoolClient,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await client.query<T>(sql, params)

  return result.rows
}

function hasCoveringIndex({
  indexes,
  tableName,
  columns,
  unique,
  exact,
}: {
  indexes: DbIndex[]
  tableName: string
  columns: string[]
  unique?: boolean
  exact?: boolean
}) {
  return indexes.some((index) => {
    if (index.tableName !== tableName) {
      return false
    }

    if (unique && !index.isUnique && !index.isPrimary) {
      return false
    }

    if (
      exact &&
      index.columns.length !== columns.length
    ) {
      return false
    }

    return columns.every(
      (column, indexPosition) =>
        index.columns[indexPosition] === column,
    )
  })
}

async function getTableRowCounts(
  client: PoolClient,
  tableNames: string[],
) {
  const counts: Record<string, number> = {}

  for (const tableName of tableNames) {
    const rows = await query<{ count: string }>(
      client,
      `SELECT count(*)::text AS count FROM ${quoteIdent(tableName)}`,
    )

    counts[tableName] =
      asNumber(rows[0]?.count)
  }

  return counts
}

async function getBusinessChecks(client: PoolClient) {
  const one = async <T extends QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ) => (await query<T>(client, sql, params))[0] ?? {}

  return {
    adminRoleCounts: await query<{
      role: string
      count: string
    }>(
      client,
      `
        SELECT "role", count(*)::text AS count
        FROM "AdminProfile"
        GROUP BY "role"
        ORDER BY "role"
      `,
    ),
    adminProfilesWithoutUser: await one<{
      count: string
    }>(`
      SELECT count(*)::text AS count
      FROM "AdminProfile" ap
      LEFT JOIN "User" u ON u."id" = ap."userId"
      WHERE u."id" IS NULL
    `),
    duplicateAdminProfilesByUser: await one<{
      duplicate_groups: string
      affected_profiles: string
    }>(`
      SELECT
        count(*)::text AS duplicate_groups,
        coalesce(sum(profile_count), 0)::text AS affected_profiles
      FROM (
        SELECT "userId", count(*) AS profile_count
        FROM "AdminProfile"
        GROUP BY "userId"
        HAVING count(*) > 1
      ) duplicates
    `),
    usersWithoutAdminOrCompanyMembership: await one<{
      count: string
    }>(`
      SELECT count(*)::text AS count
      FROM "User" u
      WHERE NOT EXISTS (
        SELECT 1
        FROM "AdminProfile" ap
        WHERE ap."userId" = u."id"
      )
      AND NOT EXISTS (
        SELECT 1
        FROM "CompanyMembership" cm
        WHERE cm."userId" = u."id"
      )
    `),
    companiesWithoutOwner: await one<{
      count: string
    }>(`
      SELECT count(*)::text AS count
      FROM "Company" c
      WHERE NOT EXISTS (
        SELECT 1
        FROM "CompanyMembership" cm
        WHERE cm."companyId" = c."id"
        AND cm."role" = 'OWNER'
      )
    `),
    companiesWithoutMembership: await one<{
      count: string
    }>(`
      SELECT count(*)::text AS count
      FROM "Company" c
      WHERE NOT EXISTS (
        SELECT 1
        FROM "CompanyMembership" cm
        WHERE cm."companyId" = c."id"
      )
    `),
    duplicateCompanyMemberships: await one<{
      duplicate_groups: string
      affected_memberships: string
    }>(`
      SELECT
        count(*)::text AS duplicate_groups,
        coalesce(sum(membership_count), 0)::text AS affected_memberships
      FROM (
        SELECT "companyId", "userId", count(*) AS membership_count
        FROM "CompanyMembership"
        GROUP BY "companyId", "userId"
        HAVING count(*) > 1
      ) duplicates
    `),
    usersWithMultipleMemberships: await one<{
      users: string
    }>(`
      SELECT count(*)::text AS users
      FROM (
        SELECT "userId"
        FROM "CompanyMembership"
        GROUP BY "userId"
        HAVING count(*) > 1
      ) users_with_multiple_memberships
    `),
    companiesMissingRequiredProfileData: await one<{
      missing_name: string
      missing_vat_number: string
      missing_phone: string
    }>(`
      SELECT
        count(*) FILTER (WHERE nullif(trim("name"), '') IS NULL)::text AS missing_name,
        count(*) FILTER (WHERE nullif(trim("vatNumber"), '') IS NULL)::text AS missing_vat_number,
        count(*) FILTER (WHERE nullif(trim("phone"), '') IS NULL)::text AS missing_phone
      FROM "Company"
    `),
    companiesMissingCoordinatesOrRadius: await one<{
      missing_coordinates: string
      missing_radius: string
      radius_outside_allowed_values: string
    }>(`
      SELECT
        count(*) FILTER (WHERE "latitude" IS NULL OR "longitude" IS NULL)::text AS missing_coordinates,
        count(*) FILTER (WHERE "operatingRadiusKm" IS NULL)::text AS missing_radius,
        count(*) FILTER (
          WHERE "operatingRadiusKm" NOT IN (10, 20, 30, 50, 75, 100)
        )::text AS radius_outside_allowed_values
      FROM "Company"
    `),
    companiesWithoutServices: await one<{
      count: string
    }>(`
      SELECT count(*)::text AS count
      FROM "Company" c
      WHERE NOT EXISTS (
        SELECT 1
        FROM "CompanyService" cs
        WHERE cs."companyId" = c."id"
      )
    `),
    companyServicesWithoutService: await one<{
      count: string
    }>(`
      SELECT count(*)::text AS count
      FROM "CompanyService" cs
      LEFT JOIN "Service" s ON s."id" = cs."serviceId"
      WHERE s."id" IS NULL
    `),
    customersWithoutRequests: await one<{
      count: string
    }>(`
      SELECT count(*)::text AS count
      FROM "Customer" c
      WHERE NOT EXISTS (
        SELECT 1
        FROM "Request" r
        WHERE r."customerId" = c."id"
      )
    `),
    requestsWithCustomerEmailButNoCustomerId: await one<{
      count: string
    }>(`
      SELECT count(*)::text AS count
      FROM "Request"
      WHERE "customerEmail" IS NOT NULL
      AND "customerId" IS NULL
    `),
    requestsWithMissingCustomer: await one<{
      count: string
    }>(`
      SELECT count(*)::text AS count
      FROM "Request" r
      LEFT JOIN "Customer" c ON c."id" = r."customerId"
      WHERE r."customerId" IS NOT NULL
      AND c."id" IS NULL
    `),
    duplicateCustomersByCaseInsensitiveEmail: await one<{
      duplicate_groups: string
      affected_customers: string
    }>(`
      SELECT
        count(*)::text AS duplicate_groups,
        coalesce(sum(customer_count), 0)::text AS affected_customers
      FROM (
        SELECT lower("email") AS normalized_email, count(*) AS customer_count
        FROM "Customer"
        GROUP BY lower("email")
        HAVING count(*) > 1
      ) duplicates
    `),
    expiredUnusedCustomerAccessTokens: await one<{
      count: string
    }>(`
      SELECT count(*)::text AS count
      FROM "CustomerAccessToken"
      WHERE "expiresAt" < now()
      AND "usedAt" IS NULL
    `),
    customerAccessTokensByPurpose: await query<{
      purpose: string
      total: string
      without_request_id: string
      active_unused: string
      expired_unused: string
      used: string
    }>(
      client,
      `
        SELECT
          "purpose",
          count(*)::text AS total,
          count(*) FILTER (WHERE "requestId" IS NULL)::text AS without_request_id,
          count(*) FILTER (WHERE "usedAt" IS NULL AND "expiresAt" >= now())::text AS active_unused,
          count(*) FILTER (WHERE "usedAt" IS NULL AND "expiresAt" < now())::text AS expired_unused,
          count(*) FILTER (WHERE "usedAt" IS NOT NULL)::text AS used
        FROM "CustomerAccessToken"
        GROUP BY "purpose"
        ORDER BY "purpose"
      `,
    ),
    requestVerificationTokensWithoutRequestId: await one<{
      count: string
    }>(`
      SELECT count(*)::text AS count
      FROM "CustomerAccessToken"
      WHERE "purpose" = 'REQUEST_VERIFICATION'
      AND "requestId" IS NULL
    `),
    requestStatusHistoryTokens: await one<{
      count: string
    }>(`
      SELECT count(*)::text AS count
      FROM "CustomerAccessToken"
      WHERE "purpose" = 'REQUEST_STATUS'
      AND "requestId" IS NULL
    `),
    reviewAccessTokensWithoutRequestId: await one<{
      count: string
    }>(`
      SELECT count(*)::text AS count
      FROM "CustomerAccessToken"
      WHERE "purpose" = 'REVIEW_ACCESS'
      AND "requestId" IS NULL
    `),
    requestsWithLegacyStructuredVerification: await one<{
      verification_object_count: string
      token_hash_present_count: string
      technical_verification_text_count: string
    }>(`
      SELECT
        count(*) FILTER (WHERE "structuredData" ? 'verification')::text AS verification_object_count,
        count(*) FILTER (
          WHERE "structuredData" #>> '{verification,tokenHash}' IS NOT NULL
          AND "structuredData" #>> '{verification,tokenHash}' <> ''
        )::text AS token_hash_present_count,
        count(*) FILTER (
          WHERE "structuredData"::text ~* '"(verification|token|tokenHash|expiresAt|usedAt)"'
        )::text AS technical_verification_text_count
      FROM "Request"
      WHERE "structuredData" IS NOT NULL
    `),
    userCustomerEmailOverlap: await one<{
      count: string
    }>(`
      SELECT count(*)::text AS count
      FROM "User" u
      INNER JOIN "Customer" c
        ON lower(u."email") = lower(c."email")
    `),
    approvedRequestsMissingGeo: await one<{
      count: string
    }>(`
      SELECT count(*)::text AS count
      FROM "Request"
      WHERE "status" = 'APPROVED'
      AND ("latitude" IS NULL OR "longitude" IS NULL OR "city" IS NULL)
    `),
    requestsMissingRequiredServices: await one<{
      count: string
    }>(`
      SELECT count(*)::text AS count
      FROM "Request" r
      WHERE NOT EXISTS (
        SELECT 1
        FROM "RequestRequiredService" rrs
        WHERE rrs."requestId" = r."id"
      )
    `),
  }
}

async function main() {
  const client = await pool.connect()

  try {
    await client.query("BEGIN TRANSACTION READ ONLY")

    const tables = await query<{
      table_name: string
    }>(
      client,
      `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `,
    )

    const tableNames = tables.map(
      (table) => table.table_name,
    )

    const columns = await query<{
      table_name: string
      column_name: string
      data_type: string
      udt_name: string
      is_nullable: string
      column_default: string | null
    }>(
      client,
      `
        SELECT
          table_name,
          column_name,
          data_type,
          udt_name,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
      `,
    )

    const foreignKeys = (
      await query<{
        constraint_name: string
        table_name: string
        columns: string[]
        referenced_table: string
        referenced_columns: string[]
        update_action: string
        delete_action: string
        definition: string
      }>(
        client,
        `
          SELECT
            c.conname AS constraint_name,
            source.relname AS table_name,
            array_agg(source_attribute.attname::text ORDER BY source_key.ordinality) AS columns,
            target.relname AS referenced_table,
            array_agg(target_attribute.attname::text ORDER BY target_key.ordinality) AS referenced_columns,
            c.confupdtype AS update_action,
            c.confdeltype AS delete_action,
            pg_get_constraintdef(c.oid) AS definition
          FROM pg_constraint c
          JOIN pg_class source ON source.oid = c.conrelid
          JOIN pg_namespace source_namespace ON source_namespace.oid = source.relnamespace
          JOIN pg_class target ON target.oid = c.confrelid
          JOIN unnest(c.conkey) WITH ORDINALITY AS source_key(attnum, ordinality) ON true
          JOIN pg_attribute source_attribute
            ON source_attribute.attrelid = source.oid
            AND source_attribute.attnum = source_key.attnum
          JOIN unnest(c.confkey) WITH ORDINALITY AS target_key(attnum, ordinality)
            ON target_key.ordinality = source_key.ordinality
          JOIN pg_attribute target_attribute
            ON target_attribute.attrelid = target.oid
            AND target_attribute.attnum = target_key.attnum
          WHERE c.contype = 'f'
          AND source_namespace.nspname = 'public'
          GROUP BY c.oid, source.relname, target.relname
          ORDER BY source.relname, c.conname
        `,
      )
    ).map(
      (foreignKey): DbForeignKey => ({
        constraintName:
          foreignKey.constraint_name,
        tableName: foreignKey.table_name,
        columns: foreignKey.columns,
        referencedTable:
          foreignKey.referenced_table,
        referencedColumns:
          foreignKey.referenced_columns,
        updateAction:
          actionName(foreignKey.update_action),
        deleteAction:
          actionName(foreignKey.delete_action),
        definition: foreignKey.definition,
      }),
    )

    const indexes = (
      await query<{
        table_name: string
        index_name: string
        is_unique: boolean
        is_primary: boolean
        columns: string[]
        definition: string
      }>(
        client,
        `
          SELECT
            table_class.relname AS table_name,
            index_class.relname AS index_name,
            index_data.indisunique AS is_unique,
            index_data.indisprimary AS is_primary,
            coalesce(
              array_agg(attribute.attname::text ORDER BY index_key.ordinality)
                FILTER (WHERE attribute.attname IS NOT NULL),
              ARRAY[]::text[]
            ) AS columns,
            pg_get_indexdef(index_class.oid) AS definition
          FROM pg_index index_data
          JOIN pg_class table_class ON table_class.oid = index_data.indrelid
          JOIN pg_namespace namespace ON namespace.oid = table_class.relnamespace
          JOIN pg_class index_class ON index_class.oid = index_data.indexrelid
          JOIN unnest(index_data.indkey) WITH ORDINALITY AS index_key(attnum, ordinality) ON true
          LEFT JOIN pg_attribute attribute
            ON attribute.attrelid = table_class.oid
            AND attribute.attnum = index_key.attnum
          WHERE namespace.nspname = 'public'
          GROUP BY table_class.relname, index_class.relname, index_data.indisunique, index_data.indisprimary, index_class.oid
          ORDER BY table_class.relname, index_class.relname
        `,
      )
    ).map(
      (index): DbIndex => ({
        tableName: index.table_name,
        indexName: index.index_name,
        columns: index.columns,
        isUnique: index.is_unique,
        isPrimary: index.is_primary,
        definition: index.definition,
      }),
    )

    const expectedIndexCoverage =
      expectedIndexes.map((expected) => ({
        ...expected,
        covered: hasCoveringIndex({
          indexes,
          tableName: expected.tableName,
          columns: expected.columns,
          unique: expected.unique,
          exact: expected.exact,
        }),
      }))

    const foreignKeysWithoutSupportingIndex =
      foreignKeys.filter(
        (foreignKey) =>
          !hasCoveringIndex({
            indexes,
            tableName: foreignKey.tableName,
            columns: foreignKey.columns,
          }),
      )

    const rowCounts =
      await getTableRowCounts(
        client,
        tableNames,
      )

    const businessChecks =
      await getBusinessChecks(client)

    await client.query("ROLLBACK")

    console.log(
      JSON.stringify(
        {
          generatedAt:
            new Date().toISOString(),
          mode: "read-only SELECT audit",
          tables: tableNames,
          columns,
          foreignKeys,
          indexes,
          expectedIndexCoverage,
          foreignKeysWithoutSupportingIndex,
          rowCounts,
          businessChecks,
        },
        null,
        2,
      ),
    )
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {
      // Ignore rollback failures while surfacing the original error.
    })

    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(
      JSON.stringify({
        name: error.name,
        message:
          error.message || "(no error message)",
      }),
    )
  } else {
    console.error(
      JSON.stringify({
        name: "NonErrorThrown",
        message: String(error),
      }),
    )
  }

  process.exitCode = 1
})
