# TAXONOMY REFOUNDATION — PHASE 12: NOTIFICATION CUTOVER REPORT

**Headline finding, verified rather than assumed:** notifications required zero source changes in this phase, for the same reason dispatch did in Phase 11 — `create-request-dispatches-for-request.ts` already creates `CompanyNotification`/`NotificationDelivery` rows directly off Phase 10's Intervention-only candidate list, and the delivery-processing/email-sending layer (`notification-deliveries.ts`, `apps/admin/.../process-request-email-deliveries.ts`) only ever reads `Request.interventionSlug` (the immutable snapshot) — never `Service`, `Category`, or any junction table. Confirmed by `git status` (no new diffs from this phase) and by real end-to-end execution against the live database, not just by re-reading prior reports.

---

## A. Files Changed

**None.**

---

## B. Notification Flow Audit

Traced `Request → Match → Dispatch → Notification → Delivery` end to end, identifying every entry point:

**Creation side (taxonomy-relevant):**
- `packages/domain/src/internal/request/dispatch/create-request-dispatches-for-request.ts` — the only place that creates `CompanyNotification`/`NotificationDelivery` rows for the request-matching flow. Already audited in full in Phase 11; re-confirmed here with a fresh end-to-end run including the recipient-resolution check (§E).

**A second, unrelated entry point was found and is explicitly out of scope:** `packages/domain/src/internal/conversation/side-effects.ts` also creates `CompanyNotification` rows — for new chat messages in a conversation thread, not request matching. Confirmed by reading it: zero `Service`/`CompanyService`/taxonomy references of any kind. Correctly outside this phase's concern (it's not part of the Request→Match→Dispatch chain), noted here only so "all entry points" (Task 1) is answered completely rather than narrowly.

**Delivery/send side:**
- `packages/domain/src/internal/request/notification-deliveries.ts` — `listPendingEmailNotificationDeliveriesForRequest` (one batched query, selects only `Request.interventionSlug`/`city`/`postalCode`/`requestCode` via a nested Prisma select — no taxonomy join), plus the `markNotificationDeliverySending`/`Sent`/`Failed` state-transition functions (pure status updates by id, zero taxonomy involvement).
- `apps/admin/src/lib/notifications/process-request-email-deliveries.ts` — the admin-side orchestrator: lists pending deliveries, transitions each through `SENDING`, builds email content from `request.interventionSlug` (formatted into a human-readable label, e.g. `"disostruire-scarichi"` → `"Disostruire Scarichi"` — text formatting, not a taxonomy lookup), sends via `resend-request-email-adapter.ts`, transitions to `SENT`/`FAILED`.

---

## C. Legacy Dependencies Found

**None**, confirmed by direct grep of every file in the chain (`notification-deliveries.ts`, `process-request-email-deliveries.ts`, `resend-request-email-adapter.ts`) for `Service|CategoryService|CompanyService|InterventionService|RequestRequiredService|requestMatchingMode`: zero matches across all three files. The creation side's dependencies were already fully removed in Phase 10/11 (re-confirmed in §B above).

---

## D. Legacy Dependencies Removed

**None needed removing — there were none left**, for the same reason as Phase 11: notifications never had their own independent taxonomy dependency. They consume whatever dispatch/matching already resolved (Phase 10) and otherwise only ever touch the permanent `interventionSlug` snapshot, which was never a legacy dependency to begin with (it's explicitly designed as the taxonomy-independent historical record, per the schema's own comment on `Request`).

---

## E. Validation Results

Real end-to-end test against the live database (company configured with real `CompanyCategory`+`CompanyIntervention`, a real `PUBLISHED` request targeting `disostruire-scarichi`):

1. **Creation** — `createRequestDispatchesForRequest` → 1 dispatch, 1 notification, 1 delivery created.
2. **Recipient resolution, checked explicitly** — the created `CompanyNotification.companyId` matched the configured company's id exactly; the created `NotificationDelivery.recipient` matched that company's real `OWNER` membership email (`sapienza.ristrutturazioni@gmail.com`) read directly from `CompanyMembership`/`User` — proving recipient targeting is correct and derives purely from `CompanyIntervention` matching, with zero `Service`/`Category` involvement anywhere in the chain.
3. **Delivery listing** — `listPendingEmailNotificationDeliveriesForRequest` returned exactly the one pending delivery, with the correct recipient, a correctly-formed idempotency key (`request-dispatch-email:{requestId}:{companyId}`), and the request snapshot fields needed to build the email (`interventionSlug`, `city`).
4. **State machine** — drove the delivery through `SENDING → SENT` using the real domain functions (`markNotificationDeliverySending`, `markNotificationDeliverySent`); both transitions succeeded (`ok: true`) and the final row showed `status: "SENT"`, `sentAt` populated, `provider`/`providerMessageId` recorded.

**One environment constraint, disclosed rather than worked around:** the actual external send call (`apps/admin/.../process-request-email-deliveries.ts`'s `sendRequestEmailWithResend`) is wrapped behind a Next.js `server-only` guard transitively pulled in when importing that admin-layer file outside an actual Next.js server runtime — attempting to import it directly from a plain Node script fails with `This module cannot be imported from a Client Component module`. This is a pre-existing environment characteristic of the admin app, unrelated to the taxonomy migration. Rather than hack around the guard, I validated the email-content-building logic by source review (already read in full — confirmed it only formats `interventionSlug` as a display label, no DB lookup) and validated the surrounding state machine and recipient resolution by direct execution (steps 1–4 above), which together cover everything in this chain that could plausibly carry a taxonomy dependency.

All test data (request, dispatch, notification, delivery, customer, company category/intervention links, company status) was deleted/restored after verification — confirmed by a final read showing the company back to `PENDING_REVIEW` with zero category/intervention links.

---

## F. Performance Review

**Creation side**: identical to Phase 11's 8-round-trip count (unchanged, since nothing here was modified).

**Delivery-listing side**: `listPendingEmailNotificationDeliveriesForRequest` is 1 query (batched, via Prisma's nested `select` — not N+1 regardless of delivery count).

**Send side**: the admin processor's `for (const delivery of deliveries)` loop calls `markNotificationDeliverySending` (1 query) → external Resend API call → `markNotificationDeliverySent`/`Failed` (1 query) **per delivery**. This is correctly per-delivery by nature — each delivery needs its own status transition and its own external email send; there is no way to "batch" sending N distinct emails to N distinct recipients into fewer round trips without changing the external email provider's API usage entirely, and this loop's existence and shape predates the taxonomy migration (it is not something Phase 9–11 introduced or could have introduced). Confirmed via source review: nothing inside this loop performs a taxonomy lookup — every value used (`recipient`, `interventionSlug`, `city`) was already fetched in the single batched listing query above.

**No N+1, no taxonomy traversal, no unnecessary joins, no additional round trips** — confirmed across every file in the chain.

---

## G. Ready For Phase 13?

**YES.**

Notifications are fully aligned with the frozen taxonomy model — recipient resolution depends only on `CompanyIntervention` (via the dispatch candidates Phase 10 already produces), and every other field touched (`interventionSlug`) is the permanent, taxonomy-independent snapshot by design. Verified with a real end-to-end execution that exercised creation, recipient correctness, listing, and the full `SENDING → SENT` state transition against the live database — not just confirmed by re-reading Phase 10/11's reports. No legacy dependency was found anywhere in this chain; none needed removing.
