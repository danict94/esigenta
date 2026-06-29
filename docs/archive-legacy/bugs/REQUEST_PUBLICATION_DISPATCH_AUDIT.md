# REQUEST PUBLICATION → DISPATCH AUDIT

Date: 2026-06-22
Scope: audit only. No source code changes. All data and execution results
in this report were pulled/run live against the real Neon database
(`Esigenta`, project `purple-glitter-37268985`).

## Premise check

The CONTEXT states "Company intervention configured." Checked live against
the database — **this is not currently true**:

```sql
SELECT id, name, status,
  (SELECT count(*) FROM "CompanyIntervention" ci WHERE ci."companyId" = c.id) AS intervention_count,
  (SELECT count(*) FROM "CompanyCategory" cc WHERE cc."companyId" = c.id) AS category_count
FROM "Company" c;
```

| name | status | intervention_count | category_count |
| --- | --- | --- | --- |
| sp ristrutturazioni | APPROVED | **0** | **0** |

This is the same finding as
[COMPANY_NOTIFICATION_VISIBILITY_AUDIT.md](COMPANY_NOTIFICATION_VISIBILITY_AUDIT.md),
re-confirmed fresh for this report. It does not change this audit's actual
job — determining whether dispatch creation is triggered at all — and the
answer to that question turns out to be unambiguous and independent of the
intervention-configuration gap. Both are reported below.

---

## TASK 1 — Locate the exact request recently published

```sql
SELECT id, "requestCode", status, "reviewedAt", "interventionId", "createdAt"
FROM "Request" ORDER BY "createdAt" DESC LIMIT 2;
```

| Field | Value |
| --- | --- |
| Request id | `cmqofj16c0004loc49nf234t9` |
| requestCode | `REQ-CPV9S9` |
| status | `PUBLISHED` |
| publishedAt | *(no separate `publishedAt` column exists on `Request` — see note below)* |
| reviewedAt | `2026-06-21T23:42:14.921Z` |
| interventionId | `cmqnvk535001jqgc4fn8ookl7` (`ripristino-frontalino`) |

Note: `Request` has no dedicated `publishedAt` field. `reviewedAt` is set
unconditionally by `publishReviewedRequest`
(`packages/domain/src/admin/requests/review-request.ts:151`) at the moment
the request's status is written to `PUBLISHED`, and is the closest
equivalent — there is exactly one write to `reviewedAt` in the publish
path, so it doubles as the publish timestamp.

A second, older request is also `PUBLISHED` in the database
(`cmqobqdq20001dgc4e72q8e3i` / `REQ-95XBJX`, `reviewedAt` =
`2026-06-21T22:07:08.577Z`) — see Task 6 and Task 7.

---

## TASK 2 — Trace publication flow

```
apps/admin/src/app/(protected)/requests/[id]/page.tsx:340
  reviewRequestAction(formData)
    "use server"
    requireAdmin()
    reads requestId / status ("APPROVED" | "PUBLISHED" | "REJECTED") / moderationNotes
    ↓
    reviewRequest({ requestId, status, moderationNotes })          [line 363]
      packages/domain/src/admin/requests/review-request.ts:188
      if status === "APPROVED" || status === "PUBLISHED":
        ↓
        publishReviewedRequest({ requestId, moderationNotes })      [line 196-200]
          packages/domain/src/admin/requests/review-request.ts:111
          prisma.$transaction(async (tx) => {
            - validates creditCost/maxUnlocks are set (throws
              RequestPublishingRequirementsError otherwise)            [line 119-142]
            - tx.request.update({ status: "PUBLISHED", reviewedAt: new Date(), ... }) [line 144-163]
            - createRequestDispatchesForRequestWithClient(tx, request.id)            [line 165-169]
              packages/domain/src/internal/request/dispatch/create-request-dispatches-for-request.ts:96
              - locks via pg_advisory_xact_lock                       [line 111-114]
              - resolveRequestDispatchCandidatesWithClient(tx, requestId)            [line 116-120]
                → fetches Request.geoLocation, Request.interventionId
                → resolveCandidates(): SQL JOIN against CompanyIntervention +
                  GeoLocation + earthdistance radius check
              - tx.requestDispatch.createMany(...)                    [line 135-149]
              - tx.companyNotification.createMany(...)                [line 209-234]
              - tx.notificationDelivery.createMany(...)               [line 236-271]
            - if dispatch.ok === false: throws RequestPublishDispatchError [line 171-179]
            - returns { ...request, dispatch }
          })
    ↓ (back in reviewRequestAction, after reviewRequest resolves)
    if (reviewResult.status === "PUBLISHED"):                        [line 377-381]
        processRequestEmailDeliveriesForRequest(requestId)
          apps/admin/src/lib/notifications/process-request-email-deliveries.ts:193
          - listPendingEmailNotificationDeliveriesForRequest(requestId)
          - for each PENDING delivery: sendRequestEmailWithResend(...) → mark SENT/FAILED
    ↓
    revalidatePath("/requests"), revalidatePath(`/requests/${requestId}`)
```

Every step from the admin form submission to dispatch/notification/email
delivery creation happens **inside one server action, unconditionally**,
with no separate trigger, queue, or cron step in between. There is no
point in this chain where dispatch creation is optional or skipped for a
status of `APPROVED` or `PUBLISHED` — both map to the same
`publishReviewedRequest` call.

---

## TASK 3 — Is `createRequestDispatchesForRequest` invoked automatically?

**YES.**

It is called as `createRequestDispatchesForRequestWithClient(tx, request.id)`
inside `publishReviewedRequest`'s transaction, which itself is reached
unconditionally whenever `reviewRequest` is called with `status: "APPROVED"`
or `status: "PUBLISHED"` — i.e. every time an admin submits the review form
with either button. There is no code path that sets `Request.status` to
`PUBLISHED` without also running this call in the same transaction.

---

## TASK 4 — Execution result (re-run live against the real request)

Ran the actual functions (not a re-implementation) against
`cmqofj16c0004loc49nf234t9` directly:

```
resolveRequestDispatchCandidates(requestId):
{
  "ok": true,
  "requestId": "cmqofj16c0004loc49nf234t9",
  "requestCode": "REQ-CPV9S9",
  "interventionSlug": "ripristino-frontalino",
  "interventionId": "cmqnvk535001jqgc4fn8ookl7",
  "city": "Valverde",
  "eligibleCompanyCount": 0,
  "candidates": []
}

createRequestDispatchesForRequest(requestId):
{
  "ok": true,
  "requestId": "cmqofj16c0004loc49nf234t9",
  "eligibleCompanyCount": 0,
  "dispatchCreatedCount": 0,
  "appNotificationCreatedCount": 0,
  "emailDeliveryCreatedCount": 0,
  "skippedNoRecipientCount": 0
}
```

**No exception was thrown. `ok: true` in both calls.** This is not a
failure or a crash — the function ran successfully and correctly computed
zero eligible companies, because the matching SQL's
`INNER JOIN "CompanyIntervention"` against the only company in the
database (`sp ristrutturazioni`) finds zero rows (see premise check above:
`intervention_count = 0` for that company, for any intervention). Zero
eligible candidates → zero dispatch/notification/delivery rows created, by
design (`candidates.length > 0 ? createMany(...) : { count: 0 }` at every
step in `create-request-dispatches-for-request.ts`).

---

## TASK 5 — N/A

Not applicable — Task 3's answer is YES, the function is called. There is
no "chain stops" point to identify; the chain runs to completion and
correctly produces a zero-row result.

---

## TASK 6 — All published requests

```sql
SELECT count(*) FROM "Request" WHERE status = 'PUBLISHED';                          -- 2
SELECT count(*) FROM "RequestDispatch";                                              -- 0
SELECT count(*) FROM "CompanyNotification";                                          -- 0
SELECT count(*) FROM "NotificationDelivery";                                         -- 0
```

| requestCode | id | dispatch rows | notification rows | delivery rows |
| --- | --- | --- | --- | --- |
| `REQ-CPV9S9` | `cmqofj16c0004loc49nf234t9` | 0 | 0 | 0 |
| `REQ-95XBJX` | `cmqobqdq20001dgc4e72q8e3i` | 0 | 0 | 0 |

Both `PUBLISHED` requests have zero dispatch artifacts. For `REQ-CPV9S9`,
Task 4 already shows why (zero eligible companies, confirmed live, no
error). For `REQ-95XBJX`, the same root cause applies now — the only
company currently in the database (`sp ristrutturazioni`) still has zero
`CompanyIntervention` rows, so re-resolving `REQ-95XBJX` today would also
find zero candidates, even though it didn't at the time it was originally
published (see Task 7).

---

## TASK 7 — Reconciling with the GEO validation report (dispatch=1, notification=1, delivery=1)

The GEO refoundation's
[03_IMPLEMENTATION_REPORT.md](../geo-refoundation/03_IMPLEMENTATION_REPORT.md)
validation ran against **company `Sp`** (id `cmqmj5k68000004jlh7m8ovw3`) and
request `REQ-95XBJX`. At that time, company `Sp` had 10 `CompanyIntervention`
rows (confirmed in the original
[P0_MATCHING_BREAKPOINT_AUDIT.md](P0_MATCHING_BREAKPOINT_AUDIT.md) and
[GEOLOCATION_CONSISTENCY_AUDIT.md](GEOLOCATION_CONSISTENCY_AUDIT.md), and
re-confirmed when the validation script ran), including
`ripristino-frontalino`. Re-running dispatch creation for that pair at that
moment correctly produced 1 dispatch, 1 notification, 1 delivery — that
result was real and reproducible at the time.

**Company `Sp` no longer exists in the database.**

```sql
SELECT id, name FROM "Company";  -- only "sp ristrutturazioni" — "Sp" is gone
```

`RequestDispatch.companyId` is declared `onDelete: Cascade`
(`packages/database/prisma/schema.prisma:794`), and
`CompanyNotification.companyId` / `requestDispatchId` and
`NotificationDelivery`'s relation through `requestDispatch` are likewise
cascading. Deleting company `Sp` — through whatever path that happened
(the data alone doesn't record *who* or *which exact action*; admin's
"imprese" page exposes company status changes, and a hard delete isn't
visible as a normal admin action in the reviewed code, so this was either
a manual database operation, a reset, or a deletion path outside the
audited admin UI) — would have cascade-deleted that company's
`RequestDispatch` row, which would have cascade-deleted its
`CompanyNotification` and `NotificationDelivery` rows in turn. That fully
and mechanically explains why the report's 1/1/1 became today's 0/0/0:
**the rows the report counted were real, and were deleted afterward as a
side effect of deleting the company they belonged to** — not because
dispatch creation broke, regressed, or stopped being triggered.

The current zero counts for both `PUBLISHED` requests are explained by two
independent, unrelated facts:
- `REQ-CPV9S9`: dispatch ran, found zero candidates, because the company
  that exists today has no `CompanyIntervention` configured (Task 4).
- `REQ-95XBJX`: its original dispatch rows were real but were cascade-deleted
  along with company `Sp`; nothing has re-run dispatch for it since (nothing
  re-triggers dispatch on its own — it only runs once, at publish time).

---

## FINAL ANSWERS

```txt
DISPATCH_TRIGGER_EXISTS = YES — createRequestDispatchesForRequestWithClient is
  called unconditionally inside publishReviewedRequest's transaction, itself
  reached by every admin review action with status APPROVED or PUBLISHED.
DISPATCH_EXECUTED = YES — re-run live against the real request, ok: true,
  no exception, completed successfully.
DISPATCH_FAILED = NO — zero eligible candidates is a correct result given
  the input data (company has zero CompanyIntervention rows), not a failure.
DISPATCH_NOT_CALLED = NO — it is called, every time, with no gating condition
  that could skip it for a PUBLISHED request.
FIRST_BREAKPOINT = There is no breakpoint in the dispatch/notification trigger
  chain itself — it runs end to end successfully. The actual gap is upstream:
  the only company in the database has never configured any CompanyIntervention
  (or CompanyCategory) rows, so matching legitimately finds it ineligible for
  every request regardless of geography. Separately, the GEO validation
  report's earlier nonzero counts were real but were cascade-deleted when
  company "Sp" was removed from the database afterward — that is a data-lifecycle
  fact, not a code regression in dispatch creation.
```
