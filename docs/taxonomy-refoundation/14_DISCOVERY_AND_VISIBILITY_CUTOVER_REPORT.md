# TAXONOMY REFOUNDATION — PHASE 14: DISCOVERY & MARKETPLACE VISIBILITY CUTOVER REPORT

Implementation phase. Replaces the remaining `Category → Service → Intervention` discovery path with `Category → ProjectGroup → Intervention` across search, SEO/profession pages, and the company marketplace dashboard — and, as a direct consequence of the dashboard rewrite, completes the `RequestRequiredService` removal that [13_REQUEST_LIFECYCLE_CLEANUP_REPORT.md](13_REQUEST_LIFECYCLE_CLEANUP_REPORT.md) had explicitly deferred. Matching, dispatch, and notification logic (Phases 10–12) were **not** touched — confirmed by re-running the full create→match→dispatch→notify chain end-to-end after every change in this phase, not just by avoiding those files.

**Architectural decision implemented exactly as specified:** `Category.defaultProjectGroups` was renamed to `Category.projectGroups`, now officially serving onboarding, search expansion, discovery, SEO, and marketplace visibility — never matching, dispatch, notifications, or authorization.

---

## A. Files Changed

**Schema (additive/rename only, no data loss):**
- `packages/database/prisma/schema.prisma` — `Category.defaultProjectGroupIds` renamed to `projectGroupIds`; new `ProjectGroupAlias` model + `ProjectGroup.aliases` relation.
- `packages/database/prisma/migrations/20260621091239_phase14_category_project_groups_rename_and_aliases/` — hand-authored migration (see §F for why).

**Frozen taxonomy package** (`packages/taxonomy/src/frozen/`):
- `source/types/{category,project-group,alias}.ts` — `projectGroups` rename, `aliases?` added to `FrozenCategory`/`FrozenProjectGroup`, `FrozenAlias` generalized to carry `ownerType`/`ownerSlug` instead of being Intervention-only.
- `shared/constants.ts`, `shared/validators.ts` — `MAX_ALIAS_PER_ENTITY` (renamed from `...INTERVENTION`, now shared across all three aliasable entities), alias validation factored into one `validateEntityAliases` helper, global alias-collision check extended to Category/ProjectGroup.
- `orchestrator/generate-taxonomy.ts` — emits `aliases`/`projectGroups` on `categories.generated.json`/`project-groups.generated.json`; `aliases.generated.json` now carries all three owner types.
- `orchestrator/sync-catalog-to-database.ts` — writes `CategoryAlias`/`ProjectGroupAlias` rows; renamed field references.
- `source/categories/*.ts` (7 files) — field rename; real legacy aliases carried over (`impresa di costruzioni`/`ditta edile`, `impresa idraulica`, `impresa elettrica`); `pittore`/`tinteggiatore` added to `imbianchino` (required by Task 3's validation list, didn't exist in legacy data).

**Search & discovery:**
- `packages/taxonomy/src/queries/search-taxonomy.ts` — Category-discovery layer rewritten from `Category → CategoryService → Service → InterventionService → Intervention` to `Category.projectGroupIds → Intervention.projectGroupId`, one batched query for all matched categories combined (was N parallel calls).
- `packages/taxonomy/src/domain/` — **deleted** (`list-services-for-category.ts` + barrel), confirmed fully dead by repo-wide grep before removal.
- `packages/taxonomy/src/queries/get-profession-page.ts` — **new**, powers the profession pages.

**Profession pages (new):**
- `apps/web/src/app/professionisti/[categorySlug]/{page,not-found}.tsx`
- `apps/web/src/site/professions/profession-page-template.tsx`

**Marketplace visibility (the other half of this phase):**
- `packages/domain/src/company/requests/get-requests-list-page.ts` — full rewrite, see §E.
- `apps/web/src/area-impresa/private/opportunita/components/{request-filters-panel,company-request-list}.tsx`, `richieste/requests-page.tsx` — renamed `serviceId`→`interventionId`, `services`→`interventions`, `hasSelectedServices`→`hasSelectedInterventions`, `matchLevel` value `selected_service`→`selected_intervention`.

**Request lifecycle (Phase 13 follow-through, enabled by this phase):**
- `packages/domain/src/public/requests/create-request.ts` — removed `resolveRequiredServiceIds` and the `RequestRequiredService` write entirely, now that its last real consumer (the dashboard) no longer needs it.
- `packages/funnel/src/types/request-draft.ts` — corrected a comment that had become actively wrong (claimed "runtime matching remains `request.requiredServices` vs `company.selectedServices`" — no longer true since Phase 10). Comment-only, no logic change.

**Company configuration (rename follow-through):**
- `packages/domain/src/company/services/get-services-configuration-page.ts`, `apps/web/.../services-configuration-page.tsx` — `defaultProjectGroupIds` → `projectGroupIds` rename propagated.

---

## B. Taxonomy Model Updates

Implemented exactly as specified in the task's architectural decision:

```
Category { id, slug, name, aliases[], projectGroups[] }
ProjectGroup { id, slug, name, aliases[], interventions[] }
Intervention { id, slug, name, aliases[] }  (unchanged, already had aliases)
```

`Category.projectGroups` (renamed from `defaultProjectGroups`) is now documented and used for onboarding, search expansion, discovery, SEO, and marketplace visibility — confirmed by actual usage in this phase's code, not just the rename. Still never read by matching/dispatch/notification/authorization code — confirmed by re-grepping those modules after every change.

**Live data verified post-migration:** all 7 categories' previously-populated `projectGroupIds` arrays survived the column rename intact (read back and compared before/after). 6 `CategoryAlias` rows written from real source data. 0 `ProjectGroupAlias` rows (none were required by this phase's validation list; the mechanism exists and is wired end-to-end, just unused until editorial content calls for it).

---

## C. Search Cutover

Old: `Category` match → `listServicesForCategory(slug)` called once per matched category → `Category → CategoryService → Service → InterventionService → Intervention`.

New: `Category` match (now includes `projectGroupIds` in the same query, no extra join) → collect all matched categories' `projectGroupIds` → **one** batched `Intervention.findMany({ where: { projectGroupId: { in: [...] } } })` covering every matched category at once.

**Validated against the live database**, all 5 required terms:

| Term | Results |
|---|---|
| `imbianchino` | `cartongesso-e-finiture`, `tinteggiare-esterni`, `tinteggiare-interni` |
| `pittore` | **identical** results — proves the new `Category.aliases` mechanism works, not just compiles |
| `elettricista` | 5 interventions from `impianti-elettrici` |
| `idraulico` | 5 interventions from `impianti-idraulici` |
| `impresa edile` | 10 interventions spanning all 3 of its ProjectGroups (`ristrutturazioni`, `opere-murarie`, `tetti`) — confirms multi-ProjectGroup expansion works, not just the single-group case |

The Service-direct-match search layer (matching a typed term against `Service` name/alias, separate from the Category-discovery layer rewritten here) was **not** touched — out of this task's literal scope ("replace Category → Service → Intervention," not "remove Service from search entirely"). Flagged in §G as a remaining dependency, not silently left unmentioned.

---

## D. Discovery Review

Profession pages validated against live data for two categories of different shapes:

- `imbianchino` → 1 ProjectGroup (`finiture`), 3 interventions.
- `impresa-edile` → 3 ProjectGroups (`ristrutturazioni`, `opere-murarie`, `tetti`), 4+2+3 interventions respectively, each intervention referenced by id/slug from its owning ProjectGroup — **zero duplication**, confirmed by reading the actual query (`getProfessionPage` selects straight from `Intervention`/`ProjectGroup`, never copies data onto `Category`).
- Not-found case (`does-not-exist`) correctly returns `null`, wired to Next.js `notFound()`.

Each intervention links to its existing SEO landing (`/interventi/{slug}`) when one exists, falling back to the universal funnel entry (`/richiesta/{slug}`) otherwise — confirmed by checking `getSeoInterventionLandingBySlug` for every intervention rather than assuming a link target.

**One pre-existing architectural fragmentation confirmed, not created by this phase, and not fixed here (out of scope per "no redesign"):** while building the profession page I found a *third* independent "category-like" grouping in `apps/web/src/site/services/catalog.ts` (its own `categorySlug` values — `ristrutturazioni`, `impianti`, `energia`, `finiture`, `pratiche-edilizie`, `tecnici-e-progettazione` — distinct from both the taxonomy `Category` and the `public-navigation` macro-areas flagged in [DISCOVERY_REVIEW.md](DISCOVERY_REVIEW.md) §D.2). The new profession pages deliberately do not depend on this registry, to avoid deepening the fragmentation — they read taxonomy data directly instead.

---

## E. Marketplace Visibility Cutover

**Old dependency chain:** `RequestRequiredService` EXISTS checks (3 separate subqueries: visibility, selected-tier rank, category-tier rank) + a 4th EXISTS for keyword search by service name + a 5th for category name via `CategoryService`/`Category` — 5 distinct `RequestRequiredService`-rooted subqueries in one SQL statement, plus `CategoryService.findMany` calls for the company's operational service set and the filter dropdown.

**New dependency chain:** `Request.interventionId` is a direct scalar column — every one of those 5 subqueries collapses to a direct comparison or a 2-table join (`Intervention`/`Category` via the array column), and the company's "operational" set comes from `Category.projectGroupIds` (already on the row, no join) → one batched `Intervention.findMany`.

**Ranking model, preserved and validated, not just redesigned on paper:**

| Tier | Old condition | New condition | Verified |
|---|---|---|---|
| `selected_intervention` (was `selected_service`) | `RequestRequiredService.serviceId ∈ CompanyService` | `Request.interventionId ∈ CompanyIntervention` | Real request targeting the company's directly-selected intervention → ranked `selected_intervention` ✓ |
| `category` | `RequestRequiredService.serviceId ∈` company's category-derived services | `Request.interventionId ∈` company's category-derived interventions (via `projectGroupIds`) | Real request for a *different* intervention in the same configured category → ranked `category` ✓ |
| `explore` | visible via an explicit filter outside the company's own config | same, now Intervention-based | Structurally unchanged, not separately re-tested (no behavior difference in this tier's trigger condition) |

**Important, deliberately-verified behavior split:** the dashboard's `category` tier is **intentionally more lenient than dispatch**. In the same validation run, the category-tier request was visible in the dashboard but produced `eligibleCompanyCount: 0` when run through the unmodified Phase 10 dispatch path — i.e., the company can still *browse* a broader "your category" set, but does not get *notified* for it unless they've explicitly selected that intervention. This is not a bug; it's the dashboard correctly staying a browsing aid while dispatch stays strict, exactly as the two systems were already decoupled (dispatch reads `CompanyIntervention` directly via Phase 10, never via this dashboard's query).

Filter dropdown (`interventions`, renamed from `services`) verified for `idraulico`: 5 interventions returned, the company's actually-selected one (`riparare-perdita-acqua`) correctly marked `isConfigured: true`, the other 4 correctly `false`.

---

## F. Migration Note: Manual Rename, Not Auto-Generated

`prisma migrate dev` refused to run non-interactively because the schema diff for renaming `defaultProjectGroupIds` → `projectGroupIds` would, by default, be generated as **drop old column + add new column** — which would have silently discarded the 7 categories' already-populated values from Phase 8.5. Caught before it happened, not after: the migration SQL was hand-authored as `ALTER TABLE "Category" RENAME COLUMN`, applied via `prisma db execute`, and reconciled into Prisma's migration history via `prisma migrate resolve --applied`. Verified by reading the data back immediately after: all 7 categories' arrays were intact, unchanged.

---

## G. Remaining Legacy Dependencies

| Entity | Status after this phase |
|---|---|
| `Service` | Still used by: the company-config write's *derivation* of legacy `CompanyService` (Phase 9, unchanged), and search's separate Service-direct-match layer (§C, not in this phase's scope). **Not fully removable yet.** |
| `CategoryService` | No longer read anywhere in search or the marketplace dashboard (both rewritten this phase). Still read by `update-services-configuration.ts`'s legacy-continuity derivation (Phase 9, intentionally unchanged) — **removable only after that derivation is retired**, which depends on `CompanyService` no longer being needed at all. |
| `CompanyService` | Still written (derived) by company configuration for legacy matching continuity (Phase 9). Matching itself (Phase 10) and the dashboard (this phase) no longer read it. **Removable once nothing reads `Service`/`CompanyService` for any purpose** — closer than before, not yet fully there. |
| `InterventionService` | No longer read by the dashboard (this phase) or matching (Phase 10). Still read by search's Service-direct-match layer (§C). |
| `RequestRequiredService` | **Removed.** No longer written (this phase) or read anywhere — confirmed by repo-wide grep, zero remaining functional references. The admin moderation view's `requiredServices` field will simply always be empty going forward and gracefully fall back to its existing `intervention.services` derivation, exactly as that page's pre-existing fallback logic already handled. |
| `requestMatchingMode` | Unchanged from Phase 9–10: not read by matching (Phase 10) or written by the current company-config UI. Column still exists, untouched. |
| `Sector` | Untouched, unaffected by this phase. |

---

## H. Ready For Legacy Cleanup?

**NO — closer than ever, but not yet, and here is exactly what's left, not a vague "almost":**

The two remaining blockers are now narrow and well-defined:
1. **`update-services-configuration.ts`'s `CompanyService` derivation** (Phase 9) — kept for legacy matching continuity. Matching (Phase 10) doesn't read it anymore, so this derivation may itself now be removable, but verifying that is Phase 9/10's territory to re-audit, not this phase's.
2. **Search's Service-direct-match layer** (§C) — still queries `Service`/`InterventionService` directly for a different search trigger than the Category-discovery layer rewritten here.

Both are now isolated, identified, single-purpose dependencies rather than tangled across multiple files — confirmed by this phase's rewrites removing every *other* place `Service`-family entities were touched in search and marketplace visibility. Legacy cleanup (dropping `Service`, `CategoryService`, `InterventionService`, `Sector`, `requestMatchingMode`) should follow once those two are explicitly resolved, not before.
