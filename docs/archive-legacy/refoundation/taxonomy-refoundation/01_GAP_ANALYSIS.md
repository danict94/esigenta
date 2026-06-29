# TAXONOMY REFOUNDATION — GAP ANALYSIS

Source of truth: [docs/taxonomy.md](../taxonomy.md) (FROZEN v1).
New model implementation: `packages/taxonomy/src/frozen/` — isolated, compiles/validates/generates independently of legacy code (verified: `taxonomy:frozen:build`, `taxonomy:frozen:generate`).

This document compares the frozen model (Category → defaultProjectGroups, ProjectGroup → Intervention → Alias, Intervention-only matching) against the **current legacy implementation** still in production code (`packages/taxonomy/src/source/*` outside `frozen/`, plus its DB-backed consumers). Nothing in this document has been deleted or modified in legacy code — this is analysis only.

---

## Legacy entity classification

| Legacy entity | Where it lives | Frozen-model equivalent | Classification | Notes |
|---|---|---|---|---|
| `Sector` (TaxonomySector) | `packages/taxonomy/src/source/sectors/`, Prisma table `Sector` | None — frozen model has no Sector tier | **DELETE** | Frozen model has nothing between "nothing" and Category. Category.defaultProjectGroups is the only bootstrap concept; Sector must not be replaced 1:1 with anything. |
| `Service` (TaxonomyService) | `packages/taxonomy/src/source/services/`, Prisma table `Service` | None — Intervention absorbs whatever Service held (description, runtime presets) | **DELETE** | This is the entity whose removal unblocks everything else. Currently the real matching unit; frozen model forbids it from participating in matching at all. |
| `ServiceAlias` | Prisma table | Folded into `Intervention.aliases` / generated `aliases.generated.json` | **DELETE** | Aliases move from Service-level to Intervention-level only. |
| `ServiceGroup` (TaxonomyServiceGroup) | `packages/taxonomy/src/source/service-groups/`, generated-only (never seeded to Prisma) | `ProjectGroup` | **REPLACE** | Same *position* in the catalog (an organizational layer between Category and the operational unit) but wrong *member type* — ServiceGroup groups Services, ProjectGroup groups Interventions directly. Not a rename; the grouping criteria must be redone against Intervention, not Service. |
| `CategoryService` (junction) | Prisma table | None | **DELETE** | Category↔Intervention/ProjectGroup relations are explicitly forbidden except `defaultProjectGroups`. |
| `InterventionService` (junction) | Prisma table | None | **DELETE** | Intervention no longer needs to reference Service once Service is gone. |
| `CompanyService` | Prisma table | New: Company.interventionIds (direct array or junction) | **REPLACE** | Company professional coverage becomes Intervention-keyed, not Service-keyed. |
| `CompanyCategory` | Prisma table | Company.categoryIds (kept, but stops participating in matching) | **KEEP (re-scoped)** | Category survives as identity metadata + UX bootstrap source only. Matching code must stop reading it. |
| `RequestRequiredService` (junction) | Prisma table | Request.interventionId / interventionSlug (already exists as a snapshot field) | **DELETE** | Request already stores `interventionSlug`; this junction becomes redundant once dispatch is repointed. |
| `Category` (TaxonomyCategory) | `packages/taxonomy/src/source/categories/`, Prisma table | `FrozenCategory` (now implemented) | **REPLACE (shape change)** | Field set changes: drop `sectorSlug`, `services[]`, `runtimePresetSlugs`; add `defaultProjectGroups: string[]`. |
| `Intervention` (TaxonomyIntervention) | `packages/taxonomy/src/source/interventions/`, Prisma table | `FrozenIntervention` (now implemented) | **REPLACE (shape change)** | Field set changes: drop `services[]`; aliases stay; becomes the sole matching unit. |
| Embedded `aliases?: string[]` on Service/Category/Intervention | Legacy types | `FrozenAlias` records, generated `aliases.generated.json` | **REPLACE** | Frozen model keeps aliases embedded on the source `Intervention` object (per spec example) but the *generator* also emits a normalized flat `aliases.generated.json` keyed by `interventionSlug` — already implemented in `generate-taxonomy.ts`. Category/Service no longer own aliases (Service disappears; Category aliases are not part of the frozen spec's example shape and were not carried over). |
| `Request.requiredServices` | Prisma relation | `Request.interventionId`/`interventionSlug` (slug snapshot already present) | **DELETE (relation)** / **KEEP (slug field)** | The slug snapshot survives untouched; only the Service-junction relation is removed. |
| `requestMatchingMode` enum (CATEGORY_WITH_SERVICE_PRIORITY / SELECTED_SERVICES_ONLY) | `Company` model | None | **DELETE** | Frozen model has exactly one matching mode: Intervention match. The toggle becomes meaningless. |

---

## Non-DB code impact (cross-reference to the read-only audit performed earlier in this engagement)

These were already inventoried in the prior full-codebase audit; restated here only insofar as they map to the entity classification above:

- `resolve-request-dispatch-candidates.ts` — currently joins `Service → CategoryService → categoryId` to find candidates. **REPLACE**: once `CompanyService`/`CategoryService` are deleted, this becomes a direct `Company.interventionIds ∩ Request.interventionId` lookup.
- `create-request.ts` — currently resolves `requiredServiceSlugs → Service IDs`. **DELETE** that resolution path; keep only `interventionSlug` resolution (already present).
- `update-services-configuration.ts`, `get-services-configuration-page.ts` — **REPLACE**, UI and persistence move from Service checkboxes to ProjectGroup-grouped Intervention checkboxes, with Category driving only the `defaultProjectGroups` bootstrap step.
- `search-taxonomy.ts`, `list-services-for-category.ts` — **REPLACE**, drop the Category→Service→Intervention discovery traversal in favor of Category→(defaultProjectGroups or none)→Intervention.
- `service-groups.ts` (apps/web) — **DELETE**, replaced by direct ProjectGroup iteration once `project-groups.generated.json` exists in the real generated output.
- `build-request-draft.ts` / `RequestMatchingSignals.requiredServiceSlugs` — **DELETE**, the funnel→matching handoff becomes Intervention-slug-only.

No admin-side impact: taxonomy stays code-sourced/editorial, confirmed in the prior audit.

---

## What is explicitly NOT touched yet

Per the phase boundary, this gap analysis does not authorize any deletion. Everything marked **DELETE** above remains live in Prisma and in application code until the migration plan ([03_MIGRATION_PLAN.md](03_MIGRATION_PLAN.md)) executes its corresponding step. The new frozen taxonomy package exists in parallel (`src/frozen/`) and has zero runtime consumers today.
