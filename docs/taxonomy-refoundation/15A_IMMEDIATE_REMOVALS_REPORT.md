# TAXONOMY REFOUNDATION — PHASE 15A: IMMEDIATE LEGACY REMOVALS REPORT

Execution phase. Every removal below was re-verified by fresh code search immediately before deletion, per the explicit rule for this phase — none were assumed from [15_PRE_CLEANUP_AUDIT.md](15_PRE_CLEANUP_AUDIT.md) alone.

---

## A. Files Removed

- `apps/web/src/site/services/service-groups.ts` — re-verified zero importers (grepped for the exported function name itself, not just the entity name) immediately before deletion.
- `packages/domain/src/company/services/backfill-company-interventions.ts` — deleted only after running it one final time and confirming `0/0/0/0` (no unmigrated `CompanyService` data anywhere).
- `packages/domain/scripts/backfill-company-interventions.ts` (the CLI wrapper) — and the now-empty `packages/domain/scripts/` directory.

## B. Files Modified

| File | Change |
|---|---|
| `packages/domain/src/company/services/update-services-configuration.ts` | Removed the `_derived_svc`/`_del_svc`/`_ins_svc` CTEs and the `CompanyService` write. `CompanyCategory`/`CompanyIntervention` writes unchanged. |
| `packages/domain/src/company/services/index.ts` | Removed the `backfillCompanyInterventions` export. |
| `packages/domain/package.json` | Removed the `company:backfill-interventions` script entry. |
| `packages/taxonomy/src/queries/resolve-intervention-for-funnel.ts` | Removed the `InterventionService → Service → CategoryService → Category` traversal and the `serviceSlugs`/`categorySlugs` fields. `InterventionForFunnel` is now `{ id, slug, name, description, runtimePresetSlugs }`. |
| `packages/funnel/src/compiler/resolve-runtime-profile.ts` | Removed `serviceSlugs`/`categorySlugs` from `ResolvedIntervention`. |
| `packages/funnel/src/compiler/build-request-draft.ts` | Removed the `matchingSignals` construction and the now-unused `sortedUnique` helper. |
| `packages/funnel/src/types/request-draft.ts` | Deleted the `RequestMatchingSignals` type and the `matchingSignals` field on `RequestDraft` — tracing every consumer showed `requiredServiceSlugs` was diagnostic-log-only and `categorySlugs` (despite its "marketplace exposure" comment) was read by **nothing at all**, confirmed by grep. Leaving an empty type behind would have been exactly the kind of half-finished state this phase exists to avoid. |
| `packages/funnel/src/index.ts` | Removed the `RequestMatchingSignals` barrel export. |
| `packages/funnel/src/orchestration/create-runtime-funnel.ts` | Removed `serviceSlugs`/`categorySlugs` from the `resolvedIntervention` construction. |
| `packages/domain/src/public/requests/submit-runtime-request.ts` | Removed the now-nonexistent `requiredServiceSlugs` field from both diagnostic `console.warn`/`console.error` calls. |
| `apps/web/src/richiesta/flow/components/request-step-ui.tsx` | Simplified the stale local `FunnelSubmittedRequest` type, which echoed a `matchingSignals.requiredServiceSlugs` shape that was never actually destructured anywhere in the file (confirmed by grep — used only in a truthy check). |

---

## C. Validation Results

`tsc --noEmit` clean across all 5 touched packages (`database`, `taxonomy`, `funnel`, `domain`, `apps/web`) after every edit, re-run after each task — not just once at the end.

All 10 required areas re-validated against the live database with a real test company, real writes, and real reads (not re-derived from code reading):

| Area | Result |
|---|---|
| Configuration | Write succeeded; **`CompanyService` row count confirmed `0`** immediately after save (the central claim of this phase, checked directly against the table, not inferred) |
| Profile | `categories: ["Idraulico"]`, `interventions: ["Ristrutturare bagno"]` |
| Search | `"idraulico"` → 5 results, top match `rifare-impianto-idraulico-bagno` |
| Discovery / Profession Pages | `getProfessionPage("idraulico")` → `projectGroups: ["impianti-idraulici"]` |
| Request Creation (Funnel) | `presetSlugs: ["BATHROOM_RENOVATION", "HOME_RENOVATION"]`; **confirmed `matchingSignals` key is absent from the resulting `RequestDraft`** |
| Matching + Dispatch | `eligibleCompanyCount: 1`, `dispatchCreatedCount: 1` |
| Notifications | `appNotificationCreatedCount: 1`, `emailDeliveryCreatedCount: 1` |
| Dashboard Visibility | Request visible, `matchLevel: "selected_intervention"` — the Phase 14.5 union fix is intact post-cleanup |

One real bug surfaced and fixed during this run, noted for transparency: the validation script's first attempt failed the dashboard check because the test `actor` object was missing `company.status` — `getCompanyRequestsListPage` checks `actor.company.status !== "APPROVED"` independently of the `company.id`-keyed DB lookup. This was a test-script gap, not a product regression; once fixed, the full run passed end to end on the first subsequent attempt.

---

## D. Runtime Consumers Rechecked

Repeated the exact entity searches from [15_PRE_CLEANUP_AUDIT.md](15_PRE_CLEANUP_AUDIT.md) after all removals, plus a direct re-read of `get-request-by-id.ts` (which uses Prisma's typed relation accessors, not the literal model-name strings, so a generic grep alone would silently miss it — re-confirmed by grep on the `requiredServices`/`service` relation fields directly, 10 occurrences, identical lines to Phase 15's audit, file untouched by this phase).

No new consumers were discovered. No removal in this phase required touching `search-taxonomy.ts`, `get-request-by-id.ts`, or `seed-taxonomy.ts` — each is exactly as documented in Phase 15.

---

## E. Remaining Legacy Blockers

Exactly the 3 carried over, unchanged:

- `packages/taxonomy/src/queries/search-taxonomy.ts` — Service-direct-match search layer. Blocked on an alias-coverage migration that doesn't exist yet.
- `packages/domain/src/admin/requests/get-request-by-id.ts` — the `intervention.services` half (the `requiredServices` half is already dead, per Phase 15's split finding, but not removed in this phase since it wasn't in Task list scope and the two halves share one query/type). Blocked on a replacement admin display not yet designed.
- `packages/taxonomy/src/orchestrator/seed-taxonomy.ts` — still the only code path that creates `Category`/`Intervention` rows at all. Blocked on a frozen-model equivalent creation script, which doesn't exist yet.

No newly discovered blockers.

---

## F. Ready For Phase 15B?

**YES.**

The four immediate removals are complete, typechecked, and validated against a live end-to-end run covering all 10 required areas with zero regressions. The remaining blocker set is exactly the smallest possible one identified in Phase 15 — none of today's work could have reduced it further without first doing the un-scoped design work (alias-coverage migration, admin display replacement, frozen-model seed script) that Phase 15B should take on directly.
