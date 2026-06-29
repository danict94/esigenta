# TAXONOMY REFOUNDATION — TARGET PERSISTENCE MODEL

Design only. No Prisma schema changes, no migrations. This describes the persistence shape the frozen model ([docs/taxonomy.md](../taxonomy.md)) requires for Company configuration, matching, requests, and notifications, evaluated **only against the frozen model** — current implementation is intentionally ignored here (see [01_GAP_ANALYSIS.md](01_GAP_ANALYSIS.md) for the legacy comparison).

---

## 1. Guiding constraints from the frozen spec

- Intervention is the only matching unit. No table or query may resolve a match through Category or ProjectGroup.
- Category and ProjectGroup carry zero matching semantics. Category's only relation to ProjectGroup is `defaultProjectGroups`, used exclusively to pre-populate onboarding UI.
- Company persists `{ categoryIds: string[], interventionIds: string[] }`. ProjectGroup is never persisted on Company — it is reconstructable from `interventionIds` purely for UX redisplay.
- Taxonomy content (Category, ProjectGroup, Intervention, Alias) is code-sourced and generated (`packages/taxonomy/src/frozen/`), matching the existing project convention of source-of-truth-in-code + seed script, not admin-edited tables.

---

## 2. What needs a real database table vs. what doesn't

| Concept | Persisted in DB? | Reasoning |
|---|---|---|
| Category | **Yes** — minimal table (`id`, `slug`, `name`) | Needed as an FK target for `Company.categoryIds` and for referential integrity; content still seeded from `packages/taxonomy/src/frozen/source`. |
| ProjectGroup | **No** | Spec: "Non salvare ProjectGroup. ProjectGroup è una struttura editoriale e UX derivata dalla taxonomy." Lives only in `project-groups.generated.json` / the frozen source tree. The web layer reads it directly from the taxonomy package, never from Prisma. |
| Intervention | **Yes** — minimal table (`id`, `slug`, `name`) | Needed as an FK target for `Company.interventionIds` and `Request.interventionId`, and as the stable join key for matching. Seeded from generated output, same pattern as today's `Intervention` table. |
| Alias | **No** | Search/SEO concern only; served straight from `aliases.generated.json` (or an in-memory index built from it) — never needs relational integrity with Company/Request. |
| `defaultProjectGroups` | **No** | Pure UX bootstrap data, lives on the generated `Category` record, read at onboarding time, never joined against in queries. |

This means the future Prisma schema shrinks to two simple lookup tables (`Category`, `Intervention`) instead of today's five-entity web (`Sector`, `Service`, `Category`, `Intervention`, plus four junction tables).

---

## 3. Company configuration target shape

```
Company {
  ...unchanged fields...

  categoryIds:     Category[]      // via CompanyCategory junction (kept, re-scoped)
  interventionIds: Intervention[]  // via NEW CompanyIntervention junction
}
```

- `CompanyCategory` survives structurally (companyId, categoryId) but its purpose changes: it no longer feeds matching, only "what professional identity does this company present" (badges, onboarding display, defaultProjectGroups re-bootstrap if the user reopens configuration).
- New junction `CompanyIntervention` (companyId, interventionId) replaces `CompanyService` 1:1 in shape, replacing "service" with "intervention" as the unit a company declares it wants to receive.
- `requestMatchingMode` enum is **removed from the target model** — there is exactly one matching mode (Intervention match), so the strictness toggle has no meaning.
- `onboardingCategorySlug` can remain as-is; it's already documented as "onboarding snapshot, not used in runtime matching" — compatible with the frozen model unchanged.

No ProjectGroup column or table is touched by Company persistence at any point — confirmed against spec's explicit "Non salvare ProjectGroup."

---

## 4. Matching target shape

Current dependency chain (`Request → Service → CategoryService → categoryId → CompanyCategory/CompanyService`) collapses to:

```
Request.interventionId  ∩  CompanyIntervention.interventionId  →  candidate Company
```

A single join, no Category involved at any step. `Request.interventionSlug` already exists as a stable snapshot field (per the schema's own comment: "Request MUST remain taxonomy-independent... historically stable") — the target model adds a resolvable `interventionId` FK derived from that slug at request-creation time, mirroring how `interventionSlug` already works today, just without the Service detour.

---

## 5. Request target shape

```
Request {
  ...unchanged fields...

  interventionSlug String?   // existing snapshot — KEPT as-is
  interventionId    String?   // NEW — FK to Intervention, resolved once at creation
}
```

`RequestRequiredService` and its `serviceId`-keyed junction have no equivalent in the target model — they are deleted outright once dispatch no longer reads them (see migration plan). No replacement junction is needed because a Request maps to exactly one Intervention (1:1), not a many-to-many like Service was.

---

## 6. Notification target shape

Notifications require no new persistence — they consume whatever the matching step (§4) already produced (`RequestDispatch` candidates keyed by company). The only structural change upstream is that those candidates are now resolved via `CompanyIntervention` instead of `CompanyCategory`/`CompanyService`, so `NotificationDelivery`/`CompanyNotification` tables are unaffected as-is.

---

## 7. Summary of new/changed tables (design intent — not a migration)

| Table | Change |
|---|---|
| `Sector` | Removed entirely |
| `Service`, `ServiceAlias` | Removed entirely |
| `CategoryService`, `InterventionService` | Removed entirely |
| `Category` | Field set shrinks to `id`, `slug`, `name` (+ generated `defaultProjectGroups` stays in JSON, not DB) |
| `Intervention` | Field set shrinks to `id`, `slug`, `name` (no `services` relation) |
| `CompanyService` | Removed, replaced by `CompanyIntervention` |
| `CompanyCategory` | Kept, re-scoped (no matching role) |
| `CompanyIntervention` | **New** junction (companyId, interventionId) |
| `RequestRequiredService` | Removed entirely |
| `Request.interventionId` | **New** FK column alongside existing `interventionSlug` |
| `Company.requestMatchingMode` | Removed entirely |
| `ProjectGroup`, `Alias` | No table — generated/source-only |

This is the target to migrate toward; execution order and risk handling are in [03_MIGRATION_PLAN.md](03_MIGRATION_PLAN.md).
