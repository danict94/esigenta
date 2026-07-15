import assert from "node:assert/strict"
import test from "node:test"

import type { CompanyActor } from "@esigenta/auth"

import { buildSharedRequestDetailReadModel } from "./request-detail-read-model"
import type { ResolvedCompanyRequestDetailCore } from "./resolve-request-detail-core"

const actor: CompanyActor = {
  user: { id: "user-1", name: "Impresa", email: "impresa@example.test" },
  company: {
    id: "company-1",
    status: "APPROVED",
    isActive: true,
    deletedAt: null,
  },
  role: "OWNER",
}

function createRequest(
  overrides: Partial<ResolvedCompanyRequestDetailCore> = {},
): ResolvedCompanyRequestDetailCore {
  return {
    id: "request-1",
    requestCode: "R-1",
    status: "PUBLISHED",
    interventionSlug: "ristrutturazione-bagno",
    city: "Milano",
    address: "Milano MI",
    postalCode: "20100",
    latitude: 45.46,
    longitude: 9.19,
    structuredData: {
      rawAnswers: {
        description: "Rifare il bagno",
        timing: "within_30_days",
        budget: "5000",
      },
    },
    creditCost: 10,
    maxUnlocks: 3,
    unlockCount: 1,
    isSaved: true,
    hasUnlocked: false,
    requestUnlockId: null,
    unlockedAt: null,
    customerContact: null,
    requestUnlockRefund: null,
    createdAt: new Date("2026-07-01T10:00:00.000Z"),
    photoCount: 0,
    ...overrides,
  }
}

test("builds shared content and commercial permissions once", () => {
  const detail = buildSharedRequestDetailReadModel({
    actor,
    request: createRequest(),
    creditBalance: 20,
  })

  assert.equal(detail.title, "Ristrutturazione bagno a Milano MI")
  assert.equal(detail.description, "Rifare il bagno")
  assert.deepEqual(detail.formDetails, [
    { label: "Tempistiche", value: "Entro 30 giorni" },
    { label: "Budget", value: "5000" },
  ])
  assert.equal(detail.commercialState.availableUnlockSlots, 2)
  assert.equal(detail.permissions.canSave, true)
  assert.equal(detail.permissions.canUnlock, true)
  assert.equal(detail.permissions.canContactCustomer, false)
})

test("exposes contacts and refund permission only for a valid unlock", () => {
  const detail = buildSharedRequestDetailReadModel({
    actor,
    request: createRequest({
      hasUnlocked: true,
      requestUnlockId: "unlock-1",
      unlockedAt: new Date("2026-07-02T10:00:00.000Z"),
      customerContact: {
        name: "Cliente",
        email: "cliente@example.test",
        phone: null,
      },
      requestUnlockRefund: {
        refundedAt: null,
        refundTransactionId: null,
        refundRequest: null,
      },
    }),
    creditBalance: 20,
  })

  assert.equal(detail.customerContact?.name, "Cliente")
  assert.equal(detail.permissions.canUnlock, false)
  assert.equal(detail.permissions.canContactCustomer, true)
  assert.equal(detail.permissions.canRequestRefund, true)
})
