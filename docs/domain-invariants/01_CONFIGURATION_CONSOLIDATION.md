# DOMAIN INVARIANTS — PHASE 1: COMPANY CONFIGURATION CONSOLIDATION

Date: 2026-06-22
Scope: implementation. Code changed, no schema changes, no new features,
no UX redesign — only removal of duplicate/divergent logic and an honest
rendering of real state. Validated live against the real Neon database
(`Esigenta`, project `purple-glitter-37268985`).

---

## TASK 1 — Canonical configuration status

**File**: `packages/domain/src/company/configuration/company-configuration-status.ts`
(new), re-exported via `packages/domain/src/company/configuration/index.ts`
and `packages/domain/src/index.ts` (so `@esigenta/domain` exposes it
directly, same as every other domain export).

**Public API**:

```ts
export type CompanyConfigurationStatus = {
  categoryIds: string[]
  interventionIds: string[]
  isConfigured: boolean
}

// Pure — the single definition of "configured." Takes only real ids,
// cannot see onboardingCategorySlug (it's not a parameter).
export function deriveCompanyConfigurationStatus(input: {
  categoryIds: string[]
  interventionIds: string[]
}): CompanyConfigurationStatus

// Convenience fetch-and-derive for callers without their own query.
export async function getCompanyConfigurationStatus(
  companyId: string,
): Promise<CompanyConfigurationStatus>
```

`isConfigured = categoryIds.length > 0 && interventionIds.length > 0` —
both real tables must have at least one row. This matches the existing,
already-correct gate the dashboard used for its `missing_category` empty
state (categories present AND interventions resolvable), just made
explicit and reusable instead of inline and duplicated.

**All callers** (after Task 3's migration):
- `packages/domain/src/company/services/get-services-configuration-page.ts`
  — via `deriveCompanyConfigurationStatus` (already has `categoryIds`/
  `interventionIds` from its own batched query; no extra round trip)
- `packages/domain/src/company/profile/get-profile-page.ts` — same pattern
- No caller currently uses `getCompanyConfigurationStatus` (the
  fetch-and-derive convenience version) — every existing reader already had
  its own ids from a query it needed to run anyway. The fetch version
  exists for any future caller that doesn't, so the *definition* never
  gets reimplemented even if a fetch strategy does.

---

## TASK 2 — Every current `CompanyConfigured` reader (audited)

| Reader | Before | Used onboarding fallback? |
| --- | --- | --- |
| Matching/dispatch (`resolve-request-dispatch-candidates.ts`) | `INNER JOIN CompanyIntervention`, exact, no fallback | No — already compliant, untouched |
| Dashboard visibility (`get-requests-list-page.ts`) | Real `CompanyCategory` query, **with** an `onboardingCategorySlug` fallback when empty (lines 569-585, removed) | **Yes — removed** |
| Configura Servizi (`services-configuration-page.tsx` / `get-services-configuration-page.ts`) | Real ids, **with** onboarding-derived preselection rendered as pre-checked (removed) | **Yes — removed** |
| Company profile page (`get-profile-page.ts`) | Real `CompanyCategory`/`CompanyIntervention` JSON aggregation, **with** a `fallback_category` SQL subquery injected into the displayed category badges when `CompanyCategory` was empty (removed) | **Yes — removed (found during this phase, not listed in the original minimum set, but the same anti-pattern on a 4th page)** |
| Marketplace access (`CompanyMarketplaceReady`, status-based) | Confirmed in Phase 0 to be a *separate* invariant (`Company.status`), never conflated with `CompanyConfigured` | N/A — out of scope for this phase, correctly so |

Four real readers found (one more than the brief's minimum list named) —
the profile page's category badges were an undocumented 4th instance of
exactly the same bug, surfaced by grepping every `onboardingCategorySlug`
reference in the repository rather than trusting the original list to be
exhaustive.

---

## TASK 3 — Migration

- **`get-requests-list-page.ts`**: removed the `onboardingCategorySlug`
  fallback block entirely (was lines 569-585) and the now-unused
  `buildFallbackCategoryQuery` function and `onboardingCategorySlug: true`
  select field. `resolvedCategoryIds` is now always exactly
  `companyCategoryRows.map(...)` — real data, no substitution. An
  unconfigured company now falls straight through to the pre-existing
  `missing_category` empty state (which already existed for the
  "categories present but zero resolvable interventions" case — it simply
  now also covers "zero categories" honestly instead of being bypassed).
- **`get-services-configuration-page.ts`**: now calls
  `deriveCompanyConfigurationStatus` and returns `isConfigured` on
  `CompanyServicesConfigurationState`.
- **`services-configuration-page.tsx`**: `initialCategoryIds`/
  `initialInterventionIds` are now exactly `company.categoryIds`/
  `company.interventionIds` — real, saved data only, nothing merged in
  from onboarding. See Task 5 for the suggestion UI.
- **`get-profile-page.ts`**: removed the `fallback_category` SQL subquery
  and its merge into the displayed `categories` array; added `isConfigured`
  to `CompanyProfileData` via the same canonical derivation.

No inline `length > 0`-style configuration logic remains outside the
canonical function and the two SQL queries that fetch the real
`CompanyCategory`/`CompanyIntervention` rows themselves.

---

## TASK 4 — Runtime business usage of `onboardingCategorySlug` removed

Repo-wide search after this phase's changes, every remaining reference:

| File | Usage | Allowed? |
| --- | --- | --- |
| `packages/auth/src/identity/company/onboarding.ts` | Writer — sets it at signup | Yes — this is the one legitimate write site |
| `packages/domain/src/company/services/get-services-configuration-page.ts` | Reads and returns it on `CompanyServicesConfigurationState`, **never used to compute `isConfigured`** | Yes — onboarding memory, passed through for the suggestion UI only |
| `apps/web/.../services-configuration-page.tsx` | Reads it **only** to compute `onboardingCategory` for the unapplied suggestion banner (Task 5) — never feeds `initialCategoryIds`/`initialInterventionIds` | Yes — exactly the allowed "suggestion source" role |
| `apps/web/.../signup-action.ts`, `create-company-for-current-user.ts` | Passthrough at signup time, into `onboarding.ts` | Yes — part of the one legitimate write path |
| `packages/domain/src/company/profile/get-profile-page.ts` | Reads and returns it on `CompanyProfileData`; **not rendered anywhere in `profile-page.tsx`** (confirmed: zero references to it in that file) | Harmless passthrough, not a forbidden runtime use, but dead weight — flagged in Task 7 as a Phase 6 cleanup candidate, not removed now since it's out of this phase's scope (no schema/API surface change beyond what's needed) |

**Forbidden uses — confirmed absent**: matching (never referenced it, confirmed in Phase 0), visibility (fallback removed), readiness/marketplace access (never referenced it — `CompanyMarketplaceReady` is a wholly separate, status-based invariant), configuration state (fallback removed from both Configura Servizi and the profile page).

---

## TASK 5 — Configura Servizi cleanup

**Before**: a never-configured company saw pre-checked category and
intervention checkboxes (derived from `onboardingCategorySlug`), visually
identical to a real saved state, with only a small, easily-missed
"Categoria suggerita" badge on the category card and **no signal at all**
on the suggested interventions.

**After**:
- `initialCategoryIds`/`initialInterventionIds` reflect only
  `CompanyCategory`/`CompanyIntervention` — an unconfigured company now
  sees an honestly empty selector.
- A status badge — `"Configurato"` (success) or `"Non configurato"`
  (warning) — now renders next to the company name, sourced directly from
  `company.isConfigured`.
- When not configured and an onboarding suggestion exists, a plain-text
  banner names it explicitly as unsaved ("Suggerimento dalla
  registrazione: *Impresa edile*. Non è ancora salvato — selezionalo qui
  sotto e premi 'Salva configurazione' per applicarlo.") instead of
  pre-checking it.

Database empty → `Non configurato`, no checked boxes, suggestion shown as
plain text only. Database populated → `Configurato`, checked boxes match
exactly what's saved. No fake configured state in either direction.

---

## TASK 6 — Dashboard cleanup

`get-requests-list-page.ts` no longer reads `onboardingCategorySlug` at
all (removed from both the SQL `select` and the application logic).
Visibility now depends only on `CompanyCategory` (for the category-derived
"broad net"/explore match level — a real, intentional, pre-existing
feature unrelated to onboarding, left untouched) and `CompanyIntervention`
(for the strict `selected_intervention` match level, matching exactly what
dispatch uses). An unconfigured company gets the `missing_category` empty
state, consistently with what Configura Servizi now also reports as "Non
configurato" — same underlying fact, same answer, two pages.

---

## TASK 7 — Database field inventory (classification, no removal)

| Field | Classification | Notes |
| --- | --- | --- |
| `CompanyCategory` (table) | **SOURCE_OF_TRUTH** | Half of `isConfigured`; sole writer `update-services-configuration.ts` |
| `CompanyIntervention` (table) | **SOURCE_OF_TRUTH** | Other half of `isConfigured`; also the sole table matching/dispatch reads |
| `Company.onboardingCategorySlug` | **LEGACY** (demoted, not dead) | Now read in exactly one legitimate role (onboarding suggestion display on Configura Servizi) plus one harmless unused passthrough (profile page's `CompanyProfileData.onboardingCategorySlug`, never rendered). No longer read by matching, visibility, or configuration-state logic anywhere. |
| `CompanyProfileData.onboardingCategorySlug` (the passthrough on the profile-page domain function) | **DEAD** (newly classified this phase) | Returned by `get-profile-page.ts`, consumed by nothing in `profile-page.tsx`. Candidate for removal in Phase 6 — kept now to avoid touching the profile page's API surface beyond what this phase requires. |
| `Category.projectGroupIds` | **DERIVED** (unchanged from Phase 0) | Still legitimately used to expand a *real, saved* category into its interventions for the dashboard's "explore" broadening — untouched by this phase, not part of the bug |
| `CompanyConfigurationStatus.isConfigured` (new) | **DERIVED** | The one new derived value this phase introduces; computed nowhere except `deriveCompanyConfigurationStatus` |

Nothing removed yet — per the task's instruction, this is preparation for
the later physical-cleanup phase, not an action taken now.

---

## TASK 8 — Validation against the real database

Ran the actual functions (not a reimplementation) live:

**Case B — real company, currently configured** (`sp ristrutturazioni`,
`cmqofg6fi0000loc47p71j87l`, `CompanyCategory` = 1 row, `CompanyIntervention`
= 10 rows):

```
getCompanyServicesConfigurationPage(actor).company:
{
  "categoryIds": ["cmqm6fwq80015i8c4r08tmoyg"],
  "interventionIds": [ ...10 ids... ],
  "isConfigured": true
}
getCompanyRequestsListPage(actor): ok: true, requests: 1
```
**Expected: Configured = true, dashboard behaves consistently. Confirmed.**

**Case A — `CompanyCategory` = 0, `CompanyIntervention` = 0** (no live
company in this exact state right now to call the full page functions
against without mutating real data — validated instead at the level that
actually matters, the canonical function itself, which is what every
reader now goes through):

```
deriveCompanyConfigurationStatus({ categoryIds: [], interventionIds: [] })
→ { categoryIds: [], interventionIds: [], isConfigured: false }
```
**Expected: Configured = false. Confirmed.** Dashboard consistency follows
structurally: `get-requests-list-page.ts`'s `resolvedCategoryIds` would be
`[]` (no fallback exists anymore to populate it), hitting the same
`missing_category` branch every empty-category company already hit before
this phase — the only change is that *no* company can avoid that branch
through an onboarding snapshot anymore.

**Case C — `onboardingCategorySlug` present, `CompanyCategory` empty,
`CompanyIntervention` empty**:

```
deriveCompanyConfigurationStatus({ categoryIds: [], interventionIds: [] })
→ { categoryIds: [], interventionIds: [], isConfigured: false }
```
**Expected: Configured = false, no marketplace access based on the
onboarding snapshot. Confirmed structurally** — `deriveCompanyConfigurationStatus`'s
parameter list does not include `onboardingCategorySlug` at all; it is
not merely ignored at runtime, it is **not a parameter the function can
see**. The only way Case C could differ from Case A is if some other
reader bypassed the canonical function and re-derived from
`onboardingCategorySlug` directly — confirmed absent by the Task 4
repo-wide search.

---

## FINAL ANSWERS

```txt
COMPANY_CONFIGURED_IMPLEMENTATIONS_BEFORE = 4 (matching — strict, correct;
  dashboard — onboarding-fallback; Configura Servizi — onboarding-fallback,
  rendered as pre-checked; company profile page — onboarding-fallback,
  rendered as a category badge. The 4th was found during this phase, not
  in the original minimum list.)
COMPANY_CONFIGURED_IMPLEMENTATIONS_AFTER = 1 (deriveCompanyConfigurationStatus,
  packages/domain/src/company/configuration/company-configuration-status.ts).
  Matching remains a separate, already-correct, strict per-intervention
  EXISTS check — not "configured" in general, a different and narrower
  question by necessity (see docs/domain-invariants/00_INVENTORY.md) — and
  was never one of the divergent implementations to begin with.
CANONICAL_CONFIGURATION_FUNCTION = deriveCompanyConfigurationStatus /
  getCompanyConfigurationStatus, packages/domain/src/company/configuration/company-configuration-status.ts,
  exported from @esigenta/domain.
ONBOARDING_RUNTIME_USAGE_REMOVED = YES — confirmed by repo-wide search;
  the only remaining reads are the one allowed suggestion-display site
  (Configura Servizi) and one harmless, unrendered passthrough (profile
  page API response), neither of which can affect isConfigured, visibility,
  matching, or marketplace access.
DASHBOARD_CONSOLIDATED = YES — get-requests-list-page.ts no longer reads
  onboardingCategorySlug; resolvedCategoryIds is real CompanyCategory data
  only.
CONFIGURE_SERVICES_CONSOLIDATED = YES — initial checkbox state is real
  saved data only; an explicit Configurato/Non configurato badge and an
  unapplied-suggestion banner replace the old indistinguishable preselection.
SOURCE_OF_TRUTH = CompanyCategory + CompanyIntervention, nothing else —
  confirmed structurally (the canonical function's only parameters) and by
  live validation (Cases A/B/C above).
READY_FOR_PHASE_2 = YES — CompanyConfigured is now a single, real,
  type-enforced concept other invariants (CompanyMarketplaceReady,
  RequestVisibleToCompany) can compose against in the next phase, rather
  than each needing to decide for itself what "configured" means.
```
