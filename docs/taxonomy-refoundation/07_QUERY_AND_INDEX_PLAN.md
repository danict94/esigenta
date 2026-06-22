# TAXONOMY REFOUNDATION — QUERY & INDEX PLAN

Design review only. No code, schema, or migration changes were made. Grounded in the actual current implementations read in full for this review: `update-services-configuration.ts`, `get-services-configuration-page.ts`, `create-request.ts`, `search-taxonomy.ts`, `get-request-detail-page.ts`, plus everything already established in [06_MATCHING_CUTOVER_DESIGN.md](06_MATCHING_CUTOVER_DESIGN.md). This document also **challenges and revises** parts of 06 where a better design surfaced during this pass — see the callouts in §B and §C.

One correction to carry forward: the legacy company-configuration code is **not** plain Prisma nested selects — it already uses raw SQL CTEs (`$queryRaw`/`$executeRaw`) with `json_agg` for single-round-trip batched reads and atomic multi-table writes, with `recordPerf` instrumentation built in. The target design should match this style, not regress to naive ORM calls.

---

## A. Query Path Analysis

### Company configuration

**Current:** 2 round trips.
- Read (`get-services-configuration-page.ts`): 2 queries in parallel (`Promise.all`) — (1) one company row with `CompanyCategory`/`CompanyService` ids aggregated via correlated subqueries + `json_agg`; (2) all `Category` rows joined to `Sector` and `CategoryService`→`Service`, grouped with `json_agg`. Tables: `Company`, `CompanyCategory`, `CompanyService`, `Category`, `Sector`, `CategoryService`, `Service`. **7 tables, 1 round trip (parallelized).**
- Write (`update-services-configuration.ts`): round trip 1 validates selected categories + derives allowed services via a `Category LEFT JOIN CategoryService` raw query; round trip 2 is a single `$executeRaw` CTE doing `UPDATE Company.requestMatchingMode` + delete/insert `CompanyCategory` + delete/insert `CompanyService` atomically. **2 round trips, 3 tables.**

**Target:** same shape, fewer tables.
- Read: (1) one company row with `CompanyCategory`/`CompanyIntervention` ids via the same correlated-subquery pattern; (2) all `Category` rows (no `Sector` join — Sector is deleted) plus, separately or via the frozen generated source, the `ProjectGroup`-grouped `Intervention` list (this one doesn't need a DB read at all if ProjectGroup/Intervention display data is served from `project-groups.generated.json`/`interventions.generated.json` rather than queried — see note below). **Tables: `Company`, `CompanyCategory`, `CompanyIntervention`, `Category` — 4 tables (down from 7), still 1 round trip.**
- Write: round trip 1 validates selected categories exist (no `CategoryService` join needed — frozen model has no Category↔Intervention relation to validate against; validate `interventionIds` instead against the `Intervention` table directly, or skip server-side existence-validation entirely if the picker UI only ever submits ids sourced from the generated taxonomy). Round trip 2: same atomic CTE shape, `UPDATE Company` (no `requestMatchingMode` column to set), delete/insert `CompanyCategory`, delete/insert `CompanyIntervention`. **Still 2 round trips, 3 tables (down from needing the `CategoryService` validation join).**

### Request creation

**Current:** `resolveRequiredServiceIds` does one query (`Service.findMany({ where: { slug: { in } } })`) to turn funnel `requiredServiceSlugs` into `serviceId`s, then the transaction creates `Customer` (upsert), `Request` (with nested `requiredServices.create[]` — N rows), optionally `RequestPhoto` updates, and `CustomerAccessToken`. **Tables: `Service`, `Customer`, `Request`, `RequestRequiredService`, `RequestPhoto`, `CustomerAccessToken`. ~2 round trips outside the transaction + 4 inside.**

**Target:** drop `resolveRequiredServiceIds` entirely — resolve `interventionSlug → Intervention.id` with one `Intervention.findUnique({ where: { slug } })` (1:1, not a `findMany` over an array), write `Request.interventionId` directly on the same `Request.create` call (no nested junction-row creation at all, since the relation is now a plain FK, not a many-to-many). **Tables: `Intervention`, `Customer`, `Request`, `RequestPhoto`, `CustomerAccessToken` — `RequestRequiredService` removed entirely, same round-trip count, strictly fewer writes per request (1 FK column vs N junction rows).**

### Matching

Covered exhaustively in [06_MATCHING_CUTOVER_DESIGN.md](06_MATCHING_CUTOVER_DESIGN.md) §1–2; restated compactly in §B below with one revision.

### Dispatch

Covered in 06 §8; restated in §D below, verified against the actual advisory-lock/idempotency code.

### Notification recipient resolution

Covered in 06 §7; revised in §C below after weighing the 1-query-vs-2-query trade-off more rigorously, as instructed.

### Search

**Current:** `searchTaxonomy()` — (1) 3 parallel alias lookups (`InterventionAlias`, `CategoryAlias`, `ServiceAlias`); (2) `Intervention.findMany` direct-match query; (3) `Category.findMany` direct-match query; (4) **N additional calls** to `listServicesForCategory(category.slug)`, one per matched category, run via `Promise.all` (concurrent, but still N queries — see §G); (5) `Service.findMany` with nested `interventions` relation. **Tables: `InterventionAlias`, `CategoryAlias`, `ServiceAlias`, `Intervention`, `Category`, `CategoryService`, `Service`, `InterventionService`. 5 sequential round-trip groups, plus N inside group 4.**

**Target:** Category-expansion-via-Service disappears entirely (no `CategoryService`/`InterventionService`/`Service` involved). Search becomes: (1) `InterventionAlias` lookup (Category/Service alias lookups removed — Category has no aliases in the frozen example shape, and Service doesn't exist); (2) `Intervention.findMany` direct match; (3) **only if Category is kept as a discovery-expansion mechanism** (open product question, flagged in 06 §10) — a direct `Category → ProjectGroup → Intervention` expansion, which can be done as a single batched query across all matched categories (`Intervention.findMany({ where: { projectGroup: { categoryDefaults: { some: { categoryId: { in: matchedCategoryIds } } } } } })` style, shape depends on final schema) instead of one query per category. **Tables: `InterventionAlias`, `Intervention`, `ProjectGroup`/`Category` — down from 8 tables to 3, and the N-query expansion collapses to 1 batched query.**

### Request status

**Current and target are identical, no change needed.** `get-request-detail-page.ts` (representative of request-status/detail reads) already touches only `Request.interventionSlug` for taxonomy display — no `Service`, `Category`, or junction table involved. This flow was already correctly taxonomy-light; confirmed, not redesigned.

---

## B. Matching Query Design — revised from 06

**Legacy chain** (unchanged from 06 §1): `Request → (RequestRequiredService | InterventionService fallback) → CategoryService → Company∩(CompanyCategory, CompanyService) → requestMatchingMode branch`.

**Target chain**, starting exactly from `Request.interventionId` as instructed:

```
Request.interventionId                                   -- read once, from Request.findUnique
  → WHERE EXISTS (
      SELECT 1 FROM "CompanyIntervention" ci
      WHERE ci."interventionId" = Request.interventionId
        AND ci."companyId" = "Company"."id"
    )                                                       -- single indexed semi-join
  → Company (filtered: isActive, status=APPROVED, geo not null, operatingRadiusKm>0)
```

**Removed joins:** `CategoryService` (Service→Category derivation), `InterventionService` (Intervention→Service fallback), `CompanyCategory` (no longer read in matching — Category plays no role here).
**Removed lookups:** the conditional `RequestRequiredService`-present check and its fallback branch — collapses to zero branches.
**Removed pivot tables:** 3 (`CategoryService`, `InterventionService`, `CompanyService` as the matching pivot — `CompanyService` is replaced by `CompanyIntervention`, not removed outright, but its *role* changes from "one of two co-equal signals" to "the only signal").

**Revision vs. 06:** §6 of this review's grounding work confirmed the legacy configuration code already uses raw SQL for performance-sensitive paths. The matching read itself is simple enough (single `where` clause, no aggregation) that plain Prisma is fine and more maintainable than raw SQL here — **no revision needed to the query mechanism**, only confirming the join shape above is correct and minimal. This is the one part of 06 that holds up unchanged under closer scrutiny.

---

## C. Notification Query Design — revised from 06

06 proposed splitting recipient resolution into its own `resolveNotificationRecipients(companyIds)` query, accepting one extra round trip for separation of concerns. **Challenging that here, as instructed:**

**Case for 1 query (embed recipient email back into the matching query):** the legacy code already does this — `memberships` is a nested `select` inside the same `Company.findMany` that does geo/category filtering. It costs zero extra round trips and Prisma already batches the nested relation in one SQL join.

**Case for 2 queries (06's proposal):** matching and notification-recipient resolution are genuinely different concerns with different futures — matching might later need to run in a context with no notification step at all (e.g., a "preview match count" admin tool), and notification recipient resolution might later need to support multiple channels/roles beyond `OWNER` email. Coupling them in one query means every future caller of matching pays for a join it may not need.

**Decision: keep the 2-query split, but justify it precisely instead of by general principle.** The real justification is not "separation of concerns" in the abstract — it's that `resolveMatchingCandidates` is the function most likely to be called from contexts that don't need recipients (future admin preview tooling, analytics, dry-runs), while `createDispatches` is the only caller that needs recipients. Forcing every matching caller to pay for a `CompanyMembership` join it doesn't need is the wrong default. The extra round trip is paid exactly once per actual dispatch run (not per candidate, not in a loop), against an indexed `(companyId, role)` lookup — negligible against the win of not over-fetching in the common case.

**How the 1-query approach would look, for completeness:** `Company.findMany({ ..., select: { ..., memberships: { where: { role: 'OWNER' }, take: 1, select: { user: { select: { email: true } } } } } })` — exactly what legacy does today. This remains available as a fallback if profiling later shows the 2-query split costs more than its separation-of-concerns benefit justifies (flagged reversibly in 06 §10, reaffirmed here).

**Final recommendation: 2-query approach, as in 06, with the refined justification above replacing the original "testability" framing.**

---

## D. Dispatch Query Design

`createDispatches(requestId)` — verified against the actual current `create-request-dispatches-for-request.ts`:

**Reads:**
1. `resolveMatchingCandidates(requestId)` — see §B.
2. Re-read created `RequestDispatch` rows by `(requestId, companyId in [...])` to get their ids (needed because `createMany` doesn't return rows).
3. `CompanyNotification.findMany({ where: { requestDispatchId: { in }, type: 'NEW_REQUEST_AVAILABLE' } })` — dedup check before creating notifications.
4. `resolveNotificationRecipients(companyIds)` — see §C.

**Writes:**
1. `RequestDispatch.createMany({ skipDuplicates: true })` — relies on the existing `@@unique([requestId, companyId])` constraint.
2. `CompanyNotification.createMany({ skipDuplicates: true })`.
3. `NotificationDelivery.createMany({ skipDuplicates: true })` — relies on `idempotencyKey @unique`.

**Idempotency handling (preserved exactly as today):** `getIdempotencyKey({ requestId, companyId })` → `` `request-dispatch-email:${requestId}:${companyId}` `` written to `NotificationDelivery.idempotencyKey`; combined with `skipDuplicates` on all three `createMany` calls and the pre-existing-notification check, re-running dispatch for the same request is safe and produces no duplicate rows or emails. **No change needed — this protection is taxonomy-independent and already correct.**

**Advisory lock handling (preserved exactly as today):** `pg_advisory_xact_lock(hashtext('request-dispatch:' + requestId))` inside the transaction, serializing concurrent dispatch attempts for the same request. **No change needed** — this lock has nothing to do with the matching join shape; it protects the create-step regardless of how candidates were resolved.

**Verification: both legacy protections (idempotency keys + advisory lock) are fully preserved in the target design with zero modification.** This is a case where the right answer is "don't touch it" — it's already correct and orthogonal to the taxonomy model.

---

## E. Index Plan

| Index | Query it supports | Expected benefit |
|---|---|---|
| `CompanyIntervention @@id([companyId, interventionId])` | The compound PK, doubling as the `companyId`-prefixed lookup and the uniqueness constraint backing the company-config CTE's `ON CONFLICT DO NOTHING` | Matches the exact pattern already proven by `CompanyService`'s identical compound PK |
| `CompanyIntervention @@index([interventionId])` | `resolveMatchingCandidates`'s `WHERE EXISTS (... interventionId = ...)` semi-join — the one index actually load-bearing for the hot dispatch path | This is the single most important new index in the whole cutover — without it, matching degrades from an indexed lookup to a sequential scan over every company's intervention rows |
| `Request @@index([interventionId])` | Future reporting ("requests per intervention"), not the dispatch flow itself (Request is always fetched by its own PK there) | Low priority, additive, safe to defer to a later migration if not needed immediately |
| `RequestDispatch @@unique([requestId, companyId])` (existing) | `createMany({ skipDuplicates })`, the re-read-by-ids query | Already present, unchanged, still load-bearing |
| `RequestDispatch @@index([requestId, createdAt])`, `@@index([companyId, createdAt])`, `@@index([status, createdAt])` (existing) | Dispatch history listing, company-side request-list filtering | Already present, unchanged — none of these reference taxonomy entities, so the cutover doesn't touch them |
| `CompanyMembership` — verify `(companyId, role)` composite exists | `resolveNotificationRecipients`'s batched `WHERE companyId IN (...) AND role = 'OWNER'` | If missing, add it; this is the one index this review could not confirm from the schema excerpts read so far — flagged for verification at implementation time, not assumed |
| `NotificationDelivery.idempotencyKey @unique` (existing) | The idempotency-key dedup itself | Already present, unchanged |

**Net index change:** add 2 indexes on 1 new table (`CompanyIntervention`), retire up to 6 indexes across 3 deleted join tables (`CategoryService`, `InterventionService`, the matching-relevant half of `CompanyService`'s usage), confirm 1 possibly-missing index on an existing table.

---

## F. Geo Filtering Review

**Current implementation:** `Company.findMany` filters everything *except* distance in SQL (status, geo-not-null, radius>0, category/service membership); distance itself is computed in application code via `getDistanceKm` (Haversine) over every row returned, then filtered against `operatingRadiusKm` in JS. No bounding box, no PostGIS, no `ST_DWithin`.

**Evaluated alternative: bounding box pre-filter + Haversine** (proposed in 06 §9, evaluated more rigorously here):

- **Expected DB reduction:** a bounding box (`latitude BETWEEN lat±Δ AND longitude BETWEEN lng±Δ`) pushed into the existing `Company.findMany` `where` clause, using the existing `@@index([latitude, longitude])`, would let Postgres use that composite index for a range scan instead of returning every intervention-matching company nationwide before JS filters them down. Reduction is proportional to how concentrated companies are outside the request's region — likely significant in a multi-region marketplace, **negligible if the company base is small/single-region today** (worth checking actual row counts before committing effort).
- **Expected CPU reduction:** Haversine itself is cheap (a handful of trig calls per row); the CPU win is really just "fewer rows fed through that cheap-but-nonzero per-row function," proportional to the same regional-concentration factor above.
- **Implementation complexity:** low — it's an additional `where` clause computed from `operatingRadiusKm`'s maximum plausible value and basic degree-to-km conversion, no new dependency, no PostGIS extension needed. The real complexity is correctness of the `Δ` constant (must stay in sync with whatever the maximum allowed `operatingRadiusKm` is across all business tiers — flagged as a maintenance risk in 06 §10, reaffirmed here).

**Verdict: include it, but only as a genuinely separable, optional optimization, not a cutover requirement.** It improves a dimension (geo filtering) that is completely orthogonal to the taxonomy model — the matching rewrite would be correct and complete without it. Recommend implementing it in the same PR only if the company table has grown enough that the win is measurable; otherwise track it as a fast-follow once row counts justify the added `Δ`-maintenance burden. Do not let it block the cutover.

---

## G. N+1 Review

| Flow | Risk | Fix |
|---|---|---|
| **Search — category discovery expansion** | **Real N+1, confirmed by reading the code.** `searchTaxonomy()` calls `listServicesForCategory(category.slug)` once per matched category inside `Promise.all` — concurrent, but still N round trips for N matched categories, and each of those calls does its own nested Category→Service→Intervention traversal. | **Batched-query fix:** once Category's discovery role is resolved (open question, 06 §10), replace the per-category loop with a single `Intervention.findMany({ where: { ... categoryId IN matchedCategoryIds ... } })` across all matched categories at once — collapses N+1 into 1. |
| **Matching — per-candidate distance computation** | Not a query N+1 (it's in-memory JS, not DB calls per row) — no fix needed, just noted so it isn't mistaken for one. | None needed. |
| **Notification recipients** | Already correctly batched today (single nested `memberships` select) and remains batched in the target 2-query design (§C) — `resolveNotificationRecipients` takes the *full* candidate-company-id array in one call, never looped per company. | Already correct; preserve this property explicitly when implementing — a naive refactor could accidentally turn this into a per-company loop if someone "simplifies" it without noticing the batching intent. |
| **Company configuration write — validation query** | The `Category LEFT JOIN CategoryService` validation query in `update-services-configuration.ts` already validates all selected categories in one round trip (`WHERE c.id = ANY(...)`), not one query per category. In the target model, the equivalent validation (if any is even still needed — see §A) must preserve this batched shape. | Preserve as-is; flag in implementation review if anyone proposes per-id validation loops. |
| **Dispatch creation — recipient lookup inside delivery-row building** | `deliveryRows` today builds from `candidateByCompanyId.get(...)` — an in-memory map lookup, not a DB call, so no N+1 here despite looping over `dispatches`. Confirmed safe. | None needed. |
| **Cached-query opportunity: Category/ProjectGroup display data** | Category, ProjectGroup, and Intervention display data (names, descriptions, groupings) changes only on deploy (code-sourced taxonomy) — every read of it from a DB table is arguably unnecessary at all. | Consider serving company-configuration-page category/intervention lists directly from `categories.generated.json`/`project-groups.generated.json`/`interventions.generated.json` (already built and validated in the frozen package) instead of querying `Category`/`Intervention` tables for *display* purposes — reserve DB reads for the company's *own* selected ids only. This removes an entire query (today's "all categories with sector + services" read) from the company-configuration page entirely. |

---

## H. Performance Comparison

| Dimension | Legacy | Frozen model |
|---|---|---|
| **Matching** — join tables | 3 (`CategoryService`, `InterventionService`, `CompanyService`/`CompanyCategory` combined read) | 1 (`CompanyIntervention`) |
| **Matching** — conditional branches | 1 (RequestRequiredService present? else Intervention→Service fallback) + 1 (`requestMatchingMode` branch) = 2 | 0 |
| **Dispatch** — writes/protections | unchanged | unchanged (verified §D) |
| **Notifications** — queries | 1 (embedded in matching query) | 1–2 (deliberate split, §C) — architecturally cleaner, not necessarily fewer round trips |
| **Search** — tables touched | 8 (`InterventionAlias`, `CategoryAlias`, `ServiceAlias`, `Intervention`, `Category`, `CategoryService`, `Service`, `InterventionService`) | 3 (`InterventionAlias`, `Intervention`, and `Category`/`ProjectGroup` only if Category-expansion is kept) |
| **Search** — N+1 instances | 1 confirmed (category discovery loop) | 0 (batched, §G) |
| **Company config** — tables touched (read) | 7 | 4 (or fewer if display data moves to generated JSON, §G) |
| **Company config** — tables touched (write) | 3, plus a `CategoryService` validation join | 3, validation join removed (no Category↔Intervention relation to validate against) |
| **Request creation** — taxonomy writes per request | N rows (`RequestRequiredService`, one per required service) | 1 FK column (`Request.interventionId`) |
| **Tables removed overall** | — | `Sector`, `Service`, `ServiceAlias`, `CategoryService`, `InterventionService`, `RequestRequiredService`, `Company.requestMatchingMode` — 7 removed |
| **Tables added overall** | — | `CompanyIntervention`, `Request.interventionId` column — 1 table + 1 column added |

**Net architectural complexity:** every flow examined loses joins, tables, or branches; none gains any. The only place round trips don't strictly decrease is notification recipient resolution, and that's a deliberate, justified trade (§C), not a regression.

---

## I. Observability Recommendations

| Flow | Logging points | Metrics | Tracing points |
|---|---|---|---|
| **Matching** (`resolveMatchingCandidates`) | Log `requestId`, `interventionId`, candidate count pre/post geo-filter, and the failure code on early-exit paths (`request_not_found`, `request_missing_coordinates`, `request_intervention_not_resolved`) | Counter: dispatch runs by failure code; histogram: candidate count per request; histogram: query duration (reuse the existing `recordPerf` pattern already used in `update-services-configuration.ts`/`get-services-configuration-page.ts` — extend it here for consistency) | Span around the `CompanyIntervention` join query, tagged with `interventionId` and resulting row count |
| **Dispatch** (`createDispatches`) | Log advisory-lock acquisition/release, `dispatchCreatedCount`, `appNotificationCreatedCount`, `emailDeliveryCreatedCount`, `skippedNoRecipientCount` — all already returned in today's result object, just ensure they're also logged, not only returned | Counter: dispatches created per request; counter: skipped-no-recipient rate (a rising rate here signals a `resolveNotificationRecipients` data-quality problem worth alerting on) | Span around the whole transaction, child spans around each `createMany` call |
| **Notifications** (`resolveNotificationRecipients`) | Log company ids with no resolvable `OWNER` email (distinct from "no candidates" — this is "candidate but unreachable") | Counter: unresolved-recipient rate per dispatch run | Span around the batched `CompanyMembership` query, tagged with input company-id count vs. resolved count |

**Goal restated and met:** every number needed to answer "why didn't company X get notified about request Y" without reading code is already present in the existing result types (`ResolveRequestDispatchCandidatesResult`, `CreateRequestDispatchesForRequestResult`) — the recommendation here is to make sure those numbers are also *logged*, not only returned to the caller, and that the `recordPerf` instrumentation pattern already proven in the company-configuration code is extended to the matching/dispatch/notification path, which today has no equivalent timing instrumentation.
