# TAXONOMY REFOUNDATION — QUERY BOUNDARY + DUPLICATION AUDIT

Read-only audit. No code, schema, or data changes were made. Grounded in direct re-reading of every file named below, plus fresh repo-wide greps run for this audit rather than relying on prior reports' summaries.

---

## A. Files Reviewed

`packages/taxonomy/src/queries/{search-taxonomy.ts, get-profession-page.ts, resolve-intervention-for-funnel.ts, index.ts}`, cross-referenced against `packages/funnel/src/orchestration/create-runtime-funnel.ts` (the sole consumer of `resolveInterventionForFunnel`), `packages/domain/src/company/{requests/get-requests-list-page.ts, profile/get-profile-page.ts, services/get-services-configuration-page.ts}`, and a repo-wide grep for `runtimePresetSlugs`, `ProjectGroup`, and `CompanyService`.

---

## B. Ownership Classification

| File | Classification | Why |
|---|---|---|
| `search-taxonomy.ts` | **KEEP_IN_TAXONOMY** | Pure taxonomy discovery — full-text search over `Intervention`/`Category` aliases, returns taxonomy entities. Explicitly listed as something the package should own ("taxonomy search/discovery"). No business-workflow entity (Company, Request, Dispatch) appears anywhere in it. |
| `get-profession-page.ts` | **KEEP_IN_TAXONOMY** | Explicitly listed as in-scope ("profession discovery pages"). Reads only `Category`/`ProjectGroup`/`Intervention`, returns a taxonomy-shaped DTO; the actual page rendering lives in `apps/web` where it belongs. |
| `resolve-intervention-for-funnel.ts` | **KEEP_IN_TAXONOMY, with a flagged boundary smell** | The *query* (Intervention by slug, with its legacy Service/Category graph) is legitimately taxonomy-domain logic. But the export is named and shaped after one specific external consumer (`InterventionForFunnel`), which is itself the violation — see §E. Moving the whole file to `packages/funnel` would just relocate the smell rather than fix it (funnel would then own a function that re-derives taxonomy graph data it doesn't otherwise need). The correct fix is narrower than a file move — see §G. |

---

## C. Duplicate Logic Found

1. **Minor query-shape overlap, not exact duplication:** `get-profession-page.ts` and `packages/domain/src/company/services/get-services-configuration-page.ts` both run a `ProjectGroup.findMany` with a nested `interventions` select ordered by name. The domain file fetches **all** ProjectGroups (for the client-side picker, which needs the full catalog); the taxonomy file fetches only the ProjectGroups referenced by **one** category. Not byte-identical, not worth merging into a shared export given the different callers and filter shapes — flagged for awareness, not as an action item.

2. **Real, more significant finding — surfaced by Task 2's repo-wide search, outside `packages/taxonomy` itself:** `packages/domain/src/company/profile/get-profile-page.ts` still reads `CompanyService` directly (raw SQL join to `Service`) to display "your services" on the company's own profile page. This was not on any prior phase's radar — Phase 9 rewrote the *configuration* page to `CompanyIntervention`, Phase 14 rewrote the *dashboard* away from `CompanyService`, but the *profile* page was never touched and still shows the legacy `CompanyService` list. **This means a company's profile page can now show a different, stale set of "services" than what they actually configured via the new Intervention-based picker** — a real, user-facing inconsistency, not a code-correctness bug. Outside this audit's literal scope (it's not in `packages/taxonomy`), but too relevant to omit — see §G.

3. **No duplication found** between `search-taxonomy.ts`'s text-matching/relevance logic and anything in `packages/funnel`, `packages/domain`, or `apps/web` — confirmed by grep, nothing else implements scored multi-term taxonomy search.

---

## D. Temporary Logic Found

1. **A fully unwired field — the clearest "shadow implementation" in the frozen model:** `FrozenIntervention.runtimePresetSlugs` (added in the FROZEN MODEL UPDATE phase, validated, generated into `interventions.generated.json`) has **no corresponding column on the live `Intervention` Prisma model** — confirmed by reading the schema directly, the model has no `runtimePresetSlugs` field at all. `sync-catalog-to-database.ts` never syncs it (it only syncs `projectGroupId`/`projectGroupIds`/aliases). The field is fully validated and generated but read by **nothing, anywhere** — a designed-but-never-connected feature, not a bug, but real dead weight in its current state.

2. **The actual live preset mechanism is 100% legacy, and disconnected from the frozen model entirely:** traced `create-runtime-funnel.ts`'s real preset-merging code (`resolveTaxonomyRuntimePresetSlugs`, lines ~148–165) — it reads `runtimePresetSlugs` from the legacy in-memory `taxonomySource.interventions`/`.services`/`.categories` (imported directly from `@esigenta/taxonomy`, **not** from `resolveInterventionForFunnel`'s return value, and **not** from `frozenTaxonomySource`). `resolveInterventionForFunnel`'s `serviceSlugs`/`categorySlugs` are used only as join keys to filter the legacy `taxonomySource` arrays by slug. So today there are **two parallel, fully independent in-memory taxonomy trees** in this package (`src/source/*` legacy, `src/frozen/source/*` new) — funnel exclusively uses the legacy one. This is the direct explanation for why `resolve-intervention-for-funnel.ts` still carries the legacy Service/Category graph traversal: nothing has migrated funnel off it yet.

3. **No `TODO` comments found** in any of the three files (checked directly). No explicit "temporary adapter" labeling exists in code — the temporariness here is structural (parallel unmigrated systems), not a marked-and-forgotten shortcut.

---

## E. Boundary Violations

**One real violation, narrowly scoped:** `resolve-intervention-for-funnel.ts` exports a type and function named after its consumer (`InterventionForFunnel`, `resolveInterventionForFunnel`), encoding funnel's internal preset-merging needs (which specific slugs it wants, in which shape) into the taxonomy package's public API. This couples taxonomy to funnel's algorithm: if funnel's preset-merging logic changes — for instance, if it's ever migrated to read `Intervention.runtimePresetSlugs` directly instead of re-deriving from services/categories — taxonomy's exported function would need to change in lockstep with a change that is conceptually entirely internal to funnel.

This is the only boundary violation found. `search-taxonomy.ts` and `get-profession-page.ts` are clean: their exports are named after taxonomy concepts (search results, profession pages), not after a specific consumer's internal needs, and neither touches Company/Request/Dispatch/Notification/business-workflow entities anywhere.

---

## F. Dead Files Candidates

**None found inside `packages/taxonomy/src/queries/`.** All three files reviewed have at least one live, real consumer (confirmed by reading the consumer, not just grepping for the import):
- `search-taxonomy.ts` ← `apps/web/src/app/api/taxonomy/search/route.ts`.
- `get-profession-page.ts` ← the new `/professionisti/[categorySlug]` route (Phase 14).
- `resolve-intervention-for-funnel.ts` ← `packages/funnel/src/orchestration/create-runtime-funnel.ts` (confirmed live, not legacy-only — this is the funnel's main runtime path, still actively used for every request).

**Already-handled dead files, for completeness of the record (not new findings):** `packages/taxonomy/src/domain/` (the `list-services-for-category.ts` module) was identified as dead and deleted *during* Phase 14 itself, not before it — so it correctly does not appear as a live file in this audit.

**Not dead, but worth flagging as still-load-bearing despite reduced relevance:** the entire legacy `packages/taxonomy/src/source/**` tree (as distinct from `src/frozen/source/**`) is still required — it's what `seed-taxonomy.ts` uses to populate the live `Service`/`Category`/`Sector`/`ServiceGroup` tables that both `resolve-intervention-for-funnel.ts` (this audit) and search's still-unreplaced Service-direct-match layer (flagged in [14_DISCOVERY_AND_VISIBILITY_CUTOVER_REPORT.md](14_DISCOVERY_AND_VISIBILITY_CUTOVER_REPORT.md) §G) depend on. Not removable until funnel's preset mechanism migrates off it.

---

## G. Recommended Actions

Narrow, in order of priority — none of these are executed in this audit:

1. **Rename/regeneralize `resolve-intervention-for-funnel.ts`'s export** so taxonomy stops naming an API after one consumer's internals. Concretely: rename the export to something taxonomy-domain-shaped (e.g., `resolveInterventionLegacyServiceGraph`, explicitly flagged as legacy in its own name) and let `packages/funnel` decide how to shape what it needs from that — or, better, once funnel migrates to `Intervention.runtimePresetSlugs` directly (next item), delete the resolver's `serviceSlugs`/`categorySlugs` derivation entirely rather than rename it.
2. **Wire `FrozenIntervention.runtimePresetSlugs` end-to-end** before relying on it for anything: add the column to the live `Intervention` model, sync it in `sync-catalog-to-database.ts`, then migrate `create-runtime-funnel.ts`'s `resolveTaxonomyRuntimePresetSlugs` to read it directly instead of cross-referencing the legacy `taxonomySource` service/category arrays. This is the change that makes Recommendation 1 actually safe to finish (today, removing the legacy derivation would break real preset merging, since the new field isn't populated anywhere yet).
3. **Outside `packages/taxonomy`, flagged because it was found during this audit's required repo-wide search, not part of the package's own verdict:** reconcile `get-profile-page.ts`'s `CompanyService`-based "your services" display with the Intervention-based configuration that's been the source of truth since Phase 9 — a company can currently see a different, stale list on their profile page than what they actually configured.

---

## Verdict

**Is `packages/taxonomy` still clean and cohesive? YES**, with one narrow, precisely-scoped exception, not a systemic problem.

Two of the three reviewed files (`search-taxonomy.ts`, `get-profession-page.ts`) are correctly placed, free of duplication, free of temporary/legacy shortcuts, and free of boundary leakage — confirmed by direct inspection, not assumption. The third (`resolve-intervention-for-funnel.ts`) has one identified boundary smell (a consumer-named export) and is the visible symptom of a real but pre-existing fact: funnel has not yet migrated off the legacy in-memory taxonomy source, so the new frozen model's `runtimePresetSlugs` field sits unused. This does not block Phase 15 — none of the three files duplicate logic that Phase 15's legacy cleanup would need to consider removing, and none of them own request lifecycle, matching, dispatch, or notification logic. The two corrective actions in §G (rename the funnel-shaped export, wire the frozen `runtimePresetSlugs` field) are recommended before or alongside Phase 15, not as a blocker to starting it.
