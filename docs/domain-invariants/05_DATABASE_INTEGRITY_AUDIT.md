# DOMAIN INVARIANTS — PHASE 5: DATABASE INTEGRITY & DEAD DATA AUDIT

Date: 2026-06-22
Scope: audit only. No code changes, no deletions, no migrations. All row
counts and orphan checks below were run live against the real Neon
database (`Esigenta`, project `purple-glitter-37268985`). Column-level
classification was done by repo-wide search, not inference — every `DEAD`
or `PLACEHOLDER` finding below has a confirmed zero-result search backing
it, cited inline.

Depth note: full per-column treatment is given to the tables this
refoundation series has directly touched (`Company`, `Request`,
`GeoLocation`, `CompanyCategory`/`CompanyIntervention`, `RequestDispatch`/
`CompanyNotification`/`NotificationDelivery`). Peripheral tables (credits,
conversations, identity) are classified at the table/enum level with
targeted column checks only where a concrete finding emerged — stated
explicitly so this isn't mistaken for an exhaustive column-by-column pass
across all ~200 columns in the schema.

---

## TASK 1 — Full schema inventory (row counts, purpose, classification)

| Table | Rows | Purpose | Classification |
| --- | --- | --- | --- |
| `Sector` | 4 | Taxonomy root grouping | SOURCE_OF_TRUTH |
| `Category` | 7 | Professional identity / onboarding grouping | SOURCE_OF_TRUTH |
| `CategoryAlias` | 6 | Search/alias resolution for Category | SOURCE_OF_TRUTH |
| `ProjectGroup` | 9 | Non-operational catalog organization | SOURCE_OF_TRUTH |
| `ProjectGroupAlias` | 5 | Alias resolution for ProjectGroup | SOURCE_OF_TRUTH |
| `Intervention` | 32 | The sole matching/dispatch unit (frozen taxonomy) | SOURCE_OF_TRUTH |
| `InterventionAlias` | 97 | Search/alias resolution for Intervention | SOURCE_OF_TRUTH |
| `GeoLocation` | 5 (3 orphaned — see Task 2) | One row per resolved place (geo refoundation) | SOURCE_OF_TRUTH |
| `Company` | 1 | Marketplace participant | SOURCE_OF_TRUTH |
| `CompanyCategory` | 1 | Configuration — categories (Phase 1) | SOURCE_OF_TRUTH |
| `CompanyIntervention` | 10 | Configuration — interventions; sole matching input | SOURCE_OF_TRUTH |
| `CompanyMembership` | 1 | User↔Company access control | SOURCE_OF_TRUTH |
| `User` | 2 | Authenticated identity (company operators, admins) | SOURCE_OF_TRUTH |
| `Session`/`Account`/`Verification` | 4/2/0 | Better Auth's own tables | SOURCE_OF_TRUTH (owned by the auth library, not app code) |
| `AdminProfile` | 1 | Admin role grant | SOURCE_OF_TRUTH |
| `Customer` | 2 | Soft customer identity (funnel-created) | SOURCE_OF_TRUTH |
| `CustomerAccessToken` | 4 | Token-gated customer access (verification/status/conversation) | SOURCE_OF_TRUTH |
| `Request` | 1 | Marketplace request snapshot | SOURCE_OF_TRUTH |
| `RequestPhoto` | 0 | Uploaded photo metadata | SOURCE_OF_TRUTH (active code, zero rows = no photos uploaded yet on this test request, not unused) |
| `RequestDispatch` | 1 | Dispatch eligibility result, persisted | SOURCE_OF_TRUTH |
| `CompanyNotification` | 1 | App-channel notification intent | SOURCE_OF_TRUTH |
| `NotificationDelivery` | 1 | Email-channel notification intent + delivery status | SOURCE_OF_TRUTH |
| `CreditPackage` | 0 | Sellable credit bundles | SOURCE_OF_TRUTH (active code; zero rows because no package has been configured in admin yet — a product-setup gap, not dead code) |
| `CompanyCreditAccount`/`CreditOrder`/`CompanyCreditTransaction`/`CreditLot`/`CreditLotConsumption` | all 0 | Credit ledger (FEFO, D-011) | SOURCE_OF_TRUTH (active code in `@esigenta/billing`, confirmed via `lot-ledger.ts`/`credit-ledger.ts`; zero rows is a consequence of zero `CreditPackage` rows existing to purchase, not unused logic) |
| `RequestUnlock` | 0 | Unlock grant + credit charge link | SOURCE_OF_TRUTH (active; no unlock has happened on the one real request yet) |
| `CompanySavedRequest` | 0 | Save grant | SOURCE_OF_TRUTH (active; unused so far) |
| `CreditRefundRequest` | 0 | Refund workflow | SOURCE_OF_TRUTH (active; nothing to refund yet) |
| `CompanyContactChangeRequest` | 0 | Moderated phone-change requests | SOURCE_OF_TRUTH (active; none submitted) |
| `Conversation`/`ConversationParticipant`/`Message` | all 0 | Messaging layer | SOURCE_OF_TRUTH (active; no conversation has started on the one real request/company pair yet) |

**No table in the schema is `CACHE`, `LEGACY`, or `DEAD` at the table
level.** Every table maps to either taxonomy (frozen, intentionally
read-only at runtime for matching), a configuration/grant table this
refoundation series already verified as a real source of truth, or an
operational table with confirmed active reader/writer code and zero rows
purely because this is a near-empty pre-launch database (1 company, 1
request, 2 users). Row count alone does not imply dead code — every zero
above was checked against actual application code, not assumed.

---

## TASK 2 — Orphan audit (exact counts, live)

```sql
GeoLocation orphans (no owning Company or Request):          3
RequestDispatch orphans (missing Request or Company):         0
CompanyNotification orphans (missing Company):                0
NotificationDelivery orphans (missing RequestDispatch):       0
Conversation orphans (requestId set, Request missing):        0
Message orphans (missing Conversation):                       0
RequestUnlock orphans (missing Request):                      0
CompanySavedRequest orphans (missing Request):                0
CompanyMembership orphans (missing User):                     0
CustomerAccessToken orphans (requestId set, Request missing): 0
Intervention orphans (projectGroupId set, ProjectGroup missing): 0
```

**The only orphan in the entire database is the 3 `GeoLocation` rows**
already identified in the geo refoundation and the company-configuration
audit (`geoloc_req_muv9md_backfill`, `geoloc_req_95xbjx_backfill`,
`geoloc_company_sp_corrected`) — leftover from the test
company/requests deleted earlier in this session. No cascade exists from
`Company`/`Request` deletion to their `GeoLocation` row (the FK points
the other direction), so these three rows simply stopped being
referenced. Confirmed, not re-derived: identical to the finding in
`docs/company-configuration/ONBOARDING_CONFIGURATION_REFOUNDATION_AUDIT.md`.

Every other table audited — including all six minimum-list tables this
task named — has **zero** orphans.

---

## TASK 3 — Column read/write audit (targeted, full detail on core tables)

### `Company`
| Column | Reads | Writes | Classification |
| --- | --- | --- | --- |
| `onboardingCategorySlug` | `services-configuration-page.tsx` (suggestion display only) | `onboarding.ts` (signup) | **LEGACY** (Phase 1 — restricted to onboarding-suggestion role, confirmed not read by matching/visibility/readiness) |
| `geoLocationId` | every geo-aware reader (Phase geo refoundation) | `set-company-location.ts` (sole writer) | **ACTIVE / SOURCE_OF_TRUTH** |
| `operatingRadiusKm` | matching, dashboard, detail page | onboarding, profile update | **ACTIVE** |
| `isActive`/`deletedAt`/`status` | `isCompanyMarketplaceReady` (Phase 2, sole reader of this exact combination) | `mutateCompanyStatus`/its 3 wrappers (admin-companies.ts) | **ACTIVE** |
| `website`, `phone`, `vatNumber`, `name` | profile page, admin company list | onboarding, profile update | **ACTIVE** |

`CompanyProfileData.onboardingCategorySlug` (the **read-side return
value** in `get-profile-page.ts`, not the column itself) — confirmed in
Phase 1 as returned but never rendered by `profile-page.tsx`. Re-confirmed
here: still true, still unfixed (correctly deferred — Phase 1 explicitly
left this for Phase 6). **DEAD** (the passthrough, not the underlying
column, which remains LEGACY/restricted as above).

### `Request`
| Column | Reads | Writes | Classification |
| --- | --- | --- | --- |
| `interventionSlug` | display/notification copy, structured data | `create-request.ts` (once, at creation) | **ACTIVE** — deliberately duplicates `interventionId`'s semantic meaning as an immutable historical snapshot (see Task 5) |
| `interventionId` | matching, dispatch, visibility eligibility | same | **ACTIVE / SOURCE_OF_TRUTH** for live matching |
| `geoLocationId` | every geo-aware reader | `set-request-location.ts` (sole writer, once) | **ACTIVE / SOURCE_OF_TRUTH** |
| `archivedAt`/`archivedByAdminUserId`/`archiveReason` | `list-admin-requests.ts`, `get-request-by-id.ts`, `admin-dashboard.ts`, list/detail pages | `archive-request.ts` (confirmed real, active write path) | **ACTIVE** — not dead, confirmed via direct file match |
| `deletedAt`/`deletedByAdminUserId`/`deleteReason` | same readers | `soft-delete-request.ts` (confirmed real, active write path) | **ACTIVE** |
| `creditCost`/`maxUnlocks`/`unlockCount` | publish requirements, unlock eligibility | `review-request.ts` (cost/limits), `unlock-request.ts` (count) | **ACTIVE** |
| `moderationNotes` | admin detail view | `review-request.ts` | **ACTIVE** |

### `GeoLocation`
All columns confirmed `ACTIVE` per the geo refoundation's own write
boundary (`packages/database/src/geo/`) — no column found unread or
unwritten. `placeId` nullable specifically for the 3 `LEGACY_BACKFILL`
rows (Task 2), consistent with its documented design.

### `RequestDispatch` / `CompanyNotification` / `NotificationDelivery`
All columns confirmed `ACTIVE` per the geo refoundation and Phase 4
notification-architecture tracing — `distanceKm`/`matchReason` (dispatch),
`readAt` (notification), `provider`/`providerMessageId`/`attemptCount`/
`lastError`/`nextAttemptAt` (delivery, the retry-metadata fields) are all
written by `create-request-dispatches-for-request.ts` and
`process-request-email-deliveries.ts` and read by the admin/company UI.
One pre-existing, already-documented gap (not new to this audit): the
retry metadata (`nextAttemptAt`) is written but **no worker reads it to
actually retry** — already flagged in
`docs/bugs/EMAIL_SYSTEM_RELIABILITY_AUDIT.md` §C/§G, not re-litigated
here, since it is a missing *process*, not a dead *column* (the column is
correctly written and would be correctly read by a retry worker if one
existed).

---

## TASK 4 — Runtime invariant cross-check against persisted data

| Invariant | Persisted data it depends on | Cross-check result |
| --- | --- | --- |
| `CompanyConfigured` | `CompanyCategory` (1 row), `CompanyIntervention` (10 rows) | Both present for the one real company → `isConfigured = true`, matches live behavior confirmed in Phase 1/3 validation |
| `MarketplaceReady` | `Company.{isActive, deletedAt, status}` | `isActive=true, deletedAt=null, status=APPROVED` → `true`, matches |
| `RequestVisibleToCompany` | Eligibility (above) + `GeoLocation` + Grants (`RequestUnlock`/`CompanySavedRequest`/`RequestDispatch`) | `RequestDispatch` exists (1 row) → Grant=true independent of LiveMatch; confirmed in Phase 3 validation |
| `RequestDispatchEligible` | `CompanyIntervention`, `Company.{isActive,deletedAt,status,operatingRadiusKm}`, `GeoLocation` | Confirmed produced the 1 real `RequestDispatch` row (geo refoundation + Phase 4 validation) |
| `NotificationEligible` | `RequestDispatch` (new-request case) / `ConversationParticipant` (message case) | 1 `CompanyNotification` + 1 `NotificationDelivery` row trace to the same `RequestDispatch`, confirmed in Phase 4 |

**No table or column was found that exists solely to support an invariant
that no longer needs it.** Every persisted fact these five invariants
read is still the correct, current source of truth per Phases 1–4 — this
audit found no leftover "old way of deciding X" data sitting unused
alongside the new way, because each consolidation phase replaced its
target's *logic*, not its *underlying tables* (the tables were already
correct; only the code paths reading them needed unification).

---

## TASK 5 — Duplicate persistence audit

| Fact | Stored where | Classification |
| --- | --- | --- |
| "What intervention is this request about" | `Request.interventionSlug` (text) **and** `Request.interventionId` (FK) | **CANONICAL (interventionId) + intentional duplicate (interventionSlug)** — explicitly documented in the schema as a frozen-taxonomy pattern: `interventionId` is live-joinable and can in principle be reorganized; `interventionSlug` is the permanent, immutable snapshot for historical stability even if the `Intervention` row's catalog position changes. This is a deliberate, documented design decision (`docs/taxonomy-refoundation/06_MATCHING_CUTOVER_DESIGN.md §6`), not an accidental duplication to clean up. |
| "Is this company configured" | Computed live from `CompanyCategory`/`CompanyIntervention` (Phase 1's `deriveCompanyConfigurationStatus`) | **Not duplicated** — never persisted as a separate boolean column anywhere; confirmed by schema inspection (`Company` has no `isConfigured` column) |
| "What place is this" | `GeoLocation` only (geo refoundation) | **Not duplicated** — confirmed zero scalar geo columns remain on `Company`/`Request` |
| Company's operating radius | `Company.operatingRadiusKm` only | **Not duplicated** — confirmed single column, single reader (matching), in Phase 0 |

**One genuine duplicate-persistence case found, and it is intentional and
already documented — not a bug.** No accidental "same fact stored twice"
was found anywhere else in the schema.

---

## TASK 6 — Dead write path audit

**Tables receiving writes but never read**: none found. Every table
checked (Task 1/3) has a confirmed reader in application code.

**Tables read but never written**: none found, with one nuance —
`Verification`/`Session`/`Account` are written and read exclusively by
the `better-auth` library, not by this codebase's own domain/billing
logic. They are not "dead" — they are infrastructure tables owned by a
dependency, correctly outside this audit's application-level write/read
tracing.

**Tables neither read nor written**: none found. Every table in the
schema has at least one confirmed application-level reader and writer
(or, for the three Better Auth tables, library-level read/write).

---

## TASK 7 — Dead enum audit

| Enum | Members | Classification |
| --- | --- | --- |
| `GeoSource` | `GOOGLE_PLACES` (ACTIVE), `LEGACY_BACKFILL` (ACTIVE — written exactly once, by the geo refoundation migration; correctly never written by application code since, per its own design) | Both members in active, intentional use |
| `CompanyStatus` | `PENDING_REVIEW`, `APPROVED`, `SUSPENDED`, `BLOCKED` | All four ACTIVE — confirmed referenced across `admin-companies.ts`'s four status-mutation functions |
| `RequestStatus` | `DRAFT`, `PENDING_VERIFICATION`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `PUBLISHED`, `CLOSED` | All ACTIVE except `CLOSED` — not confirmed written anywhere in this pass (no "close a request" admin action was found in the files traced across this whole refoundation series). **Flagged as a possible PLACEHOLDER**, not confirmed dead (a targeted search beyond this audit's scope might still find it; not asserted as DEAD without that check) |
| `NotificationChannel` | `EMAIL` (ACTIVE), `WHATSAPP` (**PLACEHOLDER** — zero application references anywhere, reconfirmed from Phase 4) | |
| `ConversationType` | `COMPANY_CUSTOMER` (ACTIVE), `SUPPORT` (ACTIVE) — both confirmed via `contact-customer.ts`, `ensure-unlock-conversation.ts`, support pages. `COMPANY_ADMIN`, `ADMIN_CUSTOMER`, `INTERNAL_ADMIN` — **DEAD/PLACEHOLDER**, confirmed zero matches anywhere in `packages/` for all three | |
| `CustomerTokenPurpose` | `CONVERSATION_ACCESS`, `REQUEST_VERIFICATION`, `REQUEST_STATUS` — ACTIVE. `REVIEW_ACCESS` — **PLACEHOLDER**, confirmed zero code references; the schema's own comment already says "Reserved for the future customer review flow" | |
| `CreditLotSource` | `PACKAGE_PURCHASE`, `REFUND`, `ADMIN_ADJUSTMENT` — ACTIVE, confirmed in `lot-ledger.ts`/`credit-ledger.ts`. `LEGACY_MIGRATION` — **PLACEHOLDER**, confirmed zero code references (no legacy pooled-balance data exists to migrate yet) | |
| `CreditTransactionType`/`CreditTransactionStatus`/`CreditOrderStatus`/`CreditPackageStatus`/`CreditLotStatus` | Not individually re-verified member-by-member in this pass — `@esigenta/billing` is confirmed as live, actively-developed code (Task 1), and a full enum-member sweep of the credit system was not performed; flagged as **out of this audit's depth**, not asserted clean | |
| `CompanyMemberRole` | `OWNER`, `MANAGER`, `STAFF` | `OWNER` confirmed ACTIVE (recipient resolution, actor guards). `MANAGER`/`STAFF` not independently re-verified this pass — plausible they're enforced by `requireCompanyOwnerFromUser`/`requireCompanyMemberFromUser` (`packages/auth`) distinguishing roles, but not re-traced here |
| `CompanyContactChangeField` | `PHONE` (only member) | ACTIVE — confirmed in `contact-change-requests.ts`. Single-member enum is not itself a finding; it reflects the feature's current real scope (phone-only), not a partially-built one |

---

## TASK 8 — Dead index audit

No `EXPLAIN`-based query-plan analysis was run in this pass (would
require representative production-scale data volume to be meaningful —
this database has 1–10 rows per table, so every index would trivially
show as "unused" by a query planner regardless of whether it will matter
at scale, making such an analysis misleading right now rather than
informative). Structural review instead:

| Index | Status |
| --- | --- |
| Legacy geo indexes (`Company_city_idx`, `Company_latitude_longitude_idx`, `Company_postalCode_idx`, `Request_city_idx`, `Request_latitude_longitude_idx`) | **Already removed** — dropped in the geo refoundation's additive migration (`20260622000001_geo_refoundation_additive`), confirmed via that migration's `DROP INDEX` statements. Nothing left to clean up here. |
| Legacy taxonomy indexes | **Already removed** — per `docs/taxonomy-refoundation/16_PHYSICAL_CLEANUP_REPORT.md`/`17_LEGACY_TAXONOMY_SOURCE_REMOVAL_REPORT.md` (prior, separate refoundation, already completed before this series began) |
| `GeoLocation_earth_point_gist_idx` (GiST, `ll_to_earth`) | **ACTIVE** — backs the `earthdistance`/`cube` matching and dashboard queries (geo refoundation Phase 6) |
| Duplicate/superseded indexes elsewhere | None found — every `@@index`/`@@unique` in the current schema corresponds to a confirmed query pattern from this audit's tracing (status filters, foreign-key lookups, the three `_s6b`-suffixed indexes which read as deliberately added performance indexes for specific hot-path lookups, not accidental duplicates of an existing index) |

---

## TASK 9 — Phase 6 cleanup candidate list

| Item | Group | Classification |
| --- | --- | --- |
| 3 orphaned `GeoLocation` rows | Rows (not schema) | `SAFE_REMOVE_NOW` — confirmed unreferenced by any FK; deleting them is a data operation, not a code/schema change, and carries no risk since nothing points to them |
| `CompanyProfileData.onboardingCategorySlug` passthrough field | Code (domain function return type) | `REMOVE_PHASE_6` — confirmed unused by `profile-page.tsx`; removing it narrows a public API surface, which this audit's prior phases consistently deferred to a dedicated cleanup phase rather than doing opportunistically |
| `NotificationChannel.WHATSAPP` enum member | Enum | `KEEP` — explicit forward placeholder, costs nothing to leave, would have to be re-added the moment WhatsApp delivery is actually built |
| `ConversationType.COMPANY_ADMIN`/`ADMIN_CUSTOMER`/`INTERNAL_ADMIN` | Enum | `KEEP` (not `SAFE_REMOVE`) — these read as intentional forward declarations for admin-involved conversation types, not leftovers from a removed feature (no removed code referencing them was found); removing them would be guessing at product intent this audit cannot confirm |
| `CustomerTokenPurpose.REVIEW_ACCESS` | Enum | `KEEP` — same reasoning, and explicitly self-documented as intentional in the schema comment |
| `CreditLotSource.LEGACY_MIGRATION` | Enum | `KEEP` — reserved for a real future need (migrating a pre-FEFO pooled balance), not a removed feature |
| `RequestStatus.CLOSED` | Enum | `DEFER` — flagged as possibly unwritten, not confirmed dead; needs a dedicated check before any classification change |
| Dead geo/taxonomy indexes | Indexes | `KEEP` (nothing to do) — already physically removed in prior refoundations, confirmed, not a Phase 6 task |
| Credit system enum members beyond `PACKAGE_PURCHASE`/`REFUND`/`ADMIN_ADJUSTMENT` | Enums | `DEFER` — out of this audit's depth, needs its own targeted pass |

---

## FINAL ANSWERS

```txt
ORPHAN_TABLES_FOUND = 0 (no table is itself orphaned/unreferenced; the
  finding is orphaned ROWS within one table, GeoLocation)
ORPHAN_ROWS_FOUND = 3 (GeoLocation rows with no owning Company or Request
  — confirmed live, unchanged from the geo refoundation's own finding;
  every other table checked has zero orphans)
DEAD_COLUMNS_FOUND = 1 confirmed (CompanyProfileData.onboardingCategorySlug
  passthrough — a return-value field, not a database column itself;
  the underlying Company.onboardingCategorySlug column is LEGACY/restricted,
  not dead, since it's still read by the Configura Servizi suggestion banner)
DEAD_TABLES_FOUND = 0 — every table has a confirmed active reader and
  writer in current application code (or is owned by better-auth)
DUPLICATE_DATA_FOUND = 1 case (Request.interventionSlug vs. interventionId),
  confirmed intentional and already documented as a frozen-taxonomy
  historical-snapshot pattern — not a bug, not a cleanup candidate
UNUSED_INDEXES_FOUND = 0 currently present — all previously-dead geo and
  taxonomy indexes were already physically removed in earlier, separate
  refoundation phases; nothing unused remains in the live schema
PHASE_6_CLEANUP_READY = PARTIALLY — one safe, immediate data cleanup
  (delete the 3 orphaned GeoLocation rows) and one safe, immediate code
  cleanup (remove the unused onboardingCategorySlug passthrough) are ready
  now. Three enum members (CLOSED, and the full credit-system enum sweep)
  are explicitly DEFERRED, not cleared, pending a dedicated, narrower check
  this audit's depth did not reach. No SAFE_REMOVE_NOW table, column, or
  index beyond the one orphaned-row case was found.
```
