# TAXONOMY REFOUNDATION — LEGACY DEPENDENCY MAP

Read-only inventory. No code, schema, or migration changes were made to produce this document. Cross-references [01_GAP_ANALYSIS.md](01_GAP_ANALYSIS.md), [02_TARGET_MODEL.md](02_TARGET_MODEL.md), [03_MIGRATION_PLAN.md](03_MIGRATION_PLAN.md). Anything proposing a *new* field/table not already in `schema.prisma` is marked **(PROPOSED)** — it is a design suggestion surfaced during this scan, not a confirmed decision.

---

## A. Legacy Entity Inventory

| Entity | Purpose (today) | Current Usage | Replacement | Removal Strategy | Risk |
|---|---|---|---|---|---|
| `Sector` | Groups Category for display/onboarding | `Category.sectorId` FK only; no live matching/dispatch read found | DELETE (no replacement — frozen model has no tier here) | Drop `Category.sectorId`, then drop table, after Category no longer needs it for any UI | LOW |
| `Service` (+ `ServiceAlias`) | Today's real matching unit | Read in dispatch (`resolve-request-dispatch-candidates.ts`), company config, request creation | `Intervention` absorbs description/runtime-preset attributes; aliases fold into `Intervention.aliases` | Delete only after every read path below is repointed to Intervention | HIGH |
| `ServiceGroup` | UX-only catalog grouping (generated, never seeded to Prisma) | `apps/web/.../services/service-groups.ts`, taxonomy generator | `ProjectGroup` (now persisted) | Delete generator/source files + web adapter once `project-groups.generated.json`/table is the live source | MEDIUM |
| `CategoryService` | Category↔Service junction | Read in dispatch to derive `categoryId` from `serviceId`; read in company-config validation | DELETE (no Category↔Intervention relation in frozen model) | Drop once dispatch no longer needs the Service→Category derivation | HIGH |
| `CompanyService` | Company's declared service specialization | Read/write in company config (`update-services-configuration.ts`, `get-services-configuration-page.ts`); read in dispatch | `CompanyIntervention` **(PROPOSED, new junction)** | Dual-write during migration, then drop | HIGH |
| `InterventionService` | Intervention↔Service junction | Read in dispatch fallback (Intervention→Service when no `RequestRequiredService` rows) | DELETE (Intervention no longer needs a Service relation) | Drop once dispatch is Intervention-only | HIGH |
| `RequestRequiredService` | Per-request snapshot of required services | Written in `create-request.ts`; read in dispatch | `Request.interventionId` **(PROPOSED, new column)** — `Request.interventionSlug` snapshot already exists | `serviceId` FK is `onDelete: Restrict` (confirmed in schema, line 744) specifically to keep historical requests stable — deleting old rows needs an explicit archive/accept-loss decision, not just a code change | HIGH |
| `Company.requestMatchingMode` (enum `CompanyRequestMatchingMode`) | Toggles CATEGORY_WITH_SERVICE_PRIORITY vs SELECTED_SERVICES_ONLY matching strictness | Read in dispatch; written in company config | DELETE — Intervention-only matching has exactly one mode | Drop column + enum once dispatch no longer branches on it | HIGH |
| `services.generated.json`, `service-groups.generated.json`, `sectors.generated.json` | Legacy generated taxonomy artifacts | Consumed by `seed-taxonomy.ts` and web adapters | `interventions.generated.json` / `project-groups.generated.json` (frozen, already exist in `packages/taxonomy/generated/frozen/`) | Delete once legacy generator/seed scripts are retired | MEDIUM |

---

## B. File Dependency Map

Legend — Classification: KEEP / REWRITE / DELETE / UNKNOWN. Risk: LOW / MEDIUM / HIGH.

### apps/web

| File | Legacy dependency | Replacement | Classification | Risk |
|---|---|---|---|---|
| `apps/web/src/site/services/service-groups.ts` | `TaxonomyServiceGroup`, `serviceSlugs` | ProjectGroup iteration over `project-groups.generated.json` | REWRITE | MEDIUM |
| `apps/web/src/area-impresa/private/account/servizi/category-services-selector.tsx` | `serviceIds`, `serviceGroupSlug` | Intervention-checkbox UI grouped by ProjectGroup | REWRITE | MEDIUM |
| `apps/web/src/area-impresa/private/account/servizi/services-configuration-page.tsx` | `groupServicesByServiceGroup`, ServiceGroup types | ProjectGroup-grouped Intervention picker | REWRITE | MEDIUM |
| `apps/web/src/area-impresa/private/account/actions/update-services-action.ts` | `serviceIds` form field, `requestMatchingMode` | `interventionIds` form field, no mode field | REWRITE | HIGH |
| `apps/web/src/area-impresa/private/opportunita/richieste/requests-page.tsx` | `serviceId` query param | `interventionId` query param | REWRITE | MEDIUM |
| `apps/web/src/area-impresa/private/opportunita/components/request-filters-panel.tsx` | `serviceId` filter state | `interventionId` filter state | REWRITE | MEDIUM |
| `apps/web/src/site/services/catalog.ts` | `categorySlug` validation path (comment-level ServiceGroup references) | Intervention/ProjectGroup-only validation | REWRITE | LOW |
| `apps/web/src/site/services/public-navigation/*.ts`, `apps/web/src/site/seo/**` | None confirmed live (Intervention/ProjectGroup-shaped already, per prior audit) | — | KEEP | LOW |
| `apps/web/src/app/api/taxonomy/search/route.ts` | Indirect via `searchTaxonomy` | Same endpoint, updated underlying query | KEEP (until `search-taxonomy.ts` rewritten) | LOW |

### packages/taxonomy/src (legacy — everything outside `src/frozen/`)

| File | Legacy dependency | Replacement | Classification | Risk |
|---|---|---|---|---|
| `src/shared/types.ts` | `TaxonomySector`, `TaxonomyService`, `TaxonomyServiceGroup`, `sectorSlug`, `services[]` | `src/frozen/source/types/*` (already built) | DELETE (wholesale, once frozen is promoted) | HIGH |
| `src/shared/validators.ts` | Validates Sector/Service/ServiceGroup invariants | `src/frozen/shared/validators.ts` (already built) | DELETE | HIGH |
| `src/orchestrator/generate-taxonomy.ts` | Generates `sectors/services/service-groups.generated.json` | `src/frozen/orchestrator/generate-taxonomy.ts` (already built) | DELETE | HIGH |
| `src/orchestrator/seed-taxonomy.ts` | Seeds `Sector`/`Service`/`ServiceGroup`/`Category`/`Intervention` into Prisma | New seed script targeting Category/ProjectGroup/Intervention tables | DELETE → REWRITE as new seed | HIGH |
| `src/orchestrator/build-taxonomy.ts` | Validates legacy `taxonomySource` | `src/frozen/orchestrator/build-taxonomy.ts` (already built) | DELETE | LOW |
| `src/source/**` (sectors/, categories/, service-groups/, services/, interventions/ — 17 files) | `TaxonomySector`/`TaxonomyService`/`TaxonomyServiceGroup`/`TaxonomyCategory`/`TaxonomyIntervention` source data | `src/frozen/source/**` (categories/, project-groups/ — needs full data migration per [03_MIGRATION_PLAN.md](03_MIGRATION_PLAN.md) Step 0) | DELETE wholesale | MEDIUM (data, not logic) |
| `src/queries/search-taxonomy.ts` | Queries `Service`/`Category` as discovery-expansion entities | Intervention/Alias-first query, drop Service/Category traversal | REWRITE | MEDIUM |
| `src/queries/resolve-intervention-for-funnel.ts` | Returns `serviceSlugs`/`categorySlugs` | Returns `runtimePresetSlugs` directly from Intervention (frozen type already supports this) | REWRITE | MEDIUM |
| `src/domain/list-services-for-category.ts` | Category→`CategoryService`→Service→Intervention traversal | Direct Category→Intervention (via whatever discovery rule replaces Category-expansion, an open product question per the architecture review) | REWRITE | MEDIUM |
| `src/index.ts` | Re-exports legacy types | Re-export frozen types instead | REWRITE | LOW |

### packages/domain

| File | Legacy dependency | Replacement | Classification | Risk |
|---|---|---|---|---|
| `src/internal/request/dispatch/resolve-request-dispatch-candidates.ts` | `requiredServices`/`Service`, `CategoryService` join, `CompanyService`, `CompanyCategory`, `requestMatchingMode` | `Request.interventionId ∩ CompanyIntervention.interventionId`, single join, no mode branch | REWRITE (core rewrite, this is the cutover point) | HIGH |
| `src/internal/request/dispatch/create-request-dispatches-for-request.ts` | Consumes candidate list from the file above; recipient email already resolved via `Company.memberships[OWNER].user.email` (no Service/Category touch here) | Same consumption pattern, just a different candidate source — no recipient-resolution change needed | KEEP (logic), REWRITE (only the candidate-source call) | MEDIUM |
| `src/internal/request/notification-deliveries.ts` | None (reads `Request.interventionSlug`/city/postalCode only) | No change | KEEP | LOW |
| `src/company/services/update-services-configuration.ts` | `CompanyService`, `CategoryService` validation, `requestMatchingMode` write | Write `CompanyIntervention`, drop mode field entirely | REWRITE | HIGH |
| `src/company/services/get-services-configuration-page.ts` | `CompanyService`, `CategoryService`, `Sector` join | Read `CompanyIntervention` + ProjectGroup-grouped Intervention list | REWRITE | HIGH |
| `src/company/requests/get-requests-list-page.ts` | `categoryId`/`serviceId` filters, `CategoryService` | `interventionId` filter | REWRITE | HIGH |
| `src/company/profile/get-profile-page.ts`, `src/company/profile/index.ts` | `categoryIds`/`serviceIds` display types | `categoryIds`/`interventionIds` | REWRITE | MEDIUM |
| `src/admin/requests/get-request-by-id.ts`, `src/admin/requests/index.ts` | Reads `Service`/Category nested under Intervention for admin display | Read Intervention directly (no Service hop) | REWRITE | MEDIUM |
| `src/public/requests/create-request.ts` | Resolves `requiredServiceSlugs`→`Service.id`, writes `RequestRequiredService` | Resolve `interventionSlug`→`Intervention.id`, write `Request.interventionId` | REWRITE | HIGH |

### packages/funnel

| File | Legacy dependency | Replacement | Classification | Risk |
|---|---|---|---|---|
| `src/orchestration/create-runtime-funnel.ts` | Merges `runtimePresetSlugs` by walking `serviceSlugs`/`categorySlugs` | Read `runtimePresetSlugs` directly off Intervention (frozen type already carries it) | REWRITE | MEDIUM |
| `src/compiler/resolve-runtime-profile.ts` | `ResolvedIntervention.serviceSlugs`/`categorySlugs` fields | Drop both fields, keep `runtimePresetSlugs` | REWRITE | MEDIUM |
| `src/compiler/build-request-draft.ts` | `RequestMatchingSignals.requiredServiceSlugs` | Carry `interventionSlug` only | REWRITE | HIGH (this is the funnel→matching handoff) |
| `src/presets/*.ts` | None (preset definitions are funnel-internal, not taxonomy-coupled) | — | KEEP | LOW |

### apps/admin

| File | Legacy dependency | Replacement | Classification | Risk |
|---|---|---|---|---|
| `apps/admin/src/lib/notifications/process-request-email-deliveries.ts` | None (reads `Request.interventionSlug`/city/postalCode only) | No change | KEEP | LOW |
| Rest of `apps/admin/**` | None — confirmed no taxonomy/service/category management screens exist | — | KEEP | LOW |

---

## C. Database Dependency Map

| Table | Column/Relation | Legacy entity | Replacement | Delete? | Risk |
|---|---|---|---|---|---|
| `Sector` | entire model | Sector | — | YES | LOW (no live runtime read found, only `Category.sectorId` FK) |
| `Category` | `sectorId` | Sector FK | dropped, no replacement column | YES | MEDIUM (orphans on Sector removal — sequence matters) |
| `Service` | entire model | Service | Intervention | YES (after all referrers below) | HIGH |
| `ServiceAlias` | entire model | Service aliases | `Intervention.aliases` / Alias | YES | MEDIUM |
| `CategoryService` | entire model (junction) | Category↔Service | DELETE, no replacement | YES | HIGH (actively read in dispatch) |
| `InterventionService` | entire model (junction) | Intervention↔Service | DELETE, no replacement | YES | HIGH (actively read in dispatch fallback) |
| `CompanyService` | entire model (junction) | Company↔Service | `CompanyIntervention` **(PROPOSED)** | YES (after dual-write window) | HIGH |
| `CompanyCategory` | entire model (junction) | Company↔Category | KEPT, re-scoped to non-matching | NO | HIGH (still read in dispatch today — read removed in matching rewrite, not the table) |
| `RequestRequiredService` | entire model (junction) | Request↔Service snapshot | `Request.interventionId` **(PROPOSED)** | YES, but `serviceId` FK is `onDelete: Restrict` for historical stability — needs explicit data-retention decision before drop | HIGH |
| `Company` | `requestMatchingMode` + `CompanyRequestMatchingMode` enum | Matching strictness toggle | DELETE, single matching mode | YES | HIGH |
| `Request` | `interventionSlug` | Already-existing taxonomy-independent snapshot | KEPT as-is | NO | LOW |
| `Request` | `interventionId` (does not exist yet) | — | **(PROPOSED)** new FK column | N/A (additive) | MEDIUM |
| n/a | `CompanyIntervention` (does not exist yet) | — | **(PROPOSED)** new junction (companyId, interventionId) | N/A (additive) | MEDIUM |

Migration files already present: `packages/database/prisma/migrations/20260620090513_remove_taxonomy_domain/` already dropped `Domain`/`DomainAlias`/`DomainIntervention` — confirming that cutover is a precedent already executed once in this codebase, not a hypothetical pattern.

---

## D. Matching Dependency Map

**Current flow** (`resolve-request-dispatch-candidates.ts`):
1. Resolve required service IDs: prefer `RequestRequiredService` rows; fall back to `Intervention → InterventionService → serviceId` when none exist.
2. Join `Service → CategoryService → categoryId` to derive eligible categories.
3. Filter `Company` by `CompanyCategory` membership; further filter by `CompanyService` when `requestMatchingMode = SELECTED_SERVICES_ONLY`.
4. Return candidates tagged `SERVICE_MATCH` or `CATEGORY_MATCH`.

**Target flow:** `Request.interventionId ∩ CompanyIntervention.interventionId` — one join, no mode branch, no Category involvement.

**Files affected:** `packages/domain/src/internal/request/dispatch/resolve-request-dispatch-candidates.ts` (HIGH — full rewrite), `packages/database/prisma/schema.prisma` (MEDIUM — additive columns/tables only).

---

## E. Dispatch Dependency Map

**Current chain:** `create-request-dispatches-for-request.ts` calls the matching resolver above, creates `RequestDispatch` rows, then creates `CompanyNotification`/`NotificationDelivery` rows with recipient email read from `Company.memberships[OWNER].user.email` — this recipient-resolution step does **not** touch Service/Category at all today.

**Target chain:** identical, except the candidate list it consumes comes from the rewritten matching resolver. No change to recipient-email resolution is required — note this corrects a candidate denormalization idea (`CompanyIntervention.companyOwnerEmail`) that surfaced during this scan; it is not needed and is **not** part of the approved target model in [02_TARGET_MODEL.md](02_TARGET_MODEL.md).

**Files affected:** `packages/domain/src/internal/request/dispatch/create-request-dispatches-for-request.ts` (MEDIUM — only the candidate-source call changes).

---

## F. Notification Dependency Map

**Today:** recipients are exactly whoever the matching/dispatch step already selected; `notification-deliveries.ts` and `apps/admin/src/lib/notifications/process-request-email-deliveries.ts` read only `Request.interventionSlug`/city/postalCode for the email body — zero Service/Category/ServiceGroup coupling in the notification layer itself.

**Tomorrow:** unchanged structurally — notifications inherit the fix once §D/§E land. No notification-specific files need rewriting.

**Files affected:** none requiring change; confirmed KEEP for both files above.

---

## G. Request Lifecycle Map

| Phase | Legacy touchpoint | Target replacement |
|---|---|---|
| Creation (`create-request.ts`) | Resolves `requiredServiceSlugs → Service.id`, writes `RequestRequiredService` | Resolve `interventionSlug → Intervention.id`, write `Request.interventionId` |
| Persistence | `RequestRequiredService` junction | `Request.interventionId` column (1:1, no junction needed) |
| Matching | See §D | See §D |
| Dispatch | See §E | See §E |
| Notification | See §F | See §F (no change) |

---

## H. Search Map

| File | Legacy dependency | Replacement strategy | Classification |
|---|---|---|---|
| `packages/taxonomy/src/queries/search-taxonomy.ts` | Category/Service discovery-expansion traversal | Intervention/Alias-first, drop Service hop | REWRITE |
| `packages/taxonomy/src/domain/list-services-for-category.ts` | Category→CategoryService→Service→Intervention | Direct Category→Intervention (pending the open product decision on whether Category still expands to results at all, flagged in the architecture review) | REWRITE |
| `apps/web/src/site/services/service-groups.ts` | `TaxonomyServiceGroup`/`serviceSlugs` | ProjectGroup iteration | REWRITE |
| `apps/web/src/site/home/search-bar.tsx`, `apps/web/src/app/api/taxonomy/search/route.ts`, `apps/web/src/site/seo/**`, `public-navigation/*` | None confirmed (already Intervention/ProjectGroup-shaped) | — | KEEP |

---

## I. Admin Map

No taxonomy, service, category, or sector management screens exist anywhere in `apps/admin`. Confirmed by direct inspection — admin manages companies, requests, support, and credits only; taxonomy stays code-sourced/editorial. **No files require changes in Admin for this cutover.**

---

## J. Legacy → New Mapping Table

| Legacy | Replacement |
|---|---|
| Service | Intervention |
| ServiceAlias | Intervention.aliases / Alias |
| ServiceGroup | ProjectGroup |
| Sector | DELETE |
| CategoryService | DELETE |
| InterventionService | DELETE |
| CompanyService | CompanyIntervention (proposed) |
| CompanyCategory | KEPT, re-scoped (no matching role) |
| RequestRequiredService | Request.interventionId (proposed) |
| Company.requestMatchingMode | DELETE |
| services.generated.json | interventions.generated.json |
| service-groups.generated.json | project-groups.generated.json |
| sectors.generated.json | DELETE |

---

## Success-criteria answer

**"What exact files, tables, and flows must change before legacy taxonomy can be deleted forever?"**

- **Tables to add (additive, non-breaking):** `CompanyIntervention`, `Request.interventionId`.
- **Tables to delete (only after the rewrite below ships):** `Sector`, `Service`, `ServiceAlias`, `CategoryService`, `InterventionService`, `CompanyService`, `RequestRequiredService`, `Company.requestMatchingMode`/enum.
- **The one file that gates everything:** `packages/domain/src/internal/request/dispatch/resolve-request-dispatch-candidates.ts` — until this is rewritten to the Intervention-only join, none of the legacy tables above can be touched.
- **Everything else** (company config UI, request creation, search, funnel handoff) can be rewritten in parallel once the matching rewrite defines the new query shape, per the sequencing already laid out in [03_MIGRATION_PLAN.md](03_MIGRATION_PLAN.md).
- **Genuinely open, non-code decisions** surfaced again in this pass: (1) historical `RequestRequiredService` rows are `onDelete: Restrict`-protected for a reason — deleting them needs an explicit retention call, not just a migration; (2) whether Category still expands to search results once it has no Service relation to traverse is unresolved.
