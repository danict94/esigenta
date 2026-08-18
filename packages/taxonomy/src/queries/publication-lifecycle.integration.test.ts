/**
 * Integration lifecycle tests — DB-backed, requires DATABASE_URL to point
 * at a database whose Intervention table already has the
 * publicationStatus column (see prisma/migrations/
 * 20260807220000_add_intervention_publication_status). The `before` hook
 * runs the real sync once, so the file is self-contained: no external
 * "run sync first" step required.
 *
 * NEVER run against production without explicit authorization — point
 * DATABASE_URL at a local/test/branch database.
 *
 * SAFETY NOTE (2026-08, verified directly via the Neon API, not assumed):
 * the DATABASE_URL configured in this repo's .env resolves to Neon project
 * "Esigenta" (purple-glitter-37268985), compute ep-little-dew-aljt0wd6,
 * which belongs to branch br-odd-dew-al5nhkxe — the "production" branch
 * (primary/default, the only non-archived branch in the project; the two
 * other branches are archived backups, not connectable). There is
 * currently NO separate test/dev/preview branch provisioned for this
 * project. This means, as configured today, this suite MUST NOT be run at
 * all from this environment — every write here (draft fixtures aside,
 * which clean up after themselves) would land on production, including the
 * two convergence tests that briefly flip a real Intervention's
 * publicationStatus before re-syncing it back. If a safe branch is
 * provisioned later, point DATABASE_URL at it explicitly for this suite
 * only.
 *
 * DRAFT coverage (2026-08 rewrite): the tests below no longer depend on any
 * specific real Intervention being draft. Frozen taxonomy can have 0, 1, or
 * N draft Interventions at any given time (see
 * ../frozen/publication-status.test.ts for the same principle at the unit
 * level) — the "DRAFT —" tests create their own disposable draft
 * Intervention row instead. syncCatalogToDatabase only iterates
 * Interventions listed in frozen taxonomy (see
 * ../frozen/orchestrator/sync-catalog-to-database.ts) and never touches a
 * row absent from it, so a throwaway row created directly via Prisma (same
 * pattern as the FAIL-SAFE test below) survives the `before` sync
 * untouched and is always cleaned up in its own `finally`.
 *
 * Run: DATABASE_URL="..." node --import tsx --test \
 *   src/queries/publication-lifecycle.integration.test.ts
 * (also covered by `pnpm --filter @esigenta/taxonomy test:lifecycle-db`).
 */
import assert from "node:assert/strict"
import { before, test } from "node:test"

import { prisma } from "@esigenta/database"

import { searchTaxonomy } from "./search-taxonomy"
import { resolveInterventionForFunnel } from "./resolve-intervention-for-funnel"
import { syncCatalogToDatabase } from "../frozen/orchestrator/sync-catalog-to-database"

before(async () => {
  // Establishes the baseline the read-only tests below assume (every
  // frozen Intervention synced to its own real publicationStatus) via the
  // real sync path, not a manual SQL fixture — the same code production
  // would run.
  await syncCatalogToDatabase(prisma)
})

/**
 * Creates a disposable DRAFT Intervention, runs `run` with it, then always
 * deletes it — regardless of what `run` does or throws. Never synced from
 * frozen taxonomy (see the module comment above), so it exercises the real
 * publicationStatus = "PUBLISHED" gate that searchTaxonomy/
 * resolveInterventionForFunnel apply to any row that would otherwise
 * match, without requiring — or creating — a real draft Intervention in
 * frozen taxonomy.
 */
async function withThrowawayDraftIntervention<T>(
  namePrefix: string,
  run: (intervention: { id: string; slug: string; name: string }) => Promise<T>,
): Promise<T> {
  const unique = `${namePrefix}-${Date.now()}`
  const created = await prisma.intervention.create({
    data: {
      slug: `test-draft-${unique}`,
      name: `Test draft ${unique}`,
      publicationStatus: "DRAFT",
    },
  })

  try {
    return await run(created)
  } finally {
    await prisma.intervention.delete({ where: { id: created.id } })
  }
}

test("PUBLISHED — search finds a known published intervention", async () => {
  const results = await searchTaxonomy({ query: "impermeabilizzare tetto" })
  assert.ok(
    results.some((r) => r.slug === "impermeabilizzare-tetto"),
    "impermeabilizzare-tetto must be findable",
  )
})

test("PUBLISHED — search still prefers the correct sibling (no cross-regression)", async () => {
  const balcone = await searchTaxonomy({ query: "impermeabilizzare balcone" })
  assert.equal(balcone[0]?.slug, "impermeabilizzare-balcone-ballatoio")

  const tetto = await searchTaxonomy({ query: "impermeabilizzare tetto" })
  assert.equal(tetto[0]?.slug, "impermeabilizzare-tetto")
})

test("PUBLISHED — /richiesta resolves a known published intervention", async () => {
  const resolved = await resolveInterventionForFunnel("rifare-tetto")
  assert.ok(resolved, "rifare-tetto must resolve")
  assert.equal(resolved?.slug, "rifare-tetto")
})

// Test-fix 2026-08: era basato su impermeabilizzare-terrazzo come slug
// draft reale (ora published, dato non toccato qui) — vedi il commento di
// modulo in cima al file. searchTaxonomy applica un filtro SQL esplicito
// `publicationStatus: "PUBLISHED"` sulle stesse righe candidate trovate per
// nome/slug/alias (vedi search-taxonomy.ts): un record che esiste
// davvero e matcherebbe per testo, ma viene comunque escluso per lo stato
// draft, è quindi un test genuino di quel filtro — non equivalente a
// "cercare una stringa che non matcha nulla".
test("DRAFT — search never returns a draft Intervention, even when it would otherwise match by name", async () => {
  await withThrowawayDraftIntervention("search", async (intervention) => {
    const results = await searchTaxonomy({ query: intervention.name })
    assert.ok(
      !results.some((r) => r.id === intervention.id),
      "a draft Intervention that matches the query text by name must never surface in search results",
    )
  })
})

// Test-fix 2026-08: stesso principio del test sopra. resolveInterventionForFunnel
// tratta "esiste ma è draft" e "non esiste" allo stesso modo per design
// (vedi il commento nella funzione stessa: "no separate 'not public yet'
// response, same notFound()") — qui verifichiamo comunque con una riga
// draft realmente persistita, non solo con uno slug inventato, per
// coprire esplicitamente anche il secondo ramo della condizione
// (`intervention.publicationStatus !== "PUBLISHED"`), non solo il primo
// (`!intervention`).
test("DRAFT — /richiesta does not resolve a draft Intervention, even though it exists", async () => {
  await withThrowawayDraftIntervention("resolve", async (intervention) => {
    const resolved = await resolveInterventionForFunnel(intervention.slug)
    assert.equal(resolved, null)
  })
})

test("FAIL-SAFE — a row written without an explicit publicationStatus is born DRAFT", async () => {
  const slug = `test-failsafe-default-${Date.now()}`

  const created = await prisma.intervention.create({
    data: { slug, name: "Test fail-safe default" },
  })

  try {
    assert.equal(
      created.publicationStatus,
      "DRAFT",
      "the column default must be DRAFT, never PUBLISHED",
    )
  } finally {
    // Throwaway fixture row — never left behind, on any DB this runs against.
    await prisma.intervention.delete({ where: { id: created.id } })
  }
})

// Test-fix 2026-08: era in due varianti, "...back to PUBLISHED" (rifare-tetto)
// e "...back to DRAFT" (impermeabilizzare-terrazzo, ora published — la
// seconda variante è quindi irrealizzabile con dati reali, e non necessaria:
// syncCatalogToDatabase non ha alcun branching sulla direzione, chiama
// sempre lo stesso upsert incondizionato con
// `publicationStatus: toDbPublicationStatus(intervention.publicationStatus)`
// (vedi ../frozen/orchestrator/sync-catalog-to-database.ts) — testare UNA
// direzione con dati reali dimostra già il meccanismo generale, non serve
// un secondo Intervention draft solo per simmetria. La copertura del ramo
// "draft" a livello di logica pura resta nei test sintetici di
// ../frozen/publication-status.test.ts. Rinominato in modo status-agnostico.
test("SYNC CONVERGENCE — frozen publication status overrides database drift", async () => {
  await prisma.intervention.update({
    where: { slug: "rifare-tetto" },
    data: { publicationStatus: "DRAFT" },
  })

  await syncCatalogToDatabase(prisma)

  const after = await prisma.intervention.findUnique({
    where: { slug: "rifare-tetto" },
    select: { publicationStatus: true },
  })
  assert.equal(
    after?.publicationStatus,
    "PUBLISHED",
    "frozen taxonomy says rifare-tetto is published — sync must restore that over the DB drift introduced above",
  )
})
