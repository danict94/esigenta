import assert from "node:assert/strict"
import test from "node:test"

import type { Prisma } from "@prisma/client"

import { writeCompanyServiceConfigurationWithClient } from "./write-company-service-configuration"

test("configuration save replaces Category and Intervention sets atomically", async () => {
  let calls = 0
  let sql = ""
  let values: unknown[] = []
  const client = {
    $executeRaw: async (strings: TemplateStringsArray, ...parameters: unknown[]) => {
      calls += 1
      sql = strings.join("?")
      values = parameters
      return 1
    },
  } as unknown as Prisma.TransactionClient

  await writeCompanyServiceConfigurationWithClient(client, {
    companyId: "company-1",
    categoryIds: ["category-new"],
    interventionIds: ["kept", "added"],
  })

  assert.equal(calls, 1)
  assert.match(sql, /DELETE FROM "CompanyCategory"/)
  assert.match(sql, /INSERT INTO "CompanyCategory"/)
  assert.match(sql, /DELETE FROM "CompanyIntervention"/)
  assert.match(sql, /INSERT INTO "CompanyIntervention"/)
  assert.ok(values.includes("company-1"))
  assert.ok(values.includes(client) === false)
  assert.ok(values.some((value) => Array.isArray(value) && value.join() === "kept,added"))
})
