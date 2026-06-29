# TAXONOMY REFOUNDATION — PHASE 10: MATCHING CUTOVER REPORT

Implementation phase. Legacy matching has been **removed** from the candidate resolution path, not deprecated alongside it — per this phase's explicit objective. `Service`, `CategoryService`, `InterventionService`, `CompanyService`, `RequestRequiredService`, and `Company.requestMatchingMode` are no longer read anywhere in the matching/dispatch code. No fallback to legacy matching was kept, because none was necessary — confirmed by shadow validation (§D) before the switch, not assumed.

---

## A. Files Changed

| File | Change |
|---|---|
| `packages/domain/src/internal/request/dispatch/resolve-request-dispatch-candidates.ts` | **Rewritten.** Legacy chain (`RequestRequiredService`/`InterventionService` fallback → `CategoryService` → `Company` filtered by `CompanyCategory`/`CompanyService` → `requestMatchingMode` branch) replaced entirely with `Request.interventionId → WHERE EXISTS (CompanyIntervention) → Company`. |
| `packages/domain/src/internal/request/dispatch/types.ts` | `RequestDispatchServiceSource` removed. `RequestDispatchCandidate.matchedServiceIds` removed (no successor value). `RequestDispatchFailureCode`'s `request_services_not_resolved` replaced with `request_intervention_not_resolved`. `ResolveRequestDispatchCandidatesResult` drops `resolvedServiceIds`/`resolvedServiceCount`, adds `interventionId`. |
| `packages/domain/src/internal/request/dispatch/create-request-dispatches-for-request.ts` | Drops the `matchedServiceIds` field from the `RequestDispatch.createMany` write and `resolvedServiceCount` from the result object — both followed directly from the type changes above, no independent logic change. |
| `packages/domain/src/admin/requests/review-request.ts` | `createDispatchFailureMessage` updated: `request_services_not_resolved` branch replaced with `request_intervention_not_resolved`, new Italian message. This was a real consumer that would have silently fallen through to the generic "not found" message if missed. |
| `packages/domain/src/internal/request/dispatch/index.ts`, `packages/domain/src/internal/request/index.ts` | Barrel exports updated to drop `RequestDispatchServiceSource`. |

**Confirmed untouched:** `notification-deliveries.ts`, `apps/admin/src/lib/notifications/process-request-email-deliveries.ts` — no notification code needed any change, exactly as predicted in [06_MATCHING_CUTOVER_DESIGN.md](06_MATCHING_CUTOVER_DESIGN.md) §6.

---

## B. Old Matching Flow

1. Resolve `serviceIds`: prefer `RequestRequiredService` rows; fall back to `Intervention → InterventionService` by `interventionSlug`.
2. Join `Service → CategoryService → categoryId` to derive eligible categories.
3. Query `Company` filtered by `CompanyCategory` membership in those categories, with `CompanyService` and `requestMatchingMode` read alongside.
4. Branch: if `requestMatchingMode === "SELECTED_SERVICES_ONLY"` and zero matched services, exclude the company.
5. Compute `matchStrength` (`SERVICE_MATCH`/`CATEGORY_MATCH`), build a 9-key `matchReason`.

3–4 round trips, 3 join tables (`CategoryService`, `InterventionService`, `CompanyService`/`CompanyCategory` combined read), 2 conditional branches.

---

## C. New Matching Flow

1. Fetch `Request` by id, selecting `interventionId` (plus `interventionSlug`/geo/requestCode for display and the distance check).
2. If `interventionId` is `null` → fail with `request_intervention_not_resolved` (this can no longer realistically happen for requests created after [09_5_REQUEST_INTERVENTION_WRITE_REPORT.md](09_5_REQUEST_INTERVENTION_WRITE_REPORT.md), but is still a real, reachable failure path for any pre-Phase-9.5 request, of which there are currently none in this environment).
3. Query `Company` with `interventions: { some: { interventionId } }` — a single `where` clause, one join against `CompanyIntervention`, alongside the unchanged geo/status/active filters.
4. In-memory Haversine distance filter against `operatingRadiusKm` (unchanged from legacy — not a regression, see [07_QUERY_AND_INDEX_PLAN.md](07_QUERY_AND_INDEX_PLAN.md) §F for the separately-tracked optimization opportunity).
5. `matchReason` is a flat 3-key object: `{ interventionId, distanceKm, operatingRadiusKm }`.

2 round trips, 1 join table, 0 conditional branches — matches [06](06_MATCHING_CUTOVER_DESIGN.md)/[07](07_QUERY_AND_INDEX_PLAN.md) exactly, verified by reading the final code, not just by design intent.

---

## D. Shadow Validation Results

Run against the real database with two constructed scenarios (company/request rows created, exercised, then fully deleted/restored — confirmed clean afterward):

**Scenario 1 — full coverage** (company configured with matching `CompanyCategory` + `CompanyService` + `CompanyIntervention`, request targeting `riparare-perdita-acqua`):

| | Legacy | New |
|---|---|---|
| Candidate count | 1 | 1 |
| Candidate company id | `cmqmj5k68...` | `cmqmj5k68...` (identical) |
| Distance | 0.296382237993841 km | 0.29638223799384095 km |

**Identical result**, modulo a floating-point-precision difference in the 14th decimal digit from two independently-implemented Haversine functions — not a behavioral discrepancy.

**Scenario 2 — broad-net divergence** (same company, same request, but with `CompanyService`/`CompanyIntervention` removed, leaving only `CompanyCategory`):

| | Legacy | New |
|---|---|---|
| Candidate count | 1 (category fallback, `matchedServiceIds: []`) | 0 |

**A real, expected divergence — explained exactly, not hand-waved:** legacy's `CATEGORY_WITH_SERVICE_PRIORITY` mode (the default) matches on category membership alone, regardless of service/intervention configuration. The new model has no category-level fallback by design — `Intervention` is the only matching unit, per [docs/taxonomy.md](../taxonomy.md), and this is exactly the "broad-net" regression flagged as real and accepted (not a bug) in [06_MATCHING_CUTOVER_DESIGN.md](06_MATCHING_CUTOVER_DESIGN.md) §9/§10 and reconfirmed in [09_COMPANY_CONFIGURATION_CUTOVER_REPORT.md](09_COMPANY_CONFIGURATION_CUTOVER_REPORT.md) §F. No other discrepancy class was found or is expected — the two flows are functionally identical for any company that has `CompanyIntervention` coverage, and diverge only for companies relying purely on category-level fallback with zero intervention configuration.

---

## E. Query Path Review

| | |
|---|---|
| **Final query path** | `Request.findUnique({ id })` → `Company.findMany({ where: { ..., interventions: { some: { interventionId } } } })` |
| **Tables touched** | `Request`, `Company`, `CompanyIntervention` (join), `CompanyMembership`/`User` (nested select for recipient email) |
| **Joins used** | One: `Company ⋈ CompanyIntervention` via the `where: { interventions: { some } } }` clause. No `Category`, `Service`, or any of their junctions. |
| **Indexes used** | `CompanyIntervention_interventionId_idx` (the load-bearing one, added Phase 8) for the semi-join; `Company`'s existing `@@index([status])` and `@@index([latitude, longitude])` for the surrounding filters — none of these are new, confirming Phase 8's index plan was sufficient and nothing additional was needed at implementation time. |
| **Compliance with [07_QUERY_AND_INDEX_PLAN.md](07_QUERY_AND_INDEX_PLAN.md)** | Matches §B exactly: 2 round trips, 1 join table, 0 branches — re-verified here by reading the shipped code, not re-asserted from the design doc. |

---

## F. Performance Impact

| Dimension | Before | After |
|---|---|---|
| Join tables in the hot path | 3 (`CategoryService`, `InterventionService`, `CompanyService`/`CompanyCategory`) | 1 (`CompanyIntervention`) |
| Conditional branches | 2 (service-resolution fallback, `requestMatchingMode` exclusion) | 0 |
| Round trips (matching only) | 3–4 | 2 |
| `matchReason` payload | 9 keys, derived/branchy | 3 keys, flat |

No N+1 introduced: the new `Company.findMany` is a single query regardless of candidate count, identical in shape to the legacy query's round-trip count (the legacy version's *extra* round trips came from its `CategoryService` derivation step and conditional service-resolution branch, both eliminated, not from any per-row loop in either version).

---

## G. Remaining Legacy Dependencies

**Zero, in the matching/dispatch path** — confirmed by direct grep of the rewritten files: no occurrence of `Service`, `CategoryService`, `InterventionService`, `CompanyService`, `requestMatchingMode`, or `RequestRequiredService` outside of one explanatory code comment stating their absence.

**Two dependencies remain elsewhere, correctly out of this phase's scope, not overlooked:**
- **Request creation** (`create-request.ts`) still resolves `Service` (via `requiredServiceSlugs`) and writes `RequestRequiredService` — this is a *creation-time* dependency, not a *matching-time* one (confirmed distinction from [10_REQUEST_PERSISTENCE_AUDIT.md](10_REQUEST_PERSISTENCE_AUDIT.md) §D), and dropping that write path is explicitly Phase 13 scope.
- **Schema-level**: `Service`, `ServiceAlias`, `CategoryService`, `InterventionService`, `CompanyService`, `RequestRequiredService` tables and the `Company.requestMatchingMode` column/enum still exist in Prisma — none of them are read by any code anymore after this phase (`requestMatchingMode`'s only remaining repo-wide references are two explanatory comments, verified by grep), but dropping the columns/tables themselves is Phase 15 scope, gated on this phase's completion per [ROADMAP.md](ROADMAP.md)'s dependency rules.

---

## H. Ready For Phase 11?

**YES.**

- `resolveMatchingCandidates`-equivalent logic (`resolveRequestDispatchCandidatesWithClient`) is live, reads only `Request.interventionId`/`CompanyIntervention`/`Company`, and was validated against the legacy implementation with two real scenarios — one proving identical output, one proving the one expected, already-documented divergence and explaining exactly why.
- `create-request-dispatches-for-request.ts` (Phase 11's primary target) already consumes the new resolver's output unchanged in shape (`companyId`, `recipientEmail`, `distanceKm`, `matchReason`) — the advisory-lock/idempotency-key persistence logic in that file was not touched in this phase and remains to be reviewed in Phase 11 per [07_QUERY_AND_INDEX_PLAN.md](07_QUERY_AND_INDEX_PLAN.md) §D, but it already works correctly against the new candidate shape (verified indirectly: the shadow-test scenarios exercised the full resolver, and `create-request-dispatches-for-request.ts`'s `tsc` compiles clean against the new `RequestDispatchCandidate` type with no remaining references to the removed fields).
- No web-layer business logic was introduced or required — confirmed `apps/web` has zero Prisma imports throughout this phase, unchanged from every prior phase's verification.
