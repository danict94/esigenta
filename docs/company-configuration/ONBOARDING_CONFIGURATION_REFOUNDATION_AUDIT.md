# ONBOARDING / SERVICE CONFIGURATION — INTEGRITY & REFOUNDATION AUDIT

Date: 2026-06-22
Scope: audit only. No code changes, no migrations. All data pulled live
from the real Neon database (`Esigenta`, project `purple-glitter-37268985`).
The database is actively being used during this audit (a real browser
session was making writes while these queries ran) — every figure below is
a point-in-time snapshot, timestamped where it matters.

---

## TASK 0 — Database integrity inventory

### Row counts (live, at time of writing)

| Table | Count |
| --- | --- |
| Company | 1 |
| Request | 1 |
| CompanyMembership | 1 |
| CompanyCategory | 1 |
| CompanyIntervention | 10 |
| GeoLocation | 5 |
| RequestDispatch | 1 |
| CompanyNotification | 1 |
| NotificationDelivery | 1 |
| Category | 7 |
| Intervention | 32 |
| ProjectGroup | 9 |

Note: at the moment the previous two audits in this `docs/bugs/` series ran
(minutes earlier), `CompanyCategory` and `CompanyIntervention` were both
`0` for this same company. Between then and now, a real save action
completed against `/area-impresa/configura-servizi` (visible in the dev
server log as the missing piece — no POST to that route had completed
before; one has now), which is why `RequestDispatch`/`CompanyNotification`/
`NotificationDelivery` have gone from `0` to `1` in the interim. This is
consistent with, and confirms, the root cause identified in
[REQUEST_PUBLICATION_DISPATCH_AUDIT.md](../bugs/REQUEST_PUBLICATION_DISPATCH_AUDIT.md):
the company simply had never saved a configuration until just now.

### Orphans

| Check | Result | Classification |
| --- | --- | --- |
| Company without CompanyCategory | 0 | EXPECTED_STATE (currently) |
| Company without CompanyIntervention | 0 | EXPECTED_STATE (currently) |
| APPROVED company with zero configuration | 0 (currently) | — but see Task 8: **not prevented**, only currently absent |
| Company without GeoLocation | 0 | EXPECTED_STATE |
| Request without GeoLocation | 0 | EXPECTED_STATE |
| RequestDispatch referencing missing Request/Company | 0 / 0 | EXPECTED_STATE |
| CompanyNotification referencing missing RequestDispatch | 0 | EXPECTED_STATE |
| NotificationDelivery referencing missing RequestDispatch | 0 | EXPECTED_STATE |
| **GeoLocation not referenced by any Company or Request** | **3** | **ORPHAN** |

The one real, current orphan finding: of 5 `GeoLocation` rows, only 2 are
referenced (1 by the current `Company`, 1 by the current `Request`). The
other 3 —`geoloc_req_muv9md_backfill`, `geoloc_req_95xbjx_backfill`,
`geoloc_company_sp_corrected` — are the geo-refoundation backfill rows
for the company and requests that existed earlier in this session and have
since been deleted. `GeoLocation` rows are never cascade-deleted when
their owning `Company`/`Request` is deleted, because the foreign key lives
on `Company.geoLocationId`/`Request.geoLocationId` pointing *at*
`GeoLocation`, not the reverse — deleting the owner does not touch the
`GeoLocation` row at all, it simply stops being referenced. **Classification:
ORPHAN + MISSING_CONSTRAINT** (no cleanup mechanism removes a `GeoLocation`
row once nothing points at it; `setCompanyLocationWithClient` deletes the
*previous* location on a *replace*, but nothing deletes a location on
entity deletion, because entity deletion doesn't go through that function
at all — it's a separate, undetected code path).

### Impossible states

| Check | Result | Classification |
| --- | --- | --- |
| APPROVED company that cannot receive work (zero CompanyIntervention) | 0 currently, but reachable — see Task 8 | MISSING_VALIDATION (not currently manifest, but not prevented) |
| Published request without intervention | 0 | EXPECTED_STATE |
| RequestDispatch without a Request | 0 | EXPECTED_STATE |
| CompanyNotification without a RequestDispatch (where dispatch-linked) | 0 | EXPECTED_STATE |
| NotificationDelivery without a RequestDispatch | 0 | EXPECTED_STATE |

No impossible state is currently materialized in the live data. Several
are **reachable but unenforced** — see Task 8, which is the more useful
framing than a point-in-time count.

### Duplicates

| Check | Result | Classification |
| --- | --- | --- |
| Duplicate `CompanyCategory` (companyId, categoryId) | 0 | EXPECTED_STATE — unique constraint exists (`@@id([companyId, categoryId])`) |
| Duplicate `CompanyIntervention` | 0 | EXPECTED_STATE — same pattern |
| Duplicate `GeoLocation` by `placeId` | **1 pair** (`ChIJNxrH-Qj8ExMRvd01rFEUS70` ×2 — the company's location and the request's location, both genuinely at "95028 Valverde CT") | **EXPECTED_STATE, not a bug** — this is the geo refoundation's explicit, documented design choice (`docs/geo-refoundation/01_DESIGN.md` §4.1): one `GeoLocation` row per capture event, not a shared row, even when two entities resolve to the same real place. `placeId` is intentionally not unique at the table level for this reason. |
| Duplicate notifications/dispatches for the same (request, company) | 0 | EXPECTED_STATE — `RequestDispatch` has `@@unique([requestId, companyId])` |

### Legacy data

| Finding | Classification |
| --- | --- |
| `Company.onboardingCategorySlug` — written once at signup, **read by two different fallback code paths** (Task 3/4) that treat it as if it were a real configuration signal, even though the schema's own comment says "Runtime matching must use CompanyCategory, not this onboarding snapshot" | **LEGACY_MODEL** — the field itself isn't dead (it's actively read), but its *semantic role* has drifted: it was meant as a one-time onboarding memory, and has become a parallel, lower-fidelity configuration model that two UI/visibility paths trust as if it were current |
| `street`/`streetNo` style write-only fields | none currently — already removed in the geo refoundation (`docs/geo-refoundation/04_CLEANUP_REPORT.md`) | N/A |

---

## TASK 1 — Trace company signup

```
apps/web/src/area-impresa/public/auth/components/impresa-signup-form.tsx
  handleSubmit()
    authClient.signUp.email({ name, email, password })        → Better Auth: User row
    completeCompanyOnboardingAction({ name, vatNumber, phone, categorySlug,
                                       operatingRadiusKm, geoPlace })
      apps/web/src/area-impresa/public/auth/actions/signup-action.ts
      validates name/vatNumber/phone/categorySlug/operatingRadiusKm/geoPlace
      ↓
      createCompanyForCurrentUser({ onboardingCategorySlug, company })
        apps/web/.../create-company-for-current-user.ts — requireUser(), passthrough
        ↓
        createCompanyForUser({ userId, onboardingCategorySlug, company })
          packages/auth/src/identity/company/onboarding.ts:229
          - listExistingCompanyLinksForUser(userId)        [read CompanyMembership]
          - normalizeCompanyProfile(company)                [validates geoPlace via isFreshGeoPlace]
          - prisma.company.findUnique({ vatNumber })        [read Company, uniqueness check]
          - prisma.$transaction(async (tx) => {
              tx.company.create({ data: buildCompanyCreateData(...) })
                → WRITES: Company.name, vatNumber, phone, website?,
                  operatingRadiusKm, status="PENDING_REVIEW",
                  onboardingCategorySlug
              setCompanyLocationWithClient(tx, companyRecord.id, geoPlace)
                → WRITES: GeoLocation (new row), Company.geoLocationId
              tx.companyMembership.create({ companyId, userId, role: "OWNER" })
                → WRITES: CompanyMembership
            })
```

**Tables touched**: `Company` (create), `GeoLocation` (create),
`CompanyMembership` (create), plus Better Auth's own `User`/`Session`
tables (outside this domain's schema).

**Tables NOT touched, at any point in this flow**: `CompanyCategory`,
`CompanyIntervention`. The only trace of the category the user picked
during signup is the **text snapshot** `Company.onboardingCategorySlug` —
a plain string, not a foreign key, not a join table row, carrying no
referential integrity and not validated against `Category` at write time
beyond what the signup form itself restricts.

**Fields written**: `Company.{name, vatNumber, phone, website?,
operatingRadiusKm, status, onboardingCategorySlug, geoLocationId}`,
`GeoLocation.{placeId, formattedAddress, city, postalCode, province,
latitude, longitude, source, resolvedAt}`, `CompanyMembership.{companyId,
userId, role}`.

**Services called**: Better Auth (`authClient.signUp.email`),
`completeCompanyOnboardingAction` (server action),
`createCompanyForCurrentUser` → `createCompanyForUser` (domain/auth layer).

---

## TASK 2 — Trace Configura Servizi

```
UI:
  apps/web/src/area-impresa/private/account/servizi/services-configuration-page.tsx
    ServicesConfigurationPage()
      getCompanyServicesConfigurationPage(actor)
        packages/domain/src/company/services/get-services-configuration-page.ts:66
        3 parallel raw SQL queries:
          - Company row + json_agg(CompanyCategory.categoryId) + json_agg(CompanyIntervention.interventionId)
          - all Category rows (id, slug, name, projectGroupIds)
          - all ProjectGroup rows with their Interventions (nested json_agg)
      ↓ result.company = { id, name, onboardingCategorySlug, categoryIds, interventionIds }
      ↓ result.categories, result.projectGroups (full taxonomy, not company-scoped)

  Preselection logic (services-configuration-page.tsx:143-174):
    savedCategoryIds = company.categoryIds                      [REAL: from CompanyCategory]
    onboardingCategoryId = categories.find(slug === company.onboardingCategorySlug)
    initialCategoryIds =
      savedCategoryIds.length > 0 ? savedCategoryIds            [REAL]
      : onboardingCategoryId ? [onboardingCategoryId]           [FALLBACK — see Task 3]
      : []

    initialInterventionIds =
      company.interventionIds.length > 0 ? company.interventionIds   [REAL]
      : <every Intervention in every ProjectGroup of initialCategoryIds>  [FALLBACK — see Task 3]

  CategoryInterventionsSelector receives initialCategoryIds/initialInterventionIds
  as pre-checked checkbox state — client component, no server re-validation
  of "is this really saved" before rendering checked.

→ action:
  apps/web/src/area-impresa/private/account/actions/update-services-action.ts
    updateServicesAction(formData)
      reads interventionIds[]/categoryIds[] from the submitted form
      updateCompanyServicesConfiguration(actor, { selectedCategoryIds, selectedInterventionIds })

→ domain:
  packages/domain/src/company/services/update-services-configuration.ts
    updateCompanyServicesConfiguration()
      validates category/intervention ids exist (Category/Intervention tables)
      rejects if selectedCategoryIds.length === 0 ("missing_categories")
        — NOTE: no equivalent rejection for selectedInterventionIds.length === 0
      single $executeRaw CTE: DELETE+INSERT CompanyCategory, DELETE+INSERT CompanyIntervention
        (atomic replace-set, scoped to companyId)

→ database:
  CompanyCategory, CompanyIntervention — the only two tables this whole
  flow is actually allowed to write.
```

**Source of displayed categories/interventions**: a *blend* of two
disjoint sources, selected by an `if/else` based on whether the real table
is empty — `CompanyCategory`/`CompanyIntervention` when non-empty, else
`Company.onboardingCategorySlug` resolved through `Category` →
`Category.projectGroupIds` → `ProjectGroup.interventions`. The UI gives no
visual signal distinguishing the two for interventions at all (only the
category section gets a "Categoria suggerita" badge — line 202-204 — and
even that badge says nothing about the fact that *nothing has been saved
yet*).

---

## TASK 3 — Explain the bug

**Exact source of the "looks configured but isn't" appearance**:
`services-configuration-page.tsx:143-174`, reproduced above. When
`CompanyCategory`/`CompanyIntervention` are empty (which they are for
every company between signup and their first successful save — true for
*every* company, not just the one observed), the page does not show "no
configuration yet" — it computes a **derived, unsaved suggestion** from
`Company.onboardingCategorySlug` and pre-checks it in the selector exactly
as if it were the company's real, saved configuration. A user looking at
the page sees checked boxes and reasonably concludes "this is already
configured" — there is nothing in the rendered UI (beyond one easily-missed
badge on the category card, and *no* badge at all on the suggested
interventions) that says "you have not saved anything; if you leave now,
your real configuration remains empty."

This is not a database bug, not a query bug, and not a render bug in the
narrow sense — the code does exactly what it was written to do (suggest a
starting point from onboarding). The defect is that the suggestion is
visually indistinguishable from a saved state, and it is then trusted by a
**second**, independent piece of code (`get-requests-list-page.ts`, Task 4)
as if it had real authority over matching-adjacent visibility.

---

## TASK 4 — Matching source of truth

**Real, strict source of truth — dispatch/matching**:
`packages/domain/src/internal/request/dispatch/resolve-request-dispatch-candidates.ts`.
The matching SQL (`resolveCandidates`) does an `INNER JOIN "CompanyIntervention"
ci ON ci."companyId" = c."id" AND ci."interventionId" = :interventionId`.
There is no fallback, no onboarding-derived substitute, no exception. A
company with zero `CompanyIntervention` rows is invisible to matching for
every request, regardless of category, geography, or status. **Tables/fields
consumed**: `Company.{isActive, deletedAt, status, operatingRadiusKm,
geoLocationId→GeoLocation.{latitude,longitude}}`, `CompanyIntervention.{companyId,
interventionId}`, `CompanyMembership` (for the OWNER recipient email).
`Company.onboardingCategorySlug` is **never read** by this function — confirmed
by its full text containing no reference to that column.

**A second, looser "source of truth" — dashboard visibility**:
`packages/domain/src/company/requests/get-requests-list-page.ts:582-593`.
```ts
if (resolvedCategoryIds.length === 0 && company.onboardingCategorySlug) {
  const fallbackCategory = await buildFallbackCategoryQuery(company.onboardingCategorySlug!)
  if (fallbackCategory) {
    resolvedCategoryIds = [fallbackCategory.id]
  }
}
```
This *does* fall back to `onboardingCategorySlug`, broadening
`operationalInterventionIds` (the dashboard's "browse" visibility set) via
`Category.projectGroupIds` → `ProjectGroup` → `Intervention`, **even when
`CompanyCategory` is empty**. This means a company that has never saved any
configuration can still see requests in `/area-impresa/richieste` — the
exact "appears in dashboard" half of the symptom the user described — while
remaining permanently invisible to actual dispatch/notification, because
that path has no such fallback.

**Does onboarding write the same entities matching consumes? NO.**
Onboarding writes `Company.onboardingCategorySlug` (text). Matching reads
`CompanyIntervention` (foreign-keyed rows). These are different tables,
different write paths, and only contingently related through two
*separate* fallback computations (Task 3's UI suggestion, Task 4's
dashboard broadening) that both independently re-derive from the same text
field but were written at different times, by different people, for
different purposes, and are not kept in sync with each other or with the
real tables.

---

## TASK 5 — Configuration model inventory

| Model / field | Classification | Notes |
| --- | --- | --- |
| `CompanyCategory` (table) | **SOURCE_OF_TRUTH** | What `Configura Servizi` actually writes; read by dashboard visibility (`buildCompanyQuery`) and the services page itself |
| `CompanyIntervention` (table) | **SOURCE_OF_TRUTH** | The *only* table matching/dispatch consumes; also the only table read by `Configura Servizi`'s "real" branch |
| `Company.onboardingCategorySlug` | **LEGACY_MODEL** (not dead — actively read by 2 fallback paths, but semantically demoted by the taxonomy refoundation's own documentation, which says runtime matching must not use it) | Schema comment literally says "ONBOARDING CONTEXT ONLY... Runtime matching must use CompanyCategory, not this onboarding snapshot" — and one piece of code (dashboard visibility) doesn't follow that rule |
| `Category.projectGroupIds` | **DERIVED** (intentionally, per `docs/taxonomy.md`) | Used to expand a category into interventions for both the onboarding-fallback paths and the "first-time bootstrap" intervention suggestion — explicitly documented as carrying no authorization/matching weight on its own |
| `GeoLocation` (table) | **SOURCE_OF_TRUTH** for location | Out of scope for this audit's main question, included for completeness — confirmed single source post geo-refoundation |
| `Company.operatingRadiusKm` | **SOURCE_OF_TRUTH** for radius | Same, confirmed single source in the geo refoundation audit |
| Onboarding-derived "suggested" categories/interventions (the in-memory `initialCategoryIds`/`initialInterventionIds` computed in `services-configuration-page.tsx`) | **TEMPORARY** (correctly so, by intent) — the problem is not that this exists, it's that it's indistinguishable from `SOURCE_OF_TRUTH` in the rendered UI | Never persisted under this name; recomputed every page load |
| Anything resembling a cached/denormalized count of configured services on `Company` | **DEAD** — does not exist | No such field was found; not a finding, just confirming absence |

---

## TASK 6 — Architecture review

**Should onboarding directly create `CompanyCategory`?** No. Forcing a
category choice into a real `CompanyCategory` row at signup, before the
company has seen the full category/intervention picker, would freeze a
single low-context choice (made during a marketing funnel, under signup
pressure) as if it were a deliberate operational decision. The current
separation — onboarding captures *intent*, Configura Servizi captures
*configuration* — is the right shape. The bug is not that they're
separate; it's that intent is allowed to *masquerade* as configuration in
two places that should only ever trust configuration.

**Should onboarding directly create `CompanyIntervention`?** No, for the
same reason, more strongly — interventions are a finer-grained, deliberate
choice ("which jobs do you want to be notified about") that a category
pick at signup cannot honestly imply.

**Should onboarding only store a temporary selection?** Yes — and it
already effectively does (`onboardingCategorySlug` is exactly that). The
defect is that "temporary" is not enforced anywhere downstream; two
consumers (Task 3, Task 4) treat it as durable.

**Should Configura Servizi be the only writer?** Yes, and it already is —
`update-services-configuration.ts` is the only code that writes
`CompanyCategory`/`CompanyIntervention` (consistent with the "exactly one
writer" pattern already established for geo in this codebase). The gap is
on the *read* side, not the write side: two readers (dashboard visibility,
services-page preselection) independently reach past the real tables to a
text field when the real tables are empty, instead of treating "empty" as
an honest, displayed state.

**Cleanest final architecture** (no implementation, per the task's scope):
a single, explicit `ConfigurationStatus` concept derived *only* from
`CompanyCategory`/`CompanyIntervention` — e.g. `UNCONFIGURED` vs
`CONFIGURED` — computed once, in one place, and consumed identically by
the services page (to render an honest "not yet saved" state with a clear
call to action, instead of a phantom preselection) and by dashboard
visibility (to either show nothing, or to explicitly and visibly label
fallback-derived results as "exploratory" rather than indistinguishable
from a real match level — the dashboard's own `matchLevel: "explore"`
concept already exists and is the right shape for this, it's just not
being applied to the *whole-company* unconfigured case, only to
*per-request* category-vs-intervention ranking). `onboardingCategorySlug`
would stop being read anywhere except by the services page itself, purely
as a one-time UX hint clearly marked as a suggestion, never as a
visibility or matching input.

---

## TASK 7 — Physical cleanup candidates (inventory only, no action proposed)

| Item | Type |
| --- | --- |
| 3 orphaned `GeoLocation` rows (Task 0) | dead rows — safe to delete, nothing references them, but doing so is a data operation, not a "cleanup candidate" in the code sense |
| `get-requests-list-page.ts`'s onboarding-fallback branch (lines 582-593) | dead-end fallback — produces a visibility result that can never be backed by a real dispatch, since matching never honors the same fallback. Candidate for removal or for being made consistent with matching, not both kept as-is |
| `services-configuration-page.tsx`'s unlabeled intervention suggestion (lines 158-174) | dead-end UX — same category of issue: a suggestion with no "this is not saved" signal |
| No dead columns found beyond what the geo refoundation already removed | — |
| No dead tables found | — |
| No dead adapters found in this area | — |
| `onboardingCategorySlug` itself | not dead, but a candidate for *redefinition* (read-only-by-the-services-page, never by visibility/matching) rather than removal — removing it outright would lose a genuinely useful onboarding signal |

---

## TASK 8 — Constraint audit

| Invariant | Current enforcement | Missing enforcement | Recommended enforcement |
| --- | --- | --- | --- |
| An `APPROVED` company should be able to receive work | None | Nothing prevents approving a company with zero `CompanyIntervention` rows; nothing warns the admin reviewing it either | Admin approval view should surface "0 interventions configured" before approval; not a hard DB constraint (a company may legitimately be approved before configuring, if onboarding and approval are allowed to be async) but should not be silently invisible |
| `CompanyIntervention` implies `CompanyCategory` (an intervention should belong to a category the company has claimed) | None — `update-services-configuration.ts` validates each set independently; nothing cross-checks that a saved intervention's `ProjectGroup` belongs to a saved category's `projectGroupIds` | Per `docs/taxonomy.md`, this is **intentional** — categories carry no authorization weight over interventions — so this is not a missing constraint, it's a confirmed design decision. Listed here only because the task asked for it as an example; current behavior matches the documented design. |
| A `PUBLISHED` request should have a resolvable intervention and location | DB-level: `interventionId`/`geoLocationId` are nullable FKs, but `publishReviewedRequest` only ever transitions a request that already passed `validateGeoForCreation`/intervention resolution at creation time | None found missing — confirmed enforced upstream, at creation, not at publish | No change needed |
| A `CompanyNotification`/`NotificationDelivery` should always trace back to a real `RequestDispatch` | Enforced by FK (`onDelete: Cascade` from `RequestDispatch`) | None | No change needed |
| A `GeoLocation` row should not outlive every entity that references it | **None** | No cleanup path removes an orphaned `GeoLocation` row when its owning `Company`/`Request` is deleted | A scheduled cleanup query, or an application-level "delete location with owner" step alongside entity deletion, would close this — currently entity deletion (wherever it happens) doesn't go through any geo-aware code path at all |
| Dashboard visibility and matching eligibility should agree on what "configured" means | **None — this is the core finding of this audit** | Two independent fallback computations exist, reading the same `onboardingCategorySlug` field, producing answers neither tied to each other nor to the real `CompanyIntervention` table that matching trusts | A single shared "is this company configured" check, sourced only from `CompanyCategory`/`CompanyIntervention`, consumed identically wherever "can this company see/receive this request" is asked |

---

## TASK 9 — Refoundation readiness

**Yes, a configuration refoundation is justified** — not because the data
model is wrong (the write side, `CompanyCategory`/`CompanyIntervention` as
sole writer through `update-services-configuration.ts`, is already
correctly shaped, mirroring the same "exactly one writer" discipline the
geo refoundation established) — but because the **read side has silently
forked into two disagreeing interpretations of "configured."** This is the
same category of structural problem the geo refoundation fixed (independent
fields/derivations that can drift out of sync), just on the configuration
side instead of the location side.

**Target architecture (description only, no implementation):**

1. One function, e.g. `getCompanyConfigurationStatus(companyId)`, reading
   only `CompanyCategory`/`CompanyIntervention`, returning a small,
   explicit shape: `{ categoryIds, interventionIds, isConfigured: boolean }`.
   `onboardingCategorySlug` does not appear in this function's output at
   all.
2. `services-configuration-page.tsx` calls this function for the *saved*
   state and renders it honestly: if `isConfigured` is false, show an
   explicit "not yet configured" state, with the onboarding-derived
   suggestion offered as a clearly labeled, dismissible starting point —
   never pre-checked in a way indistinguishable from a save.
3. `get-requests-list-page.ts` calls the same function for dashboard
   eligibility. If `isConfigured` is false, the dashboard shows the
   existing `missing_category` empty state (which already exists in the
   code today, per the `if (resolvedCategoryIds.length === 0 ||
   operationalInterventionIds.size === 0)` branch at line 612) — the
   onboarding-fallback branch that currently *bypasses* that empty state
   is removed, so dashboard visibility and matching eligibility can never
   disagree about whether a company is configured.
4. `onboardingCategorySlug` remains on `Company` (it is a legitimate,
   useful onboarding signal for the one-time suggestion in step 2), but is
   never again read by anything that determines real visibility or
   matching eligibility.

This does not require a schema migration — no new tables, no new columns.
It is a read-path consolidation, exactly analogous in shape (if smaller in
scope) to the geo refoundation's write-path consolidation.

---

## FINAL ANSWERS

```txt
DATABASE_INTEGRITY_HEALTH = MOSTLY CLEAN — one class of real orphan found
  (3 unreferenced GeoLocation rows, left behind by entity deletion with no
  cleanup path); no impossible states currently materialized; no duplicates
  outside an intentional, documented design choice (per-entity GeoLocation
  rows sharing a placeId).
ORPHANS_FOUND = YES — 3 GeoLocation rows referenced by neither a Company nor
  a Request, left over from deleted test entities. No cleanup mechanism
  exists to remove them.
IMPOSSIBLE_STATES_FOUND = NONE CURRENTLY MATERIALIZED, but reachable and
  unenforced — an APPROVED company with zero CompanyIntervention is not
  prevented by any constraint or validation, only currently absent from the
  live data by chance of timing.
LEGACY_CONFIGURATION_MODEL_EXISTS = YES — Company.onboardingCategorySlug,
  documented in the schema itself as onboarding-only, but actively read by
  two independent runtime fallback paths as if it had matching/visibility
  authority.
MULTIPLE_CONFIGURATION_MODELS = YES — three disagreeing interpretations of
  "is this company configured": (1) the strict one matching/dispatch uses
  (CompanyIntervention only, no fallback), (2) the loose one dashboard
  visibility uses (onboarding-fallback-broadened), (3) the unsaved-suggestion
  one Configura Servizi displays (onboarding-fallback, indistinguishable
  from saved state in the UI).
SOURCE_OF_PRESELECTED_CATEGORIES = services-configuration-page.tsx:143-151 —
  Company.onboardingCategorySlug resolved against the Category table,
  rendered as pre-checked when CompanyCategory is empty. Confirmed by live
  reproduction: this company showed checked categories/interventions while
  CompanyCategory/CompanyIntervention were both 0 in the database at that
  exact moment.
MATCHING_SOURCE_OF_TRUTH = CompanyIntervention only (joined directly in
  resolve-request-dispatch-candidates.ts), with Company.{status, isActive,
  operatingRadiusKm, geoLocationId} as the remaining eligibility gates.
  Company.onboardingCategorySlug and Category.projectGroupIds are never
  read by matching — confirmed by full-text inspection of the matching
  query.
DEAD_COLUMNS_FOUND = NONE beyond what the geo refoundation already removed.
DEAD_TABLES_FOUND = NONE.
PHYSICAL_CLEANUP_RECOMMENDED = YES, narrowly — the 3 orphaned GeoLocation
  rows are safe, inert dead data; no code-level dead column/table/adapter
  was found in the configuration model itself.
CONFIGURATION_REFOUNDATION_RECOMMENDED = YES — a read-path consolidation
  (not a schema migration) unifying dashboard visibility and Configura
  Servizi preselection onto the same single, real, CompanyCategory/
  CompanyIntervention-only "is this company configured" check that
  matching already correctly uses, removing both onboarding-fallback
  branches that currently let visibility and matching disagree.
```
