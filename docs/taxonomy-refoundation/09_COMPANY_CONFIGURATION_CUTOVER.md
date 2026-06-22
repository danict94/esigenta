# TAXONOMY REFOUNDATION — PHASE 9: COMPANY CONFIGURATION CUTOVER (DESIGN)

Design only. No code, schema, or data changes were made in this phase — confirmed by `git status` showing no new modifications beyond this document. Grounded in the actual current implementation, read in full: `update-services-action.ts`, `services-configuration-page.tsx`, `category-services-selector.tsx`, plus `update-services-configuration.ts`/`get-services-configuration-page.ts` (read in Phase 7). Legacy `CompanyService`, `ServiceGroup`, `Sector` remain untouched and fully operational throughout everything described below — this document designs a dual-write addition, not a replacement.

**One finding that changes the shape of this whole phase, surfaced before the task list because it's load-bearing for §C and §E: `ProjectGroup` has zero rows and `Intervention.projectGroupId` is `NULL` on every row today.** Phase 8 added the columns/table (additive schema only, per its own scope) but nothing has ever written to them. The frozen taxonomy package (`packages/taxonomy/src/frozen/`) still contains only sample data (5 categories, 6 project groups, 14 interventions) — the full real-catalog promotion ([03_MIGRATION_PLAN.md](03_MIGRATION_PLAN.md) "Step 0") has not happened. This means **the ProjectGroup-grouped UI cannot be built against real data yet** — it's a precondition this phase must call out, not something Phase 9 can silently work around. See §C for the resulting two-track design.

---

## A. Current Configuration Audit

**Dependency chain, traced end to end:**

```
Page:       apps/web/.../area-impresa/(private)/configura-servizi/page.tsx (not re-read; routes to)
Component:  ServicesConfigurationPage (services-configuration-page.tsx)
  reads via: getCompanyServicesConfigurationPage (packages/domain/.../get-services-configuration-page.ts)
             — 2 parallel raw-SQL queries: Company+CompanyCategory+CompanyService ids; all Category JOIN Sector LEFT JOIN CategoryService LEFT JOIN Service
  groups via: groupServicesByServiceGroup (apps/web/src/site/services/service-groups.ts) — reads TaxonomyServiceGroup from the LEGACY taxonomySource
  renders:   CategoryServicesSelector (category-services-selector.tsx) — client component, category checkboxes + service checkboxes, NO "select all" bulk action exists today
  submits to: updateServicesAction (update-services-action.ts) — "use server" action, reads serviceIds/categoryIds/requestMatchingMode form fields
  writes via: updateCompanyServicesConfiguration (update-services-configuration.ts) — 2 raw-SQL round trips: validate categories+derive allowed services via Category LEFT JOIN CategoryService; atomic CTE updating Company.requestMatchingMode + CompanyCategory + CompanyService
```

**Files involved (complete list for this flow):**

| Layer | File |
|---|---|
| Page/route | `apps/web/src/app/area-impresa/(private)/configura-servizi/page.tsx` (routes to the component below; not modified in this design) |
| Page component | `apps/web/src/area-impresa/private/account/servizi/services-configuration-page.tsx` |
| Client UI | `apps/web/src/area-impresa/private/account/servizi/category-services-selector.tsx` |
| Server action | `apps/web/src/area-impresa/private/account/actions/update-services-action.ts` |
| Domain read | `packages/domain/src/company/services/get-services-configuration-page.ts` |
| Domain write | `packages/domain/src/company/services/update-services-configuration.ts` |
| Domain re-export | `packages/domain/src/company/services/index.ts` |
| Taxonomy adapter (UI grouping) | `apps/web/src/site/services/service-groups.ts` (legacy `ServiceGroup`, not `ProjectGroup`) |

**Other consumers of the same persisted state (not modified by this phase, but reading the same tables):** `get-requests-list-page.ts` and `get-profile-page.ts` both read `CompanyCategory`/`CompanyService` for unrelated display purposes (request filtering, profile page) — confirmed present in [05_LEGACY_DEPENDENCY_MAP.md](05_LEGACY_DEPENDENCY_MAP.md) §B and not touched here, since this phase's dual-write only *adds* `CompanyIntervention`, it doesn't change what these other readers see.

---

## B. Backfill Design

**A) Can `CompanyIntervention` be generated automatically from legacy data?**

Partially, and only for the matching-relevant signal, not for a perfect "intent" reconstruction:

- Where a company has `CompanyService` rows, each `serviceId` can be expanded to its `InterventionService`-linked `Intervention` ids — those become the candidate `CompanyIntervention` rows.
- Where a company has **no** `CompanyService` rows (relying on `requestMatchingMode = CATEGORY_WITH_SERVICE_PRIORITY` category-only fallback), there is **no automatic equivalent** — this is exactly the "broad net" capability flagged as a real regression in the architecture review and in [06_MATCHING_CUTOVER_DESIGN.md](06_MATCHING_CUTOVER_DESIGN.md) §10. For these companies, backfill cannot invent intervention-level intent that was never expressed. The mitigation already designed (bulk ProjectGroup select-all, defaulting to broad) applies at the UX layer going forward, not retroactively to historical data.

**B) Which mapping source will be used?**

`CompanyService.serviceId → InterventionService.serviceId → Intervention.id`, batched as a single query per run (not per company): `SELECT DISTINCT cs."companyId", isvc."interventionId" FROM "CompanyService" cs JOIN "InterventionService" isvc ON isvc."serviceId" = cs."serviceId"`. This is a direct SQL join, not an ORM loop — consistent with the existing raw-SQL convention already used in `update-services-configuration.ts`.

**C) How will consistency be validated?**

Per company: the **set of `CompanyIntervention.interventionId`s produced by backfill** should be compared against the **set of interventions reachable from that company's `CompanyService` rows** (the same join used to produce it) — this is definitionally a match by construction, so the real validation target is different: confirming the backfill script's row count matches `COUNT(DISTINCT companyId, interventionId)` from the join query with zero silent drops (e.g., a `serviceId` with no `InterventionService` row, an orphaned reference). See §F for the company-level comparison strategy.

**D) How will failures be detected?**

The backfill script must emit, per run: total companies processed, total `CompanyIntervention` rows inserted, count of companies with `CompanyService` rows but zero resulting `CompanyIntervention` rows (signals an orphaned `serviceId`→`InterventionService` gap — a data-quality bug to fix before re-running, not a silent skip), and count of companies with zero `CompanyService` rows (the "broad net" cohort from §A, expected and not an error, just a number worth knowing).

**E) How will rollback work?**

Trivial: `DELETE FROM "CompanyIntervention"` — the table has no other writers yet (nothing in application code writes to it until this phase's dual-write ships), so a full truncate-and-rerun is always safe. The backfill script itself should be idempotent (`ON CONFLICT (companyId, interventionId) DO NOTHING`, mirroring the existing pattern in `update-services-configuration.ts`'s CTE) so it can be re-run after a fix without needing the truncate step at all in the common case.

---

## C. Frozen Catalog Read Path

**The blocking finding from the top of this document determines the design here.** Two tracks, sequenced:

**Track 1 — available today, no precondition:** Category and Intervention *display* data (names, descriptions) can continue to be read exactly as today (`Category` table, already real production data — this table is shared by both legacy and frozen models, Phase 8 only added columns to it, never replaced its rows). **No change needed to this part of the read path right now.**

**Track 2 — blocked on the precondition stated up top:** ProjectGroup-grouped display (the actual UX requirement in Task 5) requires either:
- (a) the live DB `ProjectGroup` table populated and every live `Intervention.projectGroupId` backfilled — which requires the frozen package's sample data to first be promoted to the full real catalog (Migration Plan Step 0, not done), then a seed script analogous to legacy's `seed-taxonomy.ts` written and run (not built yet, not in scope for this design-only phase); or
- (b) serving ProjectGroup/Intervention *grouping* metadata directly from `packages/taxonomy/generated/frozen/project-groups.generated.json`/`interventions.generated.json` at read time, joined in application code to the live `Intervention` table by `slug` (not `id`, since the frozen package's sample ids don't correspond to live DB ids) — viable as a bridge, but only correct once the frozen source data covers the *same* interventions the live `Intervention` table actually has, i.e., still gated on the Step 0 promotion.

**Recommendation: do not attempt Track 2 in this phase.** Document it as the explicit precondition for shipping the new UI, and treat Phase 9's UI work as two sub-steps: (9a) ship dual-write + `CompanyIntervention` backfill against the *existing* flat category/service picker, unblocking Phase 10's matching cutover without waiting on catalog promotion; (9b) ship the ProjectGroup-grouped picker once Step 0 + seed are complete. This is a deliberate resequencing proposal, not a deviation requiring sign-off mid-design — flagged here for explicit awareness before implementation starts.

**Read path once Track 2 is unblocked (for reference, not actionable yet):** `Category` (DB) for the category list → `Category.defaultProjectGroupIds` (DB, already exists per Phase 8) for onboarding bootstrap → `ProjectGroup` (DB) joined to `Intervention` via `Intervention.projectGroupId` for the grouped picker. All DB reads, no generated-JSON dependency at runtime once seeded — the generated JSON only matters as the *source* for the seed script, not as a live read path (correcting a phrasing ambiguity in the task: "prefer generated frozen artifacts when possible" is about *seeding*, not about the request-time read path, since request-time reads should hit the database like every other page on this site, not bundle/parse JSON files per request).

---

## D. Dual-Write Design

**Transaction boundaries:** Single transaction, extending the existing CTE in `update-services-configuration.ts` rather than adding a second round trip. The existing CTE already does `_upd_mode` / `_del_cat` / `_del_svc` / `_ins_cat` / `_ins_svc` inside one `$executeRaw`. Add `_del_iv` (delete `CompanyIntervention` rows for this company not in the new set) and `_ins_iv` (insert new ones, `ON CONFLICT DO NOTHING`) as two more CTEs in the same statement. **Zero new round trips, zero new transaction boundaries** — this is additive within the query that already exists, not a separate write path bolted on after.

**Consistency guarantees:** Because both legacy (`CompanyService`/`CompanyCategory`) and new (`CompanyIntervention`) writes happen in the same atomic statement, there is no window where one is updated and the other isn't — a crash mid-write rolls back everything, exactly like today's existing guarantee for `CompanyCategory`+`CompanyService` already.

**Computing the `interventionId` set to write:** Until the new ProjectGroup-grouped UI ships (§C), the form still submits `serviceIds`, not `interventionIds` directly. The write path derives `interventionIds` server-side from the submitted `serviceIds` via the same `InterventionService` join used in backfill (§B) — so dual-write and backfill share one mapping function, not two divergent implementations. Once the UI submits `interventionIds` natively (post Track 2), this derivation step is simply removed; the write path doesn't need to change shape twice.

**Failure handling:** Identical to today's existing failure handling — the whole CTE is one statement; if it fails, nothing commits, the action returns its existing error codes unchanged. No new failure modes are introduced because no new round trip is introduced.

---

## E. ProjectGroup UX Validation

The required behavior (Select all / per-intervention checkboxes, expanding to `interventionIds`, never persisting `projectGroupIds`) is **fully supported by the target persistence shape already** (`{ categoryIds, interventionIds }`, confirmed against [docs/taxonomy.md](../taxonomy.md) "Persistenza" and "Selezione massiva" sections) — there is no architectural obstacle to building it. **The obstacle is purely data availability**, restated from §C: the picker needs `ProjectGroup → Intervention` grouping data to render "▼ Ristrutturazioni" as a group at all, and that grouping doesn't exist in the database yet.

**Validation of "does all required data exist?": NO, not yet.** Specifically missing:
- `ProjectGroup` rows (0 today)
- `Intervention.projectGroupId` assignments (`NULL` on every row today)
- A "select all" interaction in the current `CategoryServicesSelector` component (doesn't exist today, even for the existing flat per-category list — confirmed by reading the component in full, it only has per-service `toggleService` and per-category `toggleCategory`, no group-level bulk toggle)

**Design for once data exists:** "Select all" toggles every `Intervention` checkbox within the rendered ProjectGroup section to checked/unchecked client-side (same `useState` pattern already used for `selectedServiceIds`), submitting the resulting flat `interventionIds` list — no new form field, no `projectGroupIds` field ever rendered or submitted, satisfying the "never persist projectGroupIds" rule by construction (there's nothing in the form that could submit one).

---

## F. Validation Strategy

**Comparison method:** for a sample of companies (recommend: every company with `CompanyService` rows, since that's the population where automatic backfill applies per §B), compute two sets independently: (1) `CompanyIntervention.interventionId` rows post-backfill; (2) `Intervention.id`s reachable live from that company's current `CompanyService` rows via the same `InterventionService` join, computed fresh (not reusing the backfill's own output) as an independent check against drift between backfill-time and validation-time data.

**Reporting method:** a per-company row of `{ companyId, backfilledCount, liveDerivedCount, missingFromBackfill: [...], extraInBackfill: [...] }` — both arrays should be empty for every company; any non-empty array is a reportable discrepancy, not a tolerated variance (there's no legitimate reason for these two independently-computed sets to differ if §B's mapping is implemented correctly).

**Mismatch detection:** treat any non-empty `missingFromBackfill`/`extraInBackfill` as a blocking issue for Phase 10's shadow-mode validation (per [03_MIGRATION_PLAN.md](03_MIGRATION_PLAN.md) Step 2) — Phase 10 cannot trust `CompanyIntervention` as a matching signal if this comparison isn't clean first.

---

## G. Rollback Strategy

- **Can the UI switch back?** Yes, trivially — Track 1 of §C means the *existing* flat picker never stops working; nothing about this phase replaces it before Track 2 ships, so there is no "switch back" needed for the UI itself in the near term. Once Track 2 ships behind a flag (recommended, consistent with [03_MIGRATION_PLAN.md](03_MIGRATION_PLAN.md)'s general approach to every cutover phase), reverting the flag restores the pre-Track-2 picker exactly.
- **Can writes stop?** Yes — the `_ins_iv`/`_del_iv` CTEs added in §D can be removed from the statement (or feature-flagged off) with zero impact on the surrounding `_ins_cat`/`_ins_svc` CTEs, since they're independent clauses in the same `WITH` block, not interdependent.
- **Can `CompanyService` remain source of truth?** Yes, explicitly and by design throughout this entire phase — nothing in §A–F changes what legacy matching (`resolve-request-dispatch-candidates.ts`) reads. `CompanyService` remains the only signal legacy matching trusts until Phase 10 ships and is validated; `CompanyIntervention` is additive data collected in parallel, not yet authoritative for anything.

**Exact rollback path:** disable the dual-write CTE additions → optionally truncate `CompanyIntervention` (safe, per §B/E) → no other system noticed anything changed, because nothing downstream of Phase 9 reads `CompanyIntervention` yet (that's Phase 10).

---

## H. Phase 10 Readiness

**Not yet — two concrete prerequisites, both identified in this design, neither a surprise:**

1. **Backfill must run and pass validation** (§B, §F) before Phase 10's shadow-mode comparison (per [03_MIGRATION_PLAN.md](03_MIGRATION_PLAN.md) Step 2) has meaningful data to compare against. This is implementation work, correctly out of scope for this design-only phase.
2. **The "broad net" cohort (§A) needs an explicit product decision before Phase 10 cuts over**, not before Phase 9 ships dual-write: companies with zero `CompanyService` rows will have zero `CompanyIntervention` rows after backfill, and will receive zero matches under Intervention-only matching. This was already flagged as a real, accepted regression with a UX mitigation (bulk ProjectGroup select-all) in [06_MATCHING_CUTOVER_DESIGN.md](06_MATCHING_CUTOVER_DESIGN.md) §10 — restated here because Phase 9's backfill design is the first place it becomes a concrete, countable number (the "companies with zero `CompanyService` rows" metric from §B/D) rather than an abstract risk.

**What Phase 9 itself does not block:** dual-write and backfill (the data-layer half of this phase) have no dependency on the ProjectGroup catalog-promotion precondition (§C) — they can be designed for implementation now, against the existing flat picker, without waiting on Track 2. Only the *UI* half of Task 5 is gated on catalog promotion.
