# TAXONOMY REFOUNDATION — PHASE 15B: FINAL LEGACY CONSUMERS RESOLUTION REPORT

Execution phase. All three remaining blockers from [15_PRE_CLEANUP_AUDIT.md](15_PRE_CLEANUP_AUDIT.md) / [15A_IMMEDIATE_REMOVALS_REPORT.md](15A_IMMEDIATE_REMOVALS_REPORT.md) are resolved — two by removal, one by a minimal, narrowly-scoped capability extension. No redesign, no new architecture: every change below is either a deletion or a direct mirror of a pattern that already existed elsewhere in the same file.

---

## A. Files Changed

| File | Change |
|---|---|
| `packages/taxonomy/src/queries/search-taxonomy.ts` | Deleted the Service-discovery layer (`matchedServices` block), the now-unused `serviceAliases` query, and the `serviceDiscovery` relevance constant. |
| `packages/taxonomy/src/frozen/orchestrator/sync-catalog-to-database.ts` | Added `replaceInterventionAliases` (mirrors `replaceCategoryAliases`/`replaceProjectGroupAliases` exactly) and wired it into the Intervention sync loop. Switched Intervention sync from `updateMany` to `upsert`, making frozen taxonomy the canonical creator of Intervention rows. `SyncReport` shape adjusted accordingly (`interventionsMatched`/`interventionsUnmatched` → `interventionsUpserted`/`interventionsCreated`). |
| `packages/taxonomy/src/frozen/source/project-groups/{opere-murarie,impianti-idraulici,impianti-elettrici,fotovoltaico,tetti,climatizzazione,ristrutturazioni,finiture}.ts` | Added 20 new intervention aliases — one per closable Service-name gap (see §B). |
| `packages/domain/src/admin/requests/get-request-by-id.ts` | Rewrote the `intervention.services` derivation to use `Intervention.projectGroupId → Category` (frozen path) instead of `Intervention → InterventionService → Service → CategoryService → Category`. Removed `requiredServices` entirely (proven always-empty). Removed `mapService`, added `mapCategory`. |
| `apps/admin/src/app/(protected)/requests/[id]/page.tsx` | Removed the dead `request.requiredServices.length > 0 ? ... : ...` branch — one line, `primaryServices` now reads `request.intervention?.services ?? []` directly. No other UI changes. |

`tsc --noEmit` clean across `database`, `taxonomy`, `funnel`, `domain`, `apps/web`, `apps/admin` after every change.

---

## B. `search-taxonomy.ts` Resolution

**Exact reason it still existed:** a Service-discovery layer that matched query text against `Service.name`/`.slug`/`ServiceAlias`, then expanded to the linked `Intervention`(s) via `InterventionService`, at a lower relevance tier (2500) than direct-intervention matches (4000) or category-discovery matches (3000).

**Exact queries it served:** searches phrased the way the *old* Service catalog named things rather than the way the *new* Intervention catalog names them — e.g. "disostruzione scarichi" (Service) vs. "Disostruire scarichi" (Intervention) — different word forms that the fuzzy tokenizer doesn't bridge on its own.

**Exact gap, measured not guessed:** wrote a script comparing every Service's full text surface (name + slug + aliases) against the combined Intervention+Category alias coverage reachable from it. Result: **26 of 31 Services had a real, literal gap** — and in every single case, the gap was exactly one term: the Service's own display name, not yet present anywhere as an Intervention alias.

**Root cause of the gap, traced to its actual source:** the frozen source files already declare `aliases: [...]` per intervention — confirmed by reading `ristrutturazioni.ts` and others. But `sync-catalog-to-database.ts` only ever synced `Category`/`ProjectGroup` aliases, never `Intervention` aliases — there was no `replaceInterventionAliases` function at all. The frozen alias data has been sitting unused since it was authored.

**Before → After:**

| | Before | After |
|---|---|---|
| `"disostruzione scarichi"` | 0 results from direct/category layers; Service layer (relevance ~2480) returns `disostruire-scarichi` | `disostruire-scarichi`, relevance 5982, via direct-intervention alias match |
| `"controsoffitti in cartongesso"` | `cartongesso-e-finiture`, relevance 4401 (direct-intervention match on the shared "cartongesso" token — **not actually served by the Service layer in practice**, confirmed by re-running with the layer removed and diffing byte-for-byte) | identical — `cartongesso-e-finiture`, relevance 4401 |
| All 24 other gapped terms | served only by the Service layer at relevance ~2500 | served by the direct-intervention layer at relevance 5500–6400+ (alias text added to the linked Intervention) |

**Resolution:**
1. Extended `sync-catalog-to-database.ts` with `replaceInterventionAliases`, wiring up alias data that already existed in source but was never reaching the database.
2. Added the 20 missing alias terms (the Service's own name, where genuinely absent) to the relevant frozen source files — re-audited afterward: **29 of 31 Services fully redundant, 0 remaining closable gaps.**
3. Ran the sync against the live database, then re-ran every one of the 26 originally-gapped queries before and after physically deleting the Service-discovery code — **identical results in all 26 cases**, confirmed by diff, not assumption.
4. Removed the layer.

**Not closable, and explicitly not a regression introduced here:** 2 of 31 Services (`controsoffitti-in-cartongesso`, `pareti-in-cartongesso`) link to `cartongesso-e-finiture`, an intervention that exists live in the database but has no entry in the current frozen source — it was split into more granular interventions (`realizzare-controsoffitto`, `realizzare-parete-cartongesso`, etc., now live as of Task 3 below) during an earlier, external content reorganization documented in [14_5_CONSISTENCY_REPORT.md](14_5_CONSISTENCY_REPORT.md). There is no frozen entry to attach an alias to. Confirmed both exact-phrase queries still return a relevant result (via direct token match on "cartongesso") with or without the Service layer — zero search-quality loss, but this is a pre-existing content-timing gap, not something resolvable without inventing new structure, which this phase was explicitly told not to do.

---

## C. `get-request-by-id.ts` Resolution

| Usage | Classification | Action |
|---|---|---|
| `requiredServices` (`RequestRequiredService.service` → `Service` → `CategoryService` → `Category` → `Sector`) | **REMOVE** — re-confirmed always empty (0 historical requests; Phase 14 stopped writing `RequestRequiredService`) | Deleted the field, its query block, and the page's dead ternary branch entirely. |
| `intervention.services` (`Intervention` → `InterventionService` → `Service` → `CategoryService` → `Category` → `Sector`) | **REPLACE** | Migrated to `Intervention.projectGroupId` → `Category` (`Category.projectGroupIds`), the identical relation `search-taxonomy.ts`'s category-discovery layer and `get-profession-page.ts` already use. `Category.sector` is read directly (it's a non-nullable, Service-independent relation — confirmed in schema) — no `Sector` traversal lost, just rerouted around `Service`. |

The admin page's "Servizi rilevanti" card list and "Categoria professionale" derivation both keep working unchanged: the query now returns a single synthetic entry representing the Intervention itself (since the frozen model collapsed Service into Intervention 1:1 — there is no finer-grained breakdown left to enumerate), carrying the categories reached via `ProjectGroup`. Verified live: a real request for `ristrutturare-bagno` correctly surfaced category `impresa-edile` with sector `Edilizia` — sourced entirely from `Intervention`/`Category`/`ProjectGroup`, zero `Service` involvement.

---

## D. `seed-taxonomy.ts` Resolution

**Why the frozen pipeline couldn't create entities:** a deliberate, explicitly-commented decision from Phase 8 ("it never creates Intervention or Category rows... until Phase 15") — not a technical limitation. Checked the schema directly: `Intervention` requires only `slug`+`name` (both already present on every frozen source entry); nothing blocked `upsert` from working.

**What still depends on `seed-taxonomy.ts`:** re-ran the full Task 5 scan (below) and found **zero remaining runtime readers** of `Service`/`CategoryService`/`InterventionService`/`ServiceAlias` anywhere in the repository — Tasks 1 and 2 removed the last two. The only code touching those four tables now is `seed-taxonomy.ts` itself, writing data nothing reads. `Category`/`Sector` creation is still needed in principle, but there is currently no live gap requiring it (`categoriesUnmatched: []`).

**Whether frozen taxonomy can become canonical creator:** yes, for `Intervention` — implemented. Not yet for `Category`/`Sector`: `FrozenCategory` (`packages/taxonomy/src/frozen/source/types/category.ts`) has no `sectorId`/`sectorSlug` field at all, and `Category.sectorId` is a required, non-nullable column. Adding one would mean extending the frozen model's contract — explicitly out of scope ("Do NOT redesign"), and not currently blocking anything since no new Category is pending.

**Minimum change implemented:** `sync-catalog-to-database.ts`'s Intervention loop now `upsert`s instead of `updateMany`s, with a `create` clause supplying `slug`/`name`/`description`. Ran it against the live database: **the 7 previously-unmatched interventions (`ripristino-frontalino`, `realizzare-parete-cartongesso`, `realizzare-controsoffitto`, `realizzare-controparete`, `intonacare-pareti`, `ripristinare-intonaco`, `applicare-stucco-decorativo`) were created**, exit code 0 (no more unmatched-reference failure). `update` on existing rows still touches only the fields frozen taxonomy has always owned (`projectGroupId`, `runtimePresetSlugs`) — `name`/`description` on pre-existing rows are left untouched, preserving the legacy pipeline's existing ownership of those fields exactly as before. This is additive and reversible, not a rewrite of the sync's behavior.

**Honest scope boundary:** `seed-taxonomy.ts` is not deleted. It remains the only creator of `Sector`/`Service`/`CategoryService`/`InterventionService`/`ServiceAlias` rows, and a (currently unexercised) fallback creator of `Category` rows. Stopping it from writing the now-unread `Service`/`CategoryService`/`InterventionService`/`ServiceAlias` tables was considered but **not done in this phase** — it wasn't the verified blocker (Intervention creation was), and doing it now would be exactly the kind of unrequested, broader change this phase's instructions ruled out. It's flagged in §G as the one remaining, now well-understood, narrowly-scoped opportunity.

---

## E. Validation Results

Full live-database run, all 12 required areas, real writes and reads (not re-derived from code):

| Area | Result |
|---|---|
| Search | `"idraulico"` → 5 results; `"disostruzione scarichi"` → `disostruire-scarichi` top result (new alias, confirmed working) |
| Discovery / Profession Pages | `getProfessionPage("idraulico")` → `projectGroups: ["impianti-idraulici"]` |
| Configuration | Write + read-back round-trip correct |
| Profile | `categories: ["Idraulico"]`, `interventions: ["Ristrutturare bagno"]` |
| Request Creation (Funnel) | `presetSlugs: ["BATHROOM_RENOVATION", "HOME_RENOVATION"]` |
| **Request Detail** | `intervention.services[0].categories` → `impresa-edile (Edilizia)`, sourced via the new frozen path — verified this is the *correct* category for `ristrutturare-bagno` (a renovation intervention, not a plumbing one), not just "a" category |
| Matching + Dispatch | `eligibleCompanyCount: 1`, `dispatchCreatedCount: 1` |
| Notifications | `appNotificationCreatedCount: 1`, `emailDeliveryCreatedCount: 1` |
| Dashboard Visibility | Request visible, `matchLevel: "selected_intervention"` |

No regressions. The Phase 14.5 dashboard-visibility fix and the Phase 15A `CompanyService`-free configuration write both still hold.

---

## F. Final Runtime Consumer Count

Repo-wide search for `CompanyService`, `CategoryService`, `InterventionService`, `RequestRequiredService`, `requestMatchingMode`, `Sector`, and bare `Service`, excluding migrations, docs, comments, and historical reports — every hit individually inspected, not just counted:

**Real runtime consumers: 1.**

- `packages/taxonomy/src/orchestrator/seed-taxonomy.ts` — the legacy seed script itself, still the sole writer of `Sector`/`Service`/`CategoryService`/`InterventionService`/`ServiceAlias`, and a fallback `Category` creator. Its own internal machinery (`build-taxonomy.ts`, `validators.ts`'s `validateTaxonomySource`, `generate-taxonomy.ts`'s legacy generation) is not counted separately — it exists solely to support this one script.

Everything else that matched the search patterns was verified to be one of:
- A false positive from a substring collision (`getCompanyServicesConfigurationPage` containing the literal string `"CompanyService"`; `CategoryServiceGroup` containing `"CategoryService"`; the unrelated `"QUICK_SERVICE"` funnel preset and `apps/web/.../services/catalog.ts`'s own "Service catalog item" error-message text).
- A comment documenting the *absence* of a dependency (several already catalogued in [15A_IMMEDIATE_REMOVALS_REPORT.md](15A_IMMEDIATE_REMOVALS_REPORT.md) §D, re-confirmed unchanged here).
- A legitimate `Category.sector` read — the new, frozen-model-correct usage added in Task 2, which never touches `Service`.

`Sector` itself has exactly one real runtime reader now: `get-request-by-id.ts`'s new `Category.sector` selection (direct relation, no `Service` involved) — everything else matching `Sector` is the legacy pipeline's own internals or historical comments.

---

## G. Remaining Blockers

None of the three originally-named blockers remain. One new, narrow, optional opportunity was surfaced by this phase's own audit and is flagged for a future minimal phase rather than acted on now (per explicit scope limits):

- `seed-taxonomy.ts` still writes `Service`/`CategoryService`/`InterventionService`/`ServiceAlias` rows that, as of this phase, have zero remaining readers anywhere in the codebase. Removing those specific writes (not the script, not `Sector`/`Category` creation) would be a small, well-understood, low-risk follow-up — but it wasn't a verified blocker for this phase and wasn't acted on.

---

## READY_FOR_PHASE_16 = YES

All three named consumers are resolved (two removed outright, one made capable of creating its own data instead of depending on the legacy pipeline). The runtime consumer count for the six originally-audited legacy entities is reduced to its minimum: a single file, which is itself the legacy data's only remaining writer, not a reader of anything. Every change was verified against the live database before and after, with zero search-quality loss and zero functional regression across all 12 validated areas.
