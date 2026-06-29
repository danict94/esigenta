# Search Intelligence Audit

Scope: why search feels less intelligent after the taxonomy refoundation. Audit only — no fixes applied.

Code read:
- Current engine: [search-taxonomy.ts](../../packages/taxonomy/src/queries/search-taxonomy.ts)
- Current route: [route.ts](../../apps/web/src/app/api/taxonomy/search/route.ts)
- Current UI: [search-bar.tsx](../../apps/web/src/site/home/search-bar.tsx)
- Current data: `packages/taxonomy/generated/frozen/{interventions,categories,aliases}.generated.json`
- Old engine (pre-refoundation, commit `91673f5`): `packages/db/src/search-taxonomy.ts`
- Old catalog snapshot: [16_pre_drop_backup.json](../taxonomy-refoundation/16_pre_drop_backup.json) (31 `Service` rows, `serviceAliases: 0`)

---

## TASK 1 — Old vs current code paths

**Old (`91673f5`, pre-"Improve search relevance" commit):**
- `normalize()` = trim + lowercase only. No tokenization, no stopwords, no scoring.
- A single `contains` filter per entity (`Intervention`, `Category`, `Service`, `Domain`) plus their alias tables — **4 entity types, 4 alias tables**, run in parallel.
- Flat hardcoded relevance per layer: intervention=100, category-discovery intervention=80, category=50, service-discovery intervention=70, domain-discovery intervention=60. No text-quality signal at all — a match is a match.
- `Service` and `Domain` were independent many-to-many hubs: one `Service` (e.g. "Grondaie", "Massetti", "Tramezzi") could fan out to interventions across categories that had nothing else in common, and `Service`/`Domain` names used **plural/colloquial nouns** as their canonical name (`Grondaie`, not `Sistemare grondaie`).

**Current (`search-taxonomy.ts`, this branch):**
- Full normalization (NFD strip accents, lowercase, punctuation strip) + tokenization + Italian stopword removal + an "action verb" token set (`ristrutturare`, `rifare`, `installare`, …) split out as non-content tokens.
- Only **2 entity types** remain: `Intervention`, `Category` (+ `InterventionAlias`, `CategoryAlias`). `Service` and `Domain` models are gone from `schema.prisma` entirely — confirmed, no `model Service`/`model Domain` left.
- Category discovery is now `Category → ProjectGroup → Intervention` (structural taxonomy), replacing the old `Service`/`Domain` free-form hub-and-spoke fan-out.
- A real scoring function (`scoreSearchTexts`) with coverage/phrase/first-token components, layered on top of a `directIntervention` (4000) vs `categoryDiscovery` (3000) base.

So the matching *algorithm* objectively got more sophisticated (tokenizing, stopwords, scoring) — but two structural things were lost or never carried over, and that's the actual source of the "less intelligent" feeling:

1. **Discovery breadth**: `Service`/`Domain` fan-out is gone, not replaced 1:1. Category discovery only reaches interventions inside the same `ProjectGroup` — narrower than the old free-form `Service`→many-interventions links.
2. **Naming convention flip**: old canonical names were plural/colloquial nouns (`Grondaie`, `Massetti`, `Tinteggiatura interni`); new canonical names are verb-infinitive phrasings (`Sistemare grondaie`, `Fare massetto`, `Tinteggiare interni`). Since matching is still pure substring/prefix (see Task 2), this directly changes which literal user input lines up with which literal catalog string — independent of the scoring upgrade.

---

## TASK 2 — Missing capabilities

| Capability | Old | Current | Notes |
|---|---|---|---|
| Singular/plural normalization | ❌ absent | ❌ absent | Neither version stems. `tokenMatchesFieldToken` only allows a *prefix* match (`queryToken.length >= 4 && fieldToken.startsWith(queryToken)`), which only catches plural→singular when the plural is the longer string starting with the singular (e.g. `frontalino`→`frontalini` would work in that direction), not the reverse, and not for irregular Italian plurals (`grondaia`/`grondaie`, `intonaco`/`intonaci`) where stem mutates. |
| Stemming | ❌ | ❌ | No stemmer (e.g. Snowball-it) in either version. |
| Lemmatization | ❌ | ❌ | Not present. |
| Fuzzy matching / typo tolerance | ❌ | ❌ | Both rely on Postgres `contains`/`startsWith`-style substring checks via Prisma. No edit-distance, no trigram, no `pg_trgm`. |
| Synonym expansion | Implicit via `Service`/`Domain` aliasing across hubs + zero explicit `ServiceAlias` rows (table existed, was empty) | Explicit via `InterventionAlias`/`CategoryAlias` (108 rows total) | Current is actually **richer** here — it has curated alias rows old search never had (`serviceAliases: 0` in the pre-drop backup). The regression is not synonym *capability*, it's synonym *coverage* (see Task 3). |
| Intent expansion (verb→noun, colloquial→technical) | Partial, accidental: catalog names were already colloquial nouns | Deliberate but narrow: a handful of curated aliases (`imbiancare casa`, `pittore`, `tinteggiatore`) | Current depends entirely on someone manually anticipating each colloquial phrasing per intervention; old got broad colloquial coverage "for free" because the canonical names themselves were colloquial. |
| Ranking signal | Flat per-layer constant only | Token coverage + phrase match + per-term weighting | Objectively improved in sophistication, but introduces a new failure mode (Task 4) because it has no term-specificity (IDF) weighting. |

---

## TASK 3 — Per-query failure analysis (WHY, not how to fix)

**`frontalini`** — FAILS (no results).
WHY: `frontalino`/`frontalini` is a **new concept added during the refoundation** — it did not exist in the old 31-service catalog at all (verified against the pre-drop backup), so this isn't a regression in the literal sense. But within the *current* data, the only stored singular form is `frontalino` (name "Ripristino frontalino", aliases "rifacimento frontalino", "ripristinare frontalino"). The query token `frontalini` (10 chars) vs field token `frontalino` (10 chars): `tokenMatchesFieldToken` requires `fieldToken.startsWith(queryToken)` — same length, different last letter, no match either direction. The Postgres `contains` filter at the DB layer also requires literal substring containment, which fails first. → **DATA ISSUE** (missing plural alias) compounded by **SEARCH ISSUE** (no stemming/morphology to bridge it).

**`frontalino`** — SUCCEEDS.
WHY: literal substring match against the stored singular name/alias. Works only because the query happens to match the one stored surface form exactly.

**`grondaie`** — SUCCEEDS.
WHY: `grondaie` (plural) is the intervention's canonical name surface ("Sistemare grondaie") and is also a standalone alias (`"value": "grondaie"`). Direct substring hit.

**`grondaia`** — FAILS.
WHY: the singular form does not exist anywhere in the dataset — not in old data either (old canonical name was also the plural "Grondaie", and old search had zero algorithmic stemming, only whole-string `contains`). Same root cause as `frontalini`: no morphology, no singular alias row. **DATA ISSUE + SEARCH ISSUE**, not a regression — old search would have failed this exact query too.

**`intonaci`** — FAILS.
WHY: no intervention/alias contains the plural `intonaci` anywhere. There is also no `intonaco`/`intonaci` `Service` in the old catalog at all (this concept is new post-refoundation), so there's no "old behavior" to regress from. **DATA ISSUE** (incomplete alias set for a newly introduced concept).

**`intonaco`** — SUCCEEDS (partially, ambiguously).
WHY: substring `intonaco` appears in aliases of *two different* interventions — `intonacare-pareti` ("intonaco esterno", "intonaco interno") and `ripristinare-intonaco` ("rifacimento intonaco", "riparazione intonaco"). Both surface, which is a legitimate result (one is "apply fresh plaster", the other is "patch/repair plaster") but their relative ranking is decided only by token-coverage math, not by which is more likely the user's intent — see Task 4 pattern.

**`ristrutturare casa`** — SUCCEEDS, with pollution (see Task 4).
WHY: exact phrase match against intervention "Ristrutturare casa" gets the top score, but a second, generically-matched intervention also surfaces — explained below.

**`rifare casa`** — FAILS (no good direct hit; at best loosely matches via `casa`).
WHY: there is no `rifare-casa` intervention in either the old or current catalog — "rifare" is reserved for object-specific verbs (`rifare-tetto`, `rifare-impianto-elettrico`), never combined with the generic noun `casa`. This is a genuine **TAXONOMY ISSUE**: the catalog never modeled the colloquial "rifare casa" ≈ "ristrutturare casa" equivalence, in either version. The only thing that can match is the bare token `casa`, which (per Task 4) drags in unrelated interventions.

**`cartongessista`** — SUCCEEDS.
WHY: it is a `Category` name verbatim (`"name": "Cartongessista"`). Direct exact match, unaffected by the refoundation (categories were not restructured the way services/domains were).

**`imbiancare casa`** — SUCCEEDS, and is actually *better* than old.
WHY: `imbiancare casa` is a deliberately curated alias on `tinteggiare-interni`. Old search had **zero** colloquial coverage for "imbiancare" (old catalog only ever said "Tinteggiatura interni/esterni", and `serviceAliases` was empty in production). This is a case where the refoundation added real intelligence — but it also created the side effect documented next.

---

## TASK 4 — Surprising ranking: `ristrutturare casa` → `tinteggiare interni`

Trace through `buildSearchQuery("ristrutturare casa")`:
- tokens = `["ristrutturare", "casa"]`
- `ristrutturare` is in `ITALIAN_SEARCH_ACTION_TOKENS`, so `contentTokens = ["casa"]` only.
- `terms` (used for the Postgres `contains` OR-filter) = `["ristrutturare casa", "ristrutturare", "casa"]` — note `casa` is included **on its own**, as an independent filter term.

The DB-level filter therefore matches *any* alias/name containing the bare word `casa`, including `tinteggiare-interni`'s alias `"imbiancare casa"`. That pulls `tinteggiare-interni` into the `directInterventions` candidate set via `interventionAliasIds`.

Then `scoreSearchTexts` runs on `tinteggiare-interni`'s text (name + aliases including `imbiancare casa`, `imbiancare facciata`, `imbiancare appartamento`):
- `casa` matches exactly (1 of 2 tokens) → `matchedTokenCount = 1`, `contentTokens` match count = 1 (non-zero, so it clears the zero-score guard that would otherwise have blocked a "ristrutturare"-only-no-content-match case).
- `coverageScore` = round(1/2 × 400) = 200 (not full 900, since only 1 of 2 tokens hit).
- no phrase match (0).
- `firstContentTokenScore` = 180 (the lone content token `casa` matched).
- final text score ≈ 200 + 180 + 120 (content-token bonus) + 80 (token-count bonus) = **580**.
- relevance = `directIntervention` base (**4000**) + 580 = **~4581**.

Compare to the correct match `ristrutturare-casa`: exact phrase + both tokens hit → text score ≈ 1860 → relevance ≈ 5862. So the correct intervention *does* outrank `tinteggiare-interni` — but `tinteggiare-interni` still lands at ~4581, comfortably inside the visible top-10 and above the entire `categoryDiscovery` tier (3000 base). The single generic token `casa` is enough, on its own, to earn the full 4000-point `directIntervention` layer bonus, because the layer bonus is flat and is not discounted by how weak or partial the match was.

WHY it ranks: **no term-specificity weighting (no IDF/TF-IDF-style discount)**. The scorer treats `casa` — a token that appears in many aliases across many unrelated interventions — exactly the same as a rare, discriminating token. Combined with a alias dataset that uses `casa` loosely as a suffix on colloquial paint-related aliases (`imbiancare casa`), this guarantees that "casa"-containing queries leak into the paint intervention regardless of the verb that precedes it.

---

## TASK 5 — Issue classification

| Query / Symptom | Classification |
|---|---|
| `frontalini` fails | DATA ISSUE (no plural alias) + SEARCH ISSUE (no stemming to bridge it) |
| `grondaia` fails | DATA ISSUE (no singular alias) — pre-existing, not a regression |
| `intonaci` fails | DATA ISSUE (incomplete alias set on a newly modeled concept) |
| `rifare casa` fails | TAXONOMY ISSUE (the catalog never modeled this colloquial equivalence, old or new) |
| `intonaco` ambiguous across two interventions | RANKING ISSUE (no intent disambiguation between "apply" vs "repair" plaster) |
| `ristrutturare casa` → `tinteggiare interni` pollution | RANKING ISSUE (flat layer bonus + no term-specificity/IDF weighting on single generic tokens like `casa`) |
| Loss of `Service`/`Domain` fan-out discovery | SEARCH ISSUE (structural: discovery breadth narrowed from free-form hub-and-spoke to `Category→ProjectGroup` only) |
| Canonical names flipped from plural/colloquial nouns to verb-infinitive phrasings | TAXONOMY ISSUE (changes which literal queries align with catalog strings, independent of the matching algorithm) |
| `cartongessista`, `grondaie`, `imbiancare casa`, `frontalino` succeed | Not issues — confirm the alias mechanism and verb-infinitive direct names work when data exists |

---

## Direct answers

**What exact capabilities existed before and are missing today?**
None, in the literal "the old engine could do X and the new one can't" sense — the old engine (`packages/db/src/search-taxonomy.ts` at `91673f5`) had *less* algorithmic capability: no tokenization, no stopwords, no scoring, no stemming, no fuzzy matching, no synonym table with actual rows (`serviceAliases: 0`). What's missing today is **structural breadth and naming alignment**, not algorithm features:
- The `Service`/`Domain` free-form many-to-many discovery hubs are gone (models deleted from `schema.prisma`), narrowing intervention discovery to `Category → ProjectGroup` only.
- The old catalog's canonical names were themselves plural/colloquial nouns (`Grondaie`, `Massetti`, `Tinteggiatura interni`), which gave broad accidental coverage of how people actually type; the new catalog's canonical names are verb-infinitive (`Sistemare grondaie`, `Fare massetto`, `Tinteggiare interni`), so literal substring/prefix matching — unchanged in matching power — now lines up with a different literal string.

**What exact capabilities exist today but are ranking incorrectly?**
- `scoreSearchTexts`'s per-layer flat bonus (`directIntervention: 4000`, `categoryDiscovery: 3000`) overwhelms the more nuanced text-score delta between a strong match and a weak one, so a single generic content token (`casa`) shared across unrelated curated aliases is enough to surface an unrelated intervention inside the top results (`ristrutturare casa` → `tinteggiare interni`).
- There is no term-specificity / IDF-style discount, so common nouns embedded in curated aliases (`imbiancare casa`) behave as if they were as discriminating as rare technical terms (`frontalino`, `cartongessista`).
