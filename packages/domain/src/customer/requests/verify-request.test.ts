import assert from "node:assert/strict"
import test from "node:test"

import { isRequestAlreadyVerified } from "./verify-request"

// FASE 7 FINAL (§B) — solo il confine di decisione puro è testato qui,
// deliberatamente: verifyWithAccessToken nel suo complesso (la
// transazione, il consumo atomico del token, l'invio della notifica admin
// esattamente una volta) tocca sempre @esigenta/database/Prisma, e questo
// pacchetto non fa mai toccare Postgres ai propri test — stesso vincolo
// già rispettato ovunque in packages/domain (vedi
// public/funnel-events/record-funnel-event.test.ts). Questo è comunque il
// cuore della correttezza del fix: decide se un token "perso nella race"
// significa "la Request è già verificata da un tentativo concorrente"
// (ALREADY_VERIFIED, mai un errore) oppure "il token non ha davvero nulla
// da mostrare" (invalid, comportamento invariato).

test("isRequestAlreadyVerified: Request con verifiedAt valorizzato -> true, indipendentemente dallo status", () => {
  assert.equal(
    isRequestAlreadyVerified({ verifiedAt: new Date(), status: "PENDING_REVIEW" }),
    true,
  )
})

test("isRequestAlreadyVerified: status diverso da PENDING_VERIFICATION (es. già in revisione/pubblicata) -> true anche senza verifiedAt esplicito", () => {
  assert.equal(
    isRequestAlreadyVerified({ verifiedAt: null, status: "APPROVED" }),
    true,
  )
  assert.equal(
    isRequestAlreadyVerified({ verifiedAt: null, status: "PUBLISHED" }),
    true,
  )
})

test("isRequestAlreadyVerified: Request ancora PENDING_VERIFICATION e mai verificata -> false — un token che perde la race qui è un errore reale, non una race legittima", () => {
  assert.equal(
    isRequestAlreadyVerified({ verifiedAt: null, status: "PENDING_VERIFICATION" }),
    false,
  )
})

test("isRequestAlreadyVerified: Request non trovata (null) -> false, mai un throw", () => {
  assert.equal(isRequestAlreadyVerified(null), false)
})
