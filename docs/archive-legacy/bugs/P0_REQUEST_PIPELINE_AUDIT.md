# P0 REQUEST PIPELINE AUDIT

Date: 2026-06-21
Scope: audit only. No source code changes.

## A. Client Verification Flow

Runtime path traced:

1. `apps/web/src/richiesta/flow/components/request-stepper.tsx`
   - Submits the funnel payload with `fetch("/api/requests", { method: "POST" })`.
2. `apps/web/src/app/api/requests/route.ts`
   - Parses JSON.
   - Calls `submitRuntimeRequest`.
3. `packages/domain/src/public/requests/submit-runtime-request.ts`
   - Builds a runtime request draft through the funnel runtime.
   - Calls `createRequestFromDraft`.
4. `packages/domain/src/public/requests/create-request.ts`
   - Resolves `Request.interventionId` from `draft.interventionSlug`.
   - Creates a verification token with `createRequestVerificationToken`.
   - In a transaction, upserts `Customer`, creates `Request`, attaches photos, and creates `CustomerAccessToken` with purpose `REQUEST_VERIFICATION`.
   - After the transaction, builds the verification URL and awaits `sendRequestVerificationEmail`.
5. `packages/domain/src/internal/request/send-verification-email.ts`
   - Calls `sendEmail` from `@esigenta/notifications`.
6. `packages/notifications/src/email/send-email.ts`
   - Dispatches through Resend.
   - Throws if Resend returns an error.

Real validation:

- The local dev server started with `pnpm --filter web dev`.
- `GET /` returned 200.
- `POST /api/requests`, `POST /api/funnel/runtime`, and `GET /api/taxonomy/search` returned the app HTML 404 page in this local dev process.
- The route files exist and `.next/dev/server/app-paths-manifest.json` contains `/api/requests/route`, `/api/funnel/runtime/route`, and `/api/taxonomy/search/route`.
- Because the HTTP route was not reached locally, the database/provider validation below used the same domain creation function called by the route, not the HTTP route.

Controlled database/provider validation:

- Created a real request through `buildRuntimeRequestDraft` plus `createRequestFromDraft`.
- Request status after creation: `PENDING_VERIFICATION`.
- `Request.interventionId` was populated for `realizzare-parete-cartongesso`.
- One `CustomerAccessToken` with purpose `REQUEST_VERIFICATION` existed before any controlled verification token was added.
- Verification email dispatch returned `verificationEmailSent: true` only when the recipient was the Resend sandbox-allowed recipient.

Important provider finding:

- A request to a unique normal audit recipient was created in the database, but Resend rejected the verification email.
- Failure point: `packages/notifications/src/email/send-email.ts`, throwing from Resend error handling.
- Call stack included `packages/domain/src/internal/request/send-verification-email.ts` and `packages/domain/src/public/requests/create-request.ts`.
- Exact condition: current Resend configuration is in sandbox/testing mode and can only send to the provider-allowed owner address. Arbitrary customer recipients are rejected.
- Since request and token creation happen before email sending, this failure can leave a request and verification token in the database while the caller receives an error from request creation.

Phase A status:

```txt
REQUEST_CREATED = YES
TOKEN_CREATED = YES
EMAIL_TRIGGERED = YES
EMAIL_SENT = PARTIAL
EMAIL_DELIVERED = NOT_VERIFIABLE
```

`EMAIL_SENT = PARTIAL` means provider-accepted for the sandbox-allowed recipient, but rejected for arbitrary recipients. Delivery to an inbox was not verifiable from application state because verification email message IDs are not persisted.

## B. Company Dispatch Flow

Runtime path traced:

1. `packages/domain/src/customer/requests/verify-request.ts`
   - `verifyRequestEmailByToken` consumes a valid `REQUEST_VERIFICATION` token.
   - Updates request to `PENDING_REVIEW`.
   - Updates the customer verification timestamp.
   - Creates request status/history access tokens.
2. `packages/domain/src/admin/requests/review-request.ts`
   - `publishReviewedRequest` requires positive `creditCost` and `maxUnlocks`.
   - Updates request to `PUBLISHED`.
   - Calls `createRequestDispatchesForRequestWithClient`.
3. `packages/domain/src/internal/request/dispatch/resolve-request-dispatch-candidates.ts`
   - Uses `Request.interventionId`.
   - Requires company status `APPROVED`, active/not deleted company, coordinates, radius, an owner membership, and a matching `CompanyIntervention.interventionId`.
4. `packages/domain/src/internal/request/dispatch/create-request-dispatches-for-request.ts`
   - Creates `RequestDispatch`.
   - Creates `CompanyNotification` type `NEW_REQUEST_AVAILABLE`.
   - Creates `NotificationDelivery` channel `EMAIL`.
   - Uses `skipDuplicates` plus idempotency keys.

Current database precondition finding:

- Before inserting the temporary audit fixture, the current database had `0` approved dispatchable companies matching the required shape.
- Without a matching approved company, the dispatch pipeline cannot produce candidates even if the request itself is valid.

Controlled validation:

- Temporary company was created with:
  - `Company.status = APPROVED`
  - valid coordinates/radius
  - owner membership
  - `CompanyCategory` for `cartongessista`
  - `CompanyIntervention` for `realizzare-parete-cartongesso`
- Request was verified through `verifyRequestEmailByToken` using a controlled token because the raw emailed token is intentionally not stored.
- Request was given `creditCost = 1` and `maxUnlocks = 5` to satisfy publishing requirements.
- `publishReviewedRequest` returned:
  - `eligibleCompanyCount = 1`
  - `dispatchCreatedCount = 1`
  - `appNotificationCreatedCount = 1`
  - `emailDeliveryCreatedCount = 1`
  - `skippedNoRecipientCount = 0`
- Re-running dispatch for the same request returned:
  - `dispatchCreatedCount = 0`
  - `appNotificationCreatedCount = 0`
  - `emailDeliveryCreatedCount = 0`
- Final counts remained one dispatch, one notification, and one email delivery.

Phase B status:

```txt
MATCHING_EXECUTED = YES
CANDIDATES_FOUND = YES, with controlled approved company
DISPATCH_CREATED = YES
NOTIFICATION_CREATED = YES
DELIVERY_CREATED = YES
EMAIL_SENT_TO_COMPANY = PARTIAL
```

`EMAIL_SENT_TO_COMPANY = PARTIAL` means the delivery pipeline and Resend send succeeded for the sandbox-allowed recipient. With the current Resend sandbox configuration, arbitrary company owner recipients would be rejected by the provider for the same reason as customer verification emails.

## C. Dashboard Visibility

Runtime path traced:

- `packages/domain/src/company/requests/get-requests-list-page.ts`

Visibility model:

- Company must be approved.
- Company must have location and radius.
- Request must be visible marketplace status (`APPROVED` or `PUBLISHED`) and not archived/deleted.
- Visibility is driven by `Request.interventionId`.
- The company-side intervention set comes from selected `CompanyIntervention` rows, with category-derived interventions also used for filtering/exploration.

Controlled validation:

- After publishing, `getCompanyRequestsListPage` returned `ok: true`.
- The published request appeared in the returned company request list.
- `returnedCount = 1`.
- `dbFetchedCount = 1`.
- `hasSelectedInterventions = true`.

Dashboard status:

```txt
DASHBOARD_VISIBILITY_WORKING = YES
```

## D. Notification Flow

Runtime path traced:

1. Dispatch creation creates `CompanyNotification`.
2. Dispatch creation creates `NotificationDelivery` with:
   - `channel = EMAIL`
   - `status = PENDING`
   - recipient from owner membership email
   - idempotency key `request-dispatch-email:${requestId}:${companyId}`
3. `apps/admin/src/lib/notifications/process-request-email-deliveries.ts`
   - Lists pending deliveries.
   - Marks delivery `SENDING`.
   - Sends through Resend.
   - Marks delivery `SENT` or `FAILED`.

Controlled validation:

- Delivery before processing:
  - `status = PENDING`
  - recipient present
  - provider empty
  - no provider message ID
- Delivery after processing:
  - `status = SENT`
  - `provider = resend`
  - provider message ID present
  - `sentAt` present
  - `attemptCount = 0`
  - `lastError = null`

Standalone import caveat:

- Importing `apps/admin/src/lib/notifications/process-request-email-deliveries.ts` directly from a standalone `tsx` audit process failed because it imports `@esigenta/domain`, and the domain root currently re-exports `submitRuntimeRequest`, which imports `@esigenta/funnel/server` and therefore `server-only`.
- The audit therefore used the same lower-level delivery transition functions plus the same Resend client to validate the delivery state machine and provider send.
- This is an auditability/operability caveat for standalone scripts; it does not prove the Next admin server component path fails.

## E. Regression Analysis

Taxonomy matching model:

- No regression found in the intervention-driven dispatch model.
- `Request.interventionId`, `CompanyIntervention.interventionId`, dispatch matching, dashboard visibility, and company email delivery all align on the same intervention-driven model.
- The controlled request for `realizzare-parete-cartongesso` matched the controlled company through `CompanyIntervention` and appeared in the company dashboard.

Operational regressions/risks found:

- Email provider configuration is not production-operable for arbitrary recipients.
- Resend sandbox mode rejects normal customer/company addresses.
- Verification email failure happens after request/token creation, so a failed email send can leave persisted unverified requests.
- Verification email provider message IDs are not stored, so provider acceptance and later inbox delivery cannot be audited from application records.
- Current database has no approved dispatchable companies, so a real request in this DB has no candidates unless company onboarding/approval/configuration is completed.
- Local `pnpm --filter web dev` returned HTML 404 for app API routes even though the route artifacts/manifests exist. This blocked full HTTP-level validation from the client route in this environment and needs a separate Next route registration/dev-server audit.

## F. Exact Failure Points

Failure point 1: customer verification email to arbitrary recipients.

- File: `packages/notifications/src/email/send-email.ts`
- Condition: Resend returns an error because the API key/from-address is in sandbox/testing mode and only allows the provider-owned recipient.
- Effect: `createRequestFromDraft` throws after the database transaction already created `Customer`, `Request`, and `CustomerAccessToken`.

Failure point 2: no persisted verification email provider receipt.

- File: `packages/domain/src/public/requests/create-request.ts`
- Condition: `sendRequestVerificationEmail` returns only `{ sent, provider }`; no provider message ID is persisted on request/token.
- Effect: `EMAIL_DELIVERED` cannot be proven from DB state.

Failure point 3: local HTTP API route validation blocked.

- Files present:
  - `apps/web/src/app/api/requests/route.ts`
  - `apps/web/src/app/api/funnel/runtime/route.ts`
  - `apps/web/src/app/api/taxonomy/search/route.ts`
- Condition: local `pnpm --filter web dev` served app HTML 404 for `/api/requests`, `/api/funnel/runtime`, and `/api/taxonomy/search`.
- Effect: direct client-side HTTP validation could not complete in this environment even though the route manifest contains the route entries.

Failure point 4: current DB has no dispatchable companies.

- File path involved in matching: `packages/domain/src/internal/request/dispatch/resolve-request-dispatch-candidates.ts`
- Condition: no approved active company with coordinates, positive radius, owner membership, and matching `CompanyIntervention`.
- Effect: real current DB requests have no company candidates until a company is approved and configured.

## Final Answers

```txt
REQUEST_CREATED = YES
TOKEN_CREATED = YES
EMAIL_TRIGGERED = YES
EMAIL_SENT = PARTIAL
MATCHING_EXECUTED = YES
DISPATCH_CREATED = YES
NOTIFICATION_CREATED = YES
EMAIL_SENT_TO_COMPANY = PARTIAL
DASHBOARD_VISIBILITY_WORKING = YES
PIPELINE_HEALTH = PARTIALLY_BROKEN
```

