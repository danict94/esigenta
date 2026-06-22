# DOMAIN INVARIANTS — PHASE 3A: VISIBILITY VS RECOMMENDATION AUDIT

Date: 2026-06-22
Scope: audit only. No code changes. This audit exists because Phase 3's
product framing was incomplete: it treated "can this company see this
request" as one question, when the actual product semantics (stated in
this task's CONTEXT) split it into two — exploration (unrestricted by
configured interventions) and recommendation/matching (driven by them).
This document determines how much of Phase 3 actually implements which
concept, and whether it accidentally fused them.

---

## TASK 1 — Every caller of `evaluateRequestVisibility`

Repo-wide search, exact function name:

| Caller | File |
| --- | --- |
| `getCompanyRequestDetailPage` | `packages/domain/src/company/requests/get-request-detail-page.ts:208` |

**Exactly one literal caller.** But `evaluateRequestVisibility`'s
`LiveMatch` half is not an isolated idea — it is built from
`resolveCompanyRequestEligibility`/`getDefaultVisibilityInterventionIds`
(`company-request-eligibility.ts`), and **that** pair has a second
consumer:

| Caller | File | What it does with it |
| --- | --- | --- |
| `getCompanyRequestsListPage` | `packages/domain/src/company/requests/get-requests-list-page.ts:601` | Uses `getDefaultVisibilityInterventionIds(eligibility)` to build the bulk SQL query's `WHERE r."interventionId" = ANY(${visibilityInterventionIds}::text[])` clause — a **hard inclusion filter**, not a ranking signal. Requests whose `interventionId` falls outside the company's selected-or-category-derived set are excluded from the result set entirely; they are not returned with a lower `match_level`, they are not returned at all. |

So the real picture is: one shared eligibility computation, expressed
twice — once as `evaluateRequestVisibility`'s `LiveMatch` (detail page),
once as a raw SQL `WHERE` clause (list page) — and **both** of those
expressions currently encode the same rule: *configured interventions
gate inclusion*. Per this task's stated product semantics, that rule is
correct for *recommendation*, not for *visibility/exploration*.

---

## TASK 2 — Classification of each caller

| Caller | Currently behaves as | Should be |
| --- | --- | --- |
| `get-request-detail-page.ts` (`evaluateRequestVisibility`) | **RECOMMENDED_REQUEST** logic, labeled and used as "visibility" — a company cannot open a specific request's detail page (via direct link, search, or a notification for a request it's no longer configured for) unless it's a *live recommendation match* or has a *Grant* (unlock/save/dispatch history) | **VISIBLE_REQUEST** — opening a specific, already-identified request should not require a live intervention match at all. Exploration must not be blocked by configuration, per this task's CONTEXT. |
| `get-requests-list-page.ts` (default/no-filter feed) | **RECOMMENDED_REQUEST** logic — and, importantly, this is **not** a Phase 3 invention; the hard `interventionId = ANY(...)` filter predates Phase 3 (it was already in the list page before this refoundation touched it; Phase 3 only relocated where the eligibility ids came from, it did not change the filter's hard/excluding nature) | Correctly **RECOMMENDED_REQUEST** for the *default* feed (a curated, relevant-first dashboard is a reasonable, desirable product behavior) — but it should not be the *only* way to reach a request, and should not be confused with or substituted for `RequestVisibleToCompany` when something else (a direct link, a search, a notification) needs the broader question answered. |

---

## TASK 3 — Did Phase 3 merge two distinct concepts?

**Yes — but it inherited the merge, it did not originate it, and then
extended it to a place it hadn't reached before.**

- The list page's hard, excluding intervention filter already conflated
  "what should I recommend by default" with "what am I even allowed to
  see" *before* Phase 3 — this audit did not previously notice it because
  Phase 3's stated objective was "list and detail must agree," which is a
  *consistency* goal, not a *correctness-of-definition* goal. Phase 3
  successfully made detail agree with list — but list's own underlying
  rule was already the wrong rule for the question "can this company open
  this request," and consistency with a wrong rule is not the same as
  being right.
- Phase 3's actual, original contribution — `evaluateRequestVisibility`
  and the Grant mechanism (unlock/save/dispatch-history always grants
  access) — is sound and should be kept. The error is narrower than "redo
  Phase 3": it is specifically that `LiveMatch` (configured-interventions-gated)
  was used as the non-Grant half of *visibility*, when it should have
  been used as the definition of a *separate* invariant —
  `RequestRecommendedToCompany` — and *visibility's* non-Grant half should
  have been something close to "request is publicly browsable and the
  company is marketplace-ready," with no intervention/configuration gate
  at all.

**Conclusion: Phase 3 consolidated the right mechanism (one shared
eligibility computation, one Grant model, structural list/detail
consistency) around the wrong abstraction (treating "recommended" as if
it were "visible").**

---

## TASK 4 — Target model

Four distinct invariants, ordered from narrowest to broadest, with the
relationship between them stated explicitly:

```
RequestDispatchEligible
  ⊆ RequestRecommendedToCompany
  ⊆ RequestVisibleToCompany
```

### `RequestDispatchEligible(company, request)`
**Unchanged from the geo refoundation.** `CompanyIntervention` exact
match on `Request.interventionId` (no category broadening), `Company.{isActive,
deletedAt, status, operatingRadiusKm}`, geo coverage via
`earthdistance`/`cube`. Decided exactly once, at publish time
(`resolve-request-dispatch-candidates.ts`). This is the narrowest set —
it answers "who gets dispatched a brand-new opportunity right now."

### `RequestNotificationEligible(company, request)`
**Not a fifth invariant — two existing things, already correctly
separate, now named explicitly:**
- For the "new opportunity" notification type: **identical to**
  `RequestDispatchEligible`. A `RequestDispatch` row's creation *is* the
  notification-eligibility decision for that case — there is no second
  computation, only the one dispatch already performs.
- For the "conversation message" notification type: an unrelated,
  membership-graph-based rule ("every other participant already in this
  conversation") — already correctly implemented in
  `internal/conversation/side-effects.ts`, already correctly *not* using
  any of the matching/visibility machinery, and out of scope for any
  change here (Phase 0 already classified this as `EXPECTED_DIVERGENCE`,
  not a bug).

### `RequestRecommendedToCompany(company, request)`
**This is Phase 3's `LiveMatch`, renamed and re-scoped to its correct
role.** `CompanyConfigured` (Phase 1) AND `request.interventionId` ∈
(`CompanyIntervention` ∪ category-derived `operationalInterventionIds` —
the existing "broad net") AND within geo coverage. Used to:
- Rank/filter the **default** dashboard feed (today's `match_level`:
  `selected_intervention` / `category` / `explore` is already exactly
  this gradient, and should stay).
- Decide what counts as "recommended" anywhere else recommendation is a
  distinct, named concept (e.g., a future "for you" surface).

It is **broader** than `RequestDispatchEligible` (it includes the
category-derived set; dispatch does not) — this asymmetry already exists
today and is intentional (documented in the list page: "dashboard must
not be stricter than dispatch, or a company stops seeing requests it's
actually being notified about").

### `RequestVisibleToCompany(company, request)`
**The corrected, broadest invariant — what Phase 3's
`evaluateRequestVisibility` should actually compute.**
```
VisibleToCompany =
  MarketplaceReady(company)
  AND ( RequestIsPubliclyBrowsable(request) OR Grant(company, request) )

RequestIsPubliclyBrowsable =
  request.status ∈ {APPROVED, PUBLISHED}
  AND not archived, not deleted
  [geo coverage: open question — see below]

Grant = unlocked OR saved OR already dispatched (unchanged from Phase 3)
```
No `CompanyConfigured` check. No intervention-match check. This is the
gate for: opening a specific request's detail page by any path (direct
link, search result, notification), and any future "explore everything"
/ search-across-all-requests surface that is explicitly *not* the curated
default feed.

**Open question, flagged rather than assumed**: should geo coverage gate
`RequestVisibleToCompany`, or only `RequestRecommendedToCompany`/
`RequestDispatchEligible`? The CONTEXT given for this audit explicitly
frees only *configured interventions* from limiting exploration — it says
nothing about geography. Two defensible positions:
- **Keep geo as a hard gate even for Visible** (this audit's
  recommendation): geography is a physical constraint on a company's
  ability to actually perform the work, unlike "configured interventions"
  which is a soft, self-declared preference signal. Letting a Milan-based
  company explore Sicily-based requests it can never service has limited
  product value and was not the behavior being asked for.
- **Drop geo from Visible too**, making it identical to "is this request
  public at all" (status + not archived/deleted), with geo only
  affecting Recommended/Dispatch.

This audit does not decide this — it is a product decision, not a
consolidation question, and the task explicitly asked not to leave
behavior implicit. **Recommend resolving this explicitly before Phase 4
proceeds**, since `RequestVisibleToCompany`'s exact definition is now a
dependency of however notification-link-following behavior gets specified.

---

## FINAL ANSWERS

```txt
VISIBILITY_AND_RECOMMENDATION_SAME_CONCEPT = NO — they are two different
  questions ("can I open this" vs. "should this be surfaced to me by
  default / will I be notified about it") that happened to share one
  implementation because the list page's pre-existing hard intervention
  filter was mistaken for the definition of visibility rather than
  recognized as a recommendation/ranking rule.
PHASE_3_CONSOLIDATED_WRONG_ABSTRACTION = YES — evaluateRequestVisibility's
  non-Grant half (LiveMatch) is a correct, sound computation, but it is the
  definition of RequestRecommendedToCompany, not RequestVisibleToCompany.
  The mechanism Phase 3 built (shared eligibility, Grant model, structural
  list/detail consistency) is reusable and should not be discarded; only
  the role LiveMatch was assigned needs correcting.
NEW_INVARIANT_DISCOVERED = YES — RequestRecommendedToCompany, previously
  unnamed and merged into "visibility." RequestVisibleToCompany must be
  redefined narrower (no configuration/intervention gate) than what
  evaluateRequestVisibility currently computes.
PHASE_4_BLOCKED = YES — Phase 4 (Notification Architecture) needs a settled
  relationship between RequestDispatchEligible, RequestNotificationEligible,
  RequestRecommendedToCompany, and RequestVisibleToCompany to define
  "who can still open a request they were notified about" correctly. Building
  it on the current, mis-scoped evaluateRequestVisibility would carry the
  same error into notification-link behavior. Recommend a Phase 3B
  (implementation) to correct evaluateRequestVisibility per the target
  model above, resolving the geo open question first, before Phase 4 starts.
```
