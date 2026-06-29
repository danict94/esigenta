# Search Intelligence V2 — Design Review

Design review only. No code, no implementation, no migration. Builds directly on [SEARCH_INTELLIGENCE_AUDIT.md](SEARCH_INTELLIGENCE_AUDIT.md).

Current model (frozen, not to be touched by this review):

```
Category → ProjectGroup → Intervention
```

`Service` / `Domain` are gone and **must not** be reintroduced in any equivalent form. Every recommendation below is checked against that constraint.

---

## A. Current Weaknesses

1. **No morphology.** Matching is pure substring/prefix on stored strings (Postgres `contains` + a hand-rolled prefix check). Italian plural/singular pairs that don't share a literal substring relationship never connect (`frontalino`/`frontalini`, `grondaia`/`grondaie`, `intonaco`/`intonaci`).
2. **No typo tolerance.** A single transposed or missing letter drops a query to zero results. There is no edit-distance or trigram layer.
3. **Prefix matching is half-built and inconsistently applied.** `tokenMatchesFieldToken` only allows `fieldToken.startsWith(queryToken)` when `queryToken.length >= 4`. This means `fronta` (6 chars) *should* prefix-match `frontalino`, but it fails anyway because the Postgres `contains` filter that selects candidate rows in the first place requires the literal term `fronta` to appear as a substring of `name`/`slug`/alias `value` — and the filter terms passed to Postgres are built from tokens of the *query*, not matched against prefixes of the *field*. The DB layer and the JS scoring layer disagree about what "prefix" means, so prefix matching silently doesn't work end-to-end.
4. **No synonym/intent layer beyond manually curated aliases.** Coverage is whatever someone remembered to type into `InterventionAlias`/`CategoryAlias`. There's no systematic colloquial-to-technical mapping.
5. **Flat per-layer ranking bonus dominates text quality.** `directIntervention: 4000` / `categoryDiscovery: 3000` are large constants added on top of a 0–~1900 text score. A weak partial match in the `directIntervention` layer (e.g. one generic token hit) can still outscore a perfect match in `categoryDiscovery`, and can sit in the visible top-10 alongside a real exact match.
6. **No term-specificity weighting.** Every matched token contributes the same fixed point value regardless of how common that token is across the corpus. A generic noun like `casa` is scored identically to a rare technical term like `frontalino`.
7. **Discovery is now single-path.** `Category → ProjectGroup → Intervention` is the only expansion route. That's the correct taxonomy model, but it means there is no orthogonal "this also relates to…" signal — the kind that `Service`/`Domain` gave for free but at the cost of an unprincipled free-form hub. The model is healthier; the search layer hasn't yet built an equivalent recall mechanism for it.

---

## B. Missing Capabilities

| Capability | Status today | Effort to add |
|---|---|---|
| **Prefix matching** | Partially implemented, broken end-to-end (see A.3) | **LOW** — fixing the DB/JS mismatch is a targeted change to one query-building function, no schema change. |
| **Singular/plural normalization** | Absent | **MEDIUM** — Italian plural rules have real exceptions (`-o/-a → -i/-e`, invariant nouns, etc.); a hand-rolled suffix-stripper will mis-handle enough cases to need a real Italian stemmer/dictionary. |
| **Stemming** | Absent | **MEDIUM** — a proper Italian stemmer (e.g. Snowball-it) is a known, off-the-shelf algorithm; effort is integration + reindexing strategy, not invention. |
| **Lemmatization** | Absent | **HIGH** — requires a lexicon/dictionary and POS-aware processing; meaningfully more machinery than stemming for marginal gain in this domain (short, mostly-noun/verb queries). |
| **Typo tolerance** | Absent | **MEDIUM** — trigram similarity (Postgres `pg_trgm`) is a contained, well-understood addition; true edit-distance ranking is a bit more tuning but still bounded. |
| **Fuzzy matching** | Absent | **MEDIUM** — same mechanism as typo tolerance (`pg_trgm` or similar); not a separate effort line if typo tolerance is built on trigrams. |
| **Synonym expansion** | Manual-only (curated aliases) | **LOW** to extend incrementally, **HIGH** to make systematic (would need a controlled vocabulary / thesaurus structure — see Section D). |
| **Intent recognition** | Crude (action-verb token set stripped from content tokens) | **HIGH** — real intent recognition (distinguishing "ristrutturare casa" the whole-house intent vs "ristrutturare bagno" the room-specific intent vs a generic "casa" mention) needs either a curated intent taxonomy or a model; not a quick win. |
| **Ranking by specificity (IDF-style)** | Absent | **LOW to MEDIUM** — corpus-wide term-frequency weighting can be computed at build time (the catalog is small and changes rarely) and folded into the existing scorer without new infrastructure. |

**Smallest wins, ranked by effort:** fix prefix matching end-to-end, add specificity-weighted scoring, then layer in trigram-based typo tolerance.

---

## C. Recommended Search Architecture

Keep the taxonomy model exactly as-is (`Category → ProjectGroup → Intervention`). Search is a *read-time concern* on top of that model, not a structural layer inside it. Concretely, three independent improvements, each addressable without touching the taxonomy graph:

1. **A normalization/expansion stage at query time** (and mirrored at index/build time for stored strings): strip accents (already done), apply an Italian stemmer to both the query and the indexed text, and generate a small set of *query variants* (original, stemmed, prefix-truncated) rather than relying on one normalized string.
2. **A similarity layer using Postgres trigram indexes (`pg_trgm`)** for typo tolerance and fuzzy matching, run as a fallback tier when exact/stemmed/prefix matching returns too few results — not as the primary signal, to avoid drowning precise queries in noisy near-matches.
3. **A specificity-aware scorer**: precompute, at catalog-build time, how many distinct interventions/categories each token appears in across all names+aliases. Use that as an inverse-frequency discount multiplier in the existing `scoreSearchTexts`-style function, so a token shared across many entries (`casa`) contributes less than a token unique to one or two (`frontalino`).

None of this requires a new entity type. It is a smarter function over the existing `Intervention`/`Category`/`InterventionAlias`/`CategoryAlias` tables.

---

## D. Ranking Model

Ordered hierarchy, most to least confident. Each tier should *dominate* the next only when it actually fires — not via a flat constant large enough to swamp text quality regardless of match strength (today's bug):

1. **Exact Match** — normalized query string equals a name/slug/alias exactly.
2. **Alias Match (exact)** — normalized query equals a curated alias exactly.
3. **Stemmed/Normalized Exact Match** — query and field match after stemming/singular-plural normalization (this is the new tier that closes `grondaia`/`frontalini`-class gaps).
4. **Prefix Match** — query is a genuine prefix of a name/alias token (fixed end-to-end, see B).
5. **Fuzzy/Typo Match** — trigram similarity above a confidence threshold; only considered when higher tiers produced nothing or very few results, and always ranked below any tier 1–4 hit.
6. **Category Match** — query matches a `Category` name/alias directly; expands to its interventions.
7. **ProjectGroup Match** — query matches at the `ProjectGroup` level (if `ProjectGroup` ever carries its own searchable names/aliases) and expands to member interventions.
8. **Related Result** — anything surfaced only through partial/generic-token overlap (today's `casa`-style matches). This tier should exist, but capped low and **always shown separately or visually de-emphasized**, never interleaved above a tier 1–4 result for a different intervention.

Within each tier, order by the specificity-weighted text score from Section C, not by a flat per-tier constant alone. The tier determines the *floor* of the relevance band; the specificity score determines order *within* the band. This directly fixes Example 4: `tinteggiare interni`'s only path in is tier 8 (generic token overlap), so it cannot outrank or sit alongside a tier-1 exact match for `ristrutturare-casa` regardless of point totals.

---

## E. Discovery Model

Discovery (showing *more than the literal query asked for*) and matching (deciding *whether something is relevant at all*) are different concerns and should stay structurally separate:

- **Matching** answers "does this query text relate to this entity's text," using the ranking model above.
- **Discovery** answers "given a matched entity, what else should the user see," using the existing taxonomy edges: a matched `Intervention` can surface sibling interventions in the same `ProjectGroup`; a matched `Category` expands to its `ProjectGroup`s and their `Intervention`s. This is exactly the current `categoryDiscovery` mechanism and should be kept — it is the correct replacement for the old `Service`/`Domain` fan-out, just narrower in scope (by design, since `Service`/`Domain` was an unprincipled hub).

The fix for the over-broad old fan-out is **not** to widen discovery back out — it's to make matching precise enough (Sections C/D) that discovery only activates from genuinely relevant matches, and to keep discovery results visually/scoring-wise distinct (tier 6–8 above) from direct hits.

---

## F. Suggested Roadmap

1. Fix prefix matching end-to-end (DB filter and JS scoring agree on what counts as a prefix).
2. Add specificity-weighted (IDF-style) scoring, computed at catalog build time from the existing frozen taxonomy data — no schema change.
3. Restructure the ranking output into the tiered model in Section D, so tier floor gates ordering before raw score does.
4. Add an Italian stemmer/normalizer pass (query side first, then mirrored into indexed text) to close the plural/singular gap.
5. Add a trigram-based fuzzy/typo fallback tier, gated to only fire when tiers 1–4 are empty or sparse.
6. Revisit synonym/alias coverage systematically (audit every intervention/category for missing colloquial variants) once the above is in place — at that point it's a content/vocabulary exercise, not an engineering one.

This order front-loads LOW-effort, high-impact fixes (1–3) before MEDIUM-effort additions (4–5), and defers the genuinely HIGH-effort, open-ended work (systematic synonym/intent modeling) to last, once the engine itself is no longer the limiting factor.

---

## G. Anti-Patterns To Avoid

- **Do not reintroduce a `Service`/`Domain`-shaped hub** under a new name (`SearchTerm`, `Tag`, `Keyword`) as a way to "fix" discovery breadth. That recreates the exact structure the refoundation removed and reopens the same maintenance/consistency problems it solved.
- **Do not fix ranking by adding more flat constants.** The current bug (Example 4) exists *because* of a flat per-layer bonus; stacking more flat bonuses on top to compensate will create new, harder-to-predict interactions.
- **Do not build a general-purpose lemmatizer/intent model before exhausting LOW/MEDIUM-effort fixes.** Most of the example failures in this review are closed by prefix-matching + stemming + specificity weighting, not by heavyweight NLP.
- **Do not let fuzzy/typo matching run unconditionally.** If it fires on every query at equal weight to exact matches, it reintroduces noise of exactly the kind Example 4 demonstrates, just via a different mechanism.
- **Do not conflate catalog vocabulary gaps with engine bugs.** Some failures are missing data (no `grondaia` alias ever entered), not missing capability — adding stemming will fix `grondaia` (it's a regular-enough pattern for a stemmer to bridge once stemming exists), but other gaps are pure content work no algorithm will solve (e.g. `rifare casa` was never modeled as equivalent to `ristrutturare casa` in either the old or new catalog).

---

## Q3 — Search Engine vs Catalog Vocabulary

| Problem | Classification |
|---|---|
| `frontalini` → nothing | **Mostly ENGINE** (no stemming/plural normalization) once a `frontalino` alias exists; pure vocabulary gap only if no singular form is stored at all either. |
| `fronta` → nothing | **ENGINE** — prefix matching exists in code but is broken end-to-end; this is purely an engine defect, not a missing word. |
| `grondaia` → expected grondaie results | **ENGINE** (singular/plural normalization is a stemming problem, not a missing-word problem — the plural form already exists and is correctly indexed). |
| `ristrutturare casa` → `tinteggiare interni` | **ENGINE** (ranking model: flat layer bonus + no specificity weighting). The *vocabulary* (the alias `imbiancare casa`) is legitimate and should stay; the *engine* mishandles its weight. |

General rule of thumb going forward: if the right word already exists somewhere in the catalog and the query still fails or misranks, it's an ENGINE issue. If the right word (or an equivalent colloquial phrasing) was never entered anywhere in the catalog, it's a CATALOG VOCABULARY issue.

---

## Q4 — Should a dedicated `SearchTerm`/`DiscoveryTerm` layer exist?

**No**, not as a new persisted entity/table, with one narrow exception noted below.

Reasoning: the constraint stated up front is "no equivalent of `Service`/`Domain`." A `SearchTerm`/`DiscoveryTerm` table that maps many terms to many `Intervention`/`Category` rows **is** structurally a `Service`/`Domain` table with a different name — same many-to-many fan-out, same maintenance burden (every new term needs manual linking), same risk of becoming an unprincipled second taxonomy that drifts from `Category → ProjectGroup → Intervention`. Reintroducing it would undo the exact thing the refoundation fixed.

What *should* exist instead, and where it lives:
- **Normalized/stemmed text is a derived index, not a new domain entity.** It can be computed at build time from existing `name`/`slug`/`InterventionAlias.value`/`CategoryAlias.value` fields and stored as a search-only index (e.g. a generated/materialized column or a build-time JSON artifact alongside the existing `generated/frozen/*.json` files) — never as a hand-curated table that someone has to remember to populate per concept.
- **`InterventionAlias`/`CategoryAlias` remain the single place humans add vocabulary.** No second alias mechanism should be introduced; extend coverage of these existing tables rather than building a parallel one.

The one place a *very narrow* new concept could be justified, if synonym coverage becomes unmanageable by hand: a small, explicitly-scoped **lexicon table** (e.g. `verb → verb` or `colloquial-noun → canonical-noun` pairs, with no ownership of/link to specific interventions) that the engine consults as a query-rewrite step before matching — not a relevance hub. The distinction that keeps this from becoming `Service`/`Domain` again: it never stores "this term relates to these interventions"; it only ever stores "this word means roughly the same as that word," and the existing alias/taxonomy matching does the rest. Build this only if Section F step 6 (systematic alias audit) proves insufficient in practice — don't pre-build it speculatively.

---

## Q5 — Preventing `ristrutturare casa` → `tinteggiare interni` without hurting discovery

Three layered changes, all from Sections C/D, working together:

1. **Tier the ranking model** so a match reached only through a single generic content token (`casa`) lands in the lowest tier ("Related Result"), structurally below any tier that contains an exact or near-exact match — regardless of point totals. This alone stops the pollution from appearing *above or beside* the correct result.
2. **Specificity-weight tokens** so `casa` (appearing across many aliases) contributes far less to a match score than a rare token like `frontalino` or `cartongessista`. This reduces how often a generic-token-only match clears any meaningful threshold at all.
3. **Require multi-token queries to hit more than just the generic remainder** before counting as anything above the lowest tier — i.e. a query with an action-verb token (`ristrutturare`) stripped to a single generic content token (`casa`) should not, by itself, be enough to enter tiers 1–6; it should only ever land in "Related Result."

This doesn't hurt discovery: a *bare* query of `casa` alone (no other signal) can still surface "Related Result" candidates exactly as broadly as before — it's specifically the case where a *more specific* query (`ristrutturare casa`) is present that the generic-token match should be demoted, because a more specific signal is available and should win.

---

## Final Answer

**Smallest change with the biggest impact:**
Fix prefix matching end-to-end (the DB filter and the JS scorer currently disagree on what a prefix is) combined with re-tiering the ranking model so generic single-token matches can never outrank or sit beside an exact/near-exact match. Both are pure logic changes over existing data — no schema change, no new tables, no migration — and together they directly resolve three of the four reported examples (`fronta`, and the ranking pollution in `ristrutturare casa`/`tinteggiare interni`), while reducing (not eliminating) the fourth (`frontalini`/`grondaia`) until stemming lands.

**Long-term ideal architecture:**
Keep `Category → ProjectGroup → Intervention` as the single source of taxonomic truth, with search as a layered read-time concern on top of it: (1) a build-time-generated normalization/stemming index over existing name/slug/alias fields, (2) a tiered, specificity-weighted ranking model as in Section D, (3) a trigram-based fuzzy/typo fallback gated to only engage when precise tiers are empty, and (4) `InterventionAlias`/`CategoryAlias` as the only human-curated vocabulary surface, periodically audited for colloquial gaps. No new many-to-many relevance hub is ever introduced — discovery stays anchored to the taxonomy graph, and everything that makes search feel "smarter" is a function over data, not a new structural layer beside it.
