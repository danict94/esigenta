# TAXONOMY REFOUNDATION — PHASE 10 PRECHECK: REQUEST PERSISTENCE AUDIT

Read-only audit. No code, schema, or data changes were made — confirmed by `git status` showing no modifications beyond this document. Grounded in the actual current code (`create-request.ts` re-read in full) and direct live-database queries (not assumptions from generated files).

---

## A. Current Request Creation Flow

Exactly one function creates requests: `createRequestFromDraft` in `packages/domain/src/public/requests/create-request.ts`.

Flow:
1. Validate the funnel `RequestDraft` (photos, customer contact, geo).
2. `resolveRequiredServiceIds(draft.matchingSignals.requiredServiceSlugs)` — resolves service slugs to `Service.id`s via `prisma.service.findMany({ where: { slug: { in } } })`. Throws `missing_required_services`/`invalid_required_services` if any slug doesn't resolve.
3. Build the `Prisma.RequestCreateInput` object.
4. Inside one `$transaction`: upsert `Customer`, `tx.request.create(...)`, attach any pending `RequestPhoto` rows, create a `CustomerAccessToken` for email verification.
5. Outside the transaction: send the verification email.

---

## B. Current Persistence Model

**Fields populated on every new `Request` row today** (read directly from the `data`/`createdRequest` construction in `create-request.ts`):

| Field | Source |
|---|---|
| `status` | Literal `"PENDING_VERIFICATION"` |
| `requestCode` | `generateUniqueRequestCode()` |
| `interventionSlug` | `draft.interventionSlug` (already resolved upstream by the funnel) |
| `customerEmail` | `draft.contact.email`, validated |
| `customerName` | optional, from `draft.contact` |
| `customerPhone` | optional, from `draft.contact` |
| `structuredData` | `toRequestStructuredData({ draft })` |
| `city`, `address`, `postalCode?`, `latitude`, `longitude` | `draft.geo`, validated |
| `requiredServices` (junction create) | `RequestRequiredService` rows, one per resolved `serviceId` from step A.2 |
| `customer` | connected to the upserted `Customer` row |

**Not populated, confirmed by reading every line of the `data` object construction: `interventionId`.** There is no line anywhere in this file that sets it.

---

## C. `Request.interventionId` Status

**Not populated — anywhere, by anything.** Two independent confirmations:

1. **Code-level**: a repo-wide grep for `request.create(` (any case) across `packages/` returns exactly one match (`create-request.ts` line 340), and that call's `data` object never references `interventionId`.
2. **Data-level**: queried the live database directly — `Request` table has **0 rows total**. There are no historical rows to be missing the field; the column simply has never been written to, by anyone, ever, in this environment.

**Why not:** the column was added in Phase 8 ([08_DATABASE_CUTOVER_REPORT.md](08_DATABASE_CUTOVER_REPORT.md)) as a deliberately additive, unconsumed schema change — Phase 8's own scope explicitly excluded touching request creation. No phase between 8 and now has revisited `create-request.ts`. This is expected, not a defect — but it means Phase 10 cannot assume the column has any data to read.

---

## D. Legacy Dependencies

**Exact dependency chain for request creation today:**

```
RequestDraft.matchingSignals.requiredServiceSlugs (funnel-produced)
  → resolveRequiredServiceIds()
    → prisma.service.findMany({ where: { slug: { in } } })   [Service table]
  → Request.create({ requiredServices: { create: [...] } })   [RequestRequiredService rows]
```

- **`Service`**: read directly (by slug) in `resolveRequiredServiceIds`.
- **`RequestRequiredService`**: written directly, one row per resolved service.
- **`InterventionService`**: **not touched by request creation at all.** It's read only on the upstream funnel side (`resolveInterventionForFunnel` in `packages/taxonomy`, which is how `requiredServiceSlugs` gets populated in the first place, before the draft ever reaches `create-request.ts`) and on the downstream matching side (`resolve-request-dispatch-candidates.ts`'s fallback path). Request creation itself sits strictly between those two, touching only `Service`.
- **`CategoryService`**: **not touched anywhere in the request lifecycle.** It's read only inside matching (`resolve-request-dispatch-candidates.ts`'s category derivation step), never during creation or persistence.

So request *creation*'s only legacy dependency is `Service` (via slug resolution) and the `RequestRequiredService` write it produces. `InterventionService`/`CategoryService` are matching-time dependencies, not creation-time ones — an important distinction Phase 10's matching rewrite addresses on its own, independent of anything in request creation.

---

## E. Required Changes

**Can a request be fully resolved from `Request.interventionId` alone? Structurally yes, practically no today.**

Structurally: the schema already supports it — `Request.interventionId` is a direct FK to `Intervention` (added in Phase 8, `onDelete: Restrict`, indexed). Nothing about the column's shape is missing or wrong.

Practically: it's never populated, so there is currently nothing to resolve. **What's missing is exactly one step in `create-request.ts`**: resolve `draft.interventionSlug → Intervention.id` (a single `findUnique({ where: { slug } })`, mirroring the existing `resolveRequiredServiceIds` pattern exactly) and add `interventionId` to the `data` object passed to `tx.request.create`.

**Files that would need modification before `Request → Intervention → CompanyIntervention` can become the official matching path:**

| File | Required change |
|---|---|
| `packages/domain/src/public/requests/create-request.ts` | Add the slug→id resolution step above; write `interventionId` on creation. This is the only required change to make new requests carry the field — small, additive, and independent of everything else in this file (the `requiredServiceSlugs`/`Service` resolution can keep running unchanged alongside it for now). |
| `packages/domain/src/internal/request/dispatch/resolve-request-dispatch-candidates.ts` | The actual matching rewrite (Phase 10's core deliverable per [06_MATCHING_CUTOVER_DESIGN.md](06_MATCHING_CUTOVER_DESIGN.md)) — reads `Request.interventionId`, which will be `NULL` for every request created before the change above ships, and populated for every request created after. |
| `packages/database/prisma/schema.prisma` | **No further change needed.** Phase 8 already added the column, FK, and index — confirmed still correct and sufficient by re-inspection in this audit. |

**Not required to unblock Phase 10**, despite being in the same general area:
- `packages/funnel/**` — `draft.interventionSlug` is already present on every draft today; no funnel change is needed to make the `create-request.ts` fix above possible.
- Dropping the `requiredServiceSlugs`/`RequestRequiredService` write path — that's a separate (Phase 13) cleanup decision, not a blocker for Phase 10 to start reading `interventionId` on whatever requests do have it.
- Any historical backfill — **there is nothing to backfill.** The `Request` table has 0 rows in this environment, so the historical-data risk flagged in [06_MATCHING_CUTOVER_DESIGN.md](06_MATCHING_CUTOVER_DESIGN.md) §10 ("interventionSlug no longer resolves to a live Intervention") and in [03_MIGRATION_PLAN.md](03_MIGRATION_PLAN.md) Step 5 currently has zero rows to apply to. This must be re-checked once real request volume exists — it is not permanently resolved, just not currently a blocker.

---

## F. Ready For Matching Cutover?

**NO — not yet, but the gap is narrow, well-defined, and low-risk, not a re-scope of Phase 10.**

Reasoning: Phase 10's matching design ([06_MATCHING_CUTOVER_DESIGN.md](06_MATCHING_CUTOVER_DESIGN.md)) is built entirely around `Request.interventionId ∩ CompanyIntervention.interventionId`. `CompanyIntervention` is ready (Phase 9, confirmed working end-to-end). `Request.interventionId` is schema-ready (Phase 8) but **functionally empty and will stay empty** for every request created until `create-request.ts` is updated — meaning `resolveMatchingCandidates()` could be written today, but it would have nothing to match against for any new request, making shadow-mode validation (the actual purpose of Phase 10's first sub-step) impossible to run meaningfully.

**Recommendation, not an implementation:** pull the single small change identified in §E (`create-request.ts`'s slug→id resolution + write) forward, either as a "Phase 9.5"-style precursor or as the first task inside Phase 10 itself, rather than waiting for the full Phase 13 (Request Lifecycle Cutover) — Phase 13's remaining scope (dropping the legacy write path, funnel cleanup, historical backfill) is genuinely independent of this and can stay sequenced where the roadmap already has it. This is a much smaller ask than re-ordering the roadmap: one additive field write, no removals, no risk to the existing `requiredServiceSlugs`/`Service` path, and — critically — zero historical data to reconcile, since the `Request` table is currently empty.
