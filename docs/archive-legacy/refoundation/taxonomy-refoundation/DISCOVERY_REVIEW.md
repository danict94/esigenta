# TAXONOMY REFOUNDATION — DISCOVERY REVIEW

Architecture review only. No code, schema, or data changes were made. Scope is strictly search/SEO/discovery/navigation — matching, dispatch, and notifications (already correctly Intervention-only, per Phases 10–12) are not touched or reconsidered here.

Grounded in the actual current state, re-read for this review: `packages/taxonomy/src/frozen/source/types/{category,project-group,intervention}.ts`, the live database after Phase 8.5 (8 `ProjectGroup`s, 7 `Category`s with `defaultProjectGroupIds` populated, 26 `Intervention`s all assigned), the still-untouched legacy `search-taxonomy.ts`/`list-services-for-category.ts` (Phase 14 hasn't run yet), and `apps/web/src/site/services/public-navigation/{macro-areas,coverage,types}.ts`.

---

## A. Current Frozen Model Assessment

The frozen model (`Category → defaultProjectGroups`, `ProjectGroup → Intervention`, `Alias`) is structurally sound for matching — proven across Phases 10–13. For discovery specifically, it has exactly the shape the review questions assume:

- `FrozenCategory`: `id, slug, name, description?, defaultProjectGroups: string[]` — **no alias field**.
- `FrozenProjectGroup`: `id, slug, name, description?, interventions: FrozenIntervention[]` — already explicitly documented in code as existing for "catalog organization, public navigation, SEO hubs, discovery, analytics and reporting" — **no alias field**.
- `FrozenIntervention`: `id, slug, name, description?, runtimePresetSlugs?, aliases?` — the only entity with alias support today.

`defaultProjectGroups` is explicitly documented (both in `docs/taxonomy.md` and in the type itself) as *"NOT permissions, NOT compatibility rules, NOT matching rules, NOT authorization rules"* — it was designed for one purpose: onboarding bootstrap. The review's premise — that the model removed `Category → Intervention` and now needs *some* discovery path back to interventions — is correct, and `Category → ProjectGroup → Intervention` is the only structural path available, since `ProjectGroup → Intervention` is a real, already-existing, non-duplicated relation (in the live DB: `Intervention.projectGroupId`).

---

## B. Discovery Capabilities Lost

1. **Category-to-intervention search expansion** — confirmed still *structurally possible* via `ProjectGroup` (§F), but the **mechanism** that used to provide it (`Category.services[]` → `Service` → `Intervention`) is gone, and nothing has replaced it yet in the actual search code (`search-taxonomy.ts` still does the old Category→Service→Intervention walk — Phase 14 hasn't run).
2. **Category-level alias/synonym matching** — the legacy `Category` model has a `CategoryAlias` table (still in the live schema, unused by anything frozen). The frozen `FrozenCategory` type never gained an equivalent. Today, searching "pittore" or "tinteggiatore" would not surface the `Imbianchino` category at all under the frozen model's data shape, even though `CategoryAlias` rows could theoretically still be written — there's just no frozen-model concept that would populate or read them for this purpose.
3. **ProjectGroup-level alias/synonym matching** — never existed even in the legacy model (`ServiceGroup`, its closest analog, also had no alias field) — not a regression, but worth fixing now since `ProjectGroup` is explicitly meant to be SEO/discovery-facing.

---

## C. Discovery Capabilities Preserved

1. **Intervention-level search is untouched and fully intact** — `Intervention.aliases` exists, is populated (26/26 interventions, several with 2–3 aliases each per Phase 8.5), and was never part of the Category↔Intervention link that got removed.
2. **`ProjectGroup → Intervention` is a real, complete, non-duplicated relation** — every live Intervention has exactly one `projectGroupId` (Phase 8.5, verified 0 NULLs). This is structurally *better* for discovery than the legacy model's `Category → Service → Intervention` (two hops, many-to-many at each step) — it's one hop, one-to-many, no junction table.
3. **`Category → defaultProjectGroups` already encodes almost exactly the lookup the review is asking for** — it just was never *read* for discovery purposes, only for onboarding bootstrap. The data dependency is already there; only the consumer is missing.

---

## D. Recommended Improvements

**1. Answering Review Question 1 — yes, but as a second, separate field, not a repurposing of `defaultProjectGroups`.**

Recommend adding `FrozenCategory.primaryProjectGroups: string[]` (the review's own suggested name) as a distinct field from `defaultProjectGroups`, even though both are `string[]` of `ProjectGroup` slugs and will likely start out identical in practice. Reasoning: `defaultProjectGroups` carries a hard-won guarantee from `docs/taxonomy.md` — "never authorization, never compatibility, never matching" — and its only consumer is onboarding bootstrap. `primaryProjectGroups` would carry a different, equally narrow guarantee — "never matching, only search/SEO/discovery expansion" — and its only consumers would be search and profession-page generation. Conflating them into one field means a future edit to fix an onboarding default could silently break an SEO page, or vice versa. Two fields, same mechanism, different editorial intent and different consumers — not a new relationship type, not a compatibility matrix, just a second labeled list reusing the exact pattern already proven safe.

**2. Converge the two competing "navigation grouping" layers — a finding beyond the five review questions, surfaced because it's squarely in scope (navigation/SEO) and is already causing drift.**

`apps/web/src/site/services/public-navigation/macro-areas.ts` defines 8 hand-maintained "macro areas" (`ristrutturazioni`, `cartongesso-e-pareti`, `imbianchini-e-finiture`, `opere-murarie`, `tetti-e-facciate`, `impianti-elettrici`, `idraulica`, `clima-ed-energia`), with membership assigned per-intervention via `coverage.ts`'s `macroAreaSlug` field — entirely independent of the taxonomy package's real `ProjectGroup`. **These have already diverged, concretely, not hypothetically**: the frozen `ProjectGroup` named `finiture` (cartongesso + tinteggiatura together, from Phase 8.5) corresponds to *two separate* macro areas here (`cartongesso-e-pareti` and `imbianchini-e-finiture`), and `tetti` (frozen) vs. `tetti-e-facciate` (macro area) are similarly not the same grouping. `ProjectGroup` is explicitly documented as existing for exactly this purpose ("public navigation, SEO hubs") — having a second, hand-maintained, independently-drifting grouping doing the same job is the kind of duplication this whole migration set out to eliminate, just relocated to the web layer instead of the database layer. **Recommend, as a future (not this review's) phase: retire `publicServiceMacroAreas`/`coverage.ts`'s `macroAreaSlug`, and drive macro-area-style navigation directly from `ProjectGroup`.** Not actioned here — flagged for scoping, consistent with this review's "do not redesign" boundary.

**3. Add aliases to `Category` and `ProjectGroup`**, closing the gap in §B/§E.

---

## E. Changes Required To Taxonomy (if any)

Additive only, mirroring `Intervention.aliases`'s already-proven shape — no new relationship kind, no Category↔Intervention link, no compatibility matrix:

| Field | Type | Purpose | Read by |
|---|---|---|---|
| `FrozenCategory.primaryProjectGroups` | `string[]` (ProjectGroup slugs) | Search expansion + profession-page generation (Q2, Q3) | Search, SEO/profession-page generation — **never** matching, dispatch, notification, or company configuration |
| `FrozenCategory.aliases` | `string[]?` | Profession-name synonyms (e.g. "pittore", "tinteggiatore" → Imbianchino) — closes the gap in §B.2 | Search only |
| `FrozenProjectGroup.aliases` | `string[]?` | ProjectGroup-level SEO hub synonym matching — closes the gap in §B.3 | Search, SEO hub pages |

No change to `Intervention`, no change to the matching path, no change to `CompanyIntervention`/`Request.interventionId`. These three fields are pure additions to the existing `FrozenCategory`/`FrozenProjectGroup` types, validated by the same alias-collision/global-uniqueness checks already in `packages/taxonomy/src/frozen/shared/validators.ts` (which already validates `Intervention.aliases` this way — extending the same function to also walk `Category.aliases`/`ProjectGroup.aliases` is a small, mechanical change, not a new validation concept).

---

## F. Impact On Search

**Answering Review Question 2 — yes, structurally proven, not just asserted.** The replacement expansion path for what `search-taxonomy.ts` currently does via `listServicesForCategory` (Category → `CategoryService` → Service → `InterventionService` → Intervention) is:

```
matched Category (by name/alias)
  → Category.primaryProjectGroups (string[] of ProjectGroup slugs, O(1) read)
    → for each ProjectGroup slug: ProjectGroup.interventions[] (already a direct, real relation — no join table)
      → flatten + dedupe → Intervention search results
```

One hop shorter than today's legacy path (which goes through both `Service` and a junction table), and zero duplication: `Intervention` definitions live exactly once, nested under their owning `ProjectGroup` in the frozen source tree, referenced by slug from `Category`, never copied onto it.

**Answering Review Question 4** — "imbianchino", "elettricista", "idraulico" all resolve through the identical mechanism above once `Category.aliases` exists (§E): direct `Category` name/alias match → `primaryProjectGroups` expansion → `Intervention` results. No Category↔Intervention duplication anywhere — the only stored relationship is `Category → ProjectGroup` (already existed) and `ProjectGroup → Intervention` (already existed); search just gets a new, additive *consumer* of data that already exists, not a new data relationship.

This is **explicitly out of scope to implement here** (this review is design-only, per its own instructions) — Phase 14 (Search Cutover, already on the roadmap, not yet executed) is where `search-taxonomy.ts` would actually be rewritten to this shape.

---

## G. Impact On SEO

**Answering Review Question 3** — profession pages (`/professionisti/imbianchino`) can be generated with zero intervention-definition duplication, using the identical `Category → primaryProjectGroups → ProjectGroup.interventions` walk from §F. The page becomes a pure read/render of already-existing data: Category's own name/description for the page header, then one section per `primaryProjectGroups` entry rendering that `ProjectGroup`'s `interventions[]` (names/descriptions/aliases already defined once, under the `ProjectGroup`).

Net SEO impact of the frozen model, once §E's additions land: **neutral to positive**, not regressive. Today's legacy SEO surface (`apps/web/src/site/seo/pages/interventi/*`) is already Intervention-keyed and was already confirmed aligned with the frozen model in earlier audits ([05_LEGACY_DEPENDENCY_MAP.md](05_LEGACY_DEPENDENCY_MAP.md) §H) — the only genuinely new SEO surface this review's questions introduce is the profession page (`/professionisti/:categorySlug`), which doesn't exist in the legacy model's audited surface at all; it's a net-new capability the frozen model makes cheap to build, not a capability being clawed back from a regression.

---

## H. Impact On Navigation

Two distinct findings:

1. **Within the taxonomy package itself, navigation is fine** — `ProjectGroup` already supports rendering a flat list of its `Intervention`s for any navigation surface that wants to iterate it directly (this is exactly what Phase 9's company-configuration UI already does — `ProjectGroup`-grouped, "select all" — proving the rendering pattern works in production code today, just for a different consumer than public navigation).
2. **Across the web layer, navigation is currently duplicated, not regressed** — per §D.2, `publicServiceMacroAreas` is a second, independently-maintained grouping mechanism that predates this migration and was never unified with the taxonomy package's `ProjectGroup`, even though they serve the identical conceptual purpose and have already drifted apart in their actual groupings. This isn't something the taxonomy refoundation broke — it's a pre-existing parallel structure that the refoundation now makes *redundant in principle*, since `ProjectGroup` is the taxonomy-correct home for this data. Recommended for a future scoping decision (§D.2), not fixed in this review.

---

## Summary

No part of the frozen model needs to be redesigned to support search/SEO/discovery/navigation. The three additive fields in §E, plus the convergence opportunity in §D.2 (flagged, not actioned), are sufficient to fully answer all five review questions without reintroducing `Category ↔ Intervention`, without a compatibility matrix, and without `ProjectGroup` or `Category` ever becoming a matching-relevant entity. Matching, dispatch, and notifications remain exactly as Phases 10–13 left them.
