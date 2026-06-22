# DOMAIN INVARIANTS — PHASE 2: MARKETPLACE READINESS CONSOLIDATION

Date: 2026-06-22
Scope: implementation. Code changed, no schema changes (one Prisma-adjacent
type widening, explained in Task 3), no new features, no UX changes.
Validated live against the real Neon database (`Esigenta`, project
`purple-glitter-37268985`) plus direct invocation of the real exported
functions for states that don't currently exist in the live data.

---

## TASK 1 — Audit of existing readiness policies

| Implementation | Location | Completeness | Callers (before this phase) |
| --- | --- | --- | --- |
| `isCompanyMarketplaceEnabled(status)` | `packages/domain/src/company/account/company-status-policy.ts` | **Weak** — checks `status === "APPROVED"` only, ignores `isActive`/`deletedAt` | **0** — exported from `packages/domain/src/company/account/index.ts`, never called |
| `isCompanyMarketplaceApproved(company)` + `assertCompanyCanUseMarketplace`/`assertCompanyCanBuyCredits` + `CompanyMarketplaceAuthorizationError` | `packages/auth/src/identity/company/marketplace-policy.ts` | **Complete** — checks `isActive && deletedAt === null && status === "APPROVED"` | **0** — exported from two index files, never called |
| Inline `actor.company.status !== "APPROVED"` | `get-requests-list-page.ts:540`, `get-request-detail-page.ts:111`, `unlock-request.ts:56`, `checkout-order.ts:46` (billing) | **Weak** — status only, identical gap to the dead domain-layer policy, relying entirely on an *unstated* upstream guarantee that `CompanyActor` was built from an already-`isActive`/non-deleted row | **4** real call sites |

**Determination**: `marketplace-policy.ts`'s `isCompanyMarketplaceApproved`
was already the most complete implementation in the codebase — checking
exactly the three fields that matter — and is the one promoted to
canonical (renamed `isCompanyMarketplaceReady` for clarity; it had zero
callers, so renaming is not a breaking change). The weaker
`isCompanyMarketplaceEnabled` and the 4 inline reimplementations are all
retired in its favor.

---

## TASK 2 — Canonical readiness rule set

**Question**: "Can this company participate in the marketplace?"

**Rule**:
```
isCompanyMarketplaceReady(company) =
  company.isActive === true
  AND company.deletedAt === null
  AND company.status === "APPROVED"
```

Answered explicitly, not left implicit:

| Sub-question | Included? | Reasoning |
| --- | --- | --- |
| Must be `APPROVED`? | **Yes** | The core admin-moderation gate |
| Must be active (`isActive`)? | **Yes** | A soft-deactivated company must not transact even if its status field still says `APPROVED` |
| Must not be deleted (`deletedAt`)? | **Yes** | Same reasoning, for soft-delete |
| Must be configured (`CompanyConfigured`, Phase 1)? | **No** | Deliberately excluded. `unlock-request.ts` and `checkout-order.ts` already never required configuration (a company can unlock a specific request or buy credits without having any `CompanyIntervention` rows at all — configuration only affects *which requests it gets matched/visible to*, not whether it can transact). Conflating the two would also collapse two already-distinct, already-useful error codes (`company_not_approved_for_marketplace` vs `missing_category`) into one less actionable message. |
| Must have geo/coverage configured (`CompanyCoverage`)? | **No** | Same reasoning — geo/radius gates *visibility of specific requests*, not general marketplace participation. `unlock-request.ts`/`checkout-order.ts` never checked this either. |
| Must have an owner (`CompanyMembership` with role `OWNER`)? | **No, not as a separate runtime check** | Structurally guaranteed instead: `resolveCompanyActorFromUser`/`getActiveMembershipForUser` (`packages/auth/src/identity/company/actor.ts`) can only ever produce a `CompanyActor` by joining through an *existing* `CompanyMembership` row — there is no code path that hands a caller a `CompanyActor` for a company with zero memberships. Adding a redundant runtime check for something the type system's only constructor already guarantees would be a new, unnecessary check, not a consolidation. |

**Case F (Approved but not configured) — documented, not left implicit**:
`isCompanyMarketplaceReady` returns `true`. The company *can* use the
marketplace (browse, unlock, buy credits) but, per Phase 1's
`CompanyConfigured`, will see zero requests on the dashboard and never
receive a dispatch notification until it saves a real configuration. This
is the **existing, correct, already-shipped behavior** at the unlock and
checkout call sites; this phase makes it the explicit, documented rule
for *every* caller instead of an accident of which check each one happened
to skip.

---

## TASK 3 — Canonical readiness API

**File**: `packages/auth/src/identity/company/marketplace-policy.ts`
(existing file, function renamed — not a new file, since the most-complete
implementation already lived here).

**Public API**:
```ts
export type CompanyMarketplaceState = {
  isActive: boolean
  deletedAt: Date | null
  status: CompanyStatus
}

export function isCompanyMarketplaceReady(
  company: CompanyMarketplaceState,
): boolean
```
Exported from `packages/auth/src/identity/company/index.ts` →
`packages/auth/src/identity/index.ts` → `@esigenta/auth` (top level).

**Supporting change**: `CompanyActor.company` (`packages/auth/src/identity/company/actor.ts`)
widened from `{id, status}` to `{id, status, isActive, deletedAt}`. The
two SQL queries that build a `CompanyActor` already `JOIN`ed to `Company`
and already filtered `isActive = true AND deletedAt IS NULL` in their
`WHERE` clause — this only adds 2 already-available columns to the
`SELECT`, no new joins, no schema change, no new query. This closes the
exact "implicit, unstated guarantee" risk Phase 0 flagged (`CompanyActor`
previously couldn't *see* the fields its own construction already
guaranteed, forcing every caller to either trust an unwritten contract or
re-fetch the company from the database itself).

**All callers (after Task 5's migration)**:
- `packages/domain/src/company/requests/get-requests-list-page.ts`
- `packages/domain/src/company/requests/get-request-detail-page.ts`
- `packages/domain/src/company/requests/unlock-request.ts`
- `packages/billing/src/checkout/checkout-order.ts`

---

## TASK 4 — Every readiness consumer (repo-wide search, not assumed)

| Site | Had its own check? | Now uses canonical? |
| --- | --- | --- |
| Requests list (dashboard) | Yes, inline | Yes |
| Request detail | Yes, inline | Yes |
| Unlock request | Yes, inline | Yes |
| Checkout (billing) | Yes, inline | Yes |
| Notifications (`get-notifications-page.ts`, `notifications.ts`) | **No check at all** — a company's notifications are listed by `companyId` regardless of current status | Not applicable — notifications are historical records; an admin-suspended company should presumably still see *past* notifications. Not a readiness gate, confirmed by reading the function: no status check exists or is implied anywhere in that path. |
| Dashboard (same as requests list) | covered above | covered above |
| Marketplace pages (signup/profile) | No readiness check — these operate *before* or *independent of* `APPROVED` status by design (a `PENDING_REVIEW` company must still be able to view/edit its own profile and services configuration) | Not applicable, confirmed by reading `get-profile-page.ts`/`get-services-configuration-page.ts`: neither checks `status` at all, intentionally |
| Future dispatch eligibility | `resolveCandidates` (`resolve-request-dispatch-candidates.ts`) already checks `c."status" = 'APPROVED'::"CompanyStatus"` directly in its bulk SQL `WHERE` clause | **Not migrated** — see explanation below |

**Why dispatch's bulk SQL is not migrated to call the function directly**:
`isCompanyMarketplaceReady` is a per-company JS predicate; dispatch's
matching query evaluates the same three conditions (`isActive`,
`deletedAt`, `status`) as a `WHERE` clause across potentially thousands of
candidate rows in one indexed SQL statement. Forcing it to fetch every
company row into JS and call a predicate per row would reintroduce
exactly the N+1/full-table-scan performance regression the geo
refoundation eliminated. The **rule is identical** —
`isActive = true AND deletedAt IS NULL AND status = 'APPROVED'` appears
verbatim in `resolve-request-dispatch-candidates.ts`'s `WHERE` clause,
character-for-character the same three conditions
`isCompanyMarketplaceReady` checks — so there is no actual rule
divergence, only a necessary difference in *where* the same three
conditions are evaluated (SQL predicate vs. JS function). This is
documented here explicitly so it isn't mistaken for a missed migration.

---

## TASK 5 — Migration (inline checks removed)

| File | Before | After |
| --- | --- | --- |
| `get-requests-list-page.ts:540` | `if (actor.company.status !== "APPROVED")` | `if (!isCompanyMarketplaceReady(actor.company))` |
| `get-request-detail-page.ts:111` | `if (actor.company.status !== "APPROVED")` (with a comment about an implicit actor guarantee) | `if (!isCompanyMarketplaceReady(actor.company))` — the guarantee is now explicit and checked, not assumed |
| `unlock-request.ts:56` | `if (actor.company.status !== "APPROVED")` | `if (!isCompanyMarketplaceReady(actor.company))` |
| `checkout-order.ts:46` (billing) | `if (actor.company.status !== "APPROVED")` | `if (!isCompanyMarketplaceReady(actor.company))` |

Confirmed via repo-wide search after migration: zero remaining occurrences
of `actor.company.status !== "APPROVED"` (or the `===` equivalent) outside
`marketplace-policy.ts`'s own implementation and `resolve-request-dispatch-candidates.ts`'s
already-explained, intentionally-separate bulk SQL predicate.

---

## TASK 6 — Validation (real database + direct invocation)

Invoked the actual exported `isCompanyMarketplaceReady` function (not a
reimplementation):

| Case | Input | Result | Expected | Match |
| --- | --- | --- | --- | --- |
| A — Approved + Active + not deleted | `{isActive: true, deletedAt: null, status: "APPROVED"}` | `true` | `true` | ✓ |
| B — Pending review | `{isActive: true, deletedAt: null, status: "PENDING_REVIEW"}` | `false` | `false` | ✓ |
| C — Rejected | `CompanyStatus` has no `REJECTED` value (only `PENDING_REVIEW`, `APPROVED`, `SUSPENDED`, `BLOCKED`) — tested both real "rejected-equivalent" statuses: `SUSPENDED` → `false`, `BLOCKED` → `false` | `false` | `false` | ✓ |
| D — Deleted | `{isActive: true, deletedAt: <now>, status: "APPROVED"}` | `false` | `false` | ✓ |
| E — Inactive | `{isActive: false, deletedAt: null, status: "APPROVED"}` | `false` | `false` | ✓ |
| F — Approved but not configured | readiness: `{isActive: true, deletedAt: null, status: "APPROVED"}` → `true`; configuration (separately): `isConfigured` → `false` for a hypothetical unconfigured company | `Ready = true`, documented as a deliberate, separate fact from `isConfigured` (Task 2) | matches the documented rule | ✓ |

Live, real-data confirmation for Case A: `sp ristrutturazioni`
(`cmqofg6fi0000loc47p71j87l`), currently `APPROVED`/active/not-deleted/
configured — `isConfigured` (real DB query) returns `true`, consistent
with both invariants agreeing for this company's actual current state.

No regression: `getCompanyRequestsListPage`/`getCompanyRequestDetailPage`/
`unlockCompanyRequest`/`createCreditPackageCheckoutOrder` all compile and
typecheck against the new predicate with the exact same return shapes and
error codes as before — only the *test* changed, not the *response* a
caller sees on rejection.

---

## TASK 7 — Dead policy cleanup inventory (classification only, no deletion)

| Item | Classification | Reasoning |
| --- | --- | --- |
| `isCompanyMarketplaceEnabled` (`packages/domain/src/company/account/company-status-policy.ts`) | **SAFE_REMOVE** | Strictly weaker duplicate of the now-canonical function; zero callers before this phase, zero after. Nothing depends on its weaker (status-only) semantics. |
| `assertCompanyCanUseMarketplace` / `assertCompanyCanBuyCredits` / `CompanyMarketplaceAuthorizationError` / `assertCompanyMarketplaceState` (`marketplace-policy.ts`) | **DEFER** | Unlike the item above, these do **not** reimplement the rule — they call the same canonical predicate (`isCompanyMarketplaceReady`, after this phase's internal rename) and only differ in calling convention (throw vs. boolean) and in that they fetch the company by id themselves rather than taking an existing `CompanyActor`. They are currently uncalled, but they are not a second source of truth — removing them is a judgment call for whichever future caller might prefer exception-based flow control (e.g. a server action that wants to throw straight into a generic error boundary), not a correctness issue. Recommend deferring to Phase 6 rather than classifying as unconditionally safe to remove now. |
| `Company.onboardingCategorySlug`-adjacent items | Out of scope — already classified in Phase 1 | — |

---

## TASK 8 — Architecture verification

**How many implementations existed before?** 2 "official" policy
functions (`isCompanyMarketplaceEnabled`, `isCompanyMarketplaceApproved`),
both dead, plus 4 independent inline reimplementations at the real call
sites — 6 total places encoding this rule (with 2 of the 6 — the dead
ones — actually more complete than the 4 that were real).

**How many remain now?** 1 — `isCompanyMarketplaceReady`
(`marketplace-policy.ts`), called by all 4 former inline sites.
Dispatch's bulk SQL predicate remains separately *expressed* (necessarily,
for performance) but is not a second *definition* — it is the same three
conditions, verified character-for-character identical, just evaluated in
SQL instead of JS (Task 4).

**Can a caller bypass readiness rules?** Yes, in the sense that nothing
*prevents* a future file from writing `actor.company.status === "APPROVED"`
directly again — `CompanyStatus` and `Company.isActive`/`deletedAt` remain
plain, directly-accessible fields on the widened `CompanyActor` type; there
is no TypeScript-level barrier forcing routing through the canonical
function (that would require hiding the raw fields entirely, a much more
invasive change this phase's "no compatibility layers, but also no new
features" scope doesn't ask for). This is a process risk, not a type-system
guarantee.

**Can a future developer accidentally recreate inline checks?** Yes, for
the same reason. Mitigations available without further code change: this
document, the inline comment now on `CompanyActor.company` explaining why
`isActive`/`deletedAt` were added, and the doc-comment on
`isCompanyMarketplaceReady` itself stating it is "THE canonical answer."
A lint rule banning direct `.status ===/!== "APPROVED"` comparisons
outside `marketplace-policy.ts` would close this gap completely but is an
infrastructure addition beyond this phase's scope — flagged as a
candidate for whoever owns repo lint configuration, not implemented here.

---

## FINAL ANSWERS

```txt
MARKETPLACE_READY_IMPLEMENTATIONS_BEFORE = 6 (2 dead named policies +
  4 inline reimplementations at the real call sites)
MARKETPLACE_READY_IMPLEMENTATIONS_AFTER = 1 (isCompanyMarketplaceReady,
  packages/auth/src/identity/company/marketplace-policy.ts). Dispatch's
  bulk SQL predicate is the same rule expressed in SQL for performance
  reasons, not a second definition — verified identical, documented as
  intentionally separate in form only.
CANONICAL_READINESS_FUNCTION = isCompanyMarketplaceReady, exported from
  @esigenta/auth (packages/auth/src/identity/company/marketplace-policy.ts).
INLINE_CHECKS_REMOVED = YES — confirmed by repo-wide search; zero remaining
  actor.company.status comparisons outside marketplace-policy.ts itself
  and the explicitly-justified dispatch SQL predicate.
DEAD_POLICIES_IDENTIFIED = YES — isCompanyMarketplaceEnabled (SAFE_REMOVE),
  assertCompanyCanUseMarketplace/assertCompanyCanBuyCredits/
  CompanyMarketplaceAuthorizationError (DEFER — alternate calling
  convention over the same canonical rule, not a competing definition).
SOURCE_OF_TRUTH = Company.{isActive, deletedAt, status}, evaluated by
  exactly one JS predicate (isCompanyMarketplaceReady) and one
  character-for-character identical SQL predicate (dispatch matching),
  never independently reimplemented elsewhere.
READY_FOR_PHASE_3 = YES — CompanyMarketplaceReady (participation) and
  CompanyConfigured (Phase 1, visibility/matching content) are now both
  single, real, explicitly-documented, non-conflated concepts that
  RequestVisibleToCompany (Phase 3) can compose against instead of each
  visibility reader inventing its own blend of the two.
```
