# TAXONOMY REFOUNDATION — PHASE 14.5: FINAL CONSISTENCY FIXES REPORT

Implementation phase. Closes the two gaps identified in [QUERY_BOUNDARY_AUDIT.md](QUERY_BOUNDARY_AUDIT.md) (`get-profile-page.ts`'s `CompanyService` dependency, the unwired `runtimePresetSlugs` field) — and, during the required re-validation, uncovered and fixed a third, more consequential inconsistency between Phase 9 and Phase 14 that neither phase's own validation had caught.

---

## Task 1 — `get-profile-page.ts`

**Before:** raw SQL joined `CompanyService → Service` to render "your services" on the company's own profile page — the exact staleness risk flagged in the audit (the page could show a different list than what the Intervention-based configuration UI, live since Phase 9, actually persisted).

**After:** joined `CompanyIntervention → Intervention` instead. `CompanyProfileService` → `CompanyProfileIntervention`, `GetCompanyProfilePageResult.services` → `.interventions`. Consumer (`apps/web/.../profilo/profile-page.tsx`) updated: "Servizi selezionati" → "Interventi selezionati", badge list now renders interventions.

**Verified, not assumed:** configured a real company with category `idraulico` + intervention `ristrutturare-bagno` via the actual `updateCompanyServicesConfiguration` action, then read the profile page back — it correctly showed `Idraulico` / `Ristrutturare bagno`, sourced entirely from `CompanyCategory`/`CompanyIntervention`. Zero `CompanyService` involvement, confirmed by reading the query, not just the result.

---

## Task 2 — `runtimePresetSlugs` Canonical Source

**Audit recap (from [QUERY_BOUNDARY_AUDIT.md](QUERY_BOUNDARY_AUDIT.md) §D):** `FrozenIntervention.runtimePresetSlugs` was validated and generated but had no live DB column and no reader. The real, live preset mechanism was a completely separate, legacy path: `create-runtime-funnel.ts` cross-referenced `taxonomySource.services`/`.categories` (the legacy in-memory tree) using `serviceSlugs`/`categorySlugs` as join keys — two fully independent systems, only one of them actually running.

**Fix, in dependency order:**

1. **DB persistence:** added `Intervention.runtimePresetSlugs String[] @default([])` — pure `ADD COLUMN`, applied via ordinary `prisma migrate dev` (no rename risk this time, ran non-interactively without issue).
2. **Sync script:** `sync-catalog-to-database.ts` now writes `runtimePresetSlugs` alongside `projectGroupId` in the same `Intervention.updateMany` call.
3. **Taxonomy source:** populated real values for all 32 interventions currently in the frozen source tree (26 live + 6 not-yet-seeded editorial additions), replacing the one placeholder that existed before (`ristrutturare-bagno: ["bathroom-renovation"]` — wrong casing, not even a real `RuntimePresetSlug` value). Computed faithfully from the **legacy** per-service/per-category data (read directly from `packages/taxonomy/src/source/services/*.ts` and `categories/*.ts`, not guessed) so the migration changes *where* the data lives, not *what* it says — confirmed by direct comparison in §3 below.
4. **Funnel reader:** `resolveInterventionForFunnel` (taxonomy) now selects and returns `runtimePresetSlugs` straight from the `Intervention` row. `create-runtime-funnel.ts`'s `resolveTaxonomyRuntimePresetSlugs` (the dead cross-reference function) is deleted; replaced with `sortedValidRuntimePresetSlugs`, a small validation guard at the package boundary (the DB column has no compile-time guarantee of matching the `RuntimePresetSlug` union, so values are filtered, not blindly cast). The `taxonomySource` import is gone from this file entirely — confirmed by grep, only a comment referencing it remains.

**Regression-checked, not just unit-tested:** ran `createRuntimeFunnel` for three real interventions and compared against the legacy-derived expected values:

| Intervention | Result | Matches legacy-derived expectation |
|---|---|---|
| `ristrutturare-bagno` | `["BATHROOM_RENOVATION", "HOME_RENOVATION"]` | ✓ — and produces the richer capability set (`rooms`, `surface-area` included) that a renovation preset should yield |
| `riparare-perdita-acqua` | `["EMERGENCY_REPAIR", "PLUMBING_EMERGENCY"]` | ✓ — correctly yields a *leaner* capability set than the renovation case (no `rooms`/`surface-area`), confirming the preset is actually driving differentiated behavior, not just being threaded through inertly |
| `installare-climatizzatore` | `["QUICK_SERVICE"]` | ✓ |

This was run via a direct import of `create-runtime-funnel.ts` (bypassing `packages/funnel/src/server.ts`'s `server-only` guard, the same Next.js-runtime-only constraint already documented in [12_NOTIFICATION_CUTOVER_REPORT.md](12_NOTIFICATION_CUTOVER_REPORT.md)) — a real execution, not a code read.

**One honest, traced gap:** `cartongesso-e-finiture` (still live in the DB) has empty `runtimePresetSlugs` after this sync, because the frozen source's `finiture` ProjectGroup was reorganized mid-engagement (external edit, not part of this phase) into differently-named interventions that don't exist live yet. This is a content-timing gap, not a code defect — it will self-resolve the next time the catalog content settles and the sync re-runs. Flagged plainly rather than silently left for someone to puzzle over.

---

## Task 3 — Re-Validation, And What It Found

All nine areas were exercised against the real database with real writes, not re-derived from reading code:

| Area | Result |
|---|---|
| Search | `"idraulico"`, `"imbianchino"`, `"pittore"` all return correct, relevant interventions |
| Discovery | `getProfessionPage("idraulico")` correctly returns its one ProjectGroup (`impianti-idraulici`) |
| Funnel Runtime | See Task 2 table above — canonical source confirmed live and behaviorally correct |
| Company Configuration | `updateCompanyServicesConfiguration` dual-write (Category + Intervention) confirmed via a real write + read-back |
| Profile Page | See Task 1 |
| Request Creation | `interventionId`/`interventionSlug` correctly set, `requiredServices` correctly empty (Phase 14's removal still holds) |
| Matching + Dispatch | `eligibleCompanyCount: 1`, `dispatchCreatedCount: 1` for a real configured company |
| Notifications | `appNotificationCreatedCount: 1`, `emailDeliveryCreatedCount: 1` |
| **Dashboard visibility** | **Initially failed** — see below |

### The real finding: dashboard visibility was stricter than dispatch

The first end-to-end run (company configured with category `idraulico` + intervention `ristrutturare-bagno`, which belongs to a *different* ProjectGroup than `idraulico`'s own) produced a dispatch/notification correctly (`eligibleCompanyCount: 1`), but the company's **dashboard showed zero requests** for it.

**Root cause, traced precisely:** `get-requests-list-page.ts`'s default (no-filter) visibility set was `operationalInterventionIds` only — the interventions derived from the company's *category*. It never included `selectedInterventionIds` — the interventions the company *directly* picked. In the legacy model this distinction never mattered, because `update-services-configuration.ts` used to validate that selected services belonged to selected categories' `CategoryService` rows, making `selected ⊆ operational` true by construction. **Phase 9 deliberately removed that cross-validation** — correctly, per the frozen model's explicit rule that Category must never gate Intervention — which means `selected ⊆ operational` is no longer guaranteed. Phase 14's dashboard rewrite faithfully ported the *old query structure* without re-deriving this *assumption* against the *new* validation rules, so the gap was real and would have shipped silently.

**Fix:** the default visibility set is now the union, `selectedInterventionIds ∪ operationalInterventionIds`, so the dashboard can never show a company *fewer* requests than dispatch is already notifying them about. The category-filtered and intervention-filtered branches are unchanged (an explicit filter narrowing to one category is correct to stay scoped to that category).

**Re-verified after the fix**, same exact scenario that failed: the request now appears, ranked `selected_intervention`. This is documented here because Phase 14.5 is explicitly about consistency, and this is the most consequential consistency gap found across the entire engagement — a company could have been notified about real work and never seen it on their own dashboard.

---

## Files Changed

`packages/database/prisma/schema.prisma` (+ new migration `20260621103217_phase14_5_intervention_runtime_preset_slugs`), `packages/domain/src/company/profile/{get-profile-page,index}.ts`, `packages/domain/src/company/requests/get-requests-list-page.ts`, `packages/taxonomy/src/queries/resolve-intervention-for-funnel.ts`, `packages/taxonomy/src/frozen/orchestrator/sync-catalog-to-database.ts`, `packages/taxonomy/src/frozen/source/project-groups/*.ts` (all 8, `runtimePresetSlugs` added), `packages/funnel/src/orchestration/create-runtime-funnel.ts`, `apps/web/src/area-impresa/private/account/profilo/profile-page.tsx`.

`tsc --noEmit` clean across `packages/database`, `packages/taxonomy`, `packages/funnel`, `packages/domain`, and `apps/web`.

## Verdict

All three consistency gaps named or discovered in this phase are closed and independently re-verified against the live database: `get-profile-page.ts` is `CompanyService`-free, `runtimePresetSlugs` has exactly one canonical source (DB column, populated by the frozen sync, read directly by the funnel), and dashboard visibility can no longer fall behind what dispatch already does. The one remaining known gap (`cartongesso-e-finiture`'s empty presets, pending catalog content settling) is explained, not hidden.
