import assert from "node:assert/strict"
import test from "node:test"

import type { Prisma } from "@prisma/client"

import { resolveRequestDispatchCandidatesWithClient } from "./resolve-request-dispatch-candidates"

test("dispatch joins CompanyIntervention and never derives capability from Category", async () => {
  let candidateSql = ""
  const client = {
    request: {
      findUnique: async () => ({
        id: "request-1",
        requestCode: "REQ-1",
        interventionSlug: "water-leak",
        interventionId: "intervention-1",
        geoLocation: { city: "Roma", latitude: 41.9, longitude: 12.5 },
      }),
    },
    $queryRaw: async (strings: TemplateStringsArray) => {
      candidateSql = strings.join("?")
      return [
        {
          company_id: "company-1",
          recipient_email: "owner@example.test",
          distance_km: 2,
          operating_radius_km: 30,
        },
      ]
    },
  } as unknown as Prisma.TransactionClient

  const result = await resolveRequestDispatchCandidatesWithClient(
    client,
    "request-1",
  )

  assert.equal(result.ok, true)
  assert.match(candidateSql, /JOIN "CompanyIntervention"/)
  assert.doesNotMatch(candidateSql, /JOIN "Category"/)
})
