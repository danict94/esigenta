# GEOLOCATION CONSISTENCY AUDIT

Date: 2026-06-22
Scope: audit only. No source code changes. All data pulled live from the
production Neon database (`Esigenta`, project `purple-glitter-37268985`).
Builds on [P0_MATCHING_BREAKPOINT_AUDIT.md](P0_MATCHING_BREAKPOINT_AUDIT.md),
which found the company/request distance gap (1005.29 km) that triggered
this audit.

---

## TASK 1 — Company location lifecycle

```
company-lead-form.tsx (marketing page, public)
  CityAutocomplete -> Google Places "place_changed" -> NormalizedLocation
  { address, city, postalCode, latitude, longitude }
  ↓ on submit, serialized to URL query params (router.push)
/area-impresa/iscriviti?city=...&address=...&postalCode=...&latitude=...&longitude=...
  ↓
signup-page.tsx (AreaImpresaSignupPage)
  reads each of city/address/postalCode/latitude/longitude
  INDEPENDENTLY from searchParams — no field is checked against any other
  ↓
impresa-signup-form.tsx (ImpresaSignupForm)
  passes initialCompany.{address,city,postalCode,latitude,longitude} through unchanged
  ↓
signup-action.ts (completeCompanyOnboardingAction)
  normalizes each field independently (normalizeOptionalText / normalizeFiniteNumber)
  only requires: city present AND latitude/longitude both finite numbers
  ↓
create-company-for-current-user.ts -> packages/auth/src/identity/company/onboarding.ts
  normalizeCompanyProfile() / buildCompanyCreateData()
  writes address, city, postalCode, province, latitude, longitude as
  independent optional fields on Company.create — no cross-field check
```

Separate, second write path (post-onboarding edits):

```
profile-page.tsx -> company-location-fields.tsx
  CityAutocomplete -> same NormalizedLocation object, atomic in the browser
  ↓ hidden inputs (address/city/postalCode/latitude/longitude) submitted together
profile-actions.ts (updateCompanyProfileAction)
  ↓
packages/domain/src/company/profile/update-profile.ts (updateCompanyProfile)
  single raw SQL UPDATE writes website, address, city, postalCode, province,
  latitude, longitude, operatingRadiusKm in one statement.
  Validation is per-field only: website is a valid URL, radius is in the
  allowed list, latitude/longitude are both-present-or-both-null. There is
  no check that address/city/postalCode are consistent with latitude/longitude.
```

**Stored values for company `Sp` (`cmqmj5k68000004jlh7m8ovw3`):**

| Field | Value |
| --- | --- |
| address | `95028 Valverde CT` |
| city | `Valverde` |
| province | `null` |
| postalCode | `95028` |
| latitude | `45.46` |
| longitude | `9.19` |
| operatingRadiusKm | `30` |

`createdAt = 2026-06-20T15:46:18.849Z`. The only later write was the admin
approval at `2026-06-21T22:06:42.618Z`, which only sets
`status/approvedAt/suspendedAt` (`admin-companies.ts:371` — verified, no
latitude/longitude/address fields touched). **Latitude/longitude have not
changed since the original signup write.**

---

## TASK 2 — Request location lifecycle

```
richiesta funnel (apps/web/src/richiesta/flow/components/request-step-ui.tsx:128)
  case "location": <CityAutocomplete value={value} onChange={onChange} />
  Same shared component as the company flows (apps/web/src/ui/location/city-autocomplete.tsx)
  ↓ stored as draft.geo / rawAnswers.location in funnel state
  ↓
packages/domain/src/public/requests/create-request.ts
  validateGeoForCreation(draft): requires address, city, isValidLatitude(),
  isValidLongitude() to all be present/valid — but again no cross-field
  geographic consistency check between the text fields and the coordinates
  ↓
  data.city = geo.city; data.address = geo.address;
  data.latitude = geo.latitude; data.longitude = geo.longitude
  (create-request.ts:322-326) — written as independent fields, same pattern
  as the company path
```

**Stored values for request `REQ-95XBJX` (`cmqobqdq20001dgc4e72q8e3i`):**

| Field | Value |
| --- | --- |
| address | `95028 Valverde CT` |
| city | `Valverde` |
| postalCode | `95028` |
| latitude | `37.5786724` |
| longitude | `15.1229164` |

Also persisted, byte-identical, inside `structuredData.draft.geo` and
`structuredData.draft.rawAnswers.location` — confirming the funnel captured
this exact address/coordinate pair as one atomic Google Places selection at
submission time (`createdAt: 2026-06-21T21:54:04.423Z`).

---

## TASK 3 — Is this the same Valverde?

| | Company `Sp` | Request `REQ-95XBJX` |
| --- | --- | --- |
| Full formatted address | `95028 Valverde CT` | `95028 Valverde CT` |
| city | `Valverde` | `Valverde` |
| postalCode | `95028` | `95028` |
| Google Place ID stored | **not stored** (no `placeId` column on `Company` or `Request` — confirmed via `information_schema.columns`) | **not stored** |
| Coordinates | `45.46, 9.19` | `37.5786724, 15.1229164` |

`95028` is the real Italian CAP for **Valverde, Catania province (Sicily)**.
Both records' address/city/postal-code text **agree exactly** — textually,
they describe the same real place. The request's coordinates
(`37.5786724, 15.1229164`) are geographically correct for that place.

The company's coordinates (`45.46, 9.19`) are **not** Valverde CT — they
land almost exactly on Milan city center (Milan ≈ `45.4642, 9.1900`), roughly
1,000 km away, in Lombardy. No code path in this repository computes or
defaults to that pair (no `45.4`/`9.1`-range literal exists anywhere in
`apps/web` or `packages/`; verified by repo-wide search). The `Company`
schema also has no default value for `latitude`/`longitude` (both nullable
`Float?` with no `@default`, confirmed in `schema.prisma:210-211`).

**Conclusion: same real-world place by every text field, but the company's
coordinates are wrong/inconsistent with its own declared address.** Since
Google Places always returns `formatted_address` and `geometry` together
from one atomic API response, no normal, validation-respecting use of the
shared `CityAutocomplete` component could have produced "address text =
Valverde CT" paired with "coordinates = Milan" — that pairing is only
possible if the address/city fields were set independently of the
coordinate fields (see Task 4/6 for where that independence lives in code).

---

## TASK 4 — Coordinate source inventory

| File | Role |
| --- | --- |
| `apps/web/src/ui/location/city-autocomplete.tsx` | Shared Google Places Autocomplete wrapper. Single legitimate **source** of geocoded coordinates in the whole app. Returns address+city+postalCode+lat+lng as one atomic object per `place_changed` event. |
| `apps/web/src/area-impresa/public/marketing/company-lead-form.tsx` | **Create** (capture). Lead-gen step before company signup; feeds URL query params. |
| `apps/web/src/area-impresa/public/auth/signup-page.tsx` | **Create** (parse/relay). Parses `latitude`/`longitude` query params independently with `Number()`; no validation against `city`/`address` params. |
| `apps/web/src/area-impresa/public/auth/components/impresa-signup-form.tsx` | **Create** (relay). Passthrough only. |
| `apps/web/src/area-impresa/public/auth/actions/signup-action.ts` | **Create** (normalize). `completeCompanyOnboardingAction` — per-field normalization, no cross-field check. |
| `packages/auth/src/identity/company/onboarding.ts` | **Create** (write). `createCompanyForUser` → `Company.create` via `buildCompanyCreateData`; each of address/city/postalCode/province/latitude/longitude is independently optional. |
| `apps/web/src/area-impresa/private/account/profilo/company-location-fields.tsx` | **Update** (capture). Re-uses `CityAutocomplete`; atomic in the browser, exposed as hidden form fields. |
| `apps/web/src/area-impresa/private/account/actions/profile-actions.ts` | **Update** (relay). `updateCompanyProfileAction`. |
| `packages/domain/src/company/profile/update-profile.ts` | **Update/overwrite** (write). `updateCompanyProfile` — single raw SQL `UPDATE` writing address/city/postalCode/province/latitude/longitude together, but validated per-field only (`invalid_coordinates` only checks both-present-or-both-null, not consistency with address/city). |
| `apps/web/src/richiesta/flow/components/request-step-ui.tsx` | **Create** (capture). Funnel's `"location"` step; re-uses the same `CityAutocomplete`. |
| `packages/domain/src/public/requests/create-request.ts` | **Create** (validate/write). `validateGeoForCreation` + direct field assignment into `Request.create` data. |

No file recomputes coordinates from an address (no server-side/reverse
geocoding call exists anywhere in the repo — verified by searching for
`geocode`, `places.googleapis`, `Maps` outside this component). No
admin-side editor for `Company.latitude/longitude` exists (`apps/admin` has
no match for `latitude`/`longitude` outside the request-detail page, which
only *displays* a request's coordinates, it does not write company ones).

**The structural gap:** every write path treats
`{address, city, postalCode}` and `{latitude, longitude}` as two
independently-optional groups of fields, never as one unit. The browser
component (`CityAutocomplete`) is the only thing that ever keeps them in
sync, and only for the one event where the user actually clicks a Google
suggestion. Nothing server-side re-derives or sanity-checks one against the
other. Any path that supplies them out of step with each other (a
hand-built/edited URL into `signup-page.tsx`, a stale hidden-field replay, a
direct call to the server action, a partially-completed funnel state) will
be accepted and persisted without error.

---

## TASK 5 — Radius source inventory

| Concept | Stored where | Read where | Notes |
| --- | --- | --- | --- |
| Company radius | `Company.operatingRadiusKm` (`Int`, `@default(30)`, allowed values `[10,20,30,50,75,100]`) | `resolveCandidates()` in `packages/domain/src/internal/request/dispatch/resolve-request-dispatch-candidates.ts:105` (`select: { operatingRadiusKm: true }`, compared against `getDistanceKm`) | Set at signup (`onboarding.ts: normalizeOperatingRadiusKm`, default `30`) and editable via profile (`update-profile.ts`, same allowed list). |
| Request radius | **does not exist** — `Request` table has no radius column (confirmed via `information_schema.columns`) | n/a | Requests are points; only companies declare a coverage radius. |
| Matching radius | Not a separate value — matching reads `company.operatingRadiusKm` directly, in the same query that fetches lat/lng. | same as above | No cached/derived "matching radius" exists. |

**Single source of truth: YES.** `Company.operatingRadiusKm` is the one and
only radius value in the schema, written by exactly two paths (signup,
profile update) that both validate against the same allowed-value list, and
read by exactly one consumer (the dispatch resolver). Unlike the coordinate
fields, there is no parallel/independent radius field anywhere that could
drift.

---

## TASK 6 — Do matching inputs match what was saved?

**YES.** `resolveRequestDispatchCandidatesWithClient` (in
`resolve-request-dispatch-candidates.ts`) fetches `Request.latitude` /
`Request.longitude` directly from the `Request` table at the top of the
function, and `resolveCandidates()` fetches `Company.latitude` /
`Company.longitude` / `Company.operatingRadiusKm` directly from the
`Company` table in the same call. There is no cache, no denormalized
snapshot, no stale copy anywhere in the path — every value read by matching
is the live, currently-persisted column value, fetched in the same
transaction that creates the dispatch rows.

This means matching is **mechanically faithful** to what's stored — it is
not the cause of any staleness. But it also means matching has **no way to
know** the company's stored coordinates don't match the company's own
declared address (Task 3) — it has no independent signal to detect that,
because, per Task 4, nothing upstream of matching ever checked that either.
Matching computed the geometrically correct answer (1005.29 km, reject) for
the data it was given; the data itself was wrong before matching ever ran.

---

## TASK 7 — CompanyIntervention wipe risk

Re-examined `update-services-configuration.ts:86-109`
(`packages/domain/src/company/services/update-services-configuration.ts`):

```sql
_del_iv AS (
  DELETE FROM "CompanyIntervention"
  WHERE "companyId" = ${companyId}
    AND "interventionId" != ALL(${selectedInterventionIds}::text[])
)
```

If `selectedInterventionIds = []`, the `!= ALL(ARRAY[]::text[])` predicate is
vacuously true for every row, so **all** of the company's
`CompanyIntervention` rows are deleted, and the function still returns
`{ ok: true }` — only `selectedCategoryIds.length === 0` is rejected
(`missing_categories`); there is no equivalent `missing_interventions` guard.

**Can a valid UI path trigger this? YES.**
`category-interventions-selector.tsx` (`apps/web/src/area-impresa/private/account/servizi/category-interventions-selector.tsx`):
- Categories are capped at a maximum of 6 (`maxCategories`), but interventions
  have **no minimum-selection enforcement** anywhere in the component.
- `toggleIntervention` and `toggleSelectAll` both allow the selection set to
  reach `[]` (uncheck every box, or never check one across any
  `ProjectGroup`).
- The submit button (`<Button type="submit">Salva configurazione</Button>`,
  line 451) has **no `disabled` state** tied to `selectedInterventionIds.length`.
- The `<form action={action}>` posts whatever `interventionIds` checkboxes
  are currently checked — zero is a perfectly valid, unblocked submission.

So a company that already has interventions configured (like `Sp`, with 10
rows) can open "Configura categorie e interventi," deselect every
intervention while leaving at least one category checked, click "Salva
configurazione," and silently wipe its entire `CompanyIntervention` set —
with a `200`/redirect success response, no error message, and no
indication anything was lost. This directly defeats matching for that
company on every future request, with the same "intervention match: FAIL"
shape as the P0 audit but triggered by the user's own save action instead
of a genuine taxonomy gap.

**Companies currently with 0 `CompanyIntervention` rows: 0** (out of 1 total
company in the database — `Sp` currently has 10 rows intact). The risk is
real and reachable but has not yet manifested in the current dataset.

---

## FINAL ANSWERS

```txt
COMPANY_COORDINATES_CORRECT = NO (45.46, 9.19 — Milan-area coordinates, inconsistent
  with the company's own declared address "95028 Valverde CT")
REQUEST_COORDINATES_CORRECT = YES (37.5786724, 15.1229164 — correct for Valverde, CT)
SAME_LOCATION = YES, textually (identical address/city/postalCode strings,
  both describing real Valverde, Catania province) — but NO, geometrically
  (the two records' coordinates are ~1005 km apart)
MULTIPLE_GEO_SYSTEMS = NO — there is exactly one geocoding system
  (Google Places Autocomplete via the shared CityAutocomplete component),
  reused identically by the company lead form, company profile editor, and
  the request funnel. The inconsistency is not caused by competing systems;
  it is caused by the absence of a server-side invariant tying the
  address/city/postalCode fields to the latitude/longitude fields once they
  leave that one client component.
SINGLE_SOURCE_OF_TRUTH = PARTIAL — YES for radius (Company.operatingRadiusKm,
  one field, one validated allowed-list, one reader). NO for location: text
  address fields and coordinate fields are two independently-writable groups
  at every layer (URL params, server actions, domain functions, raw SQL
  writes) with no field ever re-deriving or checking the other.
MATCHING_INPUTS_TRUSTWORTHY = MECHANICALLY YES / DATA NO — matching reads the
  live, currently-persisted Request and Company coordinates directly, with no
  staleness or caching bug. But the values it reads are only as trustworthy
  as the write path that produced them, and the write path has no
  address-to-coordinate consistency check, so matching can (and here, did)
  faithfully compute a correct distance from corrupted input.
COMPANY_INTERVENTION_WIPE_RISK_REAL = YES — confirmed reachable via a normal,
  unmodified UI path (deselect all interventions, keep ≥1 category, save).
  0 of 1 companies are currently affected, but the guard does not exist.
```
