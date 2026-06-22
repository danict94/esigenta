# DOMAIN INVARIANTS — PHASE 3: REQUEST VISIBILITY CONSOLIDATION

Date: 2026-06-22
Scope: implementation. Code changed, no schema changes, no new features,
no UX changes — the one behavior change (detail page now correctly checks
intervention/configuration eligibility, and correctly grants access via
unlock/save/dispatch) is a bug fix forced by consolidation, documented
explicitly below, not a new feature. Validated live against the real Neon
database (`Esigenta`, project `purple-glitter-37268985`) plus direct
invocation of the pure decision function for states with no current
real-data instance.

---

## TASK 1 — Inventory of every visibility implementation (repo-wide search)

| File | Role |
| --- | --- |
| `packages/domain/src/company/requests/get-requests-list-page.ts` | Browse/dashboard list — bulk, paginated, filtered, sorted |
| `packages/domain/src/company/requests/get-request-detail-page.ts` | Single-request detail — the actual "can you open this" gate |
| `packages/domain/src/company/requests/get-saved-requests-page.ts` | Saved list — grant-only (CompanySavedRequest), no live-match recheck |
| `packages/domain/src/company/requests/get-purchased-requests-page.ts` | Purchased/unlocked list — grant-only (RequestUnlock), no live-match recheck |
| `apps/web/.../account/notifiche/notification-card.tsx` | Notification entry point — links to the detail page (`requestHref`); does not itself decide visibility, but is the most common path to a request the company never live-matched against (it was dispatched in the past, possibly under a different configuration) |
| `resolve-request-dispatch-candidates.ts` (dispatch reader, geo refoundation) | Not a visibility reader — it is `RequestDispatchable`, a different invariant. Documented in Task 7 to make the relationship explicit rather than assumed. |

No other file independently computes "can company X see request Y" —
confirmed by searching for `interventionId`, `operatingRadiusKm`,
`CompanyIntervention`, `RequestUnlock`, `CompanySavedRequest` together
across `packages/domain/src/company` and `packages/domain/src/customer`.

---

## TASK 2 — Side-by-side comparison (before this phase)

| Check | List (`get-requests-list-page.ts`) | Detail (`get-request-detail-page.ts`, before) | Saved | Purchased |
| --- | --- | --- | --- | --- |
| MarketplaceReady | Yes | Yes | No (lists are scoped by `companyId` from an already-authenticated actor; no separate check found) | No (same) |
| CompanyConfigured | Yes (`missing_category` gate) | **No — never checked at all** | No | No |
| Intervention match | Yes (`visibilityInterventionIds`) | **No — never checked at all** | No (grant-based) | No (grant-based) |
| Geographic coverage | Yes (`earthdistance`/`cube`) | Yes (plain `getDistanceKm`) | No (grant-based) | No (grant-based) |
| Dispatch existence | No (not part of browse discovery) | **No — not checked, but should grant access; this was the actual latent bug** | No | No |
| Ownership (unlock/save) | Surfaced as `isSaved` flag only, not a visibility gate | Read (`unlock`, `savedByCompanies`) but **not used as an alternate visibility grant** — only for display fields | **Yes — sole gate** | **Yes — sole gate** |
| Status (`APPROVED`/`PUBLISHED`, not archived/deleted) | Yes | Yes | Implicit (no live recheck) | Implicit (no live recheck) |

**The actual finding**: the detail page was *strictly weaker* than the
list page on eligibility (no intervention/configuration check at all) and
simultaneously *blind to grants* (it read unlock/save data but only for
display, never as an alternate path to visibility, and never checked
dispatch existence at all). This produced two real, opposite-direction bugs:
a company could open detail for a request it would never see in its own
list (too permissive on eligibility), and a company could lose access to a
request it had already unlocked, saved, or been legitimately dispatched
for, the moment its live configuration or geography changed (too strict on
history).

---

## TASK 3 — Canonical visibility definition (explicit, not implicit)

```
Visible(company, request) =
  MarketplaceReady(company)
  AND ( LiveMatch(company, request) OR Grant(company, request) )

LiveMatch = CompanyConfigured
            AND request.interventionId ∈ (CompanyIntervention ∪ CompanyCategory-derived interventions)
            AND distance(company, request) <= company.operatingRadiusKm

Grant = RequestUnlock exists (regardless of refunded status — see below)
        OR CompanySavedRequest exists
        OR RequestDispatch exists for (company, request)
```

**Scenario answers, exactly as asked:**

| Scenario | LiveMatch | Grant | Visible | Why |
| --- | --- | --- | --- | --- |
| A) MarketplaceReady, Configured=false | false (Configured is a LiveMatch prerequisite) | depends | **false, unless a Grant independently exists** | An unconfigured company has no live discovery, but a *specific* request it already unlocked/saved/was dispatched for before reconfiguring stays reachable through the Grant path — not through LiveMatch |
| B) Configured=true, intervention mismatch | false | depends | **false, unless a Grant independently exists** | Same reasoning — mismatch blocks discovery, not history |
| C) Configured=true, intervention match, outside coverage | false | depends | **false, unless a Grant independently exists** | Same |
| D) Already unlocked | n/a | **true** | **true, always** (subject to MarketplaceReady) | A paid-for unlock must remain reachable for as long as the company can use the marketplace at all |
| E) Already dispatched | n/a | **true** | **true, always** (subject to MarketplaceReady) | A notification email/in-app link must keep working even if the company's configuration or coverage later changes — this was the concrete latent bug closed by this phase |
| F) Saved | n/a | **true** | **true, always** (subject to MarketplaceReady) | Matches the pre-existing, already-correct behavior of the dedicated Saved list, now also true for the detail page specifically |

`MarketplaceReady` is checked first and is absolute — no `Grant` overrides
a suspended/deactivated/deleted company's exclusion (verified in Task 10).

---

## TASK 4 — Canonical visibility API

**Files** (new):
- `packages/domain/src/company/requests/company-request-eligibility.ts` —
  `resolveCompanyRequestEligibility(companyId)`, returning
  `{ resolvedCategoryIds, selectedInterventionIds, operationalInterventionIds, isConfigured }`,
  plus `getDefaultVisibilityInterventionIds(eligibility)` and
  `loadInterventionsForCategoryIds(categoryIds)` (the category→ProjectGroup→Intervention
  traversal, relocated here from being private to the list page).
- `packages/domain/src/company/requests/request-visibility.ts` —
  `evaluateRequestVisibility(input): { visible, isLiveMatch, hasGrant }`,
  the pure function implementing exactly the Task 3 rule set.

**Consumers**:
- `get-requests-list-page.ts` calls `resolveCompanyRequestEligibility` and
  `getDefaultVisibilityInterventionIds` for its bulk query's parameters —
  it does **not** call `evaluateRequestVisibility` directly (see Task 5's
  explanation: the list is the LiveMatch half of the rule, expressed as a
  bulk SQL predicate built from the *same* eligibility data, not a
  per-row JS function call — same performance reasoning already
  established for `isCompanyMarketplaceReady` vs. dispatch's SQL in
  Phase 2).
- `get-request-detail-page.ts` calls both `resolveCompanyRequestEligibility`
  and `evaluateRequestVisibility` — this is the one true yes/no gate.

---

## TASK 5 — Migration

- **`get-requests-list-page.ts`**: removed its own private
  `loadInterventionsForCategoryIds`, `CategoryProjectGroupsRow`,
  `InterventionRow`, and `unique` helper entirely (not deprecated, deleted
  outright — they were private to this file, zero external callers, fully
  superseded). Removed the redundant `company.interventions` Prisma select
  (selected interventions now come from the shared eligibility call). The
  default ("no filter") `visibilityInterventionIds` computation now calls
  `getDefaultVisibilityInterventionIds(eligibility)` instead of
  re-deriving the same union inline.
- **`get-request-detail-page.ts`**: added `interventionId` and `dispatches`
  to its `Request` select; added a call to `resolveCompanyRequestEligibility`;
  replaced the old geo-only check with one call to
  `evaluateRequestVisibility`, which now also makes `isSaved`'s computed
  value (`hasSaved`) the single source for both the visibility grant and
  the display field (previously computed twice, redundantly, from the
  same `savedByCompanies` data).
- **`get-saved-requests-page.ts`/`get-purchased-requests-page.ts`**: **not
  modified.** Confirmed correct as-is — each is already exactly one Grant
  clause in isolation (`CompanySavedRequest` / `RequestUnlock`
  respectively), with no live-match recheck, which is the *intended*,
  already-correct behavior per Task 3's D/F answers. Forcing them through
  `evaluateRequestVisibility` would add a LiveMatch computation they don't
  need and don't want (a saved/unlocked request must stay listed there
  even if it would now fail LiveMatch).

---

## TASK 6 — List/detail consistency (proof, not just a claim)

**Why it holds, by construction**: `List = LiveMatch`, `Detail = LiveMatch OR Grant`. `Detail ⊇ List` as sets, so:
- List-visible ⟹ LiveMatch ⟹ Detail-visible (List ⊆ Detail).
- Detail-not-visible ⟹ ¬LiveMatch ∧ ¬Grant ⟹ ¬LiveMatch ⟹ List-not-visible (contrapositive of the same inclusion).

**Live proof** (real database, `sp ristrutturazioni` /
`cmqofg6fi0000loc47p71j87l`, request `REQ-CPV9S9` /
`cmqofj16c0004loc49nf234t9`):
```
getCompanyRequestsListPage  → requests: ["cmqofj16c0004loc49nf234t9"]
getCompanyRequestDetailPage → ok: true, request.id: "cmqofj16c0004loc49nf234t9"
```
The request that appears in the list is confirmed visible on detail — the
forward direction proven on real data. The reverse direction (detail
reject ⟹ list reject) is structural per the inclusion proof above and was
additionally exercised with a nonexistent request id, correctly returning
`not_found` (a degenerate case of "list would also reject," since a
nonexistent request can never appear in any list).

---

## TASK 7 — Relationship to `RequestDispatchable`

`RequestDispatchable` (geo refoundation, `resolve-request-dispatch-candidates.ts`)
answers a *different* question — "which companies should be *notified* about
this request, right now, at publish time" — using `CompanyIntervention`
only, with **no** category-derived broadening. `RequestVisibleToCompany`'s
LiveMatch deliberately uses the *broader* set (`CompanyIntervention` ∪
category-derived interventions), per the existing, intentional "dashboard
must not be stricter than dispatch" rule (already documented in the list
page before this phase, preserved unchanged).

**The coupling, made explicit rather than hidden**: a `RequestDispatch` row
existing for `(company, request)` is now one of the three `Grant` clauses
in `RequestVisibleToCompany`. This is a deliberate, one-directional
dependency — `RequestDispatchable`'s output (a persisted `RequestDispatch`
row) feeds `RequestVisibleToCompany` as historical evidence ("you were
already matched for this"), but `RequestVisibleToCompany` never feeds back
into or influences `RequestDispatchable` in any way. No cycle, no hidden
mutual recomputation.

---

## TASK 8 — Database impact audit (classification only, no schema changes)

| Table/field | Classification | Used by |
| --- | --- | --- |
| `CompanyCategory` | **SOURCE_OF_TRUTH** | `resolveCompanyRequestEligibility` (via `isConfigured`/`resolvedCategoryIds`) |
| `CompanyIntervention` | **SOURCE_OF_TRUTH** | Same function (`selectedInterventionIds`); also `RequestDispatchable`, unchanged |
| `Category.projectGroupIds` → `Intervention.projectGroupId` | **DERIVED** | `operationalInterventionIds` — the category-broadened discovery set, unchanged from before this phase |
| `RequestDispatch` | **SOURCE_OF_TRUTH** (for the Grant it represents) | New: `evaluateRequestVisibility`'s `hasDispatch` clause. Already source-of-truth for `RequestDispatchable`; this phase adds a second, read-only consumer, not a second writer. |
| `RequestUnlock` | **SOURCE_OF_TRUTH** (for its Grant) | `evaluateRequestVisibility`'s `hasUnlock`; unchanged usage in the Purchased list |
| `CompanySavedRequest` | **SOURCE_OF_TRUTH** (for its Grant) | `evaluateRequestVisibility`'s `hasSaved`; unchanged usage in the Saved list |
| `GeoLocation` (`Company`/`Request`) | **SOURCE_OF_TRUTH** | Coverage computation in both LiveMatch paths (list's SQL, detail's `evaluateRequestVisibility`) — already established in the geo refoundation, unchanged |

No cache, no derived/denormalized visibility table, no legacy field found
feeding visibility anywhere in this audit.

---

## TASK 9 — Dead visibility logic inventory

Unlike Phase 2 (where the dead code was *exported, package-level policy
functions* with a residual public API surface worth deliberating over),
the duplicated logic found in this phase was entirely **private to
`get-requests-list-page.ts`** (`loadInterventionsForCategoryIds`,
`CategoryProjectGroupsRow`, `InterventionRow`, `unique`) — confirmed zero
external callers before removal (nothing outside this one file could
reference a non-exported function/type). There was therefore nothing to
classify as `SAFE_REMOVE`/`DEFER`/`KEEP` for *later* — it was deleted
directly as part of the same edit that introduced its replacement, since
deferring removal of unreachable private code serves no purpose Phase 6
would otherwise handle differently.

The one item worth flagging for Phase 6's broader sweep: the detail page's
*previous* geo-only check (the inline `getDistanceKm` comparison) is fully
gone, not deprecated — confirmed via `grep` that `get-request-detail-page.ts`
no longer imports `getDistanceKm` at all (it's now only used inside
`request-visibility.ts`, the one place that needs it).

---

## TASK 10 — Validation against the real database

**Live data** (`sp ristrutturazioni`, real, currently configured with
`ripristino-frontalino` among its 10 `CompanyIntervention` rows, request
`REQ-CPV9S9` published in the same city):

| Case | Result |
| --- | --- |
| A — configured + matching | List: `["cmqofj16c0004loc49nf234t9"]`. Detail: `ok: true`. **Visible = true.** |
| E — list/detail consistency | Same request, both pages agree. **Identical answer, confirmed.** |

**Direct invocation of `evaluateRequestVisibility`** (pure function, exact
exported code, constructed inputs for states with no current real-data
instance):

| Case | Input | Result |
| --- | --- | --- |
| B — configured, intervention mismatch | `isConfigured: true`, request intervention not in scope | `{ visible: false, isLiveMatch: false, hasGrant: false }` |
| C — configured, intervention match, outside coverage (Milan company, Valverde request, 30km radius — ~1005km apart) | as described | `{ visible: false, isLiveMatch: false, hasGrant: false }` |
| D — not configured, no grant | `isConfigured: false` | `{ visible: false, isLiveMatch: false, hasGrant: false }` — **explicitly documented behavior, not left implicit, per Task 3** |
| D (variant) — not configured, **with** an unlock grant | same, `hasUnlock: true` | `{ visible: true, isLiveMatch: false, hasGrant: true }` — proves the Grant path works independently of LiveMatch |
| (extra) — mismatch + outside coverage, but saved | `hasSaved: true` | `{ visible: true, isLiveMatch: false, hasGrant: true }` |
| (extra) — `SUSPENDED` company with every grant true | `status: "SUSPENDED"` | `{ visible: false, isLiveMatch: false, hasGrant: false }` — **MarketplaceReady confirmed absolute; no grant bypasses it** |

All cases match the Task 3 rule set exactly, with no discrepancy between
documented intent and actual code behavior.

---

## FINAL ANSWERS

```txt
REQUEST_VISIBLE_IMPLEMENTATIONS_BEFORE = 4 (list — correct but
  self-contained; detail — incomplete, missing intervention/configuration
  checks and missing grant-based access; saved — correct, grant-only;
  purchased — correct, grant-only). Of the 4, 2 needed real consolidation
  (list, detail); 2 were already correctly independent (saved, purchased).
REQUEST_VISIBLE_IMPLEMENTATIONS_AFTER = 1 canonical rule
  (evaluateRequestVisibility, request-visibility.ts), expressed in 2 forms
  for performance reasons that do not change its meaning: a bulk SQL
  LiveMatch predicate (list) built from the same shared eligibility data,
  and a single-row LiveMatch-OR-Grant evaluation (detail). Saved/purchased
  remain their own single Grant clause each, by design, not divergence.
CANONICAL_VISIBILITY_FUNCTION = evaluateRequestVisibility
  (packages/domain/src/company/requests/request-visibility.ts), backed by
  resolveCompanyRequestEligibility (company-request-eligibility.ts) as the
  shared eligibility source both list and detail consume.
LIST_DETAIL_DIVERGENCE_REMOVED = YES — proven both structurally (List ⊆
  Detail by construction) and live, on real data, for the one currently
  visible request in the database.
VISIBILITY_SOURCE_OF_TRUTH = CompanyCategory + CompanyIntervention (live
  match eligibility) + GeoLocation/operatingRadiusKm (coverage) +
  RequestUnlock/CompanySavedRequest/RequestDispatch (grants) — no cache, no
  derived table, no legacy field.
DEAD_VISIBILITY_LOGIC_IDENTIFIED = YES — found and removed directly (not
  deferred): get-requests-list-page.ts's private, now-fully-superseded
  loadInterventionsForCategoryIds/CategoryProjectGroupsRow/InterventionRow/unique,
  and get-request-detail-page.ts's old geo-only check. No exported,
  externally-reachable dead code was found this phase (unlike Phase 2);
  nothing deferred to Phase 6 from this phase specifically.
READY_FOR_PHASE_4 = YES — RequestVisibleToCompany and RequestDispatchable
  are now both precisely defined and their one real coupling point
  (dispatch-as-a-visibility-grant) is documented rather than hidden,
  giving Phase 4 (Notification Architecture) a settled foundation for
  "who is eligible to be notified" vs. "who can see the request once
  notified."
```
