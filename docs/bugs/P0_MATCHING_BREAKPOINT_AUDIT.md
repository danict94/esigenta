# P0 MATCHING BREAKPOINT AUDIT

Date: 2026-06-22
Scope: audit only. No source code changes. All data pulled live from the
production Neon database (`Esigenta`, project `purple-glitter-37268985`).

---

## TASK 1 — Company

| Field | Value |
| --- | --- |
| `Company.id` | `cmqmj5k68000004jlh7m8ovw3` |
| `Company.status` | `APPROVED` |
| `Company.name` | `Sp` |

Additional fields read for matching gates:

- `isActive = true`
- `deletedAt = null`
- `latitude = 45.46`, `longitude = 9.19` (Lombardy area)
- `operatingRadiusKm = 30`
- OWNER membership exists: `sapienza.ristrutturazioni@gmail.com` (role `OWNER`)

---

## TASK 2 — CompanyIntervention rows

Query: `SELECT * FROM "CompanyIntervention" WHERE "companyId" = 'cmqmj5k68000004jlh7m8ovw3'`

**Count: 10 rows.**

| interventionId | slug |
| --- | --- |
| cmqm6gapo0032i8c40k3zjd9x | ristrutturare-casa |
| cmqm6gc4x0038i8c44pdn43u3 | sistemare-grondaie |
| cmqm6ga02002yi8c4e83a22sk | ristrutturare-bagno |
| cmqm6gbfa0035i8c4mc72yfid | ristrutturare-cucina |
| cmqm6g99k002vi8c4t19owmu3 | ristrutturare-appartamento |
| cmqm6g0ll001qi8c4hmpvfn0a | fare-opere-murarie |
| cmqm6g04i001ni8c4m2rc2ag3 | fare-massetto |
| **cmqnvk535001jqgc4fn8ookl7** | **ripristino-frontalino** |
| cmqm6g5w5002gi8c4rxyxrkfi | rifare-tetto |
| cmqm6g8ql002si8c40v150gau | riparare-tetto |

`ripristino-frontalino` — the intervention on the published request (Task 4)
— **is present**. Configuration is correctly persisted.

---

## TASK 3 — Configura Servizi save path

Trace:

```
CategoryInterventionsSelector (client form)
  ↓ submits <form action={updateServicesAction}>
apps/web/.../actions/update-services-action.ts: updateServicesAction()
  ↓ normalizeIds(formData.getAll("interventionIds"))
  ↓ calls updateCompanyServicesConfiguration(actor, { selectedCategoryIds, selectedInterventionIds })
packages/domain/.../update-services-configuration.ts
  ↓ validates ids exist (Category, Intervention)
  ↓ single $executeRaw CTE: DELETE+INSERT on CompanyCategory AND CompanyIntervention
```

**Does the UI save CompanyIntervention? YES.**

The write path is real and was exercised correctly for this company — the
10 rows in Task 2 are proof the save action works end-to-end.

### Adjacent risk found during trace (not the cause of this incident, flagging per audit scope)

`update-services-configuration.ts:86-109` runs:

```sql
_del_iv AS (
  DELETE FROM "CompanyIntervention"
  WHERE "companyId" = ${companyId}
    AND "interventionId" != ALL(${selectedInterventionIds}::text[])
)
```

If `selectedInterventionIds` is `[]` (empty array), `interventionId != ALL(ARRAY[]::text[])`
is vacuously **true** for every existing row, so **all** `CompanyIntervention`
rows for the company are deleted, and the function still returns `{ ok: true }`
(only `selectedCategoryIds` is validated as non-empty; `selectedInterventionIds`
has no equivalent guard). A form submission that omits `interventionIds`
(e.g. a client bug, a "select all categories, forget interventions" path, or
a partial/aborted submit) silently wipes a company's entire matching
configuration with no error surfaced to the user. Not observed in this
incident's data (the company's 10 rows are intact), but worth a follow-up
fix given it directly threatens the matching pipeline this audit is about.

---

## TASK 4 — Published request

| Field | Value |
| --- | --- |
| `Request.id` | `cmqobqdq20001dgc4e72q8e3i` |
| `Request.requestCode` | `REQ-95XBJX` |
| `Request.interventionId` | `cmqnvk535001jqgc4fn8ookl7` (`ripristino-frontalino`) |
| `Request.status` | `PUBLISHED` |
| `Request.city` | `Valverde` |
| `Request.latitude, longitude` | `37.5786724, 15.1229164` (Sicily) |
| `reviewedAt` | `2026-06-21T22:07:08.577Z` |
| `creditCost / maxUnlocks` | `10 / 3` (publishing requirements satisfied) |

---

## TASK 5 — Manual matching execution

Gate-by-gate evaluation of company `Sp` against request `REQ-95XBJX`,
replicating `resolveCandidates()` in
`packages/domain/src/internal/request/dispatch/resolve-request-dispatch-candidates.ts`:

| Step | Result | Detail |
| --- | --- | --- |
| APPROVED | **PASS** | `Company.status = APPROVED` |
| ACTIVE | **PASS** | `isActive = true`, `deletedAt = null` |
| COORDINATES | **PASS** | Company has non-null lat/lon (`45.46, 9.19`); request has non-null lat/lon (`37.5787, 15.1229`) |
| COVERAGE | **FAIL** | Haversine distance = **1005.29 km**; `operatingRadiusKm = 30`. Distance vastly exceeds radius. |
| INTERVENTION_MATCH | **PASS** (gate itself matches — see note) | `CompanyIntervention` contains `cmqnvk535001jqgc4fn8ookl7`, identical to `Request.interventionId` |

Note on ordering: in the live SQL, the `INTERVENTION_MATCH` condition
(`interventions: { some: { interventionId } }`) is applied as part of the
same `company.findMany` `WHERE` clause as APPROVED/ACTIVE/COORDINATES, and
COVERAGE (distance vs. radius) is applied afterward in JS on the returned
rows. Practically: the company **would have been returned by the SQL query**
(intervention match included), then **filtered out in the in-memory distance
check** immediately after. Either way, intervention match is satisfied and
coverage is the actual blocking gate.

**Net result: zero eligible candidates.** The company that was registered,
configured, and approved is physically ~1000 km from the request and only
covers a 30 km radius — it was never reachable by this request, by design of
the matching rule, not by a defect in the rule's implementation.

---

## TASK 6 — Dispatch artifact counts

For request `cmqobqdq20001dgc4e72q8e3i`:

| Artifact | Count |
| --- | --- |
| `RequestDispatch` | **0** |
| `CompanyNotification` | **0** |
| `NotificationDelivery` | **0** |

All three are zero, consistent with zero eligible candidates from Task 5.
`createRequestDispatchesForRequestWithClient` only creates these rows from
the `candidates` array returned by the resolver — with zero candidates,
every downstream `createMany` call is a no-op (`candidates.length > 0 ? ... : { count: 0 }`).

---

## TASK 7 — First missing artifact

```
Request exists (PUBLISHED, REQ-95XBJX)
  ↓
Company exists, APPROVED, ACTIVE, has coordinates, has the matching intervention
  ↓
Matching executes (resolveRequestDispatchCandidatesWithClient runs without error)
  ↓
Matching finds intervention match but rejects on COVERAGE (1005 km > 30 km radius)
  ↓
candidates = [] (eligibleCompanyCount = 0)
  ↓
RequestDispatch: never created (no candidates to create from)
  ↓
CompanyNotification: never created (no dispatch rows to attach to)
  ↓
NotificationDelivery: never created (no dispatch rows to attach to)
```

The **first missing artifact is `RequestDispatch`**, and it is missing
because the **matching step itself produced zero candidates** — there is no
broken artifact chain to repair; the chain correctly stopped at the
candidate-resolution step.

---

## FINAL ANSWERS

```txt
COMPANY_INTERVENTIONS_PRESENT = YES (10 rows, including the request's intervention)
REQUEST_INTERVENTION = cmqnvk535001jqgc4fn8ookl7 (ripristino-frontalino)
MATCHING_EXECUTED = YES
COMPANY_MATCHED = NO
REQUEST_DISPATCH_CREATED = NO
COMPANY_NOTIFICATION_CREATED = NO
DELIVERY_CREATED = NO
FIRST_FAILURE_POINT = COVERAGE (distance 1005.29 km > operatingRadiusKm 30 km)
ROOT_CAUSE = The approved company's registered location (Lombardy, lat 45.46/lon 9.19)
  and 30 km operating radius do not cover the published request's location
  (Valverde, Sicily, lat 37.58/lon 15.12), a ~1005 km gap. Intervention
  configuration, approval status, and the matching/dispatch pipeline all
  function correctly; the absence of dashboard request, notification, and
  email is the correct, by-design outcome of the COVERAGE gate rejecting a
  company that is geographically out of range for this specific request —
  not a defect in matching, dispatch, or notification code.
```

### Secondary, non-blocking finding (flagged for follow-up, not in scope for this incident)

`updateCompanyServicesConfiguration` (`packages/domain/src/company/services/update-services-configuration.ts:86-109`)
deletes all of a company's `CompanyIntervention` rows when
`selectedInterventionIds` is empty, with no validation guard equivalent to
the one already in place for `selectedCategoryIds`, and returns `{ ok: true }`.
This is a latent data-loss risk for the matching pipeline, separate from
this incident's root cause.
