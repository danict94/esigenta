# GEO REFOUNDATION — IMPLEMENTATION REPORT

Date: 2026-06-22
Scope: full execution against the real Neon database (`Esigenta`, project
`purple-glitter-37268985`). No patches, no compatibility layer, no dual
geo architecture left standing. Every phase below ran in this session.

---

## Phase 1 — Geo domain design (implemented)

`packages/shared/src/geo.ts` now defines the canonical `GeoPlace` value
object and its only constructor:

- `GeoPlace` — `{ placeId, formattedAddress, city, postalCode, province,
  latitude, longitude, source, resolvedAt }`. `resolvedAt` is a plain ISO
  string (not a `Date`) so the value survives JSON/URL transport unchanged.
  `placeId` is nullable only for `LEGACY_BACKFILL` provenance (see
  [01_DESIGN.md](01_DESIGN.md) §11.2) — every live capture has one.
- `resolvePlaceFromGooglePlace(raw, resolvedAt?)` — the only function in
  the codebase allowed to construct a `GeoPlace`. Returns `null`, never a
  partial object, if `placeId`, `formattedAddress`, `city`, or valid
  `latitude`/`longitude` are missing from the provider result.
- `isGeoPlace(value)` — runtime guard accepting either `GOOGLE_PLACES` or
  `LEGACY_BACKFILL` provenance, with a nullable `placeId`. Used to validate
  values crossing a serialization boundary (URL params, hidden form
  fields, JSON funnel answers).
- `isFreshGeoPlace(value)` — stricter guard requiring a non-null `placeId`
  and `GOOGLE_PLACES` source. This is what every write boundary actually
  checks, so a `LEGACY_BACKFILL` row read back for display can never be
  re-saved as if it were a new capture.
- `getGeoBoundingBox(...)` and `MAX_OPERATING_RADIUS_KM` — shared,
  reusable geo-query helpers (see Phase 6).
- `getDistanceKm(...)` — unchanged, still the plain haversine helper for
  single-pair JS-side distance display (e.g. the company request-detail
  visibility check), not for bulk matching.

`apps/web/src/ui/location/city-autocomplete.tsx` was rewritten so the
*only* legitimate source of geocoded data in the app — Google Places
Autocomplete — produces `GeoPlace | null` directly via
`resolvePlaceFromGooglePlace`, instead of the previous ad hoc
`NormalizedLocation` partial object. Typing in the input without selecting
a suggestion now calls `onChange(null)`, explicitly invalidating any
previously selected place rather than leaving a stale partial value behind.

---

## Phase 2 — Database refoundation (implemented)

Two migrations, applied directly to the real database via
`prisma migrate deploy` (no shadow-DB-dependent `migrate dev`, since this
session ran non-interactively):

### `20260622000001_geo_refoundation_additive`
- `CREATE TYPE "GeoSource" AS ENUM ('GOOGLE_PLACES', 'LEGACY_BACKFILL')`
- `CREATE TABLE "GeoLocation"` — `id, placeId (nullable), formattedAddress,
  city, postalCode, province, latitude, longitude, source, resolvedAt,
  createdAt, updatedAt`, indexed on `city`, `(latitude, longitude)`, and
  `placeId`.
- `Company.geoLocationId` / `Request.geoLocationId` — nullable, unique FK
  columns added alongside the (still-present) legacy scalar columns.
- Dropped the now-superseded `Company_city_idx`, `Company_latitude_longitude_idx`,
  `Company_postalCode_idx`, `Request_city_idx`, `Request_latitude_longitude_idx`.
- `CREATE EXTENSION IF NOT EXISTS cube; CREATE EXTENSION IF NOT EXISTS earthdistance;`
- `CREATE INDEX "GeoLocation_earth_point_gist_idx" ... USING gist (ll_to_earth(latitude, longitude))`

### `20260622000002_geo_refoundation_drop_legacy`
- `ALTER TABLE "Company" DROP COLUMN address, city, latitude, longitude,
  postalCode, province, street, streetNo`
- `ALTER TABLE "Request" DROP COLUMN address, city, latitude, longitude, postalCode`

Both applied and verified live (see [04_CLEANUP_REPORT.md](04_CLEANUP_REPORT.md)
for the column-level verification). `street`/`streetNo` were dropped
outright, not migrated — a repo-wide search confirmed they were write-only
dead fields (set at signup, never read by any consumer).

---

## Phase 3 / 4 — Backfill

See [02_BACKFILL_AUDIT.md](02_BACKFILL_AUDIT.md) for the full inventory and
resolution. Summary: 3 of 3 existing geo-bearing rows backfilled (2
`Request`, 1 `Company`); 0 missing-coordinate, 0 missing-address, 0
orphaned rows; 1 confirmed address/coordinate mismatch (`Company` `Sp`),
corrected using independently-verified coordinates from two matching
`Request` submissions, not silently carried forward.

---

## Phase 5 — Write boundaries (implemented)

`packages/database/src/geo/`:
- `create-geo-location.ts` — `createGeoLocationWithClient(tx, place)`, the
  one `GeoLocation` INSERT in the codebase. Shared plumbing, not itself a
  "company" or "request" writer (analogous to the shared `prisma` client).
- `set-company-location.ts` — `setCompanyLocationWithClient(tx, companyId, place)`
  / `setCompanyLocation(companyId, place)`. **The only code allowed to set
  `Company.geoLocationId`.** Creates a fresh `GeoLocation` row, repoints
  the company at it, deletes whatever location it previously had. Used by
  both company creation (`onboarding.ts`, attached inside the same
  transaction right after `tx.company.create`) and company profile edits
  (`update-profile.ts`) — one function, two lifecycle moments, no third
  path.
- `set-request-location.ts` — `setRequestLocationWithClient(tx, requestId, place)`.
  **The only code allowed to set `Request.geoLocationId`.** Used once, at
  request creation (`create-request.ts`), inside the same transaction as
  `tx.request.create`.

Both write functions are exported from `@esigenta/database` (not
`@esigenta/domain`) — see [01_DESIGN.md](01_DESIGN.md) §11.1 for why:
`@esigenta/auth` (which owns company creation) cannot depend on
`@esigenta/domain` without creating a circular dependency, and both
packages already depend on `@esigenta/database`.

Every write path that used to touch `address`/`city`/`postalCode`/`province`/
`latitude`/`longitude` directly was rewired to call these functions instead:

| File | Change |
| --- | --- |
| `packages/auth/src/identity/company/onboarding.ts` | `CreateCompanyProfileInput` now takes one `geoPlace: GeoPlace` field instead of 6 independent optional scalars; `createCompanyForUser` calls `setCompanyLocationWithClient` inside its existing transaction |
| `packages/domain/src/company/profile/update-profile.ts` | `UpdateCompanyProfileInput` now takes `geoPlace: GeoPlace`; rewritten from a raw 8-column `UPDATE` to a transaction calling `setCompanyLocationWithClient` |
| `packages/domain/src/public/requests/create-request.ts` | `validateGeoForCreation` now returns a validated `GeoPlace` (via `isFreshGeoPlace`) instead of 5 independent normalized fields; the creation transaction calls `setRequestLocationWithClient` after `tx.request.create` |

---

## Phase 6 — Matching performance (implemented)

`packages/domain/src/internal/request/dispatch/resolve-request-dispatch-candidates.ts`
was rewritten from a Prisma query-builder call (fetch every
intervention-matching company nationwide, filter by distance in JS) to a
single raw SQL query using PostgreSQL's native `earthdistance`/`cube`
extension — **not PostGIS**, which would be unjustified complexity for
single-point/circle radius queries at this domain's scale.

Chosen approach, in order of consideration:
1. **PostGIS** — rejected. Superuser-grade extension, full geometry/SRID
   machinery, far more than a point-distance/radius check needs.
2. **Manual bounding box only** (`WHERE lat BETWEEN ... AND lng BETWEEN ...`)
   — rejected as the sole mechanism. Cheap and index-friendly on a plain
   B-tree, but only a rectangular approximation; still needs an exact
   circular check afterward, and doesn't get a real spatial index.
3. **`earthdistance`/`cube` + GiST index (chosen).** Built into Postgres,
   no extra ops to learn beyond `ll_to_earth`/`earth_box`/`earth_distance`,
   and gives a real GiST index on `ll_to_earth(latitude, longitude)` for
   the pre-filter.

Because `Company.operatingRadiusKm` varies per row, the query can't use a
single `earth_box(point, radius)` with the search radius as the bound (that
pattern only works when every row shares the same threshold). Instead:
`earth_box(requestPoint, MAX_OPERATING_RADIUS_KM * 1000)` — index-accelerated,
using the shared upper bound (100 km, the ceiling of the allowed radius
list) as a safe superset — pre-filters candidates, then
`earth_distance(...) <= company."operatingRadiusKm" * 1000` applies the
exact per-company threshold over that already-small set. Two-stage,
correct, and the only full-table-relevant work happens through the index.

The same treatment was applied to
`packages/domain/src/company/requests/get-requests-list-page.ts`'s
company-dashboard query, which already had its own hand-rolled
bounding-box + manual-haversine SQL (a pre-existing, reasonable pattern,
just not index-backed) — replaced with the same `earth_box`/`earth_distance`
predicates against the new `GeoLocation` join, and the local
`computeBoundingBox` helper was deleted in favor of the shared
`getGeoBoundingBox` (kept in `@esigenta/shared`, currently otherwise
unused but available for any future caller that genuinely needs a
single-radius bounding box rather than the earthdistance approach).

---

## Phase 7 — Cutover (implemented, every consumer)

Every file that read or wrote `Company`/`Request` geo columns was migrated
to read through the `geoLocation` relation (or the SQL `JOIN "GeoLocation"`
equivalent in raw queries). This list was produced by running
`turbo typecheck` after the legacy columns were physically dropped
(Phase 2) — every remaining stale reference became a hard compile error,
which is the actual completeness guarantee for this phase, not a
hand-maintained checklist.

**Write surfaces** (already covered in Phase 5):
`onboarding.ts`, `update-profile.ts`, `create-request.ts`, plus their UI
callers — `company-lead-form.tsx`, `signup-page.tsx`,
`impresa-signup-form.tsx`, `signup-action.ts`, `company-location-fields.tsx`,
`profile-actions.ts`, `profile-page.tsx`, `request-step-ui.tsx`.

**Funnel layer** (`packages/funnel`) — the "location" answer is now
`GeoPlace | null` end to end, not a bag of optional fields:
- `types/request-draft.ts` — `RequestGeoDraft = GeoPlace | null`.
- `normalization/index.ts` — `readRuntimeLocationAnswer`/
  `normalizeRuntimeLocationAnswer` now just validate via `isGeoPlace`;
  `isRuntimeLocationAnswerComplete` is `isGeoPlace(value)`;
  `describeRuntimeLocationAnswerPresence`/`RuntimeLocationAnswerPresence`
  simplified to `{ shape, isCompleteGeoPlace }` (was field-by-field
  presence flags). The now-unused `normalizeRuntimeNumber` helper was
  deleted as dead code.
- `runtime/enrich-request.ts` — `hasGeoContext` is `draft.geo !== null`.
- `compiler/build-request-draft.ts` — unchanged call shape, now correctly
  typed against the new draft contract.

**Domain read consumers** — each rewired to select through `geoLocation`
and (where the function's public return type intentionally stayed flat,
e.g. for minimal blast radius to existing UI) flatten the nested relation
back into the original field names at the boundary:
- `get-requests-list-page.ts` (company dashboard list + filter options)
- `get-request-detail-page.ts` (company request detail + visibility check)
- `get-purchased-requests-page.ts`, `get-saved-requests-page.ts`
- `get-profile-page.ts` (now exposes `geoPlace: GeoPlace | null` directly,
  since its only consumer — the profile page's location editor — needed
  the real value object, not flattened fields)
- `admin/companies/admin-companies.ts` (company list `city` column)
- `admin/requests/get-request-by-id.ts`, `list-admin-requests.ts`,
  `list-pending-requests.ts` (admin moderation views)
- `customer/requests/customer-soft-access.ts` (customer-facing request
  status/history pages — 3 query sites)
- `internal/conversation/side-effects.ts`, `get-thread.ts`,
  `company/conversations/list-conversations.ts`,
  `company/support/get-support-conversation.ts` (conversation/messaging
  `request.city` references)
- `company/notifications/notifications.ts` (notification card `request.city`/`postalCode`)
- `internal/request/notification-deliveries.ts` (pending email delivery
  `request.city`/`postalCode` — the admin email-sending adapter
  (`resend-request-email-adapter.ts`,
  `process-request-email-deliveries.ts`) needed **no changes**, because
  this file's public `PendingEmailNotificationDelivery` type kept its flat
  shape; only the internal Prisma select changed)
- `packages/billing/src/admin/credit-refunds.ts` (admin credit refund
  review list — the one consumer outside `packages/domain` that queried
  `Request.city` directly)

**Read-only UI consumers that needed zero changes**: every admin page
(`requests/[id]/page.tsx`, `requests/page.tsx`, `imprese/page.tsx`,
`crediti/rimborsi/richieste/page.tsx`) and every web app display surface
(`company-request-list.tsx`, `request-detail-view-model.ts`,
`message-thread.tsx`, `request-status-page.tsx`,
`customer-requests-page.tsx`, `customer-request-detail-page.tsx`,
`request-detail-page.tsx`, `notification-card.tsx`) — none of them query
Prisma directly; they all consume `@esigenta/domain` function results, and
those functions' public TypeScript shapes were deliberately kept flat
(`city`/`address`/`postalCode`/`latitude`/`longitude` as before) wherever a
UI surface only ever displays them, so the blast radius of the schema
change stayed inside the domain layer. This was verified, not assumed —
`turbo typecheck` passes clean across all 13 packages with the legacy
columns physically gone (see below).

---

## Verification performed

```
npx turbo typecheck --force   →  12/12 tasks successful, 0 cached, full rebuild, 0 errors
pnpm --filter admin lint      →  clean
npx turbo lint --filter=web   →  3 pre-existing, unrelated failures (performance.now()
                                  purity lint in profile-page.tsx; an apostrophe-escaping
                                  rule in professional-cta.tsx) — both predate this session
                                  (present in files already modified before this work began
                                  by an unrelated in-flight refactor) and were not touched by
                                  any geo-related edit; confirmed via `git diff` that the
                                  flagged lines are untouched by this refoundation.
```

### Runtime validation against the real database

Ran the actual domain functions (not a re-implementation) directly against
the live Neon database via `tsx`, for the request `REQ-95XBJX`
(`cmqobqdq20001dgc4e72q8e3i`) that the original P0 audit found stuck with
zero dispatch artifacts:

```
resolveRequestDispatchCandidates(requestId)
  → eligibleCompanyCount: 1
  → candidates: [{ companyId: "Sp", distanceKm: 0, operatingRadiusKm: 30, ... }]

createRequestDispatchesForRequest(requestId)
  → dispatchCreatedCount: 1
  → appNotificationCreatedCount: 1
  → emailDeliveryCreatedCount: 1
  → skippedNoRecipientCount: 0
```

Confirmed directly in the database afterward:

```sql
RequestDispatch count for this request:        0 → 1
CompanyNotification count for this request:     0 → 1
NotificationDelivery count for this request:    0 → 1
```

Also ran `getCompanyRequestsListPage` (the company dashboard list) for
company `Sp` — the request now appears, `matchLevel: "selected_intervention"`,
`distance` computed via the new earthdistance path, sort `"nearest"`
applied correctly.

This is the same request, the same company, the same database row that
the original [P0_MATCHING_BREAKPOINT_AUDIT.md](../bugs/P0_MATCHING_BREAKPOINT_AUDIT.md)
found with zero matching artifacts due to the 1005 km coordinate
inconsistency. After the refoundation's backfill correction and the
matching rewrite, the same live data now produces a correct match,
dispatch, notification, and email delivery — end to end, on the real
database, not a simulation.

A temporary validation script (`packages/domain/scratch-validate-geo.ts`)
was used to run these checks and deleted immediately afterward — it is not
part of the committed codebase.
