# PRE-COMMIT HEALTH AUDIT

Date: 2026-06-22
Scope: audit only, no code changes. Evidence-based — every finding below
traces to a specific file, a specific repo-wide search result, or a live
check against the real Neon database (`Esigenta`, project
`purple-glitter-37268985`) or the real `.env`. No theoretical or
future-improvement items are included.

---

## TASK 1 — Unresolved issues, classified

### BLOCKER

**B1 — A real customer's request cannot enter the moderation pipeline if
the verification email doesn't arrive, and there is no fallback.**
Confirmed by tracing the full lifecycle: a funnel submission creates a
`Request` with `status: PENDING_VERIFICATION` and sends a verification
email via the shared Resend client. Only when the customer clicks that
link does the request advance to `PENDING_REVIEW`, which is the *first*
status `list-admin-requests.ts`'s default fetch (`defaultAdminRequestStatuses`)
will ever surface to an admin. `PENDING_VERIFICATION` is referenced
*only* as a dashboard count metric (`admin-dashboard.ts:31`) — never in
the moderation queue itself. `review-request.ts` (the only admin
approve/publish/reject action) does not check or set `verifiedAt`
anywhere — confirmed via search, zero matches — meaning there is no
admin-side override to push a request forward without the customer's
email link. **If the verification email fails to deliver, the request is
permanently stuck, invisible to admin, with no recovery path in the
product.**

**B2 — That verification email rides on the same Resend
configuration already documented as not production-ready.**
`docs/archive-legacy/bugs/EMAIL_SYSTEM_RELIABILITY_AUDIT.md` (this repo, prior session)
found: sandbox/testing mode, `domainsCount = 0` (no verified sending
domain), sender `Esigenta <onboarding@resend.dev>` / `FixPro <onboarding@resend.dev>`
— Resend will reject delivery to any recipient outside the
account's allowlisted test address. Re-checked this session:
`RESEND_API_KEY` and `RESEND_FROM_EMAIL` are both populated with
non-trivial values in the real `.env` (confirmed by length, not content)
— the integration is wired and credentialed, the blocker is specifically
the unverified sending domain / sandbox restriction, not a missing key.
This was not re-verified live against the Resend dashboard in this pass
(no Resend API access available here) — cited as still current because
nothing in this session touched domain configuration. **Combined with
B1, this is the single highest-impact issue in the system**: it doesn't
just degrade notifications (the previously-documented effect), it can
fully block new customer requests from ever reaching a human.

**B3 — A company cannot complete its first paid transaction today: zero
sellable credit packages exist.** `CreditPackage` has 0 rows in the real
database. `unlock-request.ts` requires a positive credit balance;
`debitCompanyCreditsInTransaction` correctly returns `insufficient_credits`
rather than crashing, but with no `CreditPackage` to purchase, a company
has no way to ever acquire credits — Stripe checkout (`checkout-order.ts`
→ `create-credit-checkout-session.ts`) is fully wired and credentialed
(`STRIPE_SECRET_KEY`/`STRIPE_PUBLISHABLE_KEY`/`STRIPE_WEBHOOK_SECRET` all
populated, confirmed by length), but it checkouts *against* a
`CreditPackage` row that doesn't exist yet. No admin "manually grant
credits" feature exists either — searched for an `ADMIN_ADJUSTMENT`-creating
function or admin UI action and found none (the enum value exists, no
code path produces it). **This is a configuration gap, not a code defect**
— a real admin page already exists (`apps/admin/.../crediti/pacchetti/page.tsx`)
backed by working domain functions (`createCreditPackage` et al.) — but
until someone uses it, no company can unlock anything, ever, regardless
of how correct the rest of the pipeline is.

### HIGH

**H1 — `CompanyApproved` produces no notification on any channel**
(confirmed in Phase 4, `04_NOTIFICATION_ARCHITECTURE.md`). A company has
no way to learn it was approved except by independently checking. Not a
hard blocker (the company can still log in and see its own status), but
a real first-impression gap for the only two-sided flow this marketplace
has.

**H2 — `RequestVisibleToCompany`'s detail-page gate is still scoped to
"recommended," not "visible"** (confirmed in `03A_VISIBILITY_RECOMMENDATION_AUDIT.md`,
not yet corrected — "Phase 3B" was identified and never executed). A
company cannot open a specific request's detail page (direct link,
search, or — in the one case actually mitigated — a notification it was
dispatched for) unless it's a live recommendation match or has prior
unlock/save/dispatch history. This contradicts the stated product
semantics ("configured interventions do not limit exploration") but does
**not** block the core transactional flow for a company that is correctly
configured and matched — the company this database actually has
(`sp ristrutturazioni`) can see and open its one real matching request
today, confirmed live in Phase 3's validation.

### MEDIUM

**M1 — No retry worker processes `FAILED`/stale `PENDING` `NotificationDelivery`
rows.** Retry metadata (`nextAttemptAt`, `attemptCount`) is correctly
written but nothing reads it to actually retry — already documented in
`EMAIL_SYSTEM_RELIABILITY_AUDIT.md`, re-confirmed unchanged in Phase 5.
A failed email (e.g. the one real `FAILED` delivery row in this database
right now) stays failed forever unless someone manually re-runs the
process.

**M2 — 3 historical `GeoLocation` orphan rows** — already found and
**already cleaned up** in Phase 6 of this session; mentioned here only
for completeness of "currently unresolved," and the answer is: resolved,
not outstanding.

### LOW

**L1 — `RequestStatus.CLOSED` is read everywhere, written nowhere**
(Phase 6, documented, intentionally not removed/built — this is a
missing "mark as closed" admin action, not a bug in what exists).

**L2 — `CompanyProfileData`-style minor dead-passthrough patterns may
still exist elsewhere** in code this session's phases didn't reach (the
credit-system enum sweep flagged in Phase 5 as out-of-depth). Not
confirmed as a real issue — flagged as an open question, not a finding.

---

## TASK 2 — Credit system audit, lite

| Component | Status | Evidence |
| --- | --- | --- |
| `CreditLot` / `CreditLotConsumption` (FEFO ledger) | **Actively used, correctly implemented** | `packages/billing/src/credits/lot-ledger.ts` — real FEFO consumption planning, lazy expiration, idempotent transaction creation. Zero rows in the database purely because zero credits have ever been purchased or granted (see B3) — not because the code is unused. |
| `CompanyCreditAccount.balance` | **Active, and correctly a cache, not a duplicate source of truth** | `syncCompanyCreditAccountCacheInTransaction` (named exactly for this) re-derives it from `CreditLot` after every mutation — confirmed by reading `debitCompanyCreditsInTransaction`'s call sequence. No drift risk found: every credit-mutating path goes through the same sync call. |
| `CreditOrder` / Stripe checkout | **Actively used, fully wired** | `checkout-order.ts`, `create-credit-checkout-session.ts`, `stripe-webhook.ts`, `fulfillment.ts` — real Stripe session creation and webhook-driven fulfillment into `CreditLot`. Stripe credentials are populated in the real `.env` (confirmed by length). Blocked today only by B3 (no `CreditPackage` to sell), not by missing code or missing credentials. |
| Unlock flow (`unlock-request.ts`) | **Actively used, correctly implemented** | Row-locked (`FOR UPDATE`), idempotent debit, graceful `insufficient_credits` handling, eager conversation creation on success. No issues found. |
| `CreditRefundRequest` / refund workflow | **Actively used, not yet exercised** | `credit-ledger.ts`'s refund path, admin UI page confirmed (`apps/admin/.../crediti/rimborsi/richieste/page.tsx`). Zero rows because nothing has been unlocked yet (B3's downstream consequence), not because it's unbuilt. |

**Overall**: the credit system is **not dead and not meaningfully
overengineered** for what it does — the FEFO/lot model is more
sophisticated than a bare balance counter, but it exists for a real,
already-declared business rule (`CreditPackage.validityDays` — credits
expire), and the codebase already disciplines the complexity behind one
sync point (`syncCompanyCreditAccountCacheInTransaction`) rather than
letting it leak into every caller. The honest characterization is:
**fully built, fully wired to a real payment provider, currently
unconfigured** (B3) — a launch-checklist gap, not an architecture
problem.

---

## TASK 3 — Table necessity audit

| Table | Classification | Reasoning |
| --- | --- | --- |
| `Sector`, `Category`, `CategoryAlias`, `ProjectGroup`, `ProjectGroupAlias`, `Intervention`, `InterventionAlias` | **CORE** | Taxonomy backs the funnel, matching, and dispatch — nothing works without it |
| `Company`, `CompanyCategory`, `CompanyIntervention`, `CompanyMembership` | **CORE** | Company identity and the sole matching configuration |
| `GeoLocation` | **CORE** | Required by matching/dispatch/visibility |
| `User`, `Session`, `Account`, `Verification`, `AdminProfile` | **CORE** | Authentication and authorization, owned partly by Better Auth |
| `Customer`, `CustomerAccessToken` | **CORE** | The funnel cannot complete without lightweight customer identity and the verification-token mechanism (see B1) |
| `Request`, `RequestPhoto` | **CORE** | The product's central object |
| `RequestDispatch`, `CompanyNotification`, `NotificationDelivery` | **CORE** | The actual value proposition — matching companies to work — depends entirely on this layer |
| `RequestUnlock`, `CompanySavedRequest` | **CORE** | The monetization moment (unlock) and a basic, expected UX feature (save) |
| `Conversation`, `ConversationParticipant`, `Message` | **CORE** | The actual contact mechanism between company and customer — without this, an unlock is worthless |
| `CompanyCreditAccount`, `CreditOrder`, `CompanyCreditTransaction`, `CreditLot`, `CreditLotConsumption`, `CreditPackage` | **CORE** | Required for the one paid action in the product (see B3 — core but currently unconfigured, which is different from unnecessary) |
| `CreditRefundRequest` | **SUPPORT** | Needed once disputes happen; the marketplace works on day one without a single refund ever being filed |
| `CompanyContactChangeRequest` | **SUPPORT** | A moderated edge-case workflow (phone number change); not on the critical path for a company's first transaction |
| `CreditLot` / `CreditLotConsumption` (FEFO mechanics specifically, as distinct from "credits exist at all") | **PREMATURE, but already built and correctly so** | A simple non-expiring balance counter would have sufficed for a literal day-one launch with zero purchase volume; the FEFO/expiry model is more machinery than the first transaction strictly needs. Not flagged for removal — it is already correctly implemented and serves a real, already-declared product rule (credit validity windows) that would otherwise need to be retrofitted later at higher cost. "Premature" here describes when it was built relative to launch, not that it's wrong to have. |

No table was found to be **OPTIONAL** in the sense of "exists for no
confirmed reason" — every table traced back to a real, current feature
across this entire audit series (Phases 0–6 plus this pass).

---

## TASK 4 — Final production readiness

**What would stop a real customer and a real company from using the
marketplace today?**

For the **customer**: nothing stops them from *submitting* a request.
What stops the request from ever being acted on is B1+B2 — if their
verification email doesn't arrive (likely, given Resend's current
sandbox/unverified-domain state), their request sits at
`PENDING_VERIFICATION` forever, invisible to admin moderation, with no
recovery path anywhere in the product.

For the **company**: nothing stops them from signing up, configuring
services, and seeing matching requests on their dashboard (confirmed
working end-to-end, live, multiple times across this audit series). What
stops them from completing their first real transaction is B3 — there is
nothing to buy, so there are no credits, so `unlockCompanyRequest` always
returns `insufficient_credits`, so the contact/conversation layer (fully
built and correct) never gets exercised for a real, paying company.

**Neither of these is a code defect requiring a rewrite.** B1/B2 needs a
verified sending domain in Resend (an infrastructure/account
configuration task) plus, ideally, an admin fallback for manually
advancing a stuck `PENDING_VERIFICATION` request (a small, well-scoped
feature this audit does not propose implementing here, since this is an
audit-only pass). B3 needs exactly one `CreditPackage` row created
through the admin UI that already exists for that purpose.

---

## FINAL ANSWERS

```txt
BLOCKERS_FOUND = 3
  B1: PENDING_VERIFICATION requests have no path forward if the
      verification email fails, and no admin override exists.
  B2: Email delivery itself is not production-ready (sandbox/unverified
      domain) — the underlying cause of B1's failure mode.
  B3: Zero CreditPackage rows exist — companies have nothing to purchase,
      so unlocking is unconditionally blocked by insufficient_credits.
HIGH_PRIORITY_ISSUES = 2
  H1: CompanyApproved produces no notification on any channel.
  H2: RequestVisibleToCompany's detail-page gate still implements
      "recommended," not "visible" (Phase 3B, identified, not yet done).
EMAIL_STATUS = NOT PRODUCTION READY — credentials are present and the
  integration is correctly wired (confirmed this session), but the
  sending domain is unverified/sandboxed (per the prior dedicated email
  audit, not contradicted by anything found here), and it is now confirmed
  to be a harder blocker than previously scoped: it can prevent a request
  from ever reaching moderation, not just degrade notifications about it.
CREDIT_SYSTEM_STATUS = FULLY BUILT, CORRECTLY IMPLEMENTED, CURRENTLY
  UNCONFIGURED — Stripe-integrated, FEFO ledger with a disciplined cache
  sync point, zero drift risk found. Blocked today by a missing
  CreditPackage row, not by missing code.
PREMATURE_TABLES_FOUND = 1 (CreditLot/CreditLotConsumption's FEFO
  expiry mechanics — already correctly built, not recommended for
  removal, "premature" only in the sense of being more than a literal
  day-one launch strictly requires)
SAFE_TO_COMMIT = YES, for the code currently in the working tree — every
  phase across this audit series typechecked clean, was validated against
  the real database, and no new defect was introduced or found in this
  pass. "Safe to commit" is a different question from "ready to onboard a
  real paying customer today," and the answer to the second question is
  NO until B1/B2/B3 are resolved — none of which require a code change,
  all of which require an infrastructure/configuration action outside
  this repository's source code.
```
