/**
 * Integration lifecycle tests — DB-backed, requires DATABASE_URL to point
 * at a database whose Intervention table already has the
 * publicationStatus column (see prisma/migrations/
 * 20260807220000_add_intervention_publication_status). The `before` hook
 * runs the real sync once, so the file is self-contained: no external
 * "run sync first" step required.
 *
 * NEVER run against production without explicit authorization — point
 * DATABASE_URL at a local/test/branch database. Beyond the sync in `before`
 * and the two convergence tests (which sync again as their own assertion),
 * these tests only read; the fail-safe test creates and deletes its own
 * throwaway row.
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

const DRAFT_SLUG = "impermeabilizzare-terrazzo"
const DRAFT_QUERIES = [
  "impermeabilizzare terrazzo",
  "impermeabilizzazione terrazzo",
  "guaina terrazzo",
  "infiltrazioni terrazzo",
]

before(async () => {
  // Establishes the baseline the read-only tests below assume (rifare-tetto
  // etc. PUBLISHED, impermeabilizzare-terrazzo DRAFT) via the real sync
  // path, not a manual SQL fixture — the same code production would run.
  await syncCatalogToDatabase(prisma)
})

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

test("DRAFT — search never returns impermeabilizzare-terrazzo, on any of its own alias queries", async () => {
  for (const query of DRAFT_QUERIES) {
    const results = await searchTaxonomy({ query })
    assert.ok(
      !results.some((r) => r.slug === DRAFT_SLUG),
      `query "${query}" must not surface ${DRAFT_SLUG}`,
    )
  }
})

test("DRAFT — /richiesta does not resolve impermeabilizzare-terrazzo", async () => {
  const resolved = await resolveInterventionForFunnel(DRAFT_SLUG)
  assert.equal(resolved, null)
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

test("SYNC CONVERGENCE — a published frozen intervention overrides DB drift back to PUBLISHED", async () => {
  await prisma.intervention.update({
    where: { slug: "rifare-tetto" },
    data: { publicationStatus: "DRAFT" },
  })

  await syncCatalogToDatabase(prisma)

  const after = await prisma.intervention.findUnique({
    where: { slug: "rifare-tetto" },
    select: { publicationStatus: true },
  })
  assert.equal(after?.publicationStatus, "PUBLISHED")
})

test("SYNC CONVERGENCE — the draft frozen intervention overrides DB drift back to DRAFT", async () => {
  await prisma.intervention.update({
    where: { slug: DRAFT_SLUG },
    data: { publicationStatus: "PUBLISHED" },
  })

  await syncCatalogToDatabase(prisma)

  const after = await prisma.intervention.findUnique({
    where: { slug: DRAFT_SLUG },
    select: { publicationStatus: true },
  })
  // Frozen always wins: impermeabilizzare-terrazzo ends this test suite
  // exactly as it started it — DRAFT — regardless of what drifted in
  // between.
  assert.equal(after?.publicationStatus, "DRAFT")
})
