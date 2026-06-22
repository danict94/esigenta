# DOMAIN INVARIANTS — PHASE 6: PHYSICAL CLEANUP

Date: 2026-06-22
Scope: implementation, strictly limited to items already classified safe
in `05_DATABASE_INTEGRITY_AUDIT.md`. No new abstractions, no behavior
changes, no business logic changes. Validated live against the real Neon
database (`Esigenta`, project `purple-glitter-37268985`).

---

## TASK 1 — `onboardingCategorySlug` passthrough removed

**File**: `packages/domain/src/company/profile/get-profile-page.ts`

Removed:
- `CompanyProfileData.onboardingCategorySlug` field
- `CompanyProfileRow.onboarding_category_slug` field
- the `c."onboardingCategorySlug" AS onboarding_category_slug` SQL select
  column
- the `onboardingCategorySlug: row.onboarding_category_slug` assignment
- one stale comment ("fallback category included") describing behavior
  Phase 1 had already removed but the comment never caught up to

**What was not touched**: `Company.onboardingCategorySlug` the database
column itself, and its two legitimate remaining readers/writers
(`onboarding.ts` at signup, `services-configuration-page.tsx`'s unsaved
suggestion banner) — both confirmed still in place, unaffected, per Phase
1's design. This task removed only the one confirmed-dead passthrough,
not the column or its restricted, intentional uses elsewhere.

**Verification**: repo-wide search for `company.onboardingCategorySlug`
under `apps/web/src/area-impresa/private/account/profilo/` (the one place
that could have read this field) returns zero matches. Search for
`CompanyProfileData` across the whole repo returns only the type's own
definition and its barrel re-export (`packages/domain/src/company/profile/index.ts`)
— no consumer references the field by name, confirming no dangling
reference was left behind.

---

## TASK 2 — `GeoLocation` orphan cleanup

**Ownership model, as it actually exists today**: `Company.geoLocationId`
and `Request.geoLocationId` each hold a unique foreign key *pointing at*
`GeoLocation`. The relationship is declared on the owner, not on
`GeoLocation` — so a standard FK constraint can express "if the
`GeoLocation` row disappears, null out the owner's pointer"
(already the case: `onDelete: SetNull` on both relations), but **cannot**
express the reverse ("if the owner disappears, delete its `GeoLocation`
row") through the FK alone, since the FK isn't declared on that side.

**Investigated whether an "orphan generator" exists in application
code**: repo-wide search for `.company.delete(` and `.request.delete(`
(hard deletes, as opposed to the existing soft-delete fields `deletedAt`/
`isActive`) returns **zero matches** anywhere in `packages/`. **There is
no hard-delete feature for `Company` or `Request` in this codebase at
all.** The 3 orphaned rows found in the geo refoundation and Phase 5 were
therefore not produced by any live application code path — they were
produced by an out-of-band action (a direct database operation, not a
feature of this application) during this session's earlier testing.

**Decision, documented as requested**: since no generator exists in
running code, there is nothing to remove or fix at the code level — doing
so would mean inventing a hard-delete-with-cascade feature that doesn't
currently exist, which Phase 6's rules explicitly forbid ("no new
features," "no new abstractions"). The correct action available within
this phase's scope is the one actually taken: **delete the existing
orphan rows directly** (a data operation, not a code change) and
**document the standing recommendation** for whenever a hard-delete
feature for `Company`/`Request` is eventually built: that feature must
delete the associated `GeoLocation` row in the same transaction (the
"single canonical cleanup path" option), exactly mirroring how
`setCompanyLocationWithClient`/`setRequestLocationWithClient` already
delete the *previous* `GeoLocation` row on a *replace* — the same
discipline simply needs to extend to a *delete* operation once one
exists. A database-level trigger was considered and rejected as
disproportionate: it would be new infrastructure solving for a feature
that isn't built yet.

**Action taken** (data only, live on the real database):
```sql
DELETE FROM "GeoLocation" WHERE id IN (
  'geoloc_req_muv9md_backfill',
  'geoloc_req_95xbjx_backfill',
  'geoloc_company_sp_corrected'
);
-- 3 rows deleted, all 3 IDs returned, confirming exact match with the
-- previously-audited orphan set (no more, no fewer).
```

**Verification, live**:
```sql
remaining_orphans:        0
total_geolocation_rows:   2  (the company's and the request's — the only
                              two real, owned rows in the database)
```

---

## TASK 3 — `RequestStatus.CLOSED` classification

| Check | Result |
| --- | --- |
| Written anywhere? | **No.** Repo-wide search for `closeRequest`, `status: "CLOSED"` as a write target, and `RequestStatus.CLOSED` in any `data:`/`update`/`create` context: zero matches. `reviewRequest`'s `ReviewRequestDecision` type (the only admin status-transition entrypoint) only allows `"APPROVED" \| "PUBLISHED" \| "REJECTED"` — `CLOSED` is not a reachable transition target anywhere in the code. |
| Read anywhere? | **Yes, extensively.** `admin-dashboard.ts` and `list-admin-requests.ts` both include it in their status filter/count sets; `apps/admin/.../requests/[id]/page.tsx`, `apps/admin/.../requests/page.tsx`, and the admin overview page all branch on or display a `CLOSED` count; `apps/web/.../richiesta/stato/request-status-page.tsx`, `customer-requests-page.tsx`, and `customer-request-detail-page.tsx` all have explicit `case "CLOSED":` branches for customer-facing status copy. |
| Reachable? | No — a value that is read everywhere defensively but never written can never actually occur in the live data, so none of those read sites can currently be exercised with a real `CLOSED` row. |

**Classification: PLACEHOLDER** (not `DEAD` — the UI was clearly built in
anticipation of this status existing, with real, specific copy for it in
both the admin and customer-facing surfaces; it simply has no transition
mechanism wired up yet, most plausibly an intended "mark this request as
closed/fulfilled" admin action that was never implemented). Per the
task's instruction, **not removed** — documented only, exactly as
required for either a `DEAD` or `PLACEHOLDER` finding.

---

## TASK 4 — Dead enum re-verification (no removals)

Repo-wide search, full `packages/` and `apps/` trees, this session:

| Enum member | Matches found | Classification |
| --- | --- | --- |
| `NotificationChannel.WHATSAPP` | 0 | PLACEHOLDER (confirmed) |
| `ConversationType.COMPANY_ADMIN` | 0 | PLACEHOLDER (confirmed) |
| `ConversationType.ADMIN_CUSTOMER` | 0 | PLACEHOLDER (confirmed) |
| `ConversationType.INTERNAL_ADMIN` | 0 | PLACEHOLDER (confirmed) |
| `CustomerTokenPurpose.REVIEW_ACCESS` | 0 | PLACEHOLDER (confirmed) |
| `CreditLotSource.LEGACY_MIGRATION` | 0 | PLACEHOLDER (confirmed) |

All six confirmed at zero application-code references, matching Phase
5's findings exactly. **No removals performed**, per the task's explicit
instruction — these remain forward-declared placeholders in the schema,
not cleanup candidates.

---

## TASK 5 — Integrity verification

- `onboardingCategorySlug` dead-passthrough usage: **0** — confirmed by
  the Task 1 search above. (The column's own legitimate, restricted
  usage at signup and in the Configura Servizi suggestion banner is
  unaffected and intentionally out of scope — that is Phase 1's
  `LEGACY`-classified, still-correct behavior, not a dangling reference.)
- `GeoLocation` orphan generators: **0** — confirmed no hard-delete code
  path exists for `Company` or `Request` anywhere in the codebase.
- New dangling references introduced by this phase's edits: **0** —
  confirmed via the `CompanyProfileData` search above (only the type's
  own definition and barrel re-export reference it; no consumer broke).

---

## TASK 6 — Validation

```
npx turbo typecheck --force
→ Packages in scope: @esigenta/auth, @esigenta/billing, @esigenta/config,
  @esigenta/database, @esigenta/domain, @esigenta/funnel,
  @esigenta/notifications, @esigenta/shared, @esigenta/taxonomy,
  @esigenta/ui, @esigenta/uploads, admin, web
→ Tasks: 12 successful, 12 total (full rebuild, no cache)
```

All 12 packages typecheck clean after this phase's changes.

---

## FINAL ANSWERS

```txt
ONBOARDING_CATEGORY_SLUG_REMOVED = PARTIALLY, exactly as scoped — the dead
  passthrough on CompanyProfileData/get-profile-page.ts is fully removed
  and verified at zero remaining references. The underlying Company
  column and its two legitimate, Phase-1-restricted uses (onboarding write,
  Configura Servizi suggestion display) were correctly left in place —
  removing those was never classified as safe and was out of this task's
  scope.
GEOLOCATION_ORPHAN_GENERATOR_REMOVED = N/A — no generator exists in
  application code (zero hard-delete code paths for Company/Request found
  anywhere). The 3 existing orphan rows were deleted directly (data
  cleanup); the standing recommendation for any future hard-delete feature
  (clean up GeoLocation in the same transaction) is documented above, not
  implemented, since building that delete feature now would violate this
  phase's "no new features" rule.
REQUEST_STATUS_CLOSED_CLASSIFICATION = PLACEHOLDER (read extensively
  throughout admin and customer-facing UI; never written by any code path;
  not removed, per instruction).
DEAD_ENUMS_REMOVED = NO (as instructed — all 6 re-verified as PLACEHOLDER,
  zero removals performed).
TYPECHECK_PASS = YES — full turbo typecheck, all 12 packages, forced
  rebuild, zero cache, zero errors.
PHYSICAL_CLEANUP_COMPLETE = YES, for the scope this phase was given. Both
  Phase 5's SAFE_REMOVE_NOW items are now actually removed (the 3 orphan
  GeoLocation rows, deleted; the dead onboardingCategorySlug passthrough,
  removed from code). The two DEFER items from Phase 5
  (RequestStatus.CLOSED, the full credit-system enum sweep) remain exactly
  where Phase 5 left them — investigated further here only for CLOSED
  (now classified, not removed, as instructed), with the credit-enum sweep
  still open for whoever picks up that narrower follow-up.
```
