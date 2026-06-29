# TAXONOMY REFOUNDATION — PHASE 9.5: REQUEST INTERVENTION WRITE REPORT

Implementation phase. Closes the gap identified in [10_REQUEST_PERSISTENCE_AUDIT.md](10_REQUEST_PERSISTENCE_AUDIT.md): `Request.interventionId` existed (Phase 8, additive) but nothing ever wrote it. Confirmed throughout: zero changes to `packages/domain/src/internal/request/dispatch/*` or any notification code (`git status` shows only `create-request.ts` modified) — legacy matching, dispatch, and notifications remain exactly as they were.

---

## A. Files Changed

| File | Change |
|---|---|
| `packages/domain/src/public/requests/create-request.ts` | Added `resolveInterventionId(interventionSlug)` (mirrors `resolveRequiredServiceIds` exactly: same query style, same `RequestFlowError` pattern). Wired into `createRequestFromDraft` via `Promise.all` alongside the existing `resolveRequiredServiceIds` and `generateUniqueRequestCode` calls. Added `intervention: { connect: { id: interventionId } }` to the `Request.create` data object. |

No other file required modification — confirmed in the precheck audit and re-confirmed here: the schema (Phase 8), the funnel (`draft.interventionSlug` already present on every draft), and the dispatch/notification code all needed zero changes for this fix.

---

## B. Request Write Flow

**Single source of truth, no duplicate resolution logic:** both `interventionSlug` (the permanent snapshot) and the new `interventionId` (the FK) are derived from the exact same field — `persistedDraft.interventionSlug`. `resolveInterventionId` does one `prisma.intervention.findUnique({ where: { slug } })`, nothing more elaborate, consistent with the existing `resolveRequiredServiceIds`'s `Service.findMany` pattern in the same file.

**Why this is safe, not just convenient:** traced the upstream chain — `packages/funnel/src/orchestration/create-runtime-funnel.ts` calls `resolveInterventionForFunnel` and checks `if (!resolution)` *before* a `RequestDraft` can ever be built. This means every `interventionSlug` that reaches `create-request.ts` is already guaranteed, by upstream validation, to resolve to a live `Intervention` row — the new resolution step is a defensive guard (mirroring the existing style for required services) rather than a realistic new failure path.

**Atomicity:** the resolution itself (`resolveInterventionId`) is a read, run via `Promise.all` *before* the transaction starts — identical timing to `resolveRequiredServiceIds` today. The actual write (`intervention: { connect: { id } }`) is one field inside the single existing `tx.request.create(...)` call, which was already the sole write of `Request` + `RequestRequiredService` inside one transaction. No new transaction boundary, no new partial-write window — the change is additive to an existing atomic operation, not a second one.

---

## C. Validation Results

**Created a real request against the live database** (not a mock), using the actual `createRequestFromDraft` function with a draft targeting `riparare-perdita-acqua`:

```json
{
  "id": "cmqmx53iq0001y0c48h0fxu87",
  "status": "PENDING_VERIFICATION",
  "interventionSlug": "riparare-perdita-acqua",
  "interventionId": "cmqm6g7bf002ni8c48m10b58g",
  "requiredServices": [
    { "serviceId": "cmqm6fsax000oi8c4mtq0yqc4" }
  ]
}
```

- `interventionId` matches `riparare-perdita-acqua`'s actual `Intervention.id` exactly. ✓
- `RequestRequiredService` still populated (1 row, matching the intervention's linked service) — legacy write path completely unaffected. ✓
- `verificationEmailSent: true` — the existing request-creation side effects (customer upsert, photo attachment hook, verification token, verification email) all still ran, confirming nothing about the surrounding flow broke.

The test row, its `RequestRequiredService` row, its `CustomerAccessToken`, and the test `Customer` row were deleted immediately after verification — the database was returned to its prior state (0 `Request` rows). **One side effect worth disclosing plainly:** this test did send one real verification email (via the project's Resend sandbox, restricted to its own verified address) — an unavoidable consequence of exercising the real function end-to-end rather than mocking it, not a leftover artifact in the database.

---

## D. Legacy Compatibility

- `RequestRequiredService` is still created exactly as before — confirmed in §C, not just by reading the diff.
- `interventionSlug` is still written exactly as before, byte-for-byte same value as previously.
- `resolve-request-dispatch-candidates.ts` was not modified — it does not yet read `interventionId` (that's Phase 10's job) and continues reading `RequestRequiredService`/`InterventionService`/`CategoryService`/`requestMatchingMode` exactly as before. Legacy matching behavior for any request — old or new — is unaffected by this phase.
- No other consumer of `Request` (admin moderation views, company request lists, the public status/detail page) reads `interventionId` yet, so none of them change behavior either.

---

## E. Ready For Phase 10?

**YES.**

Every newly created request now populates `Request.interventionId`, verified by an actual end-to-end creation against the real database, not just by code inspection. Legacy `RequestRequiredService` writes and all legacy matching/dispatch/notification reads remain completely untouched and unaffected — confirmed by `git status` (only `create-request.ts` changed) and by the validation result showing both old and new fields correctly populated on the same row.

**One item carried forward, not a blocker, restated from the precheck audit:** the `Request` table has 0 historical rows in this environment, so there is no backfill needed now — but this must be re-checked once real request volume exists before Phase 10's shadow-mode comparison is considered statistically meaningful. The mechanism is proven correct; it simply hasn't been exercised at scale.
