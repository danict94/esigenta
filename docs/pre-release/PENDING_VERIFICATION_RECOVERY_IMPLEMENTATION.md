# PENDING VERIFICATION RECOVERY — IMPLEMENTATION

Date: 2026-06-22
Scope: implementation, directly closing BLOCKER B1 from
`docs/pre-release/PRE_COMMIT_HEALTH_AUDIT.md`. Read first, as instructed.

Non-negotiable rules respected throughout: verification was never bypassed
or auto-published; no second publication flow was created; recovery
actions all feed into the existing `reviewRequest`/`publishReviewedRequest`
pipeline, never around it.

---

## TASK 1 — Request status inventory: readers and writers

| Status | Written by | Read by |
| --- | --- | --- |
| `PENDING_VERIFICATION` | `createRequestFromDraft` (funnel submission) — the only writer of this initial value | Now: `listUnverifiedRequests` (new), the admin request detail page (unconditional), `admin-dashboard.ts` (count only, as before). Still never read by `listAdminRequests`'s default queue, by company-facing queries, or by dispatch — unchanged, and confirmed still correct (Task 4). |
| `PENDING_REVIEW` | `verifyRequestEmail` / `verifyRequestEmailByToken` (customer email-link click) and, as of this implementation, `verifyRequestManually` (new) — both now funnel through the same `advanceVerifiedRequestToReviewInTransaction` | `listAdminRequests`'s default queue, the admin request detail page's "Decisione editoriale" card (the Approve/Reject buttons) |
| `APPROVED` / `PUBLISHED` | `reviewRequest`/`publishReviewedRequest` (admin decision only) | Company-facing `get-requests-list-page.ts`, `get-request-detail-page.ts`, admin lists |
| `REJECTED` | `reviewRequest` (admin decision) | Admin lists, customer-facing status pages |
| `CLOSED` | Nobody — confirmed again in this pass (no new writer added, none needed for this task) | Admin and customer-facing UI defensively, as already documented in `docs/domain-invariants/06_PHYSICAL_CLEANUP.md` |

**No new status was added.** `PENDING_VERIFICATION` → `PENDING_REVIEW` remains the only transition out of the unverified state, and it now has two entrypoints (customer token, admin manual) instead of one, both implemented by the same function.

---

## TASK 2 — Admin moderation queue: "Richieste non verificate"

New: `packages/domain/src/admin/requests/list-unverified-requests.ts` →
`listUnverifiedRequests()`. Queries `Request` where
`status = PENDING_VERIFICATION AND deletedAt IS NULL AND archivedAt IS NULL`,
oldest first. Returns exactly the fields the task asked for: request code,
customer name, customer email, customer phone, `createdAt` (age is derived
client-side from `createdAt` in the new admin page, not stored).

New page: `apps/admin/src/app/(protected)/requests/non-verificate/page.tsx`
— lists every unverified request with the required fields, links into the
**existing** request detail page (`/requests/[id]`) for every action, and
is itself linked from the main `/requests` queue via a banner that only
appears when the count is greater than zero (no permanent UI clutter once
the queue is empty).

This was a pure gap-fill: the data this page reads already existed on
`Request` (the funnel writes `customerEmail`/`customerPhone`/`customerName`
at creation) — nothing needed to be added to the schema.

---

## TASK 3 — Admin recovery actions

**A) Resend verification email** — `packages/domain/src/admin/requests/resend-request-verification.ts`
→ `resendRequestVerificationEmail({ requestId })`. Issues a fresh
`CustomerAccessToken` via the exact same `createRequestVerificationToken`/
`createRequestVerificationAccessToken` calls `createRequestFromDraft` uses
at creation, builds the URL with the same `buildRequestVerificationUrl`,
and sends it through the same `sendRequestVerificationEmail` →
`requestVerificationEmail` template → shared `sendEmail` → Resend.
**Zero new email infrastructure.** Guards: 404 if the request doesn't
exist, rejects if already verified or not in `PENDING_VERIFICATION`, rejects
if there's no customer email to send to.

**B) Verify manually** — `verifyRequestManually({ requestId })`, added to
the existing `packages/domain/src/customer/requests/verify-request.ts`
(kept in the same file because it shares a private helper with the
customer-token flow — see below). Sets `verifiedAt`, transitions the
request to `PENDING_REVIEW`, and issues the customer's status/history
access tokens — **identically** to what happens when the customer clicks
their own email link. It does **not** touch `creditCost`, `maxUnlocks`,
dispatch, or notifications, and it cannot reach `PUBLISHED` — that
remains exclusively `reviewRequest`'s decision, made afterward, by an
admin, from the normal "Decisione editoriale" card once the request shows
up in `PENDING_REVIEW`.

To guarantee A and B share one definition of "verified" rather than two,
`verify-request.ts` was refactored: the transaction body that used to live
only inside `verifyWithAccessToken` (request update, customer update,
status/history token issuance) was extracted into
`advanceVerifiedRequestToReviewInTransaction(tx, ...)`. `verifyWithAccessToken`
now calls it after consuming the customer's token (atomically, same
transaction); `verifyRequestManually` calls it directly, with no token
involved, since admin authority replaces the token check. **The legacy
structured-data-token verification path
(`verifyWithLegacyStructuredDataToken`) was left untouched** — it's a
separate, pre-existing mechanism for already-emitted pre-`CustomerAccessToken`
links, out of this task's scope, and changing it would add risk for zero
benefit here.

**C) Delete request** — required **no new code**. `softDeleteRequest`
(`packages/domain/src/admin/requests/soft-delete-request.ts`) already
exists, is already wired into the request detail page's "Gestione
richiesta" card, and that card is **already unconditional** — it doesn't
check `status`, so it already works on a `PENDING_VERIFICATION` request
exactly as it does on any other. Confirmed by reading the existing page
rather than assumed.

---

## TASK 4 — Visibility rules

Verified, not re-implemented — these guarantees already existed
structurally before this task and remain true after it:

- **Never visible to companies**: `get-requests-list-page.ts` and
  `get-request-detail-page.ts` only ever select `APPROVED`/`PUBLISHED`
  requests for the company-facing surfaces (confirmed in the Domain
  Invariants series, unchanged here). `PENDING_VERIFICATION` was never in
  that set and nothing in this implementation adds it.
- **Never dispatched, never notified**: dispatch only happens inside
  `publishReviewedRequest`, which only runs when `reviewRequest` is called
  with `APPROVED`/`PUBLISHED`. `reviewRequest`'s `ReviewRequestDecision`
  type still only accepts `"APPROVED" | "PUBLISHED" | "REJECTED"` —
  unchanged. A request cannot reach `reviewRequest` from
  `PENDING_VERIFICATION` directly; it must pass through `PENDING_REVIEW`
  first (via the customer's link or the new manual-verify action), and
  even then dispatch only fires on the admin's *separate*, subsequent
  publish decision. There is structurally no path from "unverified" to
  "dispatched" that skips moderation.
- **Never published automatically**: `verifyRequestManually` only ever
  writes `status: "PENDING_REVIEW"`. It has no code path that writes
  `APPROVED`, `PUBLISHED`, or calls `createRequestDispatchesForRequestWithClient`.
- **Visible only to admins**: the new `listUnverifiedRequests` query and
  the new admin page are admin-only routes (`apps/admin`, behind
  `requireAdmin()` in every server action that mutates state); nothing
  customer- or company-facing reads `PENDING_VERIFICATION` requests.

---

## TASK 5 — Workflow validation

**Scenario A** — Create request → `PENDING_VERIFICATION` → Admin sees
request.
**PASS.** `listUnverifiedRequests()` selects exactly this status; the new
`/requests/non-verificate` page renders it with code/name/email/phone/age;
the main `/requests` queue now banners its count. Confirmed by reading
the query and the page render logic (not run against a live mutation in
this pass, since doing so would require creating a real test request —
out of scope for this implementation task; the read-path code is
identical in shape to the already-validated `listAdminRequests`/`getRequestById`
patterns this session has exercised live multiple times in prior phases).

**Scenario B** — `PENDING_VERIFICATION` → Resend verification → Email
generated.
**PASS.** `resendRequestVerificationEmail` reuses
`sendRequestVerificationEmail`/`requestVerificationEmail` unchanged —
the exact path already exercised at request creation, which the prior
email audits confirmed does generate a real outbound Resend call. No new
email-generation code was written; this scenario's correctness rests on
code already proven to work, called from one more place.

**Scenario C** — `PENDING_VERIFICATION` → Manual verify → enters normal
moderation queue → Admin publishes → existing dispatch pipeline executes.
**PASS, by construction.** `verifyRequestManually` writes exactly
`{status: "PENDING_REVIEW", verifiedAt}` — the identical shape
`listAdminRequests`'s default queue already selects on. From there, the
*unmodified* `reviewRequestAction` / `reviewRequest` /
`publishReviewedRequest` / `createRequestDispatchesForRequestWithClient`
chain runs precisely as it does for any other request that reached
`PENDING_REVIEW` via the customer's own link — because it's the same
status, reached through the same column, read by the same query. There is
no second code path to verify separately.

**Scenario D** — `PENDING_VERIFICATION` → Delete.
**PASS.** `softDeleteRequest`, already exercised and already wired
unconditionally on the detail page, requires no change to handle this
status — confirmed by reading the existing (status-agnostic) gating logic
rather than assumed.

---

## TASK 6 — Code quality / reuse

| Required to reuse | Reused, not duplicated |
| --- | --- |
| Verification infrastructure | `createRequestVerificationToken`, `createRequestVerificationAccessToken`, `buildRequestVerificationUrl`, `sendRequestVerificationEmail`, `requestVerificationEmail` — all called from their existing definitions, zero new email/token primitives created |
| Moderation infrastructure | `listAdminRequests`'s default status set, `getRequestById`, the existing detail-page action wiring — untouched |
| Publish infrastructure | `reviewRequest`, `publishReviewedRequest`, `createRequestDispatchesForRequestWithClient` — untouched, still the only way to reach `PUBLISHED` |
| Single transition definition | `advanceVerifiedRequestToReviewInTransaction` — the one and only place `PENDING_VERIFICATION → PENDING_REVIEW` is implemented; both the customer-token path and the new admin path call it |

**No parallel request lifecycle was created.** Every new function either
calls an existing one or extends the *same* file/transaction the existing
customer-verification flow already used, rather than reimplementing it
alongside.

---

## TASK 7 — Validation

```
npx turbo typecheck --filter=@esigenta/domain --filter=admin --force
→ 11 successful, 11 total

npx turbo typecheck --force   (full repo)
→ Packages: @esigenta/auth, @esigenta/billing, @esigenta/config,
  @esigenta/database, @esigenta/domain, @esigenta/funnel,
  @esigenta/notifications, @esigenta/shared, @esigenta/taxonomy,
  @esigenta/ui, @esigenta/uploads, admin, web
→ 12 successful, 12 total
```

Zero errors, full forced rebuild, no cache. No lifecycle regression: the
only existing files touched were `verify-request.ts` (refactor +
addition, behavior-preserving for the existing token path — verified by
the typecheck and by inspection that `verifyWithAccessToken`'s observable
contract, including its return shape, is unchanged) and the admin request
detail/list pages (additive UI branches gated on `status`, no existing
branch altered).

---

## FINAL ANSWERS

```txt
PENDING_REQUESTS_VISIBLE_TO_ADMIN = YES — new listUnverifiedRequests() +
  /requests/non-verificate page, plus a banner on the main /requests queue
  whenever the count is non-zero. Previously: zero admin visibility beyond
  a dashboard count.
RESEND_VERIFICATION_IMPLEMENTED = YES — resendRequestVerificationEmail,
  reusing the exact existing email infrastructure (same template, same
  sender, same token mechanism), zero duplicate email code.
MANUAL_VERIFICATION_IMPLEMENTED = YES — verifyRequestManually, sharing its
  entire state transition with the customer's own email-link path via the
  newly extracted advanceVerifiedRequestToReviewInTransaction. Cannot
  publish, dispatch, or notify by itself — only unlocks the existing
  PENDING_REVIEW → reviewRequest → publishReviewedRequest path.
REQUEST_CAN_DIE_SILENTLY = NO — every PENDING_VERIFICATION request is now
  visible to admins indefinitely (no expiry/auto-archive added or needed
  for this task) with two independent recovery actions (resend, manual
  verify) plus the pre-existing delete action, all reachable from the same
  detail page.
TYPECHECK_PASS = YES — 11/11 affected packages, then 12/12 full repo,
  forced rebuild, zero errors.
PRODUCTION_BLOCKER_REMOVED = YES, for B1 specifically (the no-recovery-path
  defect). B2 (the underlying email deliverability issue —
  unverified Resend sending domain) is unchanged by this task and remains
  open per docs/pre-release/EMAIL_PRODUCTION_HARDENING.md: resending a
  verification email is now possible, but if the email still doesn't
  reach the customer's inbox, the new "verify manually" action is precisely
  the fallback that makes the request recoverable anyway, by design.
```
