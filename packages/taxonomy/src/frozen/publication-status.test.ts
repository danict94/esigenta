/**
 * Pure, in-memory lifecycle tests — no DB, no network, no I/O. Runs
 * directly against the frozen SSOT, so it is always safely runnable
 * (CI, local, anywhere) with zero setup.
 *
 * Run: node --import tsx --test src/frozen/publication-status.test.ts
 * (also covered by `pnpm --filter @esigenta/taxonomy test`).
 */
import assert from "node:assert/strict"
import { test } from "node:test"

import { frozenTaxonomySource } from "./source"
import type { FrozenProjectGroup } from "./source"
import {
  findInterventionPublicationStatus,
  getInterventionPublicationStatus,
  isInterventionPublished,
} from "./publication-status"

function allInterventions() {
  return frozenTaxonomySource.projectGroups.flatMap(
    (projectGroup) => projectGroup.interventions,
  )
}

test("frozen taxonomy counts match the migrated baseline", () => {
  assert.equal(frozenTaxonomySource.categories.length, 13)
  assert.equal(frozenTaxonomySource.projectGroups.length, 20)
  assert.equal(allInterventions().length, 101)
})

// Test-fix 2026-08: era "exactly one Intervention is draft, and it is
// impermeabilizzare-terrazzo" — impermeabilizzare-terrazzo è ora published
// (deciso in una fase editoriale precedente, non un dato da toccare qui),
// quindi quell'aspettativa puntuale è obsoleta. Sostituita con un invariante
// strutturale che non dipende da QUALE o QUANTI Intervention sono draft in
// un dato momento: ogni Intervention è o published o draft (nessun terzo
// stato, nessun doppio conteggio), verificato di nuovo qui sulla somma reale
// — non solo sul singolo valore, già coperto da "every Intervention has an
// explicit, valid publicationStatus" più sotto.
test("ogni Intervention è published o draft, e la somma dei due insiemi coincide con il totale", () => {
  const interventions = allInterventions()
  const draft = interventions.filter((i) => i.publicationStatus === "draft")
  const published = interventions.filter(
    (i) => i.publicationStatus === "published",
  )

  assert.equal(draft.length + published.length, interventions.length)
})

test("every Intervention has an explicit, valid publicationStatus", () => {
  for (const intervention of allInterventions()) {
    assert.ok(
      intervention.publicationStatus === "draft" ||
        intervention.publicationStatus === "published",
      `${intervention.slug} has an invalid publicationStatus: ${String(
        intervention.publicationStatus,
      )}`,
    )
  }
})

test("isInterventionPublished / getInterventionPublicationStatus — published", () => {
  for (const slug of [
    "rifare-tetto",
    "impermeabilizzare-tetto",
    "impermeabilizzare-balcone-ballatoio",
    "ristrutturare-bagno",
  ]) {
    assert.equal(getInterventionPublicationStatus(slug), "published")
    assert.equal(isInterventionPublished(slug), true)
  }
})

// Test-fix 2026-08: era basato su impermeabilizzare-terrazzo come slug
// draft reale — ora published (fase editoriale precedente, dato non
// toccato qui), e frozen taxonomy oggi non ha più nessun Intervention
// draft (vedi il test sulla somma qui sopra). Riscritto contro una fixture
// sintetica passata a findInterventionPublicationStatus — stessa identica
// logica di getInterventionPublicationStatus/isInterventionPublished (che
// la chiamano con i dati reali, comportamento reale invariato), ma
// indipendente da uno slug reale pubblicato: verifica il comportamento del
// sistema per lo stato "draft", non il fatto che una guida specifica lo sia
// oggi.
test("findInterventionPublicationStatus — draft (fixture sintetica, non uno slug reale)", () => {
  const syntheticGroups: FrozenProjectGroup[] = [
    {
      id: "test-group",
      slug: "test-group",
      name: "Test group",
      interventions: [
        {
          id: "test-draft-intervention",
          slug: "test-draft-intervention",
          name: "Test draft intervention",
          publicationStatus: "draft",
        },
      ],
    },
  ]

  const status = findInterventionPublicationStatus(syntheticGroups, "test-draft-intervention")

  // isInterventionPublished non è parametrizzabile con dati sintetici (chiama
  // sempre i dati reali per costruzione, giustamente — vedi i suoi test
  // dedicati sopra): qui verifichiamo la STESSA logica di confronto che usa
  // al suo interno (`=== "published"`), non la funzione letterale — PRIMA
  // che assert.equal restringa il tipo, altrimenti TypeScript la segnala
  // come sempre falsa per costruzione (corretto: è proprio quello che
  // vogliamo dimostrare).
  assert.equal(status === "published", false)
  assert.equal(status, "draft")
})

test("isInterventionPublished / getInterventionPublicationStatus — unknown slug", () => {
  assert.equal(getInterventionPublicationStatus("does-not-exist"), null)
  assert.equal(isInterventionPublished("does-not-exist"), false)
})

// Test-fix 2026-08: era "...keeps its full taxonomy work WHILE DRAFT" —
// impermeabilizzare-terrazzo è ora published (fase editoriale precedente,
// dato non toccato qui), quindi la premessa "while draft" non vale più.
// Le altre asserzioni (name/aliases/group/category) restano valide e utili
// indipendentemente dallo stato di pubblicazione: la registrazione completa
// in taxonomy non dipende da publicationStatus. Titolo e assert aggiornati,
// nessun'altra modifica.
test("impermeabilizzare-terrazzo keeps its full taxonomy work (name/aliases/group/category)", () => {
  const intervention = allInterventions().find(
    (i) => i.slug === "impermeabilizzare-terrazzo",
  )

  assert.ok(intervention, "impermeabilizzare-terrazzo must exist in frozen")
  assert.equal(intervention?.name, "Impermeabilizzare terrazzo")
  assert.equal(intervention?.publicationStatus, "published")
  assert.equal(intervention?.aliases?.length, 11)

  const group = frozenTaxonomySource.projectGroups.find((projectGroup) =>
    projectGroup.interventions.some(
      (i) => i.slug === "impermeabilizzare-terrazzo",
    ),
  )
  assert.equal(group?.slug, "facciate-e-balconi")

  const owningCategory = frozenTaxonomySource.categories.find((category) =>
    category.projectGroups.includes("facciate-e-balconi"),
  )
  assert.equal(owningCategory?.slug, "impresa-edile")
})
