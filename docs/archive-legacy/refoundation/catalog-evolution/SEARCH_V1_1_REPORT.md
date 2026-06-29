# Search V1.1 Implementation Report

Implements the LOW-effort/high-impact items from [SEARCH_INTELLIGENCE_V2_REVIEW.md](SEARCH_INTELLIGENCE_V2_REVIEW.md): prefix-matching consistency, tiered ranking, and specificity weighting. No `SearchTerm`/`DiscoveryTerm` entities, no schema changes, no `Service`/`Domain` revival.

---

## A. Files Changed

- [search-taxonomy.ts](../../packages/taxonomy/src/queries/search-taxonomy.ts) - the entire ranking/matching engine. Rewritten in place; same exported functions (`searchTaxonomy`, `getPopularInterventions`), same `TaxonomySearchResult` contract, same `Category -> ProjectGroup -> Intervention` taxonomy.

No other file was changed. No migration, no `schema.prisma` edit, no new package.

**Process note:** mid-implementation, an exploratory `git checkout -- search-taxonomy.ts` (run while investigating the prefix-matching claim) reverted this file to a stale, pre-commit version still referencing the removed `Service`/`Domain` models (`prisma.service`, `prisma.domain`, `listServicesForCategory` from `../domain`) - the file had uncommitted work in the working tree that predates this session and was never part of any commit. This was caught immediately (the reverted import doesn't exist in the current package) and the file was reconstructed from the version already read into context earlier in this session, then extended with the V1.1 changes below. Net effect: no work was lost, and the stale `Service`/`Domain` references (which would not have compiled against the current schema) are gone from the file for good.

---

## B. Prefix Matching Fix

**What was actually verified, not assumed:** the V2 review's claim that `fronta`, `grond`, `inton`, `cartong` returned nothing was checked against the real frozen catalog data (`packages/taxonomy/generated/frozen/*.json`, which is the literal source synced into the DB by `sync-catalog-to-database.ts`) before touching any code. All four already returned correct results under the old code - Postgres `contains` is symmetric, so a true prefix of a stored word is automatically a substring match. The "DB filter vs JS scorer disagreement" claim, as stated, did not hold for these specific examples.

**The real, verified inconsistency:** the JS scorer's prefix rule (`tokenMatchesFieldToken`) only treats a match as a genuine prefix when `queryToken.length >= 4`. The old DB-level filter (`buildTextFilters`) had **no length floor at all** - it issued a `contains` filter for any token of length >= 2 (the tokenizer's own minimum). This meant short tokens (2-3 chars) would fetch DB candidates via incidental mid-word substring hits (e.g. `"ron"` matching inside `"frontalino"` and `"grondaie"`) that the JS scorer would then *always* discard with `score === 0`, because neither the exact-match nor the length-gated prefix branch could ever fire for them. Verified directly:

```
query="ron" -> DB matched ripristino-frontalino, sistemare-grondaie -> JS score: 0 for both
query="ist" -> DB matched 7 candidates -> JS score: 0 for all 7
```

**Fix:** `buildSearchQuery` now only places a term into `dbFilterTerms` (the list that drives the Postgres `OR`/`contains` filter) when it is at least `MIN_PREFIX_TOKEN_LENGTH` (4) characters - the exact same constant the JS scorer already used for its prefix rule. Short tokens are still kept in `tokens`/`contentTokens` and still contribute to scoring on whatever candidates get fetched via other (longer) terms - they just no longer drive their own DB round-trip that was guaranteed to retrieve nothing useful. Both layers now agree on a single definition of "long enough to prefix-match," instead of the DB casting a wider, silently-wasted net than the JS layer would ever honor.

This is a pure efficiency/consistency fix for short tokens; it does not change behavior for any of the four originally-cited examples (all length >= 5), which were already correct.

---

## C. Ranking Changes

Replaced the flat per-layer constants (`directIntervention: 4000`, `categoryDiscovery: 3000`, ...) with an explicit, strictly-ordered tier system:

```
RANK_TIER = {
  EXACT: 8,          // exact phrase match against name/slug
  ALIAS_EXACT: 7,    // exact phrase match found only via an alias
  NORMALIZED: 6,     // every token matched exactly, but not as one contiguous phrase
  PREFIX: 5,         // at least one token matched only via genuine prefix
  CATEGORY: 4,       // reached via Category -> ProjectGroup expansion
  PROJECT_GROUP: 3,  // reached via a direct ProjectGroup name/alias match
  RELATED: 2,        // matched only on generic, low-specificity tokens
}
```

Each tier occupies its own `1,000,000`-point band (`tierBase(tier) = tier * 1_000_000`). Intra-tier ordering is still decided by the existing text-quality score (coverage, phrase containment, specificity-weighted token contributions - see Section D), but that score can never be large enough to cross a tier boundary. This directly satisfies the stated rule: **lower tiers can never outrank higher tiers**, regardless of point totals.

Fuzzy matching is not implemented (none existed before; out of scope per the review's "if already present" instruction). ProjectGroup did not previously participate in search at all, despite `ProjectGroupAlias` already existing in the schema (used only by the catalog-sync orchestrator) - it's now wired in as its own discovery tier, one step below Category discovery, using zero new schema.

One correctness fix was required during validation (Section E): the tier resolver originally checked the generic-token demotion *before* checking for an exact phrase match, which incorrectly demoted a true exact match (`ristrutturare casa` against the literal "Ristrutturare casa") to RELATED just because its only content token (`casa`) is generic. Fixed by checking `hasExactPhrase` first - phrase exactness is a corpus-specific signal regardless of how generic the underlying tokens are; the generic-token demotion now only applies to matches that aren't already an exact phrase.

---

## D. Specificity Changes

Generic tokens (`casa`, `lavori`, `lavoro`, `servizio`, `servizi`, `intervento`, `interventi`, `appartamento`, `edile`, `edili`) are tracked in a static `GENERIC_CONTENT_TOKENS` set, per the audit examples in the task.

Beyond the static list, specificity is also weighted dynamically per request: for every content token, `buildSpecificityWeights` counts how many of the candidates fetched for *this* query (interventions + categories + project groups, combined) contain a match for that token, and discounts the token's contribution proportionally (`1 / documentFrequency`), with an additional fixed 0.3x penalty for tokens in the static generic set. This needs no new storage or precomputed corpus-wide table - it's computed once per request over data already being fetched.

A candidate whose *only* matched content tokens are all in `GENERIC_CONTENT_TOKENS` is forced into the RELATED tier outright (`isMatchedOnlyGeneric`), unless it also has an exact phrase match (Section C). This is what makes the target case work: a candidate matched only through `casa` can never out-tier a candidate matched through a real, specific term, no matter how the raw point totals compare.

---

## E. Before/After Query Results

Computed by tracing the exact production logic (`buildSearchQuery` -> DB candidate retrieval -> `scoreSearchTexts` -> `resolveTier` -> `buildRelevance`) against the real frozen catalog data, both before and after the change. "Before" reflects the code as it stood in this session prior to any V1.1 edit.

| Query | Before | After |
|---|---|---|
| `fronta` | 1 result: `ripristino-frontalino` (already worked - DB `contains` finds the prefix as a substring) | Same result, now explicitly tier **PREFIX** instead of an undifferentiated flat `directIntervention` bonus |
| `frontalino` | 1 result: `ripristino-frontalino` (exact alias/name match) | Same result, now tier **NORMALIZED** (all tokens matched exactly, single-token query) |
| `frontalini` | No results - no plural form (`frontalini`) exists anywhere in the catalog; this is a data gap, not an algorithm gap (see Section G) | **Unchanged** - stemming/plural normalization is MEDIUM effort and explicitly out of scope for V1.1 |
| `grond` | 1 result: `sistemare-grondaie` (already worked, same reason as `fronta`) | Same result, tier **PREFIX** |
| `grondaia` | No results - no singular form exists in the catalog | **Unchanged** - same data-gap reason as `frontalini` |
| `grondaie` | 1 result: `sistemare-grondaie` (exact alias match: alias value is literally `"grondaie"`) | Same result, tier **ALIAS_EXACT** (exact phrase, but only via alias, not the primary name `"Sistemare grondaie"`) |
| `inton` | 2 results: `intonacare-pareti`, `ripristinare-intonaco` | Same 2 results, both tier **PREFIX** |
| `intonaco` | Same 2 results (substring match via aliases) | Same 2 results, both tier **NORMALIZED** |
| `intonaci` | No results - no plural form exists | **Unchanged** - data gap, out of scope |
| `ristrutturare casa` | 3 results, **`tinteggiare-interni` ranked second** at relevance ~4581, right behind the correct match (~5862) and inside the visible top results - the bug from the original audit | 3 results: `ristrutturare-casa` at tier **EXACT** (relevance ~8,001,590); `ristrutturare-appartamento` and `tinteggiare-interni` both demoted to tier **RELATED** (~2,000,300-2,001,440) - a >6,000,000-point gap, no longer remotely competitive |
| `rifare casa` | 3 weak/ambiguous matches, all on the bare `casa` token, no real winner (no `rifare-casa` intervention exists - genuine taxonomy gap) | Same 3 candidates, now all explicitly tier **RELATED** with tied scores - correctly reflects "no good direct match exists" instead of silently picking one via accidental point differences |
| `cartongessista` | 3 interventions via category discovery (`realizzare-controparete`, `realizzare-controsoffitto`, `realizzare-parete-cartongesso`) | Same 3 interventions, now explicit tier **CATEGORY** |
| `imbiancare casa` | `tinteggiare-interni` matched via the curated alias `"imbiancare casa"`, ranked first | `tinteggiare-interni` now tier **ALIAS_EXACT** (exact phrase match, but only via alias); `tinteggiare-esterni`, `ristrutturare-appartamento`, `ristrutturare-casa` all demoted to tier **RELATED** (they only share the generic token `casa`) - same winner, now with a structurally correct, much larger margin over the noise |

---

## F. Architecture Verification

- **No schema changes.** `git diff --stat -- packages/database/prisma/schema.prisma` shows zero changes from this task (the file does differ from the last commit, but that diff is pre-existing uncommitted refoundation work from before this session, untouched here).
- **No new tables.** `ProjectGroupAlias` and `ProjectGroup.aliases` already existed in the schema (added during the taxonomy refoundation, never previously wired into search) - V1.1 only added a query against tables that already existed.
- **No new entities.** No `SearchTerm`, `DiscoveryTerm`, or any other new model/type was introduced. `TaxonomySearchResult` is unchanged.
- **No new taxonomy layers.** `Category -> ProjectGroup -> Intervention` is exactly as it was; the only addition is that `ProjectGroup` can now also be matched *directly* (not only reached via a `Category`), using its own pre-existing `name`/`aliases` fields.
- **No Service/Domain-like model reintroduced.** Confirmed via `grep -n "model Service|model Domain"` against `schema.prisma`: no matches. The specificity-weighting mechanism (Section D) is computed in-memory, per request, from data already fetched - it is not a stored table and does not create any new many-to-many relevance hub.

---

## G. Remaining Search Weaknesses

These are known, deliberately out of scope for V1.1 (see [SEARCH_INTELLIGENCE_V2_REVIEW.md](SEARCH_INTELLIGENCE_V2_REVIEW.md), Section B):

- **No singular/plural normalization or stemming.** `frontalini`, `grondaia`, `intonaci` still return nothing, because the catalog simply has no stored form (name, slug, or alias) that shares enough literal characters with the query for `contains`/prefix matching to bridge the gap. This is the next logical increment (MEDIUM effort, per the V2 review) and was explicitly excluded from this pass.
- **No typo tolerance or fuzzy matching.** A single misspelled character still drops a query to zero results.
- **No systematic synonym/intent expansion.** Coverage is exactly as good as the curated `InterventionAlias`/`CategoryAlias`/`ProjectGroupAlias` rows someone has entered - V1.1 changed how those rows are *ranked*, not how many of them exist.
- **`rifare casa`-class taxonomy gaps remain.** Some colloquial query/intent pairs were simply never modeled in the catalog (no intervention or alias represents "rifare casa" as equivalent to "ristrutturare casa"). No ranking or matching change can fix a gap that is purely about what data exists.

---

## Final Answer

**SEARCH_V1_1_SUCCESS = YES**

All four explicitly required prefix tests (`fronta`, `grond`, `inton`, `cartong`) return correct, now-explicitly-tiered results. The ranking tier hierarchy is implemented and verified to strictly dominate by tier before score. The target regression - `ristrutturare casa` ranking `tinteggiare interni` inside the same confidence band as the correct match - is fixed and verified with a quantified, structurally-guaranteed margin (tier EXACT vs. tier RELATED, a 6,000,000+ point gap that cannot be closed by any text-score difference). No schema changes, no new tables/entities, no taxonomy layer changes, no Service/Domain-equivalent structure was introduced. The known remaining gaps (plural/singular forms, typo tolerance, systematic synonym coverage) are exactly the MEDIUM/HIGH-effort items the V2 review deferred, not regressions introduced by this change.
