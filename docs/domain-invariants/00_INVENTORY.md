# DOMAIN INVARIANTS — PHASE 0 INVENTORY

Date: 2026-06-22
Scope: audit only. No code changes. Every implementation below was located
by reading the actual source files (not inferred), with file:line
citations. Where a search may not be exhaustive, that is stated explicitly
rather than implied.

This inventory directly motivates the rest of this refoundation: for
almost every invariant in the minimum set, the codebase has **more than
one implementation**, and in two cases an "official" named policy function
exists but is **never called** — every real enforcement site reimplements
the check inline instead.

---

## CompanyConfigured

*"Has this company selected the categories/interventions it operates in?"*

| | |
| --- | --- |
| **Source of truth** | `CompanyCategory` + `CompanyIntervention` tables (the only tables `update-services-configuration.ts` writes) |
| **Implementations** | **3, disagreeing** — already fully documented in [docs/company-configuration/ONBOARDING_CONFIGURATION_REFOUNDATION_AUDIT.md](../company-configuration/ONBOARDING_CONFIGURATION_REFOUNDATION_AUDIT.md). Summary: (1) matching/dispatch — strict, `CompanyIntervention` only, no fallback (`resolve-request-dispatch-candidates.ts`); (2) dashboard visibility — falls back to `Company.onboardingCategorySlug` when `CompanyCategory` is empty (`get-requests-list-page.ts:582-593`); (3) Configura Servizi preselection — same fallback, rendered indistinguishably from a saved state (`services-configuration-page.tsx:143-174`). |
| **Readers** | `resolve-request-dispatch-candidates.ts`, `get-requests-list-page.ts` (`buildCompanyQuery`, fallback-category branch), `services-configuration-page.tsx`, `get-services-configuration-page.ts` |
| **Writers** | `update-services-configuration.ts` only (confirmed sole writer) |
| **Fallbacks** | `Company.onboardingCategorySlug` → `Category` → `Category.projectGroupIds` → `ProjectGroup.interventions`, used independently by readers (2) and (3) above, never by (1) |
| **Verdict** | **MULTIPLE_IMPLEMENTATIONS** — already the subject of a dedicated audit; carried into this inventory as the canonical example of the whole initiative's problem statement. |

---

## CompanyMarketplaceReady

*"Is this company allowed to use the marketplace at all (browse, unlock, buy credits)?"*

| | |
| --- | --- |
| **Source of truth** | `Company.{status, isActive, deletedAt}` |
| **Named implementations (exist, but largely unused)** | `isCompanyMarketplaceEnabled(status)` — `packages/domain/src/company/account/company-status-policy.ts:5` — checks `status === "APPROVED"` only, ignores `isActive`/`deletedAt`. **Exported from `packages/domain/src/company/account/index.ts` but has zero call sites anywhere in the repository outside its own definition and re-export.** `isCompanyMarketplaceApproved(company)` / `assertCompanyCanUseMarketplace` / `assertCompanyCanBuyCredits` — `packages/auth/src/identity/company/marketplace-policy.ts:50,132,146` — checks `isActive && deletedAt === null && status === "APPROVED"` (the *complete* check). **Exported from `packages/auth/src/identity/index.ts` and `packages/auth/src/identity/company/index.ts`, also with zero call sites anywhere in the repository.** Both policy modules are fully dead code — written, exported, never invoked. |
| **Actual enforcement (inline, repeated)** | `actor.company.status !== "APPROVED"` checked independently in: `get-requests-list-page.ts:540`, `get-request-detail-page.ts:111`, `unlock-request.ts:56`, `checkout-order.ts:46` (billing package). `review-request.ts:194` checks request-review status, a different but related concept. None of these four call either named policy function above — each reimplements the same single-field comparison itself, and **none of them re-check `isActive`/`deletedAt`** the way the dead `marketplace-policy.ts` function does. |
| **Readers** | The 4 call sites above, plus anything that consumes a `CompanyActor` and assumes `isActive`/`deletedAt` were already filtered (see next row) |
| **Writers** | `admin/companies/admin-companies.ts`'s `mutateCompanyStatus` (status transitions); `isActive`/`deletedAt` are written by company suspension/soft-delete paths not traced in this pass |
| **Implicit, type-unenforced invariant** | `resolveCompanyActorFromUser`/`getActiveMembershipForUser`/`listActiveMembershipsForUser` (`packages/auth/src/identity/company/actor.ts:57-99`) all filter `co."isActive" = true AND co."deletedAt" IS NULL` in their SQL `WHERE` clause — so any `CompanyActor` obtained through the normal auth path structurally cannot represent an inactive/deleted company. But `CompanyActor.company` only exposes `{id, status}` (`actor.ts:21-24`) — not `isActive`/`deletedAt` — so every inline `status !== "APPROVED"` check at the 4 sites above is *implicitly* relying on this upstream guarantee without being able to see or verify it. This is documented in one comment (`get-request-detail-page.ts:109-110`: "Marketplace check via actor — resolveCompanyActorFromUser guarantees isActive: true and deletedAt: null, so only status needs checking") but the other 3 sites carry the same assumption with no comment at all. |
| **Verdict** | **MULTIPLE_IMPLEMENTATIONS + DEAD_ABSTRACTION** — two complete, well-named, exported policy functions exist and are never used; four real call sites independently reimplement a *partial* version of one of them, relying on an unstated upstream guarantee. |

---

## CompanyCoverage

*"Is this request within this company's geographic operating radius?"*

| | |
| --- | --- |
| **Source of truth** | `Company.operatingRadiusKm` + `Company.geoLocation.{latitude,longitude}` vs. `Request.geoLocation.{latitude,longitude}` |
| **Implementations** | **3, by necessity at different scales, but worth naming as 3** — (1) bulk matching: `resolve-request-dispatch-candidates.ts` — SQL `earthdistance`/`cube`, index-accelerated, per-company radius, exact; (2) dashboard list: `get-requests-list-page.ts`'s `queryPaginatedRequests` — same `earthdistance`/`cube` pattern, independently written SQL (not a shared query fragment); (3) single-request detail check: `get-request-detail-page.ts:209-218` — plain JS `getDistanceKm(...)` from `@esigenta/shared`, compared against `company.operatingRadiusKm` in application code, not SQL. |
| **Readers** | The 3 sites above |
| **Writers** | N/A — this is a derived/computed invariant, not a stored fact |
| **Fallbacks** | None found — all 3 implementations correctly use the real `GeoLocation`-backed coordinates with no onboarding-snapshot equivalent (geo refoundation already closed that gap) |
| **Verdict** | **MULTIPLE_IMPLEMENTATIONS, but lower severity than CompanyConfigured** — all 3 are mathematically equivalent (same haversine/great-circle distance, same radius comparison) and read from the same single source of truth (`GeoLocation`, post geo-refoundation), so they cannot currently disagree on *correctness*. The duplication is in *maintenance burden* (one bug fix or precision change must be applied 3 times), not in conflicting answers today. |

---

## RequestPublishable

*"Can this request be transitioned to PUBLISHED?"*

| | |
| --- | --- |
| **Source of truth** | `Request.{creditCost, maxUnlocks}` (must both be set, positive integers) + a resolvable `interventionId`/`geoLocationId` (enforced earlier, at creation) |
| **Implementations** | **1** — `packages/domain/src/admin/requests/review-request.ts`'s `publishReviewedRequest` (lines 111-186): checks `creditCost`/`maxUnlocks` via `isPositiveInteger` (throws `RequestPublishingRequirementsError` otherwise), then writes `status: "PUBLISHED"` unconditionally for both `"APPROVED"` and `"PUBLISHED"` input statuses (`reviewRequest`, line 188-201). |
| **Readers** | `apps/admin/.../requests/[id]/page.tsx`'s `reviewRequestAction` is the only caller |
| **Writers** | Same function — `tx.request.update({ status: "PUBLISHED", reviewedAt, moderationNotes })` |
| **Fallbacks** | None |
| **Verdict** | **SINGLE_SOURCE** — this is the one invariant in the minimum set that already has exactly one implementation, one reader path, one writer. No action needed here beyond confirming it stays that way. |

---

## RequestDispatchable

*"Which companies should receive this request as a new opportunity?"*

| | |
| --- | --- |
| **Source of truth** | `CompanyIntervention` (exact match on `Request.interventionId`) + `Company.{isActive, deletedAt, status, operatingRadiusKm}` + geo distance |
| **Implementations** | **1** — `resolve-request-dispatch-candidates.ts`'s `resolveCandidates`, called exclusively from `create-request-dispatches-for-request.ts`, called exclusively from `publishReviewedRequest`. Already fully audited in the geo refoundation (`docs/geo-refoundation/`). |
| **Readers/Writers** | Same chain; `RequestDispatch`/`CompanyNotification`/`NotificationDelivery` rows are the only output |
| **Fallbacks** | None — strictest of all the invariants in this inventory, by design, and the one that exposed `CompanyConfigured`'s divergence in the first place (matching's strictness is correct; the other readers' looseness is the actual problem) |
| **Verdict** | **SINGLE_SOURCE** — the second clean invariant. Worth highlighting as the template the others should converge toward, not something to change itself. |

---

## RequestVisibleToCompany

*"Should this company see this request, and under what label?"*

| | |
| --- | --- |
| **Source of truth** | Intentionally **not single** — this invariant legitimately branches into two different questions that get conflated under one name |
| **Implementations** | (1) **Browse/dashboard visibility** (`get-requests-list-page.ts`): status ∈ {APPROVED, PUBLISHED}, not archived/deleted, within bounding-box+earthdistance radius, `interventionId` ∈ the company's *visibility set* — which is the union of `CompanyIntervention` (real) and the onboarding-fallback-derived set when `CompanyCategory` is empty (the `CompanyConfigured` divergence leaking into this invariant too). (2) **Detail-page visibility** (`get-request-detail-page.ts`): status ∈ {APPROVED, PUBLISHED}, not archived/deleted, has `geoLocationId`, distance ≤ `operatingRadiusKm` via plain JS — but **does not check `CompanyIntervention` membership at all**, only company geo/radius and request status. A company could open `/area-impresa/richieste/:id` directly (e.g. from a stale link, or a notification for a request they were once eligible for but have since reconfigured away from) and see full detail without an intervention match, as long as geography still lines up. (3) **Saved requests** (`get-saved-requests-page.ts`) and (4) **Purchased/unlocked requests** (`get-purchased-requests-page.ts`): neither re-checks geo, status, or intervention eligibility at all — visibility here is entirely defined by the existence of a `CompanySavedRequest` or `RequestUnlock` row, which is correct and intentional (once saved/unlocked, a request should stay visible to that company regardless of later eligibility drift), but worth naming explicitly as a **4th, deliberately different** rule so it isn't mistaken for an inconsistency. |
| **Readers** | The 4 page-data functions above; each is its own reader and decider, no shared "is this request visible to this company" predicate exists anywhere |
| **Writers** | N/A — derived |
| **Fallbacks** | The `CompanyConfigured` onboarding fallback, inherited into (1) only |
| **Verdict** | **MULTIPLE_IMPLEMENTATIONS** — 4 independent decision paths for "can this company see this request," 2 of which (browse vs. detail) can disagree with each other on intervention-eligibility grounds even before the `CompanyConfigured` issue is considered, and the other 2 are correctly exempt for a different, legitimate reason that should be made explicit rather than left implicit. |

---

## NotificationEligible

*"Who should be notified, and through which channel(s)?"*

| | |
| --- | --- |
| **Source of truth** | Two genuinely distinct sub-invariants, currently both correctly separated but worth naming so future work doesn't merge them incorrectly |
| **Implementations** | (1) **New-request dispatch notifications** — decided exactly once, at publish time, by `resolveCandidates` (same as `RequestDispatchable` above) → `CompanyNotification`/`NotificationDelivery` rows created in the same transaction. (2) **Conversation message notifications** — decided per-message, by `internal/conversation/side-effects.ts`'s `loadMessageContext`/`processConversationMessageSideEffects` (not fully traced line-by-line in this pass, but confirmed structurally): recipients are "every other participant in the conversation," filtered to active users via `memberships: { where: { user: { isActive: true, deletedAt: null } } }` (`side-effects.ts:198-202`) — a membership-graph traversal, not a matching computation. These two are correctly different mechanisms for correctly different questions ("who is newly eligible for this opportunity" vs. "who else is already in this conversation") and should **not** be consolidated into one function — only documented as intentionally separate, which they currently are not (no shared doc or comment ties them together as "the two kinds of notification eligibility in this system"). |
| **Readers/Writers** | (1): `create-request-dispatches-for-request.ts`. (2): `internal/conversation/side-effects.ts`, triggered from `send-message.ts` and the customer-side equivalent (not traced in this pass). |
| **Fallbacks** | None in either path |
| **Verdict** | **EXPECTED_DIVERGENCE** (a new classification needed for this inventory — not a bug, not duplication of the *same* decision, but two different decisions sharing a name). Recommend the upcoming phases explicitly document this split rather than attempt to force one function. |

---

## CompanyCanUnlockRequest

*"Can this company spend credits to unlock this request?"*

| | |
| --- | --- |
| **Source of truth** | `Request.{status, creditCost, maxUnlocks, unlockCount, customerId}` + `RequestUnlock` (existing-unlock check) + `Company` credit balance (via `@esigenta/billing`) |
| **Implementations** | **1** — `unlock-request.ts`'s `unlockCompanyRequest` (lines 51-202): company-approved check (inline, see `CompanyMarketplaceReady` above), `UNLOCKABLE_STATUSES = ["APPROVED", "PUBLISHED"]` (line 49), commercial-configuration check, existing-unlock check, credit debit via `debitCompanyCreditsInTransaction`, all inside one transaction with `FOR UPDATE` row locking. |
| **Readers/Writers** | Same function; the only writer of `RequestUnlock` |
| **Fallbacks** | None |
| **Verdict** | **SINGLE_SOURCE** for the unlock-specific logic, but it **duplicates** the `CompanyMarketplaceReady` status check inline (line 56) rather than calling a shared policy function — listed here again because this is exactly the kind of duplication Phase 1+ should eliminate by having this function call one canonical `CompanyMarketplaceReady` check instead of repeating `status !== "APPROVED"` itself. |

---

## CompanyCanContactClient

*"Can this company open/use a conversation with this request's customer?"*

| | |
| --- | --- |
| **Source of truth** | `RequestUnlock` (must exist, `refundedAt IS NULL`) + `Request.customerId` |
| **Implementations** | **2, consistent with each other but separately written** — (1) `contact-customer.ts`'s `contactCustomerForRequest` (lines 41-168): checks `RequestUnlock` exists for (request, company), `refundedAt IS NULL`, `customerId` present, then finds-or-creates the `COMPANY_CUSTOMER` conversation. (2) `internal/conversation/ensure-unlock-conversation.ts`'s `ensureCompanyCustomerConversationForUnlock` (lines 33-215): same three checks (unlock exists, not refunded, customer present), called instead from *inside* `unlock-request.ts`'s transaction, immediately after a successful unlock, to eagerly create the conversation at unlock time rather than waiting for an explicit "contact" action. Both reach the same conclusion via near-identical (but separately written) SQL/Prisma queries — (1) raw SQL, (2) Prisma `findUnique`/`findFirst`. |
| **Readers** | `contact-customer.ts` is called from a company-facing "Apri contatto" action; `ensure-unlock-conversation.ts` is called only from `unlock-request.ts` |
| **Writers** | Both can create the `Conversation`/`ConversationParticipant` rows; `@@unique`-style duplicate prevention relies on each one's own existing-conversation lookup, not a DB constraint, since `Conversation` has no unique constraint on `(requestId, type)` — a race between the two paths (unlock-time auto-creation and a near-simultaneous manual "contact" action) is not impossible, only practically narrow given unlock already creates the conversation eagerly. |
| **Verdict** | **MULTIPLE_IMPLEMENTATIONS** (same decision, two independent expressions) — not currently producing wrong answers, but exactly the kind of "two people had to write the same business rule twice" this refoundation targets. |

---

## CompanyProfileComplete

*"Has this company finished setting up its profile (not just categories/interventions — also operating address, radius, contact info)?"*

| | |
| --- | --- |
| **Source of truth** | **No single definition exists.** This is the one invariant in the minimum set with **zero** named implementations — it is approximated, differently, by whichever code happens to need *a* completeness signal for its own purpose |
| **Approximations found** | (1) `get-requests-list-page.ts`'s `missing_location` code (line ~562, post geo-refoundation: checks `company.geoLocation` presence + `operatingRadiusKm` finiteness) — a *narrow* completeness check, geo-only, used only to gate the browse dashboard. (2) `CompanyConfigured` (above) — a *different* narrow completeness check (categories/interventions), used to gate the same dashboard via a separate `missing_category` code. (3) Nothing checks `website`, `phone` validity beyond signup-time format validation, or any holistic "is this profile presentable" signal — there is no admin-facing or company-facing "profile completeness score" or checklist anywhere in the codebase (confirmed by the absence of any such field/function in the profile page or admin company list). |
| **Readers** | `get-requests-list-page.ts` only, and only for its own two independent gating codes — there is no consumer that asks the holistic question "is this company's profile complete" as a single thing |
| **Writers** | N/A |
| **Verdict** | **NO_CANONICAL_DEFINITION** (distinct from "multiple implementations" — there isn't even one explicit one). If a genuine `CompanyProfileComplete` concept is wanted (e.g. for an admin checklist, or a company-facing "complete your profile" banner), it does not exist yet anywhere and would need to be designed, not consolidated from competing versions. Flagging this distinction matters for Phase 2: `isCompanyMarketplaceReady()` per the next phase's brief should probably *compose* `CompanyConfigured` + geo-configured + coverage-configured (exactly as Phase 2's own requirements list says), rather than wait on a separate `CompanyProfileComplete` that doesn't currently exist in any form. |

---

## Cross-cutting observations (not one of the 10, but found while inventorying all of them)

- **Two fully dead policy modules** (`isCompanyMarketplaceEnabled`, the `marketplace-policy.ts` trio) — exported, documented, never called. These are not legacy leftovers from a removed feature; nothing in the git history surfaced suggests they were ever wired up. They appear to have been written as the "correct" abstraction and then bypassed by every real call site, which inlined the check instead. This is a useful, concrete data point for Phase 1/2: a canonical function already exists in skeleton form for `CompanyMarketplaceReady` — it doesn't need to be invented, it needs to be *adopted* (and the weaker, also-dead `isCompanyMarketplaceEnabled` retired in its favor, since `marketplace-policy.ts`'s version is strictly more correct).
- **No shared "is this request visible to this company" predicate exists at all** — every one of the 4 `RequestVisibleToCompany` readers computes its own answer from raw `Company`/`Request`/`CompanyIntervention`/`RequestUnlock`/`CompanySavedRequest` data, independently.
- **The actor-resolution implicit guarantee** (`isActive`/`deletedAt` filtered before a `CompanyActor` is ever handed to business logic) is real and currently correct, but undocumented at 3 of its 4 dependent call sites — a future refactor of `actor.ts` could silently break all of them without any type error, since `CompanyActor.company` doesn't expose the fields the guarantee is about.

---

## Coverage statement

Every invariant in the minimum set required by this phase has been mapped:
`CompanyConfigured`, `CompanyMarketplaceReady`, `CompanyCoverage`,
`RequestPublishable`, `RequestDispatchable`, `RequestVisibleToCompany`,
`NotificationEligible`, `CompanyCanUnlockRequest`,
`CompanyCanContactClient`, `CompanyProfileComplete`. Searches were
file-content greps across `packages/` and `apps/` for the relevant status
fields, function names, and error codes, followed by direct reading of
every matched file — not a sampling. Where a search may have missed a
caller (e.g. customer-side conversation message side effects, not fully
traced), that gap is noted explicitly in the relevant section rather than
silently assumed complete.

**Gate status: every invariant mapped. Phase 0 complete.**
