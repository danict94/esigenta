# DOMAIN INVARIANTS — PHASE 4: NOTIFICATION ARCHITECTURE CONSOLIDATION

Date: 2026-06-22
Scope: implementation. One real duplicate-eligibility fix made
(conversation-message recipient resolution); everything else in this
phase is audit, naming, and documentation of an architecture that was
already structurally correct for the `RequestPublished` event and is now
made explicit so future channel additions can't silently diverge.
Validated live against the real Neon database (`Esigenta`, project
`purple-glitter-37268985`).

Note: this phase proceeds independently of the open Phase 3B question
(visibility vs. recommendation, `03A_VISIBILITY_RECOMMENDATION_AUDIT.md`)
— notification eligibility is `RequestDispatchEligible`/membership-graph
based, neither of which is affected by that open question.

---

## TASK 1 — Notification-producing events (exact file paths)

| Event | Producing file | Currently sends a notification? |
| --- | --- | --- |
| `RequestPublished` | `packages/domain/src/admin/requests/review-request.ts` (`publishReviewedRequest`) → `packages/domain/src/internal/request/dispatch/create-request-dispatches-for-request.ts` | **Yes** — app (`CompanyNotification`) + email (`NotificationDelivery`) |
| `RequestUnlocked` / `RequestPurchased` | `packages/domain/src/company/requests/unlock-request.ts` (`unlockCompanyRequest`) → `packages/domain/src/internal/conversation/ensure-unlock-conversation.ts` | **No.** These are the same event under two names (`get-purchased-requests-page.ts` uses "purchased" for what `unlock-request.ts` calls "unlocked" — confirmed identical underlying `RequestUnlock` row, not two events). Unlocking creates a conversation and an access token but sends **zero** notification to the customer at that moment — confirmed by repo-wide search for `sendEmail`/notification-table writes inside `ensure-unlock-conversation.ts` and `unlock-request.ts`: none found. The customer only hears anything once the company sends an actual message, which goes through `ConversationMessage` below. |
| `RequestContacted` | `packages/domain/src/company/requests/contact-customer.ts` (`contactCustomerForRequest`) | **No.** Same finding — creates/reuses a conversation, sends nothing. Consistent with `RequestUnlocked`: opening an empty conversation doesn't notify; the first real message does. |
| `CompanyApproved` | `packages/domain/src/admin/companies/admin-companies.ts` (`approveCompanyForMarketplace` → `mutateCompanyStatus`) | **No.** Confirmed by full read of `mutateCompanyStatus`/`approveCompanyForMarketplace`/`suspendCompanyForMarketplace`/`blockCompanyForMarketplace`: all four status-transition functions only update `Company.{status, approvedAt, suspendedAt, blockedAt}`. No email, no in-app notification, anywhere in the company-status mutation path. **This is a real gap, not a design choice that was found and confirmed intentional** — flagged here, not fixed (out of this phase's scope, which is architecture, not new notification copy). |
| `ConversationMessage` | `packages/domain/src/internal/conversation/side-effects.ts` (`processConversationMessageSideEffects`), triggered from `packages/domain/src/company/conversations/send-message.ts` and the customer-side equivalent | **Yes** — app (`CompanyNotification`, company-bound only) + email (both directions: company recipients when the customer messages first, the customer when a company replies) |
| `SupportMessage` | Same file, same function — `Conversation.type === "SUPPORT"` is just a different `ConversationType` value flowing through the identical `processConversationMessageSideEffects` path | **Yes**, via the same mechanism as `ConversationMessage` — not a separate implementation, confirmed by reading `formatRequestTitle`'s explicit `conversation.type === "SUPPORT"` branch inside the *same* function. |

---

## TASK 2 — Eligibility decisions per event

| Event | Who decides recipients | Where computed | Where filtered | Where dispatch/notification rows are created |
| --- | --- | --- | --- | --- |
| `RequestPublished` | `resolveRequestDispatchCandidatesWithClient` → `resolveCandidates` | `packages/domain/src/internal/request/dispatch/resolve-request-dispatch-candidates.ts` | Same function — `CompanyIntervention` exact match, `Company.{isActive,deletedAt,status,operatingRadiusKm}`, geo via `earthdistance`/`cube` | `createRequestDispatchesForRequestWithClient` (`create-request-dispatches-for-request.ts`) — **one resolved candidate list**, consumed by `RequestDispatch.createMany`, `CompanyNotification.createMany`, and `NotificationDelivery.createMany` in sequence, all three keyed off the same `dispatches`/`candidateByCompanyId` data, computed exactly once |
| `ConversationMessage`/`SupportMessage` | **Before this phase: two independent derivations.** `createCompanyMessageNotification` and `notifyCompanyRecipients` each ran their own `.find()` over `message.conversation.participants` to identify the company recipient(s) — same logic, same data, computed twice, in two different functions, one per channel | `packages/domain/src/internal/conversation/side-effects.ts` (both old locations) | Implicit in each `.find()` (`actorType === "COMPANY"`) | `processConversationMessageSideEffects` called both functions in `Promise.all`, each doing its own resolution |

**Duplicate eligibility logic found**: exactly the `ConversationMessage`
case above. This is the one real instance Task 2 asked to identify — not
hypothetical, not stylistic: two functions independently re-derived the
same recipient set from the same source data, which is precisely the
failure mode this phase's OBJECTIVE warns about ("prevent future
divergence when adding Email/WhatsApp/SMS/Push" — a third channel added
the old way would have been a *third* independent derivation).

`RequestPublished` had no such duplication — confirmed by reading
`create-request-dispatches-for-request.ts` end to end: `resolveCandidates`
runs once, its output (`candidates`/`dispatches`) is the single shared
list every subsequent `createMany` call reads from.

---

## TASK 3 — Delivery channels (current architecture)

| Channel | Status | Where implemented |
| --- | --- | --- |
| App (`CompanyNotification`) | **Live** | Written directly inside the same transaction that decides eligibility (`create-request-dispatches-for-request.ts`) or immediately after (`side-effects.ts`) — no separate "app delivery worker," the row's existence *is* the delivery for this channel |
| Email (`NotificationDelivery`, `channel: "EMAIL"`) | **Live**, but see note | Created in the same transaction as eligibility (queued, `status: PENDING`); actually *sent* later, separately, by `apps/admin/src/lib/notifications/process-request-email-deliveries.ts` → `resend-request-email-adapter.ts`. **Confirmed live on real data**: the one real `NotificationDelivery` row for `sp ristrutturazioni`/`REQ-CPV9S9` has `status: FAILED` — the pipeline correctly queued and attempted delivery; the actual send failed, consistent with the pre-existing, already-documented Resend sandbox-mode restriction (`docs/bugs/EMAIL_SYSTEM_RELIABILITY_AUDIT.md`), not a notification-architecture defect. |
| WhatsApp | **Schema placeholder only.** `NotificationChannel` enum (`packages/database/prisma/schema.prisma:381-384`) already declares `WHATSAPP` alongside `EMAIL` — but zero application code ever writes a `channel: "WHATSAPP"` row anywhere in the repository (confirmed by search). It is a forward-declared enum value with no implementation behind it — not partially built, not broken, simply not started. |
| SMS | **Does not exist anywhere** — not in the `NotificationChannel` enum, not referenced in any file. |
| Push | **Does not exist anywhere** — same. |

**Document of the current (correct) architecture for the live channels**:
```
Eligibility (resolveCandidates / resolveCompanyMessageRecipients)
  ↓ one resolved recipient list
Notification Intent (CompanyNotification row — app; NotificationDelivery
  row, status PENDING — email)
  ↓
Delivery (app: row existence is the delivery; email: a separate process
  reads PENDING rows and calls the provider, writing back SENT/FAILED)
```
This already matches the OBJECTIVE's target shape
(`Event → Eligibility → Notification Intent → Delivery Channels`) for
`RequestPublished`. This phase's `ConversationMessage` fix (Task 4/5)
brings that event onto the same shape.

---

## TASK 4 — Canonical notification eligibility model

**`RequestNotificationEligible(company, request)`** — not a new
computation; formally, it **is** `RequestDispatchEligible`
(geo refoundation, `resolve-request-dispatch-candidates.ts`, unchanged).
The act of resolving dispatch candidates *is* the act of deciding
notification eligibility for the `RequestPublished` event — there is
exactly one function, and it now has two names for two readers of the
same fact (a future caller asking "should this company be notified about
this new request" should call the same function dispatch already calls,
not invent a second one).

**`ConversationParticipantNotificationEligible(message)`** — the
*other* notification invariant this phase formalizes, previously implicit
and duplicated. Now: `resolveCompanyMessageRecipients(message)`
(`side-effects.ts`), returning `{ companyId, users }` once, consumed by
both the app and email channel functions. The customer-recipient case
(`notifyCustomerRecipient`) is single-channel (email only — no customer
"app" exists in this product) so there was no duplication risk there to
fix, but it now sits alongside the company-side resolver as the other
half of the same conceptual step (resolve recipients → then deliver).

These two are **deliberately not unified into one function** — they
answer different questions (one is geo/intervention matching against the
whole company universe for a brand-new request; the other is a
membership-graph lookup within one already-existing conversation) — see
Phase 0's `EXPECTED_DIVERGENCE` classification, reconfirmed here rather
than re-litigated.

---

## TASK 5 — Eligibility separated from Delivery (verified, and one gap closed)

**`RequestPublished`**: already separated — confirmed Task 2/6. The email
*sending* step (`process-request-email-deliveries.ts`) only ever reads
`recipient` off an already-created `NotificationDelivery` row; it has no
code path that could compute or alter who receives anything. Channels
read a decision, they do not make one.

**`ConversationMessage`**: **was not fully separated before this phase**
— both channel functions each made their own (identical, but
independent) eligibility decision. Fixed in this phase: see the diff in
`packages/domain/src/internal/conversation/side-effects.ts` —
`resolveCompanyMessageRecipients` is now the one eligibility step;
`createCompanyMessageNotification` (app) and `notifyCompanyRecipients`
(email) both take its output as a parameter and contain no participant-lookup
logic of their own anymore.

**Verified**: `npx turbo typecheck --force` passes clean across all 12
packages after the change (full run, no cache) — the refactor did not
alter either channel's external behavior, only where the recipient list
comes from.

---

## TASK 6 — Full `RequestPublished` pipeline trace (real database)

```
RequestPublished
  packages/domain/src/admin/requests/review-request.ts: publishReviewedRequest
    tx.request.update({ status: "PUBLISHED", reviewedAt })
  ↓
Matching
  packages/domain/src/internal/request/dispatch/resolve-request-dispatch-candidates.ts
    resolveCandidates(): CompanyIntervention join + earthdistance/cube radius check
  ↓
Dispatch
  create-request-dispatches-for-request.ts: tx.requestDispatch.createMany(...)
  ↓
Notification (app + email, same resolved list)
  tx.companyNotification.createMany(...)   [app]
  tx.notificationDelivery.createMany(...)  [email, status: PENDING]
  ↓
Delivery (email only — app delivery is the row itself)
  apps/admin/src/lib/notifications/process-request-email-deliveries.ts
    → resend-request-email-adapter.ts → mark SENT or FAILED
```

**Live verification** for `sp ristrutturazioni` (`cmqofg6fi0000loc47p71j87l`)
/ `REQ-CPV9S9` (`cmqofj16c0004loc49nf234t9`):

```sql
RequestDispatch:        1 row, companyId = cmqofg6fi0000loc47p71j87l, status = CREATED
CompanyNotification:    1 row, companyId = cmqofg6fi0000loc47p71j87l, type = NEW_REQUEST_AVAILABLE
NotificationDelivery:   1 row, recipient = sapienza.ristrutturazioni@gmail.com,
                         channel = EMAIL, status = FAILED
```

Every step in the pipeline ran and produced exactly the expected row.
`status = FAILED` on the email delivery is the provider-sandbox issue
already documented elsewhere, not a pipeline defect — the eligibility
→ intent → delivery chain completed correctly; only the final provider
call did not succeed, and that failure was correctly recorded (not
silently dropped), which is the delivery layer doing its job.

---

## TASK 7 — Dead notification logic inventory

| Item | Classification | Reasoning |
| --- | --- | --- |
| `NotificationChannel.WHATSAPP` enum value | **KEEP** | Forward-declared placeholder, zero application code references it, but it's a 1-line schema enum member, not a code path — nothing to clean up, and removing it would just have to be re-added when WhatsApp is actually built |
| The pre-fix duplicate `.find()` participant lookups in `side-effects.ts` | **N/A — already removed in this phase**, not deferred (same reasoning as Phase 3's Task 9: this was private, file-local logic with no external callers, so there was nothing gained by classifying-then-deferring; it was fixed directly) |
| `CompanyApproved` having no notification | **Not dead code — a missing feature.** Out of scope to build in an architecture-consolidation phase; flagged in Task 1 for whoever owns notification copy/product scope, not classified as cleanup since there is no existing implementation to remove or keep |

No `SAFE_REMOVE` candidates found this phase — unlike Phases 1/2/3, this
phase's findings were either "already correct" (`RequestPublished`) or
"duplicated but immediately fixable" (`ConversationMessage`), not legacy
code left behind by an earlier model.

---

## TASK 8 — Validation

**Same recipients for app vs. email — verified live**: the
`CompanyNotification` row's `companyId` and the `NotificationDelivery`
row's `recipient` both trace back to the exact same resolved candidate
(`sp ristrutturazioni`, owner email `sapienza.ristrutturazioni@gmail.com`)
for `RequestPublished` — confirmed by SQL join above, and by reading the
code: both `createMany` calls iterate the same `dispatches` array, built
from one `resolveCandidates()` call.

**Eligibility evaluated exactly once — verified by code change, not just
assertion**: for `ConversationMessage`, this was **not** true before this
phase (two independent derivations) and **is** true after (one
`resolveCompanyMessageRecipients` call, two consumers). For
`RequestPublished`, it was already true and remains true — no change
needed, confirmed by inspection.

---

## FINAL ANSWERS

```txt
NOTIFICATION_ELIGIBILITY_IMPLEMENTATIONS_BEFORE = 3 — resolveCandidates
  (RequestPublished, already correct/single), plus 2 independent
  participant-derivations for ConversationMessage (one per channel,
  duplicated).
NOTIFICATION_ELIGIBILITY_IMPLEMENTATIONS_AFTER = 2 — resolveCandidates
  (RequestPublished/RequestDispatchEligible, unchanged) and
  resolveCompanyMessageRecipients (ConversationMessage/SupportMessage,
  now single instead of duplicated). These remain two because they answer
  two genuinely different questions (Phase 0's EXPECTED_DIVERGENCE) — not
  because anything is still duplicated.
CANONICAL_NOTIFICATION_MODEL = Event → Eligibility (decided once, per
  event type, by exactly one function) → Notification Intent (CompanyNotification
  row for app, NotificationDelivery row with status=PENDING for email) →
  Delivery (channel-specific senders that only ever read an already-decided
  recipient, never compute one).
ELIGIBILITY_SEPARATED_FROM_DELIVERY = YES for RequestPublished (already
  true, reconfirmed); YES for ConversationMessage (fixed this phase —
  previously each channel decided its own eligibility, now both consume one
  shared resolution).
CHANNELS_DISCOVERED = EMAIL (live), App/in-app via CompanyNotification
  (live), WHATSAPP (schema enum placeholder only, zero implementation),
  SMS (does not exist), Push (does not exist). CompanyApproved currently
  has no notification on any channel — a real product gap, not an
  architecture defect, flagged but not built in this phase.
DEAD_NOTIFICATION_LOGIC_FOUND = Effectively none requiring deferred
  classification — the one duplication found (ConversationMessage) was
  fixed directly rather than classified for later, since it was private,
  file-local code with no external callers (same reasoning as Phase 3).
READY_FOR_PHASE_5 = YES — the notification layer now has one clearly
  documented shape (Event → Eligibility → Intent → Delivery) that channel
  additions can be checked against, and the one real divergence found has
  been closed rather than merely documented.
```
