# GEO REFOUNDATION — DESIGN

Status: **IMPLEMENTED**. Originally written as a design-only document; this
header note plus §11 were added after the full refoundation
(schema, write boundaries, matching, cutover, cleanup) was executed in the
same continuous session — see
[02_BACKFILL_AUDIT.md](02_BACKFILL_AUDIT.md),
[03_IMPLEMENTATION_REPORT.md](03_IMPLEMENTATION_REPORT.md), and
[04_CLEANUP_REPORT.md](04_CLEANUP_REPORT.md) for what actually ran against
the real database. The sections below are otherwise unedited from the
original design; §11 records the handful of points where implementation
diverged from the original plan and why.

Date: 2026-06-22

Builds directly on:
- [GEOLOCATION_CONSISTENCY_AUDIT.md](../bugs/GEOLOCATION_CONSISTENCY_AUDIT.md)
- [P0_MATCHING_BREAKPOINT_AUDIT.md](../bugs/P0_MATCHING_BREAKPOINT_AUDIT.md)

---

## 0. Why this is a refoundation, not a patch

The audit did not find a bug in matching. It found that **location has no
domain model at all** — it is a loose bag of independently-writable
columns (`address`, `city`, `postalCode`, `province`, `latitude`,
`longitude`) copy-pasted across two entities (`Company`, `Request`) and
five write paths, held together only by client-side discipline in one React
component (`CityAutocomplete`). That component is correct. The schema and
the server boundary around it are not — they make no distinction between
"a place" and "some text and two floats that were true at one point in
time, maybe."

Patching `update-services-configuration.ts`'s SQL or adding one more
`if` to `update-profile.ts` would fix today's symptom and leave the same
shape to fail again the next time a sixth write path is added (the audit
already found five: company lead form, company signup, company profile
edit, request funnel, and — implicitly — any future admin/back-office
editor, which doesn't exist yet but has no architectural reason not to
repeat the same mistake). The fix has to be at the model layer: location
becomes a thing with an identity and an invariant, not a set of parallel
optional fields.

---

## 1. Canonical geo model

### 1.1 What a "place" is, going forward

A place is **one immutable fact, produced once, by one source, and never
edited field-by-field.** Concretely: a single successful Google Places
`place_changed` event is the only thing that is allowed to produce a place.
There is no "edit the city text" operation and no "edit the latitude"
operation — there is only "replace this location with a newly selected
place." This collapses the entire Task 4 inventory (ten independent write
sites) down to one semantic operation, even though it will still be
invoked from several UI surfaces.

### 1.2 Canonical shape

```ts
type GeoPlace = {
  placeId: string          // Google Place ID — the actual identity
  formattedAddress: string  // Google's formatted_address, verbatim
  city: string
  postalCode: string | null
  province: string | null   // ISTAT 2-letter province code, derived from
                             // administrative_area_level_2's short_name
  latitude: number
  longitude: number
  source: "GOOGLE_PLACES"   // see 1.3 — closed enum, not a free string
  resolvedAt: Date          // when this place was captured from the provider
}
```

This is not a new database table by necessity (see §4) — it is the
**value object** every write boundary accepts and every read boundary
returns. No caller is ever allowed to construct a partial `GeoPlace` (no
`Partial<GeoPlace>`, no individually-optional fields at the API boundary).
A location is either a complete, freshly-resolved place, or it does not
exist yet — there is no "half-saved address."

### 1.3 Why `source` is a closed enum now

Today there is exactly one source (Google Places). It will not stay that
way forever (a future "use my GPS position" button, a future bulk-import
of companies, a future admin override for unreachable addresses). Closing
the enum now, with one member, costs nothing and forces every future
source to be an explicit, reviewed addition rather than a silent new code
path that bypasses the model the same way `update-profile.ts` does today.

---

## 2. Location value object — enforcement, not convention

The `GeoPlace` shape in §1.2 is necessary but not sufficient — the audit's
actual finding is that nothing *enforced* shapes like it. Enforcement has
to live in exactly one place per direction:

### 2.1 Construction (the only legal way to get a `GeoPlace`)

```ts
// packages/shared/src/geo/resolve-place.ts
function resolvePlaceFromGooglePlaceResult(
  raw: GooglePlaceResult,
): GeoPlace | null
```

This function is the *only* code in the repository allowed to construct a
`GeoPlace`. It lives in `@esigenta/shared` (not `apps/web`) specifically so
that a future server-side caller (admin tooling, a backfill script, a
webhook) can construct the same value the client does, from the same
provider payload shape, with the same validation — instead of each surface
inventing its own partial mapping the way `normalizeGooglePlace` in
`city-autocomplete.tsx` does today. The existing client component becomes
a thin wrapper that calls this shared function and never touches
individual fields itself.

It returns `null` — not a partially-filled object — if any required field
(`placeId`, `formatted_address`, `geometry.location`) is missing. There is
no "best effort" path. This single change removes the entire class of bug
the audit found: there is no longer a code path that can produce `address`
text without coordinates, or coordinates without `placeId`, because the
constructor either returns a complete `GeoPlace` or nothing.

### 2.2 Transport (client → server)

Every form/action that currently sends `address`, `city`, `postalCode`,
`latitude`, `longitude` as five independent optional fields instead sends
one field: a `GeoPlace` (or its `placeId` alone, see §3.2) serialized as
JSON. Server actions accept `geoPlace: GeoPlace` as a single required
parameter, never five optional primitives. A request that's missing
`placeId` or has a `latitude` but no `city` fails Zod/type validation
before it reaches any domain function — there's no `normalizeFiniteNumber`
per-field salvage logic left to write.

### 2.3 Persistence boundary

Exactly one domain function per entity is allowed to write geo columns:

- `packages/domain/src/company/geo/set-company-location.ts` — the only
  writer of `Company.{address,city,postalCode,province,latitude,longitude,placeId}`.
- `packages/domain/src/request/geo/set-request-location.ts` — same, for
  `Request`.

Both take a `GeoPlace` and write all of its fields in one statement, with
no field individually optional. `update-profile.ts` and
`create-request.ts` stop writing geo columns directly — they call these
functions. This is the direct fix for Task 4/6 of the audit: the
independence between the text fields and the coordinate fields, which is
the actual root cause, is removed by construction, because there's no API
surface left that accepts "longitude" without accepting the rest of the
`GeoPlace` it came from.

---

## 3. `placeId` persistence

### 3.1 Should it be persisted? Yes — it's the only durable identity.

Right now neither `Company` nor `Request` stores anything that identifies
*which place* was selected — only a free-text address and a coordinate
pair that, per the audit, can silently drift apart with nothing to detect
it. `placeId` is Google's stable identifier for a place; storing it gives
the system:

- A way to *detect* the exact failure mode in this audit automatically:
  if `placeId` is present but a stored `(lat,lng)` doesn't match a
  re-fetch of that `placeId` (or simply: if `placeId` is null while
  `latitude`/`longitude` are set, on records created after the
  refoundation date), that's a structural integrity violation, queryable
  with one SQL statement instead of a manual audit.
- A re-geocoding key: if Google's place data improves, or a province
  boundary changes, the record can be refreshed without asking the user to
  re-type their address.
- A natural place to attach future place-level metadata (timezone, ISTAT
  comune code, served-by region) without re-deriving it from
  free-text every time.

### 3.2 What "persisted" means concretely

`placeId` is **mandatory**, not optional, on every new `GeoPlace` write
going forward (§2.1 already guarantees this — `resolvePlaceFromGooglePlaceResult`
returns `null` without it). It does not need a Google Places API call to
*read* — it is stored purely as an opaque string for identity and future
re-resolution, never dereferenced synchronously on the read path (see §9).

---

## 4. DB schema changes

Proposal: introduce a single `GeoLocation` table, referenced by both
`Company` and `Request`, rather than continuing to duplicate the same six
columns on every entity that has a place.

```prisma
model GeoLocation {
  id String @id @default(cuid())

  placeId          String  @unique
  formattedAddress String
  city             String
  postalCode       String?
  province         String?
  latitude         Float
  longitude        Float
  source           GeoSource @default(GOOGLE_PLACES)
  resolvedAt       DateTime

  createdAt DateTime @default(now())

  company Company?
  request Request?

  @@index([city])
  @@index([latitude, longitude])
}

enum GeoSource {
  GOOGLE_PLACES
}
```

`Company.geoLocationId String? @unique` and `Request.geoLocationId String? @unique`
replace the six duplicated scalar columns on each entity (`address`,
`city`, `postalCode`, `province`, `latitude`, `longitude` — `Request`
additionally drops its now-redundant standalone `address`/`city`/`postalCode`
block). `@unique` on the FK makes this a strict one-to-one, which is the
honest cardinality today (one company has one operating address; one
request has one job site) — it is **not** modeled as many-to-many or
shared rows, because a company's location and a request's location are
never the same row even if they happen to resolve to the same `placeId`;
each capture event is its own fact with its own `resolvedAt`.

### 4.1 Why a separate table and not just adding `placeId` to the existing columns

Two reasons, both load-bearing:

1. **It makes "no partial location" structurally true, not just
   conventionally true.** With six nullable scalar columns on `Company`,
   it is always possible (and, per this audit, has already happened) to
   set some of them and not others. A foreign key to a `GeoLocation` row
   is binary: either the company has a fully-formed, validated location
   row, or `geoLocationId` is null and the company has no location at
   all. There is no representable in-between state.
2. **It gives `GeoLocation.placeId` global uniqueness for free.** Two
   different requests for the same building should be able to share
   identity-detection logic (e.g. "this exact place has had N requests in
   the last 90 days") without that becoming a second matching system —
   they can still each have their own `GeoLocation` row pointing at the
   same `placeId` if `@unique` is relaxed to allow it later, but starting
   from one normalized concept makes that an additive change, not a
   migration.

### 4.2 Radius stays on `Company`, not on `GeoLocation`

`operatingRadiusKm` is a business attribute of the company (how far it's
willing to travel), not a property of its address. It stays exactly where
it is today (`Company.operatingRadiusKm`), unaffected by this refactor.
The audit already confirmed (Task 5) this is the one part of the current
model that already behaves like a single source of truth — no design
change needed here beyond what §6 covers for scale.

---

## 5. Matching performance at scale

### 5.1 What the current query actually does

`resolveCandidates()` (`resolve-request-dispatch-candidates.ts`) filters in
SQL on `isActive`, `deletedAt`, `status`, `latitude IS NOT NULL`,
`longitude IS NOT NULL`, `operatingRadiusKm > 0`, and the
`CompanyIntervention` join — then pulls **every matching row nationwide**
into Node and computes a haversine distance in JavaScript for each one,
discarding any company whose `distanceKm > operatingRadiusKm`. The
`@@index([latitude, longitude])` on `Company` is a plain composite B-tree;
it cannot accelerate a radius predicate (B-tree indexes can't represent
"within X km of a point" — only equality/range on the leading column) and
today it isn't even attempting one in SQL. This works today because there
is exactly one company in the database. It will not work once there are
thousands: every request publish becomes an O(companies-for-this-intervention)
scan with zero geographic pruning until the very last step.

### 5.2 Target approach

Two layers, additive, not mutually exclusive:

1. **SQL-level bounding-box pre-filter**, computed from the request's
   `(lat, lng)` and the *maximum* `operatingRadiusKm` across all companies
   (or, simpler and sufficient: each candidate's own radius, via a
   `LATERAL` join or a `WHERE` clause using the standard "1 degree
   latitude ≈ 111km" approximation per company row). This needs no new
   extension — it's a `WHERE latitude BETWEEN ... AND longitude BETWEEN ...`
   using the existing `@@index([latitude, longitude])`, and it eliminates
   the vast majority of geographically-irrelevant companies before any
   haversine math runs, in SQL or in JS.
2. **PostgreSQL `earthdistance`/`cube` extension** (built into Postgres,
   no superuser-only `postgis` dependency, no new ops to learn) for the
   precise circle predicate:
   `WHERE earth_box(ll_to_earth(:reqLat, :reqLng), "operatingRadiusKm" * 1000) @> ll_to_earth(latitude, longitude)`,
   backed by a GiST index on `ll_to_earth(latitude, longitude)`. This
   moves the entire radius check into the database, index-accelerated,
   replacing the current "fetch everything, filter in JS" pattern
   entirely. `earthdistance` is sufficient for this domain (city/region-scale
   radii, not survey-grade geodesy) — full PostGIS is not justified
   complexity for a single point-in-circle query.

This is explicitly **not** required before the geo model change in §1–4
ships — it is an independent, additive index/query change that becomes
*more* valuable, not less, once `GeoLocation` is its own table (the GiST
index lives on `GeoLocation`, not duplicated per consumer).

### 5.3 What does not need to change

The decision to keep matching on intervention-then-distance (rather than
distance-then-intervention) is sound and stays: intervention is normally
the more selective filter, and the existing
`docs/archive-legacy/refoundation/taxonomy-refoundation/06_MATCHING_CUTOVER_DESIGN.md` reasoning for
"intervention is the only matching unit" is orthogonal to this geo work
and is not revisited here.

---

## 6. Radius architecture

No structural change recommended beyond what §4.2 already states: radius
remains a `Company`-only integer column, validated against the existing
closed allowed-list (`[10,20,30,50,75,100]`), read by exactly one
consumer. The audit already found this is the one part of the current
design with a real single source of truth. The only addition: once
`GeoLocation` exists, the bounding-box/earthdistance predicate in §5.2
reads `operatingRadiusKm` from `Company` and `(latitude,longitude)` from
the related `GeoLocation` row in the same query — radius and place stay
in different tables because they are different kinds of fact (a business
preference vs. a geocoded address), but they are joined at query time, not
duplicated.

---

## 7. Single source of truth

| Concept | Today | After refoundation |
| --- | --- | --- |
| "What place is this?" | No identity — free text + floats, no `placeId`, duplicated per entity | `GeoLocation.placeId`, one row per resolved place, one FK per entity |
| "Where do I read a company's location from?" | `Company.{city,address,postalCode,province,latitude,longitude}` directly | `Company.geoLocation` (the relation) — six scalar reads collapse to one relation load |
| "Who can write a location?" | Five independent write paths, each touching raw columns | Two domain functions (`set-company-location`, `set-request-location`), each accepting only a complete `GeoPlace` |
| "What's the radius?" | `Company.operatingRadiusKm` (already correct) | unchanged |

The center of gravity moves from "six columns, many writers" to "one
relation, two writers, one constructor." That is the actual single source
of truth — not a config flag or a constant, but the fact that there is
exactly one function in the codebase capable of producing a valid
`GeoLocation` row, and exactly two capable of attaching one to an entity.

---

## 8. Write boundaries

Concretely, after refoundation, geo-writing call sites collapse to:

| Surface | Before | After |
| --- | --- | --- |
| Company lead form → signup | URL params carrying 5 independent fields through 5 files | Lead form resolves a `GeoPlace` once, signup page receives it as one opaque payload (still URL-transportable as a single encoded JSON blob or, preferably, a server-side draft token — see §10), never decomposed into separate query params |
| Company profile edit | `updateCompanyProfileAction` posts 5 independent hidden inputs | Posts one `GeoPlace`; `set-company-location.ts` is the only function that touches `Company.geoLocationId` |
| Request funnel | `validateGeoForCreation` checks 4 independent fields | Funnel step produces a `GeoPlace` via the shared constructor (§2.1); `create-request.ts` calls `set-request-location.ts` |
| Any future admin override | does not exist today | Must go through the same `set-*-location.ts` functions — there is no raw-SQL or Prisma `update` path left that touches geo columns directly, because they no longer exist on `Company`/`Request` |

No write path is allowed to update `latitude`/`longitude` without also
updating `placeId`/`formattedAddress`/`city` in the same statement,
because after §4 there is no longer a `latitude` column to update in
isolation — it lives on `GeoLocation`, written wholesale or not at all.

---

## 9. Read boundaries

- **Matching** (`resolveCandidates`) reads `Company.geoLocation.{latitude,longitude}`
  and `Request.geoLocation.{latitude,longitude}` via the relation — never
  the raw scalar columns, because those columns no longer exist. This is
  a mechanical `select` change once §4 lands; the matching *logic* (§5)
  is unaffected by the schema split.
- **Display** (admin request detail, company profile page, dashboards)
  reads `geoLocation.formattedAddress`/`city` for human display — never
  reconstructs an address from parts, because `formattedAddress` is
  stored verbatim from Google and is always complete.
- **No read path ever calls the Google Places API.** `placeId` is read-only
  identity data on the read path; re-resolving it (if ever needed, e.g. a
  data-quality job) is a deliberate, separate, rate-limited background
  operation — never inline with a request/response cycle. This keeps the
  read boundary free of third-party latency and API quota risk, which the
  current design also already avoids (no code path calls Google from the
  server today either) — this section formalizes that it must stay that
  way.

---

## 10. Migration path

This is a sketch of the path, not an implementation plan — a follow-up
`02_GEO_REFOUNDATION_MIGRATION_PLAN.md` should detail exact Prisma
migrations and backfill scripts, following the same phased-cutover
pattern already proven in `docs/archive-legacy/refoundation/taxonomy-refoundation/03_MIGRATION_PLAN.md`
through `17_LEGACY_TAXONOMY_SOURCE_REMOVAL_REPORT.md`.

1. **Add, don't replace.** Create the `GeoLocation` table and the
   nullable `geoLocationId` FK columns on `Company`/`Request` alongside
   the existing scalar geo columns. Nothing reads from or writes to the
   new table yet.
2. **Backfill `GeoLocation` rows from existing scalar data**, with
   `placeId = null` and `source = GOOGLE_PLACES` (best-effort label, since
   the original provenance wasn't recorded) for every existing
   `Company`/`Request` that has non-null `latitude`/`longitude`. This is
   the step where the audit's specific bad record (`Company` "Sp") either
   gets manually corrected (re-resolve its actual address) or flagged —
   it should **not** be silently migrated forward with wrong coordinates.
3. **Introduce the constructor and the two `set-*-location` domain
   functions** (§2.1, §2.3) without yet removing any existing write path.
   They write to *both* the new `GeoLocation` relation and the legacy
   scalar columns, kept in sync by the new code (the legacy columns
   become read-only from this point for any other caller).
4. **Cut over each write surface one at a time** (company lead form →
   signup → profile edit → request funnel), per the existing
   `taxonomy-refoundation` precedent of one cutover report per surface,
   each independently verifiable and revertible.
5. **Cut over matching and all read surfaces** to read `geoLocation.*`
   instead of the scalar columns, with a verification step (compare
   matching output before/after on real data) before removing the old
   read path — mirroring `10_MATCHING_CUTOVER_REPORT.md`'s approach for
   the taxonomy cutover.
6. **Physical cleanup**: drop the now-unused scalar geo columns from
   `Company` and `Request`, make `geoLocationId` the only geo-related
   column on either table. This is the only step that is a real schema
   *removal*, and it happens last, after every consumer is confirmed
   migrated — same discipline as
   `16_PHYSICAL_CLEANUP_REPORT.md`/`17_LEGACY_TAXONOMY_SOURCE_REMOVAL_REPORT.md`.
7. **Independently, at any point after step 1**: add the `earthdistance`
   extension and GiST index from §5.2. This is not gated on the rest of
   the migration — it's a pure performance addition once `GeoLocation`
   exists as the canonical place to index.

---

## 11. As-built: where execution diverged from this design

The full migration ran in one continuous session immediately after this
design was written (no separate review/approval gap — see
[03_IMPLEMENTATION_REPORT.md](03_IMPLEMENTATION_REPORT.md)). A handful of
points changed shape between plan and execution, all for concrete reasons
discovered while wiring real code:

1. **Write boundaries live in `@esigenta/database`, not `@esigenta/domain`.**
   §2.3 originally placed `set-company-location.ts`/`set-request-location.ts`
   under `packages/domain`. `packages/auth` (which owns company creation,
   `onboarding.ts`) does not depend on `@esigenta/domain` —
   `@esigenta/domain` depends on `@esigenta/auth`, so the reverse would be
   circular. Both `@esigenta/auth` and `@esigenta/domain` already depend on
   `@esigenta/database`, so the write boundary moved there
   (`packages/database/src/geo/`). This is still exactly one company
   writer and one request writer — just hosted one package lower so both
   real callers can reach it without a cycle.
2. **`GeoPlace.placeId` is `string | null`, not strictly `string`.** §1.2
   originally specified `placeId: string` unconditionally. The backfill
   (§4, [02_BACKFILL_AUDIT.md](02_BACKFILL_AUDIT.md)) migrates real
   historical rows that never captured a Google Place ID — forcing
   `placeId` non-null would have made it impossible to represent that
   honestly. `placeId` is nullable on `GeoPlace` and on `GeoLocation`, but
   a second, stricter type guard — `isFreshGeoPlace` — requires a non-null
   `placeId` and `GOOGLE_PLACES` source, and that stricter guard is what
   every write boundary actually checks. A `LEGACY_BACKFILL` row can be
   read and displayed; it can never be re-saved as if it were a fresh
   capture.
3. **`GeoSource` has two members, not one.** §1.3 closed the enum at
   `GOOGLE_PLACES`. Implementation added `LEGACY_BACKFILL` as the explicit,
   narrow exception for the one-time migration — never written by
   application code, only by the backfill SQL itself, and excluded by
   `isFreshGeoPlace` at every write boundary.
4. **Matching's radius pre-filter uses a shared upper bound, not a
   per-row bounding box.** §5.2's sketch implied one `earth_box`/`earth_distance`
   predicate. In practice `Company.operatingRadiusKm` varies per row, and
   `earth_box(point, radius)` needs a single radius to stay index-friendly.
   The implemented query pre-filters with `earth_box` at
   `MAX_OPERATING_RADIUS_KM` (100 km — the ceiling of the existing allowed
   radius list) — index-accelerated, a superset of every possible match —
   then applies the exact per-company `earth_distance(...) <= operatingRadiusKm * 1000`
   check over that already-small candidate set. Same two-stage shape as
   the design intended, just correctly accounting for radius being a
   per-row value instead of a query-wide constant.
5. **`getCompanyRequestsListPage`'s pre-existing bounding-box code got the
   same earthdistance treatment**, not just the matching path in §5/§6.
   The design's §5.1 found the bbox+haversine pattern already used there;
   once `GeoLocation` existed as the canonical place to index, it was a
   direct, low-risk win to replace that bbox+manual-haversine SQL with the
   same `earth_box`/`earth_distance` predicates, retiring the local
   `computeBoundingBox` helper in favor of `getGeoBoundingBox`/
   `MAX_OPERATING_RADIUS_KM` from `@esigenta/shared`.
6. **Company "Sp" was corrected, not quarantined**, using the request's
   independently-captured, verified-correct coordinates for the identical
   address string (§4 anticipated either outcome). See
   [02_BACKFILL_AUDIT.md](02_BACKFILL_AUDIT.md) for the full justification
   and provenance trail.

Nothing else changed: the `GeoLocation` table shape, the one-to-one FK
relations, the two-phase migration (additive → backfill → drop legacy),
and the read/write boundary discipline all shipped as designed.

---

## FINAL ANSWERS

```txt
CURRENT_MODEL_ACCEPTABLE = NO
SHOULD_GEO_BE_CENTRALIZED = YES
SHOULD_PLACE_ID_BE_PERSISTED = YES
DB_CHANGES_RECOMMENDED = YES
MATCHING_SCALABILITY_ACCEPTABLE = NO
REFOUNDATION_RECOMMENDED = YES
```
