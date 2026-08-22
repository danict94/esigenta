import assert from "node:assert/strict"
import test from "node:test"

import { resolveCutoff } from "./cleanup-orphan-request-photos"

// FASE 7 FINAL (§C) — solo la matematica pura del cutoff è testata qui,
// deliberatamente: cleanupOrphanRequestPhotos nel suo complesso tocca
// sempre Prisma (prisma.requestPhoto.findMany/delete) E il provider
// UploadThing reale (deleteRequestPhotoFiles) — nessuno dei due viene mai
// toccato dai test di questo pacchetto, stesso vincolo già rispettato
// ovunque in packages/domain. La verifica end-to-end (batch/failure
// parziale/idempotenza) è demandata a una verifica manuale/production,
// come già avvenuto per altre query Prisma-touching in questo progetto
// (vedi admin-funnel-metrics.ts, create-request.ts).

test("resolveCutoff: esattamente 48 ore prima del riferimento", () => {
  const now = new Date("2026-08-24T12:00:00.000Z")

  assert.equal(resolveCutoff(now).toISOString(), "2026-08-22T12:00:00.000Z")
})

test("resolveCutoff: senza argomento usa l'istante corrente (differenza dal now reale trascurabile in un test veloce)", () => {
  const before = Date.now()
  const cutoff = resolveCutoff()
  const after = Date.now()

  const expectedMin = before - 48 * 60 * 60 * 1000
  const expectedMax = after - 48 * 60 * 60 * 1000

  assert.ok(cutoff.getTime() >= expectedMin)
  assert.ok(cutoff.getTime() <= expectedMax)
})
