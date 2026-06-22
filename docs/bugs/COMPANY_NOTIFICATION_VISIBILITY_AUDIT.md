# COMPANY NOTIFICATION VISIBILITY AUDIT

Date: 2026-06-22
Scope: audit only. No source code changes. All data pulled live from the
production Neon database (`Esigenta`, project `purple-glitter-37268985`).

## Premise check (important — read before the rest of this report)

The task's CONTEXT states the implementation report already confirmed
`RequestDispatch > 0`, `CompanyNotification > 0`, `NotificationDelivery > 0`
for "the request used in GEO validation," and asks why that notification
isn't visible in the UI. **That premise does not hold against the database
as it exists right now.** Two different things happened in this session,
and they are easy to conflate:

1. Earlier, a scratch validation script ran `resolveRequestDispatchCandidates`
   / `createRequestDispatchesForRequest` against company `Sp`
   (`cmqmj5k68000004jlh7m8ovw3`) and request `REQ-95XBJX`
   (`cmqobqdq20001dgc4e72q8e3i`), and at that moment it did produce
   `dispatchCreatedCount: 1`, `appNotificationCreatedCount: 1`,
   `emailDeliveryCreatedCount: 1` — confirmed live at the time.
2. Since then, a real end-to-end browser session created a **different**
   company (`sp ristrutturazioni`, id `cmqofg6fi0000loc47p71j87l`) and a
   **different** request (`REQ-CPV9S9`, id `cmqofj16c0004loc49nf234t9`),
   verified it, approved/published it via the admin panel, and reported no
   notification arriving — for **this** company/request pair.

Querying the live database right now:

```sql
SELECT id, name FROM "Company";
-- → only cmqofg6fi0000loc47p71j87l ("sp ristrutturazioni") exists.
-- The earlier company "Sp" (cmqmj5k68000004jlh7m8ovw3) no longer exists
-- in the database at all.

SELECT count(*) FROM "RequestDispatch";      -- 0 (global, every company)
SELECT count(*) FROM "CompanyNotification";  -- 0 (global, every company)
SELECT count(*) FROM "NotificationDelivery"; -- 0 (global, every company)
```

So as of right now, there is **no** `RequestDispatch`, `CompanyNotification`,
or `NotificationDelivery` row in the entire database — not filtered out,
not hidden, not present. The earlier validation's rows and the company/request
they referenced are gone (most likely the test company was deleted through
the admin "imprese" page, or a similar reset occurred — the audit can
confirm rows don't exist now but can't reconstruct exactly when/how they
were removed from the data alone).

This audit proceeds against the **actual** live case — company
`sp ristrutturazioni` / request `REQ-CPV9S9` — since that's the real
scenario behind "no notifications arrived," and is the one currently
reproducible in the database.

---

## TASK 1 — Locate the exact request used in GEO validation

| Field | Value |
| --- | --- |
| Request id | `cmqofj16c0004loc49nf234t9` (`REQ-CPV9S9`) — the live browser-tested request. The earlier script-validated request (`REQ-95XBJX`) no longer exists in the database. |
| Company id | `cmqofg6fi0000loc47p71j87l` (`sp ristrutturazioni`) |
| `RequestDispatch` rows for this request | **0** |
| `CompanyNotification` rows for this company | **0** |
| `NotificationDelivery` rows for this request's dispatches | **0** (no dispatches exist to attach a delivery to) |

---

## TASK 2 — Read the actual `CompanyNotification` row

**There is no row to read.** `SELECT * FROM "CompanyNotification" WHERE "companyId" = 'cmqofg6fi0000loc47p71j87l'`
returns zero rows. `SELECT count(*) FROM "CompanyNotification"` returns
`0` for the entire table, every company. No `id`, `type`, `status`,
`readAt`, `createdAt`, `payload`, `requestId`, or `dispatchId` exists to
inspect, because no row was ever created.

---

## TASK 3 — Trace the notification list page

```
/area-impresa/notifiche
  → apps/web/src/area-impresa/private/account/notifiche/notifications-page.tsx
      NotificationsPage(): calls getCompanyNotificationsPage(actor)
  → packages/domain/src/company/notifications/get-notifications-page.ts
      getCompanyNotificationsPage(actor):
        Promise.all([
          listCompanyNotifications(actor.company.id),
          countUnreadCompanyNotifications(actor.company.id),
        ])
  → packages/domain/src/company/notifications/notifications.ts
      listCompanyNotifications(companyId):
        prisma.companyNotification.findMany({
          where: { companyId },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: { ...fields..., request: {...geoLocation...}, conversation: {...} },
        })
        → flattens request.geoLocation.city/postalCode back onto request.city/postalCode
```

**Query**: a single `WHERE companyId = :companyId`. No status filter, no
read/unread filter, no date filter, no type filter.
**View model**: `CompanyNotificationListItem[]` — `id`, `type`, `title`,
`body`, `readAt`, `createdAt`, `requestId`, `requestDispatchId`,
`conversationId`, `messageId`, `request`, `conversation`.
**Sorting**: `createdAt desc`.
**Visibility rules**: exactly one — `companyId` ownership. No other
condition exists in the query that could hide a row from its owning
company.

Render path:
```
NotificationsPage → NotificationsList → NotificationCard (one per item)
NotificationsList: if (notifications.length === 0) renders
  "Non hai ancora notifiche." — no other empty-state branching.
```

---

## TASK 4 — Does the notification row satisfy every filter?

There is no row to test, but for completeness, the filter set applied by
this page is exactly:

| Filter | What it checks | Result if a row existed for this company |
| --- | --- | --- |
| `companyId = actor.company.id` | row belongs to the logged-in company | PASS (the only filter; nothing else gates visibility) |

There is no second filter. If a `CompanyNotification` row with this
company's id existed, it would be returned and rendered — guaranteed,
because `listCompanyNotifications` has no other `WHERE` clause and
`NotificationsList`/`NotificationCard` render unconditionally for every
item in the array (no per-item visibility check, no type allowlist, no
date cutoff).

---

## TASK 5 — First filter that removes it

**Not applicable — there is nothing to filter.** No `CompanyNotification`
row exists for this company in the database at all. The query, view
model, and UI are not rejecting or hiding a real row; there is no row.

---

## TASK 6 — If the query returns it, trace UI rendering

**Not applicable** — the query returns an empty array (correctly, since
the table has zero rows for this company), and `NotificationsList`
correctly renders its empty state. There is no rendering-path failure: the
UI is doing exactly what it should given zero input rows.

---

## TASK 7 — Counts

| Stage | Count |
| --- | --- |
| `CompanyNotification` rows in DB for company `sp ristrutturazioni` | 0 |
| Rows returned by `listCompanyNotifications` | 0 |
| Rows rendered in `/area-impresa/notifiche` | 0 |

All three numbers agree. There is no discrepancy between database,
query, and UI — the entire pipeline correctly reports zero, because zero
is correct.

---

## Root cause: why no `CompanyNotification` (or dispatch, or email) was ever created

Traced from the actual matching/dispatch code
(`packages/domain/src/internal/request/dispatch/resolve-request-dispatch-candidates.ts`,
`create-request-dispatches-for-request.ts`) against the live data for this
exact request/company pair:

```sql
SELECT
  c."id", c.name, c.status, c."isActive", c."operatingRadiusKm",
  (SELECT count(*) FROM "CompanyIntervention" ci WHERE ci."companyId" = c.id) AS intervention_count,
  (SELECT count(*) FROM "CompanyCategory" cc WHERE cc."companyId" = c.id) AS category_count
FROM "Company" c WHERE c.id = 'cmqofg6fi0000loc47p71j87l';
```

| name | status | isActive | operatingRadiusKm | intervention_count | category_count |
| --- | --- | --- | --- | --- | --- |
| sp ristrutturazioni | APPROVED | true | 30 | **0** | **0** |

The request's intervention is `ripristino-frontalino`
(`cmqnvk535001jqgc4fn8ookl7`). `resolveCandidates()`'s matching query
requires an `INNER JOIN "CompanyIntervention" ci ON ci."companyId" = c."id"
AND ci."interventionId" = :interventionId` — with **zero**
`CompanyIntervention` rows for this company (for *any* intervention, not
just this one), that join produces zero rows regardless of geography,
approval status, or radius. `eligibleCompanyCount` is correctly `0`.
`createRequestDispatchesForRequest` then correctly creates zero
`RequestDispatch`, zero `CompanyNotification`, zero `NotificationDelivery`
rows — there is nothing wrong with the dispatch/notification code path;
it has nothing to dispatch to.

This traces back to company onboarding: `createCompanyForUser`
(`packages/auth/src/identity/company/onboarding.ts`) only ever sets
`Company.onboardingCategorySlug` (a text snapshot, explicitly documented in
the schema as "ONBOARDING CONTEXT ONLY... runtime matching must use
CompanyCategory, not this onboarding snapshot") — it never inserts
`CompanyCategory` or `CompanyIntervention` rows. A company only gets those
rows by visiting **Configura Servizi**
(`/area-impresa/configura-servizi`) and explicitly saving a selection. The
server log for this session shows `GET /area-impresa/configura-servizi
200` once, with no corresponding successful save reaching the database —
consistent with the page being opened but no configuration ever being
persisted (or a save attempt that failed validation, e.g. zero categories
selected, which `updateCompanyServicesConfiguration` rejects with
`missing_categories` and redirects without writing anything).

This is unrelated to the geo refoundation. Matching correctly evaluated
geography (the company and request are in fact in the same place,
distance would compute to 0 km) — it never reached the geography check at
all, because the `CompanyIntervention` join eliminated the company first.
The notification visibility layer (query, view model, UI) was independently
verified above to have no bug: given zero source rows, it correctly shows
zero.

---

## FINAL ANSWERS

```txt
NOTIFICATION_CREATED = NO (no RequestDispatch, CompanyNotification, or
  NotificationDelivery row exists for this request/company — confirmed
  globally zero across the entire database, not just this pair)
NOTIFICATION_QUERY_RETURNS_IT = N/A — there is no row for the query to return;
  the query correctly returns an empty array
NOTIFICATION_UI_RECEIVES_IT = N/A — the UI correctly receives an empty array
NOTIFICATION_UI_RENDERS_IT = N/A — the UI correctly renders the "Non hai
  ancora notifiche" empty state for zero input rows
FIRST_FAILURE_POINT = Company "sp ristrutturazioni" has zero CompanyIntervention
  rows (and zero CompanyCategory rows) — the matching query's join against
  CompanyIntervention eliminates this company before geography is ever
  checked, so createRequestDispatchesForRequest correctly produces zero
  dispatch/notification/email rows. This is upstream of notifications
  entirely: nothing in the notification pipeline (query, view model, UI)
  is broken, because nothing was ever supposed to be created.
```

## Note on the audit's own premise

The original GEO refoundation validation (company `Sp` / request
`REQ-95XBJX`) genuinely did produce 1 `RequestDispatch`, 1
`CompanyNotification`, and 1 `NotificationDelivery` row at the time it ran
— that result was real and is unchanged as a fact about that session. It
is simply not the same company/request as the one being complained about
now, and that earlier company no longer exists in the database to
re-check. If a check against the *original* validated pair is wanted, it
would need to be re-created first (a new company at the same place, with
`CompanyIntervention` actually configured this time) — at which point this
audit's own findings predict it would work, since geography, status, and
radius are all already correct for `sp ristrutturazioni`; only the
intervention configuration is missing.
