# TAXONOMY REFOUNDATION — PHASE 17: LEGACY TAXONOMY SOURCE DECOMMISSION REPORT

Execution phase. `packages/taxonomy/src/source/**` — the legacy in-memory taxonomy tree left intentionally untouched by Phase 16's safety check — is now completely deleted. Its three real consumers were rewritten to the frozen model, not adapted or wrapped. One consumer (`cartongesso-e-finiture`'s public SEO/catalog presence) had no frozen equivalent at all and was removed outright, per this phase's explicit "no legacy SEO preservation" instruction, rather than forced into a compatibility shape.

---

## A. Consumers Removed

None were removed without replacement — every real consumer's *functionality* survives, rebuilt on frozen data. What's removed is the legacy `taxonomySource` object and the editorial surface for an intervention (`cartongesso-e-finiture`) that no longer exists as a single frozen entity.

## B. Functionality Deleted

- **Public catalog/SEO presence for `cartongesso-e-finiture`** — its `coverage.ts` entry, its `catalog.ts` home-feature tile, its registry entry in `seo/pages/interventi/index.ts`, and its entire SEO landing page directory (`seo/pages/interventi/cartongesso-e-finiture/`) were deleted. This intervention was split into 6 more granular frozen interventions back in Phase 14.5/16 (`realizzare-parete-cartongesso`, `realizzare-controsoffitto`, `realizzare-controparete`, `intonacare-pareti`, `ripristinare-intonaco`, `applicare-stucco-decorativo`) with no 1:1 successor for the combined SEO page's content — so per this phase's explicit instruction not to preserve legacy SEO, the page is gone rather than awkwardly re-pointed. The live `/interventi/[interventoSlug]` build output dropped from 6 to 5 generated pages, confirming the removal. **This deletes one previously-public, indexed URL** (`/interventi/cartongesso-e-finiture`) — flagged here explicitly rather than buried, since it's the one outwardly-visible consequence of this phase.
- A stale reference to `cartongesso-e-finiture` in `search-taxonomy.ts`'s `POPULAR_INTERVENTION_SLUGS` fallback list was replaced with `realizzare-parete-cartongesso` (its closest live successor) rather than left dangling.

## C. Functionality Rewritten

| File | Before | After |
|---|---|---|
| `packages/taxonomy/src/index.ts` | Re-exported `taxonomySource` and the legacy `Taxonomy*` types from `./shared/types` | Re-exports `frozenTaxonomySource` and the `Frozen*` types from `./frozen` instead |
| `packages/taxonomy/src/shared/types.ts` | Defined `TaxonomySector`, `TaxonomyService`, `TaxonomyIntervention`, `TaxonomyCategory`, `TaxonomyServiceGroup`, `TaxonomySource` (all legacy-only) | Those six types deleted — nothing references them anymore. `RuntimePresetSlug`, `TaxonomySearchEntityType`, `TaxonomySearchResult` kept (live consumers: `packages/funnel`, `search-taxonomy.ts`) |
| `apps/web/src/site/services/public-navigation/builders.ts` | `taxonomySource.interventions.map(...)` | `frozenTaxonomySource.projectGroups.flatMap((pg) => pg.interventions).map(...)` |
| `apps/web/src/site/services/public-navigation/validators.ts` | Same pattern, for the `taxonomyInterventionSlugs` coverage guard | Same rewrite |
| `apps/web/src/site/seo/templates/related-funnel-work.tsx` | Same pattern, for "related work" slug→name resolution | Same rewrite; updated its own error message, which used to warn against a `TaxonomyService/Category/Domain` slug — terms that no longer exist |
| `apps/web/src/site/services/public-navigation/coverage.ts` | 26 hand-authored editorial decisions, one (`cartongesso-e-finiture`) stale against frozen | Re-authored against the live frozen intervention set: removed the 1 stale entry, added 7 new entries for the frozen interventions that had none — 6 under the existing `cartongesso-e-pareti` macro area (the most direct successors to the split), 1 (`ripristino-frontalino`) under `opere-murarie` (same `ProjectGroup` as its frozen siblings `fare-opere-murarie`/`fare-massetto`) |

Every rewrite is a 1:1 structural swap — same shape of code, same call sites, different (frozen) data source. No new abstraction, helper, or compatibility layer was introduced anywhere.

## D. Files Deleted

- `packages/taxonomy/src/source/**` — all 18 files (`sectors/index.ts`, 4× `categories/*.ts`, 4× `service-groups/*.ts`, 4× `services/*.ts`, 4× `interventions/*.ts`, `source/index.ts`), the legacy in-memory tree itself.
- `apps/web/src/site/seo/pages/interventi/cartongesso-e-finiture/content.ts` (and its now-empty directory).

## E. Validation Results

`tsc --noEmit` clean across `taxonomy`, `funnel`, `domain`, and both apps. `taxonomy:frozen:generate` and `taxonomy:frozen:build` both ran clean (`Categories: 7, Project groups: 8, Interventions: 32`). `next build` succeeded for both `apps/web` and `apps/admin` — critically, `apps/web`'s build **executes** `assertValidPublicCatalog()` and `validators.selftest.ts` at module-load time (a self-enforcing runtime guard, not just a type check), so the green build is direct proof the re-authored `coverage.ts` is byte-for-byte consistent with the live frozen intervention set, not just type-compatible with it.

## F. Final Dependency Scan

- `packages/taxonomy/src/source/**` exists: **NO** (directory does not exist — confirmed by `Glob`, zero matches).
- Imports of the legacy `taxonomySource` or the deleted source path, repo-wide: **0** (confirmed by repo-wide search; the only remaining `taxonomySource`-shaped string is in `frozen/index.ts`'s own `frozenTaxonomySource` export and 2 comments, both updated to say `frozenTaxonomySource` for accuracy).
- Runtime reads of the deleted tree: **0**.
- Build dependencies on the deleted tree: **0** — `taxonomy:build`/`taxonomy:generate`/`taxonomy:seed` (the scripts that read it) were already deleted in Phase 16; only `taxonomy:frozen:*` scripts remain, and none of them ever touched `src/source`.

---

## LEGACY_TAXONOMY_SOURCE_EXISTS = NO

`packages/taxonomy/src/source/**` no longer exists. Frozen taxonomy (`packages/taxonomy/src/frozen/**`) is the only taxonomy implementation left in the repository — confirmed by a repo-wide search showing zero remaining imports, zero runtime consumers, and zero build dependencies on the deleted tree, and by a green `next build` that runs the public catalog's own self-validating guards against live frozen data.
