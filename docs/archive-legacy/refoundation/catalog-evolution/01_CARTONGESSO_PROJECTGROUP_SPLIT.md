# CATALOG EVOLUTION 01 — CARTONGESSO PROJECTGROUP SPLIT

Catalog-quality improvement, not a taxonomy refoundation phase. Matching, dispatch, notifications, request lifecycle, dashboard, company configuration logic, and the database schema were not touched — only catalog *content* (ProjectGroup membership and Category→ProjectGroup mappings).

---

## A. Files Changed

| File | Change |
|---|---|
| `packages/taxonomy/src/frozen/source/project-groups/cartongesso.ts` | **New.** ProjectGroup `cartongesso` with the 3 drywall interventions. |
| `packages/taxonomy/src/frozen/source/project-groups/finiture.ts` | The 3 drywall interventions removed; the 5 painting/plaster interventions stay. |
| `packages/taxonomy/src/frozen/source/categories/cartongessista.ts` | `projectGroups: ["finiture"]` → `["cartongesso"]`. |
| `packages/taxonomy/src/frozen/source/categories/imbianchino.ts` | Verified unchanged — already `["finiture"]`, now correctly scoped since `finiture` no longer contains drywall work. |
| `packages/taxonomy/src/frozen/source/index.ts` | Registered the new `cartongesso` ProjectGroup in `frozenTaxonomySource.projectGroups`. |

One validator-caught fix during implementation: the new ProjectGroup's first alias draft included `"cartongessista"`, which collided with the Category slug of the same name — `validateFrozenTaxonomySource` failed the build with an explicit collision error, exactly as designed. Removed the redundant alias (the category slug already covers that term) rather than overriding the check.

---

## B. ProjectGroups Before

| ProjectGroup | Interventions |
|---|---|
| `finiture` (8) | `realizzare-parete-cartongesso`, `realizzare-controsoffitto`, `realizzare-controparete`, `tinteggiare-interni`, `tinteggiare-esterni`, `intonacare-pareti`, `ripristinare-intonaco`, `applicare-stucco-decorativo` |

`cartongessista` and `imbianchino` both pointed at this one ProjectGroup.

## C. ProjectGroups After

| ProjectGroup | Interventions |
|---|---|
| `cartongesso` (3, new) | `realizzare-parete-cartongesso`, `realizzare-controsoffitto`, `realizzare-controparete` |
| `finiture` (5) | `tinteggiare-interni`, `tinteggiare-esterni`, `intonacare-pareti`, `ripristinare-intonaco`, `applicare-stucco-decorativo` |

Total ProjectGroups: 8 → 9. Total interventions unchanged at 32 — this was a regrouping, not a catalog addition.

## D. Category Mapping Changes

| Category | Before | After |
|---|---|---|
| `cartongessista` | `finiture` | `cartongesso` |
| `imbianchino` | `finiture` | `finiture` (unchanged — now correctly scoped) |

Verified directly against the live database after sync: `Category.cartongessista.projectGroupIds` contains exactly the `cartongesso` ProjectGroup's id.

---

## E. Validation Results

- `tsc --noEmit`: clean on `packages/taxonomy` and `apps/web`.
- `taxonomy:frozen:build`: `Categories: 7, Project groups: 9, Interventions: 32` — passes the full validator suite (the alias-collision check included).
- `taxonomy:frozen:generate`: artifacts regenerated successfully.
- `taxonomy:frozen:sync-db`: `projectGroupsUpserted: 9, interventionsUpserted: 32, interventionsCreated: [], categoriesMatched: 7, categoriesUnmatched: []` — the new ProjectGroup created, every intervention's `projectGroupId` re-assigned correctly, zero unmatched references.
- `next build` (apps/web): succeeded — this executes `assertValidPublicCatalog()` at module load, so the green build is direct proof the public catalog (`coverage.ts`'s macro-area assignments, untouched by this phase) is still fully consistent with the new ProjectGroup structure. Page counts unchanged (`/professionisti/*`: 7, `/interventi/*`: 5) — confirms no public route was added, removed, or broken by the regroup.
- Direct database checks: `ProjectGroup.cartongesso.interventions` = exactly the 3 drywall slugs; `ProjectGroup.finiture.interventions` = the 5 finishing-work slugs (plus one pre-existing, unrelated artifact — see §F).

## F. Search/Discovery Impact

Live-tested, not inferred:

| Query / Page | Result |
|---|---|
| Search `"cartongesso"` | `realizzare-parete-cartongesso`, `realizzare-controsoffitto`, `realizzare-controparete` (plus one pre-existing artifact, see below) |
| Search `"cartongessista"` | Exactly the 3 drywall interventions — zero painting/plaster results |
| Search `"imbianchino"` | `tinteggiare-interni`, `tinteggiare-esterni`, `intonacare-pareti`, `ripristinare-intonaco`, `applicare-stucco-decorativo` (plus the same artifact) — zero drywall results |
| Profession page `/professionisti/cartongessista` | One ProjectGroup (`cartongesso`), exactly the 3 drywall interventions |
| Profession page `/professionisti/imbianchino` | One ProjectGroup (`finiture`), exactly the 5 finishing interventions |

**Task 6 cross-contamination check — explicitly passed:** the cartongessista page does not show painting work; the imbianchino page does not show drywall construction work. Verified with assertions that fail loudly if either occurs, not by eyeballing output.

**One pre-existing artifact, not caused by this phase, flagged honestly:** the legacy intervention `cartongesso-e-finiture` — still live in the database but absent from frozen source since the Phase 14.5/16/17 catalog split — still carries a stale `projectGroupId` pointing at `finiture` from before this split, and its old aliases still contain the word "cartongesso". It shows up in both the `imbianchino` profession page's intervention list and in `cartongesso`-query search results. This is the same already-documented content-timing gap from [14_5_CONSISTENCY_REPORT.md](../taxonomy-refoundation/14_5_CONSISTENCY_REPORT.md) and [17_LEGACY_TAXONOMY_SOURCE_REMOVAL_REPORT.md](../taxonomy-refoundation/17_LEGACY_TAXONOMY_SOURCE_REMOVAL_REPORT.md) — this phase's sync does not touch it because it isn't in any frozen `project-groups/*.ts` file at all, so nothing reassigns it. Not fixed here: doing so would mean deleting or reassigning a live database row, outside this phase's explicit "catalog structure only" scope.

---

## G. Future Opportunities

- The orphaned `cartongesso-e-finiture` row (§F) is the natural next cleanup — likely a one-line fix (delete the row, since its functionality is now fully covered by the 3 `cartongesso` interventions plus the 5 `finiture` ones), but it's a database-row decision, not a catalog-structure one, so it's named here rather than acted on.
- `cartongesso`'s 3 interventions are currently narrow (wall, ceiling, counter-wall construction). If the catalog grows drywall-adjacent work (e.g. acoustic/thermal insulation behind cartongesso, fire-rated partition walls), it now has a correctly-scoped home to grow into, instead of diluting `finiture` further.

---

## CARTONGESSO_PROJECTGROUP_CREATED = YES

`cartongesso` exists as its own ProjectGroup with exactly the 3 drywall-construction interventions. `cartongessista` maps only to it. `imbianchino` maps only to `finiture`, which now contains only finishing work (painting, plastering, decorative stucco). Validated end to end against the live database with assertions that explicitly check for the cross-contamination this split was meant to eliminate, both directions, and both came back clean. No runtime regressions, no architecture changes.
