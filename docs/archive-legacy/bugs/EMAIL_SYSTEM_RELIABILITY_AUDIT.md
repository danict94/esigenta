# EMAIL SYSTEM RELIABILITY AUDIT

Date: 2026-06-22
Scope: audit only. No source code changes.

## A. Email Inventory

Current shared provider integration:

- `packages/notifications/src/email/resend-client.ts`
  - Reads `RESEND_API_KEY`.
  - Reads `RESEND_FROM_EMAIL`.
  - In non-production, falls back to `Esigenta <onboarding@resend.dev>`.
- `packages/notifications/src/email/send-email.ts`
  - Sends with Resend.
  - Throws when `result.error` is returned.

Current email categories found:

| Email type | Trigger | Template | Provider | Persistence | Delivery tracking |
| --- | --- | --- | --- | --- | --- |
| Request Verification | Public request creation after `Request` and `CustomerAccessToken` are created | `requestVerificationEmail` | Shared `sendEmail` -> Resend | `Request` and `CustomerAccessToken` only | No durable email delivery row |
| Company New Request | Admin publishes a reviewed request, dispatch candidates are created, admin action processes pending email deliveries | Admin-local request email HTML in `resend-request-email-adapter.ts` | Admin Resend adapter | `RequestDispatch`, `CompanyNotification`, `NotificationDelivery` | Yes, through `NotificationDelivery` |
| Company/Admin Password Reset | Company or admin password recovery action calls `requestPasswordReset` | Inline password reset HTML/text in `password-reset.ts` | Direct Resend SDK call | Better Auth `Verification` token only | No durable email delivery row |
| Customer Request Access | Customer requests a history/status access link | `customerRequestsAccessEmail` | Shared `sendEmail` -> Resend | `CustomerAccessToken` only | No durable email delivery row |
| Conversation Message | Conversation message side effect after a company/admin/customer message is created | `conversationMessageEmail` | Shared `sendEmail` -> Resend | Message data, optional `CompanyNotification`, optional customer conversation token | No durable email delivery row |
| Authentication sign-up/sign-in | Better Auth email/password sign-up and sign-in | None found | None found | User/session/auth records only | Not applicable |
| Admin Notifications | No separate admin notification email sender found | None found | None found | Not applicable | Not applicable |

Additional files involved:

- `packages/domain/src/public/requests/create-request.ts`
- `packages/domain/src/internal/request/send-verification-email.ts`
- `packages/domain/src/admin/requests/review-request.ts`
- `packages/domain/src/internal/request/dispatch/create-request-dispatches-for-request.ts`
- `packages/domain/src/internal/request/notification-deliveries.ts`
- `apps/admin/src/lib/notifications/process-request-email-deliveries.ts`
- `apps/admin/src/lib/notifications/resend-request-email-adapter.ts`
- `packages/auth/src/auth/password-reset.ts`
- `packages/domain/src/customer/requests/customer-soft-access.ts`
- `packages/domain/src/internal/conversation/side-effects.ts`

## B. Delivery Tracking

Durable delivery observability by email type:

| Email type | Queued | Sending | Sent | Failed | Provider message id |
| --- | --- | --- | --- | --- | --- |
| Request Verification | NO | NO | NO | NO | NO |
| Company New Request | YES | YES | YES | YES | YES |
| Password Reset | NO | NO | NO | NO | NO |
| Customer Request Access | NO | NO | NO | NO | NO |
| Conversation Message | NO | NO | NO | NO | NO |
| Authentication sign-up/sign-in | N/A | N/A | N/A | N/A | N/A |
| Admin Notifications | N/A | N/A | N/A | N/A | N/A |

Only the company new request email path has full application-level delivery tracking through `NotificationDelivery`.

Request verification, password reset, request access, and conversation emails can only be inferred from the request path result or manual Resend dashboard/API inspection. They do not persist a provider message id, so the application cannot later correlate those emails to Resend delivery events.

No Resend webhook ingestion endpoint was found, so delivered, bounced, complained, and suppressed provider events are not synchronized into application state.

## C. Failure Handling

Shared sender behavior:

- `sendEmail` checks `result.error` and throws.
- Callers that use this shared sender correctly receive a thrown error when Resend rejects a message.

Request Verification:

- The request, customer, and verification token are created in a database transaction before the email is sent.
- If Resend rejects the email, `createRequestFromDraft` throws after the database rows already exist.
- Result: the user can see an API/request failure while an unverified request and token remain persisted.
- Retry: no durable retry path found.
- Delivery marked failed: NO.

Company New Request:

- `NotificationDelivery` is created before sending.
- Processing marks the row `SENDING`.
- On provider success, the row becomes `SENT` with `provider = resend`, `providerMessageId`, and `sentAt`.
- On provider failure, the row becomes `FAILED` with `lastError`, `attemptCount`, and optional `nextAttemptAt`.
- Retry: retry metadata exists, but no worker/path was found that reprocesses `FAILED` rows or uses `nextAttemptAt`.
- Delivery marked failed: YES.

Password Reset:

- `requestPasswordReset` creates a Better Auth `Verification` row, then sends directly through `getResendClient().emails.send`.
- This path does not inspect `result.error`.
- If the Resend SDK returns `{ data, error }` without throwing, provider rejection can be treated as success.
- If an exception is thrown, the verification token is deleted and the caller receives an `email_failed` result.
- Retry: no retry path found.
- Delivery marked failed: NO.

Customer Request Access:

- If no customer exists, the action intentionally redirects as if an email was sent to avoid account enumeration.
- If a customer exists and Resend rejects the email, `sendEmail` throws.
- The server action does not have a local error mapping, so this can surface as an unhandled server action failure instead of a tracked email failure.
- Retry: no retry path found.
- Delivery marked failed: NO.

Conversation Message:

- Email sending runs as a side effect after message creation.
- Company-side message notifications use `Promise.allSettled` and return success/failure counts from the side-effect function, but those counts are not persisted as delivery rows.
- Customer conversation email failures are caught and counted, but not persisted.
- The web action schedules side effects and redirects the sender as successful regardless of email result.
- Retry: no retry path found.
- Delivery marked failed: NO.

## D. Observability

Current observability is partial and inconsistent.

Strongest path:

- Company new request emails have `NotificationDelivery` records.
- They can show queued, sending, sent, failed, recipient, provider, provider message id, sent time, error text, and attempts.

Weak paths:

- Request verification emails do not persist delivery status or provider message ids.
- Password reset emails do not persist delivery status or provider message ids.
- Customer request access emails do not persist delivery status or provider message ids.
- Conversation message emails do not persist delivery status or provider message ids.

Provider-level observability:

- Resend can show recent message events manually.
- Recent sandbox-allowed emails were visible in Resend with `last_event = delivered`.
- Application state cannot prove delivery for most email types because it does not store the returned provider message id.

Audit gap:

- There is no single application table that represents all transactional email attempts.
- There is no provider webhook consumer to update delivery, bounce, suppression, complaint, or deferred states.

## E. Company Notification Reliability

Runtime path:

1. Admin publishes a reviewed request.
2. `publishReviewedRequest` updates the request to `PUBLISHED`.
3. Dispatch matching resolves eligible companies through `Request.interventionId` and `CompanyIntervention.interventionId`.
4. Dispatch creation inserts `RequestDispatch`.
5. Dispatch creation inserts `CompanyNotification`.
6. Dispatch creation inserts `NotificationDelivery` with channel `EMAIL`.
7. The admin publish action processes pending deliveries for the request.
8. Resend sends the email.
9. The delivery row is marked `SENT` or `FAILED`.

Reliability strengths:

- Dispatch creation is idempotent through unique/idempotency keys and `skipDuplicates`.
- Email delivery rows have durable statuses.
- Resend provider idempotency key is passed for request email sends.
- Provider message id is persisted on successful sends.

Reliability gaps:

- Email processing is tied to the admin publish action runtime.
- No independent delivery worker was found for queued company emails.
- Failed deliveries store retry metadata, but no retry processor was found.
- The admin publish action does not appear to expose delivery failure details to the admin operator.
- Production delivery is still blocked by the current Resend sandbox/domain configuration.

Company email flow is the most observable path in the system, but it is not fully solid operationally until retry processing and production deliverability are in place.

## F. Deliverability Readiness

Current sender configuration:

- Root `.env`: `RESEND_FROM_EMAIL = Esigenta <onboarding@resend.dev>`.
- `apps/web/.env.local`: same Resend API key source, no local sender override found.
- `apps/admin/.env.local`: `RESEND_FROM_EMAIL = FixPro <onboarding@resend.dev>`.

Current Resend account/domain status:

- Resend Domains API returned `domainsCount = 0`.
- No verified custom sending domain is configured in the current Resend account.
- Current sender domain is `resend.dev`, not an Esigenta-owned domain.

DNS/authentication status for current sender domain:

- SPF record exists for `resend.dev`.
- DKIM selector exists for `resend.dev`.
- DMARC record exists for `resend.dev`.
- These records belong to the shared Resend sender domain, not to an Esigenta production sending domain.

Provider mode:

- Current mode is sandbox/testing.
- Resend accepts messages to the provider-allowed account recipient.
- Resend rejects arbitrary recipients with the testing-mode restriction.
- Recent provider-allowed emails were reported by Resend as delivered.

Production readiness:

- Not production ready.
- A verified Esigenta sender domain is required before normal customer/company delivery can work reliably.
- Per-message Gmail placement, spam-folder status, SPF pass, DKIM pass, and DMARC pass cannot be proven from application state. They require mailbox headers or provider event data that is currently not ingested.

## G. Recommended Improvements

1. Verify an Esigenta-owned sender domain in Resend and update every runtime to use the same production sender identity.
2. Replace stale `FixPro <onboarding@resend.dev>` sender configuration in admin runtime env.
3. Centralize all email sends behind one application email service that always checks `result.error`.
4. Persist provider message ids for request verification, password reset, customer request access, and conversation emails.
5. Add a generalized email outbox/delivery model, or extend `NotificationDelivery` so every transactional email has durable status.
6. Move provider sends out of user-facing transactions where possible: create a queued delivery row first, then process asynchronously.
7. Add retry processing for `FAILED` and stale `SENDING` deliveries.
8. Add Resend webhook ingestion for delivered, bounced, complained, suppressed, and failed events.
9. Make password reset provider errors explicit by checking the Resend SDK result object.
10. Decide user-facing behavior for verification email failures: either surface a clear retryable error or persist a retryable delivery attempt.
11. Add an operator view for failed company email deliveries and retry actions.
12. Keep provider-specific logic isolated so future provider changes do not require edits across domain, auth, web, and admin packages.

## Final Answers

```txt
EMAIL_SYSTEM_HEALTH = FRAGILE
EMAIL_DELIVERY_TRACKABLE = NO
EMAIL_FAILURES_RECOVERABLE = NO
COMPANY_EMAIL_FLOW_SOLID = NO
PRODUCTION_READY = NO
```
