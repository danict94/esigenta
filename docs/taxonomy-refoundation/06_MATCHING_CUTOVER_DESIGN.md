# TAXONOMY REFOUNDATION — MATCHING CUTOVER DESIGN

Design only. No code, schema, or migration changes were made. Replaces `packages/domain/src/internal/request/dispatch/resolve-request-dispatch-candidates.ts` and its companion `create-request-dispatches-for-request.ts`, grounded in their actual current implementation (read in full for this design) and the frozen model ([docs/taxonomy.md](../taxonomy.md), [02_TARGET_MODEL.md](02_TARGET_MODEL.md)).

**Architecture constraint check (already true today, must remain true):** `apps/web` has zero direct Prisma imports anywhere in the codebase (verified) — all matching/dispatch/notification logic already lives in `packages/domain`. This design keeps that boundary; nothing below proposes any Prisma access outside `packages/domain`.

---

## 1. Current candidate resolution flow

`resolveRequestDispatchCandidatesWithClient(client, requestId)`:

1. Fetch `Request` by id, selecting `interventionSlug`, geo fields, and `requiredServices[].serviceId`.
2. `resolveRequestServiceIds`: if `RequestRequiredService` rows exist, use those `serviceId`s. Otherwise fetch `Intervention.services[].serviceId` (the `InterventionService` join) keyed by `interventionSlug` — a **conditional second query**, branch-dependent.
3. Fetch `CategoryService` rows for those `serviceId`s to derive `categoryIds` (**third query, third join table**).
4. Fetch candidate `Company` rows: `isActive`, `status=APPROVED`, geo not null, `operatingRadiusKm>0`, `categories.some(categoryId in categoryIds)` — nested-select `categories` (filtered to those ids) and `services` (filtered to the resolved `serviceIds`), plus `memberships[OWNER].user.email` (**fourth query**, but batched/nested — not N+1).
5. In application code: compute Haversine distance per company, drop out-of-radius companies, branch on `company.requestMatchingMode` (`SELECTED_SERVICES_ONLY` requires a non-empty `matchedServiceIds`), compute `matchStrength` (`SERVICE_MATCH` vs `CATEGORY_MATCH`), build a 9-key `matchReason` diagnostic object.
6. `createRequestDispatchesForRequestWithClient`: advisory lock (`pg_advisory_xact_lock`) → `RequestDispatch.createMany` (skip duplicates) → re-read created dispatch ids → check existing `CompanyNotification` rows (avoid duplicate notify) → `CompanyNotification.createMany` → build `NotificationDelivery` rows from the **already-fetched** `recipientEmail` (carried on the candidate object since step 4) → `NotificationDelivery.createMany`.

**Tables touched:** `Request`, `RequestRequiredService`, `Intervention`, `InterventionService`, `CategoryService`, `Company`, `CompanyCategory`, `CompanyService`, `CompanyMembership`/`User`, `RequestDispatch`, `CompanyNotification`, `NotificationDelivery` — 11 tables, 3 of them (`RequestRequiredService`/`InterventionService`/`CategoryService`) exist solely to bridge Service↔Category↔Intervention.

---

## 2. Target candidate resolution flow

Three single-owner functions, replacing the current two-function split with a cleaner three-way separation matching the requested orchestration shape:

```
resolveMatchingCandidates(requestId)   →  geo + intervention-eligible companies, no notification concerns
resolveNotificationRecipients(companyIds) →  recipient emails, no matching concerns
createDispatches(requestId)            →  orchestrates the two above + persistence, unchanged transactional shape
```

**`resolveMatchingCandidates(requestId)`:**

1. Fetch `Request` by id, selecting `interventionId`, `interventionSlug`, geo fields. **No `requiredServices` select, no conditional branch.**
2. If `interventionId` is null or geo fields are missing → fail fast with the same `RequestDispatchFailureCode` shape as today (`request_not_found` / `request_missing_coordinates` / new `request_intervention_not_resolved` replacing `request_services_not_resolved`).
3. Fetch candidate `Company` rows in **one query**: `isActive`, `status=APPROVED`, geo not null, `operatingRadiusKm>0`, `interventions.some(interventionId = request.interventionId)` — a single join against the new `CompanyIntervention` table. No `requestMatchingMode` read, no `categories`/`services` nested select.
4. In application code: Haversine filter as today (pre-existing behavior, not a regression — see §9 for a proposed improvement here).
5. `matchReason` shrinks to `{ interventionId, distanceKm, operatingRadiusKm }` — no `matchStrength`, no `serviceSource`, no `resolvedServiceIds`/`derivedCategoryIds`, because there is exactly one query path now, nothing to diagnose a branch for.

**`resolveNotificationRecipients(companyIds)`:**

One batched query: `CompanyMembership.findMany({ where: { companyId: { in: companyIds }, role: 'OWNER' }, select: { companyId, user: { select: { email } } } })`. Returns a `Map<companyId, email | null>`. This is a deliberate **new, separate** query — today the OWNER email is fetched inline inside the matching query (so matching and notification-recipient concerns are entangled in one Prisma `select`). Splitting costs one extra round trip but gives matching and notification resolution genuinely independent, independently testable, independently cacheable responsibilities — see §9 for the explicit trade-off accounting.

**`createDispatches(requestId)`:** same transactional shape as today (advisory lock → `RequestDispatch.createMany` → re-read ids → existing-notification check → `CompanyNotification.createMany` → recipient resolution → `NotificationDelivery.createMany`), just calling the two functions above instead of the monolithic resolver. `RequestDispatch.matchedServiceIds` (Json) has no replacement value to store — `Request.interventionId` already identifies the match unambiguously, so this column becomes write-only-empty dead weight (flagged for removal in §3, not actioned here).

---

## 3. Required database reads

| Step | Read | Replaces |
|---|---|---|
| 1 | `Request.findUnique({ id })` selecting `interventionId`, `interventionSlug`, geo | Same shape, fewer selected fields (drop `requiredServices`) |
| 2 | `Company.findMany({ where: {..., interventions: { some: { interventionId } } } })` selecting `id`, geo, `operatingRadiusKm` | Replaces the `InterventionService` fallback query + `CategoryService` query + the `categories`/`services` nested selects on Company — **3 reads collapse into 0 extra reads** (the join is now a single `where` clause on the main Company query) |
| 3 | `CompanyMembership.findMany({ where: { companyId: { in }, role: 'OWNER' } } })` | Replaces the nested `memberships` select embedded in step 4 of the legacy flow — same data, decoupled into its own query for separation of concerns |
| 4–8 | `RequestDispatch.createMany` / re-read / `CompanyNotification` check+create / `NotificationDelivery.createMany` | Unchanged from today |

No read ever touches `Service`, `ServiceAlias`, `CategoryService`, `InterventionService`, or `RequestRequiredService` in the target flow.

---

## 4. Required indexes

| Table | Index | Reason |
|---|---|---|
| `CompanyIntervention` (proposed) | `@@id([companyId, interventionId])` | Mirrors today's `CompanyService` compound PK exactly — serves as the unique constraint and the `companyId`-prefixed index |
| `CompanyIntervention` (proposed) | `@@index([interventionId])` | The lookup direction actually used by matching: "which companies declared this intervention" — mirrors today's `CompanyService.@@index([serviceId])` |
| `Request` (proposed) | `@@index([interventionId])` | Not needed by the dispatch flow itself (Request is always looked up by its own `id`), but needed for future reporting/analytics ("how many requests for intervention X") — low priority, additive |
| `Company` | *(existing, unchanged)* `@@index([latitude, longitude])`, `@@index([status])` | Already sufficient for the candidate query's other filters; no new index needed here |
| `CompanyMembership` | *(verify existing)* index on `(companyId, role)` | Needed for `resolveNotificationRecipients`'s batched query to stay indexed rather than scan — confirm at implementation time whether this already exists or needs adding |

Net index count: **1 new table with 2 indexes**, replacing **3 join tables and their combined ~6 indexes** (`CategoryService` ×2, `InterventionService` ×2, `CompanyService` ×2) from the legacy path.

---

## 5. Required query paths

Target shape, exactly as requested:

```
Request
  ↓ (PK lookup)
Request.interventionId
  ↓ (single indexed lookup on CompanyIntervention.interventionId)
CompanyIntervention
  ↓ (FK join, already loaded by the same query)
Company
```

No multi-hop taxonomy traversal anywhere in the candidate-resolution path. The only "hop" is the single indexed join from `CompanyIntervention` to `Company`, expressed as one `where: { interventions: { some: { interventionId } } }` clause inside the existing Company query — not a separate round trip.

---

## 6. Historical request handling strategy

- `Request.interventionSlug` (already exists today) remains the permanent, immutable snapshot — untouched by this design, exactly as the schema's own comment requires ("Request MUST remain... historically stable").
- `Request.interventionId` (proposed new column) is resolved **once**, at request-creation time, and never re-resolved. If a future taxonomy edit renames or removes an Intervention, `interventionSlug` still displays correctly from the frozen snapshot; `interventionId` should use `onDelete: Restrict` (mirroring the existing, deliberate pattern on `RequestRequiredService.serviceId`, whose comment reads "historical requests must remain stable") so an Intervention can never be deleted out from under a historical request without an explicit decision.
- Pre-cutover `RequestRequiredService` rows are not touched by this design — per [05_LEGACY_DEPENDENCY_MAP.md](05_LEGACY_DEPENDENCY_MAP.md) §A, that table's `serviceId` FK is already `Restrict`-protected specifically for historical stability, and deleting that history needs an explicit retention decision before any cleanup migration, independent of this matching rewrite.

---

## 7. Notification recipient resolution

Lives entirely in `packages/domain`, as a dedicated, single-owner function: `resolveNotificationRecipients(companyIds: string[]): Promise<Map<string, string | null>>`. It has exactly one job — resolve OWNER email per company — and is called once per dispatch run with the full candidate company-id list (never in a loop, never per-candidate). This is a genuine simplification over today, where the email fetch is anonymously embedded inside the matching query's `select` and has no name, no independent test surface, and no reuse potential outside this one resolver.

---

## 8. Dispatch creation flow

Unchanged transactional shape (advisory lock, `skipDuplicates` createMany, existing-notification dedup check, delivery idempotency key) — this part of the legacy implementation is already correct and well-isolated from the taxonomy model; the only change is *what feeds it*:

```
createDispatches(requestId):
  lock(requestId)
  candidates = resolveMatchingCandidates(requestId)
  dispatches = RequestDispatch.createMany(candidates) → re-read ids
  notifications = CompanyNotification.createMany(new dispatch ids)
  recipients = resolveNotificationRecipients(candidates.companyIds)
  deliveries = NotificationDelivery.createMany(dispatches × recipients)
```

`RequestDispatch.matchedServiceIds` (Json) is flagged as removable — it has no successor value once matching is Intervention-only (the match is fully described by `requestId` + `companyId` already). Not removed here; flagged for the eventual cleanup migration.

---

## 9. Performance comparison

| Dimension | Legacy | Target |
|---|---|---|
| Join tables touched in matching | 3 (`CategoryService`, `InterventionService`/conditional, `CompanyService`) | 1 (`CompanyIntervention`) |
| Conditional query branches | 1 (`RequestRequiredService` present? else `InterventionService` fallback) | 0 |
| Matching query round trips | Request (1) + conditional Intervention fallback (0–1) + CategoryService (1) + Company w/ nested selects (1) = **3–4** | Request (1) + Company w/ intervention join (1) = **2** |
| Total round trips, full dispatch run (matching + recipients + persistence) | ≈ 9–10 | ≈ 9 (one fewer on the matching side, one more on the deliberately-separated recipient side — net flat to slightly better) |
| Per-row computed fields | `matchStrength` (2-way branch), `serviceSource`, `requestMatchingMode` branch, 9-key `matchReason` | none of the above; `matchReason` is a flat 3-key object |
| Taxonomy entities in the hot path | Service, CategoryService, InterventionService, RequestRequiredService, Company.requestMatchingMode | Intervention only |
| Indexes required in hot path | 6 (across 3 join tables) | 2 (one table) |

**Net result:** fewer joined tables, zero conditional branching, a flat (not nested/derived) diagnostic payload, and the same or fewer total round trips — satisfying "simpler, faster, more observable" without trading away correctness.

**A genuine improvement opportunity not present in the legacy code (proposed, not required for parity):** today's Haversine distance filter runs in application code over every category/intervention-eligible company, regardless of how far away it is. A bounding-box pre-filter (`latitude BETWEEN request.lat ± Δ AND longitude BETWEEN request.lng ± Δ`, where `Δ` is derived from the largest plausible `operatingRadiusKm`) could be added to the `Company.findMany` `where` clause to shrink the row set pulled from the database before the precise Haversine check — this reduces both DB I/O and application-side computation, and the existing `@@index([latitude, longitude])` already supports it. This is a real opportunity to be faster than legacy, not just equal to it — worth doing in the same PR as the cutover since it touches the same query.

---

## 10. Risks

- **Onboarding "broad net" regression** (carried over from the architecture review): legacy's `requestMatchingMode = CATEGORY_WITH_SERVICE_PRIORITY` let under-configured companies still receive notifications via category fallback. The target design has no fallback — a company with zero `CompanyIntervention` rows for the matched Intervention receives nothing. This is the intended behavior change per the frozen model, but it is a real, observable behavior shift for companies that haven't finished configuring their interventions — mitigation is product-side (bulk ProjectGroup select-all at onboarding, per the architecture review), not a matching-design gap.
- **`Request.interventionId` backfill correctness**: for requests created before cutover, this column must be backfilled by resolving `interventionSlug → Intervention.id`. Any historical request whose `interventionSlug` no longer matches a live Intervention (renamed/removed) needs an explicit resolution rule before backfill — not addressed by this design, called out as a migration-time concern.
- **`resolveNotificationRecipients` as a separate query**: the one deliberate extra round trip (§9) is a bet that observability/testability gains outweigh the marginal latency cost. If profiling at implementation time shows this matters under load, the function can still be called with a `select` hint to opt back into a single combined query while keeping its name and signature stable — flagged as a reversible decision, not a hard commitment.
- **Bounding-box pre-filter (§9) correctness**: a naive fixed `Δ` derived from "largest plausible radius" must be re-derived if `operatingRadiusKm` business rules change (e.g., a future plan tier with a larger radius) — this constant needs to live next to wherever `operatingRadiusKm` limits are defined, not be hardcoded inline in the query.
- **`matchedServiceIds` column removal**: flagged in §8 as removable, but actually dropping it is a schema change outside this design's read-only scope — listed here so it isn't silently forgotten by the time the cleanup migration ([03_MIGRATION_PLAN.md](03_MIGRATION_PLAN.md) Step 7) runs.
