# TAXONOMY REFOUNDATION — PHASE 16: PHYSICAL CLEANUP REPORT

Execution phase. Physically removed the legacy Service-based taxonomy: 6 database tables, 1 enum, 2 columns, and 12 legacy pipeline files. One real blocker was found and respected — the legacy in-memory `taxonomySource` tree (built from `packages/taxonomy/src/source/**`) has live consumers in `apps/web`'s SEO/public-navigation system that were never part of any prior phase's scope, so that tree was **not** touched. Full data backup taken before any `DROP`. All 12 functional areas re-validated against the live database after the drop, zero regressions.

---

## Pre-Drop Safety Check — the one blocker found

Per the mandatory safety rule, before deleting `packages/taxonomy/src/source/**` (named in this phase's "Legacy taxonomy source tree" target), I traced its actual consumers and found three live, non-comment usages:

- `apps/web/src/site/services/public-navigation/builders.ts` — `taxonomySource.interventions.map(...)`
- `apps/web/src/site/services/public-navigation/validators.ts` — `taxonomySource.interventions.map(...)` (a build-time coverage guard for the public services catalog)
- `apps/web/src/site/seo/templates/related-funnel-work.tsx` — `taxonomySource.interventions.map(...)`

None of these are in the 12 areas this phase was told to validate (Search, Discovery, Configuration, Profile, Request Creation, Request Detail, Funnel, Matching, Dispatch, Notifications, Dashboard) — they're SEO/public-navigation features outside that list, which is exactly why this dependency survived every prior phase's scan. Per the rule ("If any uncertainty exists: STOP. Document blocker. Do not delete."): **`packages/taxonomy/src/source/**`, `packages/taxonomy/src/source/index.ts` (the `taxonomySource` export), and `packages/taxonomy/src/shared/types.ts` were left untouched.** Migrating those three site files to a frozen-model equivalent is real design work this phase was explicitly told not to do.

Everything else this phase targeted had zero such surprises — confirmed removable, and removed.

---

## A. Deleted Tables

| Table | Rows at drop time | Backed up |
|---|---|---|
| `Service` | 31 | ✅ |
| `ServiceAlias` | 0 | ✅ |
| `CategoryService` | 31 | ✅ |
| `CompanyService` | 0 | ✅ |
| `InterventionService` | 31 | ✅ |
| `RequestRequiredService` | 1 (see note below) | ✅ |

**Note:** `RequestRequiredService` had 1 row, not 0 as every prior phase's audit found — a leftover test artifact dated 2026-06-20T22:17, from testing during an earlier phase (Phase 9.5/10 era), never cleaned up. Found only because this phase's backup step queries live data directly rather than trusting the prior "always empty" conclusion. It changes nothing about the zero-runtime-consumer finding (it's orphaned data, not a code path), and it's fully captured in the backup.

## B. Deleted Columns

| Column | Table | Reason |
|---|---|---|
| `requestMatchingMode` | `Company` | Zero real reads/writes confirmed in Phase 15A — only explanatory comments referenced it. |
| `matchedServiceIds` | `RequestDispatch` | Zero references anywhere in the codebase — confirmed by a fresh repo-wide search during this phase's Task 1 inventory (not named in the original 6-entity list, but unambiguously Service-era debris). |

## C. Deleted Prisma Models / Enums / Relations

- Models: `Service`, `ServiceAlias`, `CategoryService`, `CompanyService`, `InterventionService`, `RequestRequiredService`
- Enum: `CompanyRequestMatchingMode`
- Relation fields removed as a consequence: `Category.services`, `Intervention.services`, `Company.services`, `Request.requiredServices`, plus the `Service` model's own back-relations

`Sector` was explicitly **not** touched — confirmed in Phase 15B to have a real, surviving consumer (`Category.sector`, read directly by `get-request-by-id.ts`, no `Service` involvement). It wasn't named in this phase's target list either, for the same reason.

## D. Deleted Files

- `packages/taxonomy/src/orchestrator/seed-taxonomy.ts`
- `packages/taxonomy/src/orchestrator/build-taxonomy.ts`
- `packages/taxonomy/src/orchestrator/generate-taxonomy.ts`
- `packages/taxonomy/src/shared/validators.ts` (its only export, `validateTaxonomySource`, had no remaining caller once the three files above were gone)
- `packages/taxonomy/src/shared/guards.ts` (its only export, `invariant`, was used exclusively by the deleted `validators.ts` — confirmed the `frozen/shared/` tree has its own independent `guards.ts`/`validators.ts`/`constants.ts`, no cross-import)
- `packages/taxonomy/src/shared/constants.ts` (used exclusively by the deleted legacy `generate-taxonomy.ts`)
- `packages/taxonomy/generated/sectors.generated.json`
- `packages/taxonomy/generated/services.generated.json`
- `packages/taxonomy/generated/categories.generated.json`
- `packages/taxonomy/generated/interventions.generated.json`
- `packages/taxonomy/generated/service-groups.generated.json`
- `packages/taxonomy/generated/manifest.generated.json`

`packages/taxonomy/package.json`: removed the `taxonomy:build`, `taxonomy:generate`, `taxonomy:seed` script entries (confirmed via repo-wide search that nothing — no CI workflow, no root script — invoked them besides this file itself).

**Explicitly kept, with reason:** `packages/taxonomy/src/source/**` (17 files), `packages/taxonomy/src/source/index.ts`, `packages/taxonomy/src/shared/types.ts` — see the Pre-Drop Safety Check above.

## E. Deleted Types / Enums

- `CompanyRequestMatchingMode` (Prisma enum)
- No TypeScript-only types were deleted in this phase — every type tied to the dropped tables (`ModerationRequestService`, etc.) was already migrated off `Service`/`CategoryService`/`InterventionService` in Phase 15B and required no further change here.

---

## F. Validation Results

**Repository validation (Task 5):** `tsc --noEmit` clean across all 11 packages/apps (`database`, `taxonomy`, `funnel`, `domain`, `auth`, `billing`, `notifications`, `uploads`, `shared`, `ui`, plus `apps/web` and `apps/admin`). `next build` succeeded for both `apps/web` and `apps/admin`. The frozen pipeline's own commands (`taxonomy:frozen:generate`, `taxonomy:frozen:build`, `taxonomy:frozen:sync-db`) all ran successfully against the post-drop database — the sync reported `interventionsUpserted: 32, interventionsCreated: [], categoriesUnmatched: []`, confirming the live catalog is untouched and intact.

**Functional validation (Task 6):** all 12 required areas re-verified end to end with a real test company against the live database, *after* the physical drop:

| Area | Result |
|---|---|
| Search | 5 results for `"idraulico"`; alias-backed term `"disostruzione scarichi"` still resolves to `disostruire-scarichi` |
| Discovery / Profession Pages | `projectGroups: ["impianti-idraulici"]` |
| Configuration | write + read-back correct |
| Profile | `categories: ["Idraulico"]`, `interventions: ["Ristrutturare bagno"]` |
| Request Creation (Funnel) | `presetSlugs: ["BATHROOM_RENOVATION", "HOME_RENOVATION"]` |
| Request Detail | `categories: ["impresa-edile"]`, via the frozen `Intervention.projectGroupId → Category` path |
| Matching + Dispatch | `eligibleCompanyCount: 1`, `dispatchCreatedCount: 1` |
| Notifications | `appNotificationCreatedCount: 1`, `emailDeliveryCreatedCount: 1` |
| Dashboard Visibility | visible, `matchLevel: "selected_intervention"` |

Zero regressions.

---

## G. Final Architecture Snapshot

**Taxonomy model.** Frozen, four-level: `Category → ProjectGroup → Intervention → Alias`. Intervention is the sole matching/dispatch unit. Category and ProjectGroup are persisted but non-operational — onboarding, search expansion, discovery, SEO, and dashboard visibility only. `Sector` survives as a direct, non-`Service` relation on `Category` (professional grouping for admin/display, e.g. "Idraulico · Impianti"). The legacy `Service`/`CategoryService`/`InterventionService` layer no longer exists at the database level. The legacy in-memory `taxonomySource` tree still exists, used only by three SEO/public-navigation files in `apps/web` not yet migrated — a known, scoped, documented exception, not a hidden gap.

**Matching model.** `Request.interventionId → CompanyIntervention → Company` — one indexed join. No Category, Service, or Sector involvement at any point in matching or dispatch.

**Request model.** `Request` is taxonomy-snapshotted (`interventionId` + `interventionSlug`, immutable after creation) and otherwise fully decoupled from the taxonomy tables — moderation, lifecycle, credit, and dispatch all key off the Request row itself, never re-resolving taxonomy.

**Company configuration model.** A company configures `CompanyCategory` (broad professional coverage, for onboarding/discovery/dashboard) and `CompanyIntervention` (the only signal matching reads) independently — Category no longer gates or validates Intervention selection, by deliberate design (Phase 9). `Company.requestMatchingMode` no longer exists; there is no longer a separate "strictness mode" concept.

**Discovery model.** `Category.projectGroupIds → ProjectGroup → Intervention` powers profession pages, search's category-discovery layer, and dashboard's "broad net" visibility set. Search's direct-intervention layer (name/slug/alias) is now the primary mechanism for free-text queries — the Service-name-shaped queries that used to need a separate lower-tier layer are now covered by aliases on `Intervention` directly, synced from frozen source by `sync-catalog-to-database.ts`.

---

## H. Rollback Notes

Each step is independently reversible:

1. **Data:** every row from the 6 dropped tables, plus every non-default `Company.requestMatchingMode` value and non-null `RequestDispatch.matchedServiceIds` value, is preserved verbatim in `docs/archive-legacy/refoundation/taxonomy-refoundation/16_pre_drop_backup.json`.
2. **Schema:** `git diff` against the commit before this phase shows the exact Prisma model/field removals in `packages/database/prisma/schema.prisma`; reverting that file and running `prisma migrate dev` would recreate the tables/columns with the original structure.
3. **Data restore:** after recreating the schema, replay `16_pre_drop_backup.json`'s `data` object via `prisma.<model>.createMany()` per model, in this order: `Service` → `ServiceAlias`/`CategoryService`/`InterventionService`/`CompanyService`/`RequestRequiredService` (children depend on `Service` existing first) → restore `Company.requestMatchingMode` and `RequestDispatch.matchedServiceIds` from the same file's `companyRequestMatchingModes`/`dispatchMatchedServiceIds` arrays via targeted `update` calls.
4. **Code:** every deleted file is recoverable from git history (`git log --diff-filter=D -- <path>`); none were force-deleted from history, only from the working tree.

No rollback was needed — this is provided because the rule explicitly required a documented plan, not because any issue was found.

---

## I. Refoundation Complete?

## YES, with one explicitly scoped, documented exception.

The legacy Service-based taxonomy — `Service`, `ServiceAlias`, `CategoryService`, `CompanyService`, `InterventionService`, `RequestRequiredService`, `Company.requestMatchingMode`, the legacy seed/build/generate pipeline, and their generated artifacts — is physically gone: dropped from the database, deleted from the codebase, zero remaining references anywhere (verified by repo-wide search, not assumption), zero typecheck errors, zero build failures, zero functional regressions across all 12 validated areas.

The one thing knowingly left in place is the legacy `taxonomySource` in-memory tree and its three `apps/web` SEO/navigation consumers — discovered during this phase's own safety check, correctly out of scope for a "no redesign" cleanup phase, and now precisely identified (rather than hidden) as the next phase's actual remaining work, should the refoundation continue further.
