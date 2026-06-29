# TAXONOMY REFOUNDATION — PHASE 8: DATABASE CUTOVER REPORT

Implements [ROADMAP.md](ROADMAP.md) Phase 8 exactly as scoped: additive schema only. No legacy table, column, or code was touched or removed. No matching, dispatch, or notification logic was changed. Migration `20260620211153_phase8_frozen_taxonomy_additive` was generated and applied to the configured database (Neon Postgres) via `prisma migrate dev`; `prisma generate` was run afterward; `tsc --noEmit` was confirmed clean in both `packages/database` and `packages/domain` with zero changes required to existing code — confirming the new schema surface is inert until something is written to read/write it.

---

## A. Schema Verification

| Target (per [02_TARGET_MODEL.md](02_TARGET_MODEL.md) / [docs/taxonomy.md](../taxonomy.md)) | Status | Notes |
|---|---|---|
| `Category` | **MATCH** (extended) | Already existed (legacy: `sectorId`, `services` relation). Added `defaultProjectGroupIds String[] @default([])` — UX-bootstrap-only, no relation, matches FROZEN v2's explicit "not a relationship" framing. Legacy fields untouched. |
| `ProjectGroup` | **CREATED** | New model: `id`, `slug` (unique), `name`, `description?`, `createdAt`, `updatedAt`, `interventions Intervention[]`. Matches docs/taxonomy.md's "persisted, first-class, non-operational" definition exactly — no relation to Company, Request, or any matching-path table. |
| `Intervention.projectGroupId` | **CREATED** | Added as nullable `String?` + `projectGroup ProjectGroup?` relation, `onDelete: SetNull`. **Mismatch from a literal reading of the task** (which didn't specify nullability) **resolved deliberately**: it must be nullable now because existing legacy Intervention rows have no ProjectGroup assigned yet — backfill is Phase 9+ scope, not Phase 8. Flagged here rather than silently decided. |
| `CompanyIntervention` | **CREATED** | Mirrors `CompanyService` exactly: `companyId`, `interventionId`, `createdAt`, `@@id([companyId, interventionId])`, `onDelete: Cascade` both sides. Zero behavioral difference from the proposed shape in [06](06_MATCHING_CUTOVER_DESIGN.md)/[07](07_QUERY_AND_INDEX_PLAN.md). |
| `Request.interventionId` | **CREATED** | Nullable `String?` + `intervention Intervention?` relation, `onDelete: Restrict` — exactly the pattern mandated in [06_MATCHING_CUTOVER_DESIGN.md](06_MATCHING_CUTOVER_DESIGN.md) §6 (mirrors `RequestRequiredService.serviceId`'s existing Restrict pattern for historical stability). `interventionSlug` untouched. |

**No mismatches requiring escalation.** The one nullability judgment call above is the only deviation from a literal reading of the task list, and it's the only schema-correct choice available at this stage.

---

## B. Index Verification

| Index (per [07_QUERY_AND_INDEX_PLAN.md](07_QUERY_AND_INDEX_PLAN.md) §E) | Status |
|---|---|
| `CompanyIntervention @@id([companyId, interventionId])` | **PRESENT** |
| `CompanyIntervention @@index([interventionId])` | **PRESENT** (the load-bearing one for matching, per 07 §E) |
| `CompanyIntervention @@index([companyId])` | **PRESENT** (implied by 07's `CompanyIntervention(companyId)` example, added explicitly even though the compound PK already prefixes on `companyId` — kept for symmetry with `CompanyService`'s existing explicit index and to support any future query that wants only this index, not the full PK) |
| `Request @@index([interventionId])` | **PRESENT** (07 flagged this as low-priority/deferrable; included now since it was zero extra cost in the same migration) |
| `Intervention @@index([projectGroupId])` | **PRESENT** (not explicitly listed in 07's examples, but required by the new FK — added for correctness, not scope creep: an FK column without a supporting index is a real future-scalability gap the plan would have caught at implementation time) |
| `ProjectGroup @@index([name])`, `@@unique(slug)` | **PRESENT** (mirrors the existing `Category`/`Intervention`/`Service` convention of a unique slug + a name index, for consistency, not because 07 specified it) |
| `CompanyMembership (companyId, role)` | **UNVERIFIED — flagged, not added.** 07 §E explicitly could not confirm this from the schema excerpts read at design time and flagged it for verification "at implementation time." **Verified now: this composite index does not exist on `CompanyMembership` today.** Not added in this phase — it supports `resolveNotificationRecipients` (Phase 11 scope), not Phase 8's scope, and 07's plan says "do not optimize beyond documented plan." Recorded here so Phase 11 doesn't rediscover it from scratch. |

**Present:** 6 (all of 07's plan plus the 2 implementation-time additions noted above, both justified by FK/consistency requirements rather than speculative optimization). **Missing:** 0 within Phase 8's scope. **Incorrect:** 0. **Unused:** all are unused right now by design — nothing reads them yet, which is the correct Phase 8 end-state, not a defect.

---

## C. Repository Audit

| Repository | Status | Notes |
|---|---|---|
| `resolve-request-dispatch-candidates.ts` | **Legacy** | Still reads `CategoryService`/`InterventionService`/`CompanyService`/`RequestRequiredService`/`requestMatchingMode` exactly as before — untouched, confirmed by direct inspection, zero behavior change. |
| `create-request-dispatches-for-request.ts` | **Legacy** | Untouched, confirmed. |
| `update-services-configuration.ts`, `get-services-configuration-page.ts` | **Legacy** | Untouched — both still read/write `CompanyService`/`CompanyCategory`/`CategoryService`/`Sector` exactly as before. |
| `create-request.ts` | **Legacy** | Untouched — still resolves `requiredServiceSlugs → Service.id` and writes `RequestRequiredService`. |
| **No new repository file exists yet** for `CompanyIntervention`, `ProjectGroup`, or `Request.interventionId` reads/writes | **Missing (expected)** | Confirmed by direct directory listing of `packages/domain/src/internal/request/dispatch/` (4 files, unchanged) and a repo-wide grep for `companyIntervention`/`projectGroup` inside `packages/domain` (zero hits). This is the correct Phase 8 end-state — Phase 8 is schema-only. |
| **Required for Phase 9** (company configuration) | A `CompanyIntervention` read/write repository, parallel in shape to `update-services-configuration.ts`/`get-services-configuration-page.ts` | Not built in this phase — listed so Phase 9 starts from a known shape, not a blank page |
| **Required for Phase 10** (matching) | `resolveMatchingCandidates()` reading only `Request.interventionId → CompanyIntervention → Company`, per [06](06_MATCHING_CUTOVER_DESIGN.md)/[07](07_QUERY_AND_INDEX_PLAN.md) | Not built in this phase |
| **Required for Phase 13** (request lifecycle) | An `Intervention.findUnique({ where: { slug } })`-based resolver replacing `resolveRequiredServiceIds`, writing `Request.interventionId` | Not built in this phase |

**Confirmed: it is already possible, today, for future matching code to read only from `ProjectGroup`, `Intervention`, `CompanyIntervention`, and `Request` without touching any `Service` table** — the schema fully supports it. No repository currently does this yet; that is correctly out of scope for Phase 8.

---

## D. Request Persistence Audit

- **Can `Request` be fully resolved from `interventionId` alone?** Structurally, yes: `Request.interventionId → Intervention` is a direct FK, sufficient on its own for any future matching/display logic that only needs "which Intervention does this request want."
- **Remaining dependencies confirmed still present (correctly, per scope):** `Request.requiredServices` (the `RequestRequiredService` relation) is untouched and still populated by `create-request.ts` on every new request. `Service`/`InterventionService` are untouched and still read by the legacy matching fallback. **None of this was removed — confirmed by inspection, not assumption.**
- **`Request.interventionId` is currently always `null`** for both new and historical requests, since nothing writes it yet. This is expected and correct for Phase 8; populating it (new requests in Phase 13, historical backfill also Phase 13) is explicitly out of scope here.

---

## E. Company Configuration Audit

- **Is `CompanyIntervention` sufficient to store selected interventions without a `Service` dependency?** Yes, structurally: `companyId` + `interventionId` is a complete, self-sufficient signal — it requires no join through `Service`, `CategoryService`, or `InterventionService` to express "this company wants this intervention." Verified against the exact shape `resolveMatchingCandidates` will need (06 §2, 07 §B): `WHERE EXISTS (SELECT 1 FROM CompanyIntervention WHERE interventionId = :reqInterventionId AND companyId = Company.id)` — fully supported by the schema as written, with the load-bearing index in place (§B above).
- **Currently empty for every company** — no backfill has run (correctly out of Phase 8 scope; backfill is Phase 9).
- **`update-services-configuration.ts` does not yet write to it** (correctly out of Phase 8 scope; confirmed by inspection, zero changes to that file).

---

## F. Blocking Issues

**None found that block Phase 9.** Two items are noted for awareness, not as blockers:

1. **`CompanyMembership (companyId, role)` composite index does not exist** (§B) — not a Phase 8 blocker (Phase 8 doesn't query it), but Phase 11 should add it rather than discover the gap mid-implementation.
2. **`Intervention.projectGroupId` nullability** (§A) — a deliberate, documented design choice, not an open question, but flagged so Phase 9's backfill work is the one that closes it (eventually moving toward non-null once every Intervention has a ProjectGroup), not silently assumed elsewhere.

Neither item required deviating from "additive only, zero legacy impact, zero behavior change" — both are forward-looking notes for the next phase, not problems with this one.

---

## G. Ready For Phase 9?

**YES.**

- The new DB model is complete: `ProjectGroup`, `CompanyIntervention`, `Intervention.projectGroupId`, `Request.interventionId`, `Category.defaultProjectGroupIds` all exist, all match the target design with one documented nullability judgment call (§A).
- Required indexes exist (§B), with one out-of-scope gap (`CompanyMembership`) explicitly deferred to Phase 11, not silently dropped.
- Repositories are identified — both what exists (all legacy, all untouched) and what Phase 9/10/13 each need to build next (§C).
- Request persistence path is known: structurally resolvable from `interventionId` alone once populated; currently unpopulated by design (§D).
- Company persistence path is known: `CompanyIntervention` is structurally sufficient and Service-independent; currently unpopulated by design (§E).
- **Verified, not assumed:** `prisma validate` passed, the migration applied cleanly to the real database, `prisma generate` succeeded, and `tsc --noEmit` passed with zero changes required in `packages/database` and `packages/domain` — confirming the legacy system continues working completely unmodified.
