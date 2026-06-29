# GEO REFOUNDATION — BACKFILL AUDIT

Date: 2026-06-22
Database: real Neon database `Esigenta` (project `purple-glitter-37268985`),
default branch. All queries in this report were run against that live
database, before and after the migration in
[03_IMPLEMENTATION_REPORT.md](03_IMPLEMENTATION_REPORT.md).

Precedes the additive migration `20260622000001_geo_refoundation_additive`.
This is the full inventory required before any backfill write — every
Company/Request row in the database was inspected, not sampled (the
database has exactly 1 `Company` row and 2 `Request` rows with geo data, so
a full inventory and a sample are the same thing here).

---

## Inventory query

```sql
SELECT 'Company' AS entity, id, address, city, "postalCode", latitude, longitude,
  (latitude IS NULL OR longitude IS NULL) AS missing_coords,
  (address IS NULL OR city IS NULL) AS missing_address
FROM "Company"
UNION ALL
SELECT 'Request' AS entity, id, address, city, "postalCode", latitude, longitude,
  (latitude IS NULL OR longitude IS NULL) AS missing_coords,
  (address IS NULL OR city IS NULL) AS missing_address
FROM "Request";
```

| entity | id | address | city | postalCode | latitude | longitude | missing_coords | missing_address |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Company | `cmqmj5k68000004jlh7m8ovw3` (`Sp`) | `95028 Valverde CT` | `Valverde` | `95028` | `45.46` | `9.19` | false | false |
| Request | `cmqo3c9z40004psc4pkubdi63` (`REQ-MUV9MD`) | `95028 Valverde CT` | `Valverde` | `95028` | `37.5786724` | `15.1229164` | false | false |
| Request | `cmqobqdq20001dgc4e72q8e3i` (`REQ-95XBJX`) | `95028 Valverde CT` | `Valverde` | `95028` | `37.5786724` | `15.1229164` | false | false |

---

## Findings

### Missing coordinates: NONE
No `Company` or `Request` row has a null `latitude`/`longitude` while having
an address. Zero "missing coordinates" records.

### Missing address: NONE
No row has coordinates without address/city text. Zero "missing address"
records.

### Duplicate locations: NONE (in the sense that matters)
The two `Request` rows share an identical address string and identical
coordinates. This is not a data-quality bug — `REQ-MUV9MD`
(`PENDING_VERIFICATION`, created 2026-06-21T17:59:10Z) and `REQ-95XBJX`
(`PUBLISHED`, created 2026-06-21T21:54:04Z) are two separate submissions by
the same customer (`fixpro.web@gmail.com` / `turi scapra`) for the same job
site, ~4 hours apart — the first apparently abandoned before email
verification, the second completed and published. Each gets its own
`GeoLocation` row in the backfill (per the design's §4.1: one row per
capture event, not a shared row), preserving that they were independently
submitted even though they resolve to the same place.

### Orphaned geo data: NONE
`GeoLocation` did not exist before this migration; there is nothing to be
orphaned relative to it. (Post-migration, `geoLocationId` foreign keys are
verified 1:1 and non-dangling in
[03_IMPLEMENTATION_REPORT.md](03_IMPLEMENTATION_REPORT.md).)

### address != coordinates: ONE confirmed case — Company `Sp`

This is the actual finding, already established in
[GEOLOCATION_CONSISTENCY_AUDIT.md](../bugs/GEOLOCATION_CONSISTENCY_AUDIT.md):

| | Company `Sp` | Request `REQ-95XBJX` / `REQ-MUV9MD` |
| --- | --- | --- |
| address text | `95028 Valverde CT` | `95028 Valverde CT` (identical) |
| city | `Valverde` | `Valverde` (identical) |
| postalCode | `95028` | `95028` (identical) |
| latitude, longitude | `45.46, 9.19` | `37.5786724, 15.1229164` |
| Distance between the two coordinate pairs | **1005.29 km** | — |

`95028` is the real Italian postal code for Valverde, **Catania province
(Sicily)**. The request coordinates are correct for that place. The
company's coordinates land on Milan (Lombardy) — internally inconsistent
with its own address text, and with no code path in the repository that
could have produced that pairing from a real Google Places selection (see
the consistency audit for the full reasoning).

---

## Resolution: corrected, not quarantined

Per the task's instruction ("Company 'Sp' must be corrected or explicitly
quarantined"), this backfill **corrects** the record rather than
quarantining it, on the following evidence chain:

1. The company's `address`/`city`/`postalCode` text is byte-identical to
   two independently-submitted `Request` rows.
2. Both `Request` rows' coordinates were captured live through the funnel's
   `CityAutocomplete` step (a real Google Places selection at submission
   time, per `structuredData.draft.geo` in each row) — not derived from
   each other, not copied from the company. Two independent funnel
   submissions agreeing on `37.5786724, 15.1229164` for `95028 Valverde CT`
   is strong corroborating evidence that pair is the true coordinate for
   that address.
3. `95028` uniquely identifies Valverde, CT in Italy's postal code system —
   there is no ambiguity that could make a second, different "Valverde"
   plausible.

The company's `GeoLocation` row was created with the corrected coordinates
(`37.5786724, 15.1229164`), `province = "CT"` (derived from the postal code,
since the original record never captured one), `placeId = NULL`, and
`source = LEGACY_BACKFILL` — an honest record that this value did not come
from a live Google Places capture, so it is readable and displayable but
can never be re-saved as a fresh capture (enforced by `isFreshGeoPlace`,
see [01_DESIGN.md](01_DESIGN.md) §11.2).

If this correction is ever found wrong, the remedy is for the company to
re-select its address through the live `CityAutocomplete` profile editor —
that produces a real `GOOGLE_PLACES` row with a real `placeId`, superseding
this one.

---

## Backfill SQL executed

```sql
-- Request REQ-MUV9MD (unchanged data, just migrated to GeoLocation)
INSERT INTO "GeoLocation" (id, "placeId", "formattedAddress", city, "postalCode", province, latitude, longitude, source, "resolvedAt", "createdAt", "updatedAt")
VALUES ('geoloc_req_muv9md_backfill', NULL, '95028 Valverde CT', 'Valverde', '95028', NULL,
        37.5786724, 15.1229164, 'LEGACY_BACKFILL', '2026-06-21T17:59:10.720Z', now(), now());
UPDATE "Request" SET "geoLocationId" = 'geoloc_req_muv9md_backfill' WHERE id = 'cmqo3c9z40004psc4pkubdi63';

-- Request REQ-95XBJX (unchanged data, just migrated to GeoLocation)
INSERT INTO "GeoLocation" (id, "placeId", "formattedAddress", city, "postalCode", province, latitude, longitude, source, "resolvedAt", "createdAt", "updatedAt")
VALUES ('geoloc_req_95xbjx_backfill', NULL, '95028 Valverde CT', 'Valverde', '95028', NULL,
        37.5786724, 15.1229164, 'LEGACY_BACKFILL', '2026-06-21T21:54:04.423Z', now(), now());
UPDATE "Request" SET "geoLocationId" = 'geoloc_req_95xbjx_backfill' WHERE id = 'cmqobqdq20001dgc4e72q8e3i';

-- Company Sp (corrected coordinates, see resolution above)
INSERT INTO "GeoLocation" (id, "placeId", "formattedAddress", city, "postalCode", province, latitude, longitude, source, "resolvedAt", "createdAt", "updatedAt")
VALUES ('geoloc_company_sp_corrected', NULL, '95028 Valverde CT', 'Valverde', '95028', 'CT',
        37.5786724, 15.1229164, 'LEGACY_BACKFILL', '2026-06-20T15:46:18.849Z', now(), now());
UPDATE "Company" SET "geoLocationId" = 'geoloc_company_sp_corrected' WHERE id = 'cmqmj5k68000004jlh7m8ovw3';
```

`resolvedAt` for each backfilled row was set to the original record's
`createdAt` — the closest honest approximation of "when this place was
captured," since the real capture timestamp for company `Sp` predates this
refoundation and was never separately recorded.

## Post-backfill coverage

```sql
SELECT count(*) FROM "Company"  WHERE "geoLocationId" IS NULL;  -- 0
SELECT count(*) FROM "Request"  WHERE "geoLocationId" IS NULL;  -- 0
```

100% of existing `Company`/`Request` rows (3 of 3 total geo-bearing
records) have a `GeoLocation` attached before the legacy scalar columns
were dropped.
