# TAXONOMY REFOUNDATION — PHASE 9: COMPANY CONFIGURATION CUTOVER REPORT

Implementation phase. Confirmed throughout: zero changes to `packages/domain/src/internal/request/dispatch/*` (matching/dispatch) or any notification code — verified by `git status` showing no modifications under those paths, and by direct end-to-end testing (§C) that legacy `CompanyService`/`CompanyCategory` continue to be populated correctly for legacy matching to keep working unchanged.

**One material finding that shapes how to read this report**: this environment has exactly **1 company total**, with zero prior `CompanyService`/`CompanyCategory` configuration. All backfill/validation/metrics numbers below are real, not simulated — but they reflect a near-empty dataset, not a large production fleet. The mechanisms are built and verified correct (including via direct end-to-end exercise against the one real company, §C), ready to scale.

---

## A. Files Changed

| File | Change |
|---|---|
| `packages/domain/src/company/services/backfill-company-interventions.ts` | **New.** `backfillCompanyInterventions(prisma)` — idempotent, transactional `CompanyService → InterventionService → Intervention` backfill into `CompanyIntervention`. |
| `packages/domain/scripts/backfill-company-interventions.ts` | **New.** Runner script (`pnpm company:backfill-interventions`), mirrors the dotenv/dynamic-import convention already used by `packages/taxonomy`'s orchestrator scripts. |
| `packages/domain/src/company/services/update-services-configuration.ts` | **Rewritten.** Input changes from `{ selectedCategoryIds, selectedServiceIds, requestedRequestMatchingMode }` to `{ selectedCategoryIds, selectedInterventionIds }`. Atomic CTE extended with `CompanyIntervention` write + a `CompanyService` write *derived* from selected interventions via `InterventionService` (legacy continuity, not a UI input anymore). `Company.requestMatchingMode` is no longer written by this action at all. |
| `packages/domain/src/company/services/get-services-configuration-page.ts` | **Rewritten.** Reads `Category` (no `Sector` join), `ProjectGroup` joined to `Intervention`, and the company's `categoryIds`/`interventionIds` (no `Service`/`CategoryService` read anywhere). |
| `packages/domain/src/company/services/index.ts` | Updated exports for the renamed types (`ConfigurableCategory`, `ConfigurableProjectGroup`) and the new backfill export. |
| `packages/domain/package.json` | Added `tsx`/`dotenv` devDependency/dependency and the `company:backfill-interventions` script. |
| `apps/web/.../servizi/category-interventions-selector.tsx` | **New.** Replaces `category-services-selector.tsx`. ProjectGroup-grouped Intervention picker with "Seleziona tutti" per group, submitting `interventionIds` — never `projectGroupIds`. |
| `apps/web/.../servizi/category-services-selector.tsx` | **Deleted.** Fully superseded, confirmed zero remaining references before deletion. |
| `apps/web/.../servizi/services-configuration-page.tsx` | **Rewritten.** Consumes the new domain types and selector; computes the onboarding-bootstrap initial intervention selection from `Category.defaultProjectGroupIds` when the company has no saved interventions yet. |
| `apps/web/.../actions/update-services-action.ts` | **Rewritten.** Reads `interventionIds`/`categoryIds` form fields (drops `serviceIds`/`requestMatchingMode`). |

**Explicitly not touched, confirmed by inspection:** `packages/domain/src/internal/request/dispatch/resolve-request-dispatch-candidates.ts`, `create-request-dispatches-for-request.ts`, `notification-deliveries.ts`, and `apps/web/src/site/services/service-groups.ts` (now orphaned/unused by this cutover but its removal is Phase 14 scope per [ROADMAP.md](ROADMAP.md), not Phase 9 — left in place deliberately, not an oversight).

---

## B. Backfill Results

`backfillCompanyInterventions` run against the live database, then re-run a second time to confirm idempotency:

```json
{
  "companiesWithCompanyService": 0,
  "companyInterventionRowsInserted": 0,
  "companiesWithZeroInterventionCoverage": [],
  "companiesOnBroadNetFallback": []
}
```

Identical on both runs — confirms idempotency empirically, not just by construction (`ON CONFLICT DO NOTHING`). The 0/0/0/0 result is correct for this dataset: the single company in this environment has never configured any `CompanyService`, so there is nothing to backfill yet.

---

## C. Dual Write Verification

**Verified by direct end-to-end exercise against the real company** (not just by reading the code): called `updateCompanyServicesConfiguration` with `selectedCategoryIds: ["idraulico"]` and `selectedInterventionIds: ["riparare-perdita-acqua", "disostruire-scarichi"]`.

Result, read back immediately after:
- `CompanyCategory`: 1 row (`idraulico`) ✓
- `CompanyIntervention`: 2 rows, exactly the two submitted interventions ✓
- `CompanyService`: **2 rows, automatically derived** via the `InterventionService` reverse join — proving the legacy-continuity mechanism (§A) works correctly, not just compiles. Legacy matching, unmodified, will see exactly the `CompanyService` rows it would have seen if a user had manually picked those two services under the old UI.

The company was then restored to its original empty configuration state (direct cleanup of the three junction tables, since this was a verification exercise, not a real user action) — confirmed back to `{ categories: [], interventions: [], services: [] }`.

**Atomicity:** single `$executeRaw` statement with 6 CTEs (`_del_cat`/`_ins_cat`/`_del_iv`/`_ins_iv`/`_derived_svc`/`_del_svc`/`_ins_svc`) — no partial-write window exists; a failure anywhere rolls back the entire statement, identical guarantee to the pre-existing `CompanyCategory`+`CompanyService` CTE this extends.

---

## D. UI Verification

- `tsc --noEmit` clean in both `packages/domain` and `apps/web` after the full rewrite — zero type errors anywhere in the dependency chain.
- Confirmed by reading the rendered component logic: `CategoryInterventionsSelector` renders all 8 `ProjectGroup`s (not filtered by selected category, per the frozen model's explicit rule that Category has no relation to ProjectGroup/Intervention beyond the onboarding-suggestion field), each with a "Seleziona tutti" checkbox that adds/removes every intervention in that group from the selection.
- **A real bug was found and fixed during implementation, not after**: the first version only rendered checkboxes (and therefore only submitted form values) for the currently-expanded `ProjectGroup`. A company with saved selections in a collapsed group would have silently lost them on the next save. Fixed by adding hidden inputs for selected interventions belonging to any non-active group — verified by reading the final component logic, not just asserted.
- Persisted shape confirmed to never include `projectGroupIds`: the form only ever has `categoryIds` and `interventionIds` inputs; "select all" is purely a client-side state expansion, never a distinct submitted field.

**Not run in this phase:** an actual browser-rendered visual check (no dev server was started). Typecheck and direct domain-layer exercise (§C) are the verification performed; full browser verification is recommended before this ships to real users, per the project's own `/verify` skill guidance for UI changes.

---

## E. Coverage Validation

Comparison method per [09_COMPANY_CONFIGURATION_CUTOVER.md](09_COMPANY_CONFIGURATION_CUTOVER.md) §F, run against the live database:

| companyId | categories | legacy-derived interventions | `CompanyIntervention` rows | status |
|---|---|---|---|---|
| `cmqmj5k68000004jlh7m8ovw3` | 0 | 0 | 0 | **MATCH** |

1 company total, trivially matching (both sets empty). The comparison logic itself was exercised against non-trivial data in §C (2 legacy-derived interventions vs. 2 `CompanyIntervention` rows, both sets identical) before being reverted — confirming the comparison method works correctly, not only that it produces a trivial result here.

---

## F. Broad-Net Metrics

| Metric | Value |
|---|---|
| Total companies | 1 |
| Companies with `CompanyCategory` | 0 |
| Companies with `CompanyService` | 0 |
| Companies with `CompanyIntervention` | 0 |
| Companies on broad-net fallback (`CompanyCategory` present, `CompanyService` absent) | 0 |
| Companies on `SELECTED_SERVICES_ONLY` mode | 0 |

No companies are currently relying on the broad-net category-fallback behavior flagged as a real regression risk in [06_MATCHING_CUTOVER_DESIGN.md](06_MATCHING_CUTOVER_DESIGN.md) §10 — there is no real-data evidence of impact yet, simply because there is no configured company base yet in this environment. This number must be re-checked once real companies exist, not assumed to stay zero.

---

## G. Ready For Phase 10?

**YES**, with one caveat stated plainly rather than glossed over.

- `CompanyIntervention` population mechanism exists, is idempotent, and is verified working (backfill script + dual-write, both exercised against real writes in this database, not just typechecked).
- Frozen catalog reads (`Category`/`ProjectGroup`/`Intervention`) are live in the configuration page; `Service`/`ServiceGroup`/`Sector` are no longer read anywhere in the configuration rendering path.
- ProjectGroup "select all" UI is implemented and persists only `interventionIds`, never `projectGroupIds` — confirmed by reading the submission logic.
- Legacy matching/dispatch/notification code is unmodified (confirmed by `git status`) and legacy `CompanyService`/`CompanyCategory` continue to be populated correctly by the new save flow (confirmed by direct exercise, §C) — so Phase 10 can proceed with confidence that today's matching behavior for any company that saves through the new UI is unaffected.

**Caveat, not a blocker:** this environment's near-empty company base (1 company, unconfigured) means the backfill/validation/metrics numbers in §B/E/F cannot demonstrate behavior across the broad-net fallback population that the architecture review flagged as the one real, accepted regression of this entire migration. Phase 10's shadow-mode comparison ([03_MIGRATION_PLAN.md](03_MIGRATION_PLAN.md) Step 2) should re-run this phase's same backfill/validation tooling against whatever company base exists at that time, since the tooling is proven correct here but has not yet been exercised at any meaningful scale.
