# TAXONOMY REFOUNDATION — PHASE 8.5: CATALOG PROMOTION REPORT

Implementation phase. Promotes the frozen taxonomy package from sample source data into real database records, unblocking the ProjectGroup-grouped configuration UI flagged as blocked in [09_COMPANY_CONFIGURATION_CUTOVER.md](09_COMPANY_CONFIGURATION_CUTOVER.md). No legacy table, matching, dispatch, notification, or company-configuration code was touched — confirmed by `git status` and by re-running `tsc --noEmit` clean in `packages/domain` after this phase's changes.

**Ground truth was queried directly from the live database before any design decision**, not assumed from generated files (which can drift from what's actually seeded): the live `Intervention` table has exactly 26 rows, the live `Category` table has exactly 7 rows (`cartongessista`, `elettricista`, `idraulico`, `imbianchino`, `impresa-edile`, `installatore-fotovoltaico`, `tecnico-climatizzazione`), and `ProjectGroup` had 0 rows. The frozen package's prior sample data (5 categories including fictional `architetto`/`geometra`, 6 project groups including fictional interventions like `costruire-casa`/`presentare-cila` that don't exist in production) did not match this live catalog at all — promoting it required rewriting the frozen source content to be the *real* catalog, not just running a sync against placeholder data.

---

## A. Synchronization Strategy

**Source of truth:** `packages/taxonomy/src/frozen/source/` (rewritten in this phase to cover the real catalog — see §B).

**Target:** existing live `Category`/`Intervention` rows (no new rows created — both tables are still seeded by the legacy pipeline; this phase only adds `projectGroupId`/`defaultProjectGroupIds` values to rows that already exist) plus new `ProjectGroup` rows.

**Mechanism** (`packages/taxonomy/src/frozen/orchestrator/sync-catalog-to-database.ts`, mirroring the existing `seed-taxonomy.ts` conventions exactly — dotenv-loaded root `.env`, dynamic `@esigenta/database` import, `$disconnect` in a `finally`):

1. `ProjectGroup.upsert({ where: { slug } })` for each frozen project group — create or update by slug, building a `slug → id` map.
2. `Intervention.updateMany({ where: { slug }, data: { projectGroupId } })` for every intervention nested in every project group — matches by slug against the existing live row, never creates one. A `result.count === 0` is tracked as "unmatched" rather than silently ignored.
3. `Category.updateMany({ where: { slug }, data: { defaultProjectGroupIds } })` — `defaultProjectGroups` (slugs, per the frozen type) resolved to the real `ProjectGroup.id` values from step 1's map before writing, since the live column stores ids, not slugs.
4. A `SyncReport` object is always printed (counts + unmatched-slug lists for both interventions and categories) and a non-zero `interventionsUnmatched`/`categoriesUnmatched` count sets a non-zero exit code — making drift between frozen source and live data a loud failure, not a silent partial sync.

**Idempotency:** `upsert` for `ProjectGroup` (no duplicates possible, unique on `slug`); `updateMany` with a full-replacement `data` value for `Intervention.projectGroupId`/`Category.defaultProjectGroupIds` (re-running always sets the same final value, never appends/accumulates). Verified empirically, not just by design — see §D.

---

## B. Records Created

**8 `ProjectGroup` rows** (0 → 8), built by reorganizing the real 26-intervention catalog (read directly from the live DB, cross-checked against `packages/taxonomy/generated/interventions.generated.json`) into coherent groups — replacing the prior sample-only project groups (`nuove-costruzioni`, `pavimenti`, `pratiche-edilizie`, and a same-slug-as-intervention `cartongesso-e-finiture` group, all deleted from the frozen source in this phase):

| ProjectGroup | Interventions (real, live slugs) |
|---|---|
| `ristrutturazioni` | ristrutturare-bagno, ristrutturare-cucina, ristrutturare-casa, ristrutturare-appartamento, sostituire-box-doccia, installare-sanitari |
| `tetti` | rifare-tetto, riparare-tetto, sistemare-grondaie |
| `fotovoltaico` | installare-fotovoltaico, installare-fotovoltaico-con-accumulo |
| `opere-murarie` | fare-opere-murarie, fare-massetto |
| `finiture` | cartongesso-e-finiture, tinteggiare-interni, tinteggiare-esterni |
| `impianti-elettrici` | fare-impianto-elettrico-nuovo, rifare-impianto-elettrico, riparare-guasto-elettrico, riparare-quadro-elettrico, installare-illuminazione |
| `impianti-idraulici` | rifare-impianto-idraulico-bagno, riparare-perdita-acqua, disostruire-scarichi |
| `climatizzazione` | installare-climatizzatore, fare-manutenzione-climatizzatore |

6 + 3 + 2 + 2 + 3 + 5 + 3 + 2 = **26** — every live intervention accounted for exactly once, no overlaps (validated by the frozen validator's global slug-uniqueness check across all project groups before any write happened).

**Frozen source categories rewritten** (5 → 7, to match the live 7 exactly): removed fictional `architetto`/`geometra` (no live counterpart), added `cartongessista`, `imbianchino`, `installatore-fotovoltaico`, `tecnico-climatizzazione` (existed live, missing from frozen sample).

---

## C. Records Updated

- **26/26 `Intervention` rows**: `projectGroupId` set from `NULL` to the matching `ProjectGroup.id`, zero unmatched.
- **7/7 `Category` rows**: `defaultProjectGroupIds` set from `[]` to a resolved id array (1–3 entries each — `impresa-edile` gets 3 since it spans `ristrutturazioni`/`opere-murarie`/`tetti`; every other category gets exactly 1, reflecting its single-trade focus).
- **One naming correction made mid-implementation, not silently**: the project group initially named `cartongesso-e-finiture` (matching its own member intervention's slug) was renamed to `finiture` after the frozen validator itself caught an alias/slug collision (`"opere murarie"` as an alias on `fare-opere-murarie` collided with the new `opere-murarie` group's own slug) — fixed by dropping the redundant alias, and the `cartongesso-e-finiture`-named group was renamed to avoid the same class of confusion (a project group sharing its slug with one of its own member interventions). Both `cartongessista` and `imbianchino` categories' `defaultProjectGroups` references were updated to match.

---

## D. Validation Results

Verified with an independent query (not reusing the sync script's own self-reported counts):

| Metric | Result |
|---|---|
| `ProjectGroup` count | **8** |
| `Intervention` count | **26** |
| Interventions without `projectGroupId` | **0** |
| Categories without `defaultProjectGroupIds` | **0** (all 7 populated) |
| Idempotency check | Sync re-run a second time: identical report (`projectGroupsUpserted: 8, interventionsMatched: 26, interventionsUnmatched: [], categoriesMatched: 7, categoriesUnmatched: []`), `ProjectGroup` count still 8 (no duplicates created) |
| Frozen-package self-validation | `taxonomy:frozen:build` and `taxonomy:frozen:generate` both pass after the source rewrite |
| Regression check | `tsc --noEmit` clean in `packages/domain` after this phase — confirms no legacy code path was touched |

---

## E. Ready For Phase 9?

**YES — the specific blocker identified in [09_COMPANY_CONFIGURATION_CUTOVER.md](09_COMPANY_CONFIGURATION_CUTOVER.md) §C/§E ("Track 2", the ProjectGroup-grouped picker) is now cleared.**

- `ProjectGroup` rows exist (8) and match the real catalog, not placeholder data.
- Every live `Intervention` has a `projectGroupId` — the grouped picker can now query `ProjectGroup → Intervention` directly against real data.
- Every live `Category` has `defaultProjectGroupIds` — onboarding bootstrap has real suggestions to pre-activate, not an empty array.
- Track 1 (dual-write `CompanyIntervention`, backfill from `CompanyService`) remains unaffected by this phase and was never blocked on catalog promotion — both tracks of Phase 9 can now proceed together rather than being sequenced.

**Note carried forward, not a blocker:** the frozen source's project-group→intervention grouping reflects one reasonable editorial organization of the real catalog, chosen during this phase (e.g., "opere murarie" as its own group rather than folded into "ristrutturazioni"). This is an editorial/content decision, not an architectural one — if the business wants a different grouping (e.g., merging `opere-murarie` into `ristrutturazioni`), that's a content edit to the frozen source files followed by re-running `taxonomy:frozen:sync-db`, not a re-design.
