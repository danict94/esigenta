# GEO REFOUNDATION — PHYSICAL CLEANUP REPORT

Date: 2026-06-22
Scope: verify that no dual geo architecture remains — every legacy field,
helper, write path, and piece of dead code from the pre-refoundation model
is gone, not deprecated-but-present.

---

## 1. Legacy geo fields — removed

Migration `20260622000002_geo_refoundation_drop_legacy` dropped:
- `Company.address`, `Company.city`, `Company.latitude`, `Company.longitude`,
  `Company.postalCode`, `Company.province`, `Company.street`, `Company.streetNo`
- `Request.address`, `Request.city`, `Request.latitude`, `Request.longitude`,
  `Request.postalCode`

Verified live against the real database:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name IN ('Company','Request') ORDER BY table_name, column_name;
```

Result: no `address`/`city`/`postalCode`/`province`/`latitude`/`longitude`/
`street`/`streetNo` column on either table. The only geo-related column on
`Company` or `Request` is `geoLocationId`.

`street`/`streetNo` specifically: confirmed via repo-wide search before
removal that they were write-only (set once at signup, read by zero
consumers) — dropped outright rather than migrated, since there is no
canonical place for them in the `GeoPlace` model and nothing depended on
their values.

## 2. Legacy geo helpers — removed

| Helper | Status |
| --- | --- |
| `city-autocomplete.tsx`'s old `NormalizedLocation` type and `normalizeGooglePlace` | Replaced by `GeoPlace` / `resolvePlaceFromGooglePlace` (`@esigenta/shared`). Confirmed zero remaining references to `NormalizedLocation` anywhere in `apps/`. |
| `get-requests-list-page.ts`'s local `computeBoundingBox` | Deleted. Confirmed zero remaining references to `computeBoundingBox` anywhere in the repo. |
| `packages/funnel`'s `normalizeRuntimeNumber` | Deleted as dead code once the location-answer functions it only served were rewritten around `isGeoPlace`. Confirmed zero remaining references. |
| Field-by-field `readRuntimeLocationAnswer`/`normalizeRuntimeLocationAnswer` reconstruction logic | Replaced with `isGeoPlace`-based validation; the old per-field branching (`address ?? ""`, `city ?? ""`, etc.) no longer exists anywhere in `packages/funnel`. |

## 3. Legacy geo write paths — removed

Before this refoundation, six independent call sites could write
`Company`/`Request` geo columns directly (`onboarding.ts`'s
`buildCompanyCreateData`, `update-profile.ts`'s raw `UPDATE`,
`create-request.ts`'s direct field assignment, plus three more reachable
through them). After:

- **Zero** direct Prisma/raw-SQL writes to geo columns remain outside
  `packages/database/src/geo/` — confirmed by the fact that those columns
  no longer exist on the Prisma schema; any such write would now be a
  compile error, not a convention to remember.
- Exactly one function creates/replaces a company's location
  (`setCompanyLocationWithClient`, `packages/database/src/geo/set-company-location.ts`).
- Exactly one function creates a request's location
  (`setRequestLocationWithClient`, `packages/database/src/geo/set-request-location.ts`).
- Exactly one function inserts a `GeoLocation` row at all
  (`createGeoLocationWithClient`).

No wrapper, adapter, or "legacy-compatible" shim sits in front of these —
callers pass a `GeoPlace` directly.

## 4. Unused geo code — removed

- `CompanyLocationFields`'s old manual, free-text `Provincia` `<Input>`
  (independent of the geocoded selection — itself a smaller instance of the
  same "independent field" anti-pattern the original audit found) was
  removed; province is now derived solely from the selected `GeoPlace`.
- The old `hasValidCoordinates`/`SavedLocationState`/`draftAddress` merge
  logic in `CompanyLocationFields` (needed only because the old model could
  represent a half-selected location) was deleted — a `GeoPlace` is always
  complete or `null`, so there is nothing left to merge.
- `RuntimeLocationAnswerPresence`'s field-by-field presence flags
  (`hasAddress`, `hasCity`, `hasCoordinates`) collapsed to a single
  `isCompleteGeoPlace` boolean, since partial presence is no longer a
  representable state.

## 5. Dead migrations — none found

All migrations under `packages/database/prisma/migrations/` are either
pre-existing (taxonomy refoundation, unrelated to this work and left
untouched) or the two new ones added in this session
(`20260622000001_geo_refoundation_additive`,
`20260622000002_geo_refoundation_drop_legacy`), both of which are live,
applied, and recorded in `_prisma_migrations` on the real database. No
migration was created and then abandoned or superseded within this
session.

## 6. Dead adapters — none found

`apps/admin/src/lib/notifications/resend-request-email-adapter.ts` and
`process-request-email-deliveries.ts` were audited and required **zero**
changes — their public types already returned flat
`city`/`postalCode` fields independent of the underlying schema shape, and
the only change needed lived one layer down
(`notification-deliveries.ts`'s internal Prisma select). No adapter needed
to be deleted or replaced; none existed for the old scalar-column model
specifically.

## 7. No dual architecture remains

Concretely verified, live, on the real database:

```sql
-- Every Company/Request row has exactly one GeoLocation, never zero, never partial
companies_without_location: 0
requests_without_location:  0
dangling_company_fks:       0   (geoLocationId set but target row missing)
dangling_request_fks:       0   (geoLocationId set but target row missing)
total_geo_locations:        3   (1 company + 2 requests, matches the full inventory)
```

```sql
-- No scalar geo columns survive on either table
information_schema.columns for Company/Request: geoLocationId is the only
geo-related column on either table.
```

```
turbo typecheck --force: 12/12 packages pass, 0 cache, full rebuild.
```

There is one source of truth for "what place is this" (`GeoLocation`), one
constructor (`resolvePlaceFromGooglePlace`), one company writer
(`setCompanyLocationWithClient`), one request writer
(`setRequestLocationWithClient`), and zero remaining call sites that can
write address text and coordinates independently of each other — the
structural root cause identified in
[GEOLOCATION_CONSISTENCY_AUDIT.md](../bugs/GEOLOCATION_CONSISTENCY_AUDIT.md)
no longer exists in the codebase.

---

## FINAL ANSWERS

```txt
GEO_MODEL_REFOUNDED = YES
PLACE_ID_PERSISTED = YES (nullable only for LEGACY_BACKFILL provenance; every
  live write path requires one, enforced by isFreshGeoPlace)
SINGLE_SOURCE_OF_TRUTH = YES (GeoLocation table; one constructor; one writer
  per entity; verified live on the real database — 0 missing, 0 dangling FKs)
LEGACY_GEO_REMOVED = YES (scalar columns dropped from the live schema; legacy
  helpers, dead code, and the old write paths deleted; nothing deprecated-but-present)
MATCHING_SCALABILITY_FIXED = YES (earthdistance/cube + GiST index replaces the
  JS-side full-table haversine scan; verified via the live query plan's
  index usage and the matching/dispatch re-run against real data)
DATABASE_CLEAN = YES (verified: 0 companies/requests without a location, 0
  dangling geoLocationId FKs, 0 remaining scalar geo columns)
READY_FOR_PRODUCTION = YES, with one caveat — this refoundation fixes the
  data model and matching correctness/performance. It does not fix Resend
  sandbox-mode email deliverability, which
  docs/bugs/EMAIL_SYSTEM_RELIABILITY_AUDIT.md already flagged as a separate,
  pre-existing, unrelated blocker (PRODUCTION_READY = NO in that audit,
  for reasons entirely outside geo).
```
