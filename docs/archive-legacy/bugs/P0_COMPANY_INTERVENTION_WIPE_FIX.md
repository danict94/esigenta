# P0 COMPANY_INTERVENTION_WIPE_FIX

Date: 2026-06-22
Scope: fix only. Source: `docs/archive-legacy/bugs/P0_MATCHING_BREAKPOINT_AUDIT.md`, secondary finding.

---

## BUG

`updateCompanyServicesConfiguration` (`packages/domain/src/company/services/update-services-configuration.ts`)
validated `selectedCategoryIds` for emptiness but not `selectedInterventionIds`.
A submission with `selectedInterventionIds = []` reached the write CTE, where

```sql
DELETE FROM "CompanyIntervention"
WHERE "companyId" = ${companyId}
  AND "interventionId" != ALL(ARRAY[]::text[])
```

is vacuously true for every existing row, deleting the company's entire
matching configuration while still returning `{ ok: true }`.

---

## FIX

Added a guard before any database round trip (lines 47-53):

```ts
if (selectedInterventionIds.length === 0) {
  return { ok: false, code: "missing_interventions" }
}
```

Placed immediately after the existing category checks and before the
validation queries and the write CTE — zero reads, zero writes happen on
this path. The now-dead ternary in the validation `Promise.all` (which
special-cased an empty `selectedInterventionIds` array) was simplified
since the array can no longer be empty at that point.

**Not changed:** schema, migrations, the write CTE itself, matching/dispatch
code, `too_many_categories` / `invalid_categories` / `invalid_interventions`
behavior.

---

## CALLER TRACE

```
CategoryInterventionsSelector (client form, "interventionIds" checkboxes)
  ↓ <form action={updateServicesAction}>
update-services-action.ts: updateServicesAction()
  ↓ normalizeIds(formData.getAll("interventionIds")) — no validation here
  ↓ updateCompanyServicesConfiguration(actor, { selectedCategoryIds, selectedInterventionIds })
  ↓ if (!result.ok) redirectWithError(result.code)   — already generic, no change needed
services-configuration-page.tsx: errorMessages map
  ↓ added "missing_interventions" → "Seleziona almeno un intervento prima di continuare."
```

No caller required code changes beyond the new error-message string — the
action already forwards `result.code` generically via `redirectWithError`,
and the page already looks up any code in `errorMessages`.

---

## VALIDATION (live database)

Ran a one-off script (`pnpm exec tsx`, executed against the real Neon DB,
then deleted — no permanent test infra exists in this repo, confirmed via
repo-wide search: zero `vitest`/`jest` dependencies anywhere) against a
throwaway company (`WIPE-FIX-VERIFICATION-TMP`, deleted at the end of the
run). Exercised the real `updateCompanyServicesConfiguration` function, not
a mock.

**Scenario A — existing company, 10 interventions, submit `[]`:**

| | Before | After |
| --- | --- | --- |
| `CompanyIntervention` count | 10 | **10** |

Result: `{ ok: false, code: "missing_interventions" }`. Count unchanged.

**Scenario B — existing company, 10 interventions, submit 5:**

| | Before | After |
| --- | --- | --- |
| `CompanyIntervention` count | 10 | **5** |

Result: `{ ok: true }`. Count is exactly the 5 submitted ids.

Raw output:

```
SEED: { ok: true } count = 10
SCENARIO A (submit []): { beforeCount: 10, result: { ok: false, code: 'missing_interventions' }, afterCount: 10, passed: true }
SCENARIO B (submit 5 of 10): { result: { ok: true }, afterCount: 5, passed: true }
CLEANUP: test company deleted
```

`tsc --noEmit` clean in `packages/domain` after the change.

---

## FINAL ANSWERS

```txt
WIPE_PATH_REMOVED = YES
EMPTY_SUBMISSION_BLOCKED = YES (code: missing_interventions, zero DB writes)
DB_STATE_PRESERVED = YES (verified live: 10 -> 10 on rejected submission)
REGRESSION_TESTS_ADDED = YES (live-DB scenario script, run and recorded above;
  no persistent test framework exists in this repo to host it as a
  permanently-running suite — this matches the project's existing convention
  for domain-layer verification, e.g. docs/archive-legacy/refoundation/taxonomy-refoundation/09_*)
```
