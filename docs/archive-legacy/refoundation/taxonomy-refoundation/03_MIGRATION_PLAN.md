# TAXONOMY REFOUNDATION — MIGRATION PLAN

Step-by-step plan to move the codebase from the legacy Service-based implementation to the frozen model ([docs/taxonomy.md](../taxonomy.md)), now that:
- the new taxonomy package exists and is verified to compile/validate/generate (`packages/taxonomy/src/frozen/`)
- the gap analysis exists ([01_GAP_ANALYSIS.md](01_GAP_ANALYSIS.md))
- the target persistence model exists ([02_TARGET_MODEL.md](02_TARGET_MODEL.md))

No step below has been executed. This is a plan, not a changelog.

**Sequencing rule:** legacy code/tables stay alive and fully functional until the step that explicitly replaces them. Each step below should be its own PR/commit set, independently revertible.

---

### Step 0 — Promote the frozen taxonomy content (prerequisite, not listed as its own numbered area but blocks Step 1)

Replace the sample data in `packages/taxonomy/src/frozen/source/` with the full real catalog (all categories, project groups, interventions, aliases currently live in the legacy `services`/`interventions`/`categories` source files). This is pure data authoring — no consumer changes yet. Validate with `taxonomy:frozen:build` / `taxonomy:frozen:generate` after each batch.

---

### 1. Company configuration

1. Add `Intervention` and `Category` minimal tables seeded from the frozen generated output (additive; legacy `Service`/`Sector`/old `Category`/`Intervention` tables untouched).
2. Add `CompanyIntervention` junction table (additive).
3. Backfill: for every existing `CompanyService` row, resolve the owning Intervention(s) via the legacy `InterventionService` graph and insert the corresponding `CompanyIntervention` rows. This is the one place legacy data is read to seed the new model — a one-time backfill script, not a live dependency.
4. Ship new Company configuration UI (Category picker → `defaultProjectGroups` bootstrap → Intervention picker grouped by ProjectGroup) writing to `CompanyIntervention` **in addition to** the legacy `CompanyService` (dual-write) so dispatch (still legacy) keeps working.
5. Verify: every company that had `CompanyService` rows now has equivalent `CompanyIntervention` rows (count/spot check).

### 2. Matching

1. Implement the new candidate resolution (`Request.interventionId ∩ CompanyIntervention.interventionId`) behind a flag/parallel code path — do not remove the existing `resolve-request-dispatch-candidates.ts` logic yet.
2. Run both old and new resolution in shadow mode on real requests; diff candidate sets; investigate discrepancies (expected sources: companies not yet dual-written, interventions with no mapped legacy service, etc.).
3. Once shadow diff is clean for N consecutive days (define N with the user — not specified in spec, flag as open decision), cut matching over to the new path.

### 3. Dispatch

1. Repoint `create-request-dispatches-for-request.ts` to consume the new matching path's output instead of the legacy candidate list.
2. No notification-specific change needed — dispatch already feeds notifications; this step is the actual cutover point for the whole funnel.

### 4. Notifications

1. No structural change required (per [02_TARGET_MODEL.md](02_TARGET_MODEL.md) §6) — confirm post-cutover that recipient sets match pre-cutover behavior for a sample of requests.

### 5. Request lifecycle

1. Add `Request.interventionId` column, backfilled from existing `interventionSlug` (resolve slug → new Intervention table).
2. Update `create-request.ts` to populate `interventionId` directly; stop populating `RequestRequiredService` (dual-write window optional here since dispatch already migrated in Step 3).
3. Drop `requiredServices` write path from request creation code.

### 6. Search

1. Replace `list-services-for-category.ts` traversal with direct Category → (no relation) lookup; Category stops expanding into Intervention results entirely once it stops owning a `services[]` array — re-evaluate whether Category should still appear as a discovery entry point at all, since the frozen model gives Category no relation to Intervention besides `defaultProjectGroups` (UX-only, not search).
2. Replace `apps/web/.../services/service-groups.ts` with a ProjectGroup-based equivalent reading `project-groups.generated.json`.
3. Update `build-request-draft.ts` / `RequestMatchingSignals` to drop `requiredServiceSlugs`, carrying only the intervention slug forward into the request draft.

### 7. Cleanup (only after Steps 1–6 are live in production and stable)

1. Remove dual-write paths (legacy `CompanyService` writes, `RequestRequiredService` writes).
2. Drop Prisma models: `Sector`, `Service`, `ServiceAlias`, `CategoryService`, `InterventionService`, `CompanyService`, `RequestRequiredService`, `Company.requestMatchingMode` enum + column.
3. Delete legacy taxonomy source tree (`packages/taxonomy/src/source/`, `src/orchestrator/seed-taxonomy.ts` legacy paths, legacy generated JSON files) and fold `src/frozen/` up to be *the* taxonomy package (drop the `frozen/` namespace).
4. Remove the legacy `requestMatchingMode`-aware branches in any leftover service code.

---

## Blockers carried over from the audit

- Step 1.3's backfill quality depends entirely on today's `Service → Intervention` (`InterventionService`) mapping being complete and correct — any service with zero or ambiguous intervention mapping needs manual resolution before backfill.
- Step 2's shadow-mode duration (N days) is an open decision for the user, not derivable from the spec.
- Historical `RequestRequiredService` rows are a data-loss risk at cleanup time (Step 7.2) — confirms the same risk flagged in the prior audit. Per [[feedback_no_legacy]] (project not live, no compat needed beyond declared bridges), straight deletion is acceptable unless the user wants an export/archive first — worth a one-line confirmation before Step 7 executes.

## Hidden risks

- Category losing its `services[]`/search-expansion role (Step 6.1) may regress "search for my profession" UX (e.g., typing "idraulico" today expands to all plumbing interventions via Service). The frozen model doesn't define a replacement expansion path for Category in search — needs an explicit product decision, not just a code change, before Step 6 ships.
- Dual-write windows (Steps 1.4, 5.2) are the main place new bugs can hide silently, since both old and new paths must stay consistent for the duration — recommend an automated consistency check job during these windows.

## Migration complexity assessment

Unchanged from the prior audit: **High**, driven by Step 2 (matching cutover) and Step 1 (UI + backfill). Steps 4, 6.2, 6.3, and 7 are comparatively mechanical once 1–3 land safely.
