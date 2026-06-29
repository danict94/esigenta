# CATALOG EVOLUTION 02 — CARTONGESSO-E-FINITURE ORPHAN CLEANUP

---

## A. Orphan Analysis

| Field | Value |
|---|---|
| Intervention id | `cmqm6fxrd001ai8c4005f7gxc` |
| Slug | `cartongesso-e-finiture` |
| Name | `Cartongesso e finiture` |
| ProjectGroup assignment | `finiture` (`cmqmw2j3j0004q4c4xk7o2cci`) — stale, left over from before the [Phase 14.5/16/17 catalog split](../taxonomy-refoundation/17_LEGACY_TAXONOMY_SOURCE_REMOVAL_REPORT.md) that replaced this single intervention with 6 granular ones, 3 of which are now `cartongesso` and 3 `finiture` |
| Aliases (3) | `"controsoffitto in cartongesso"`, `"lavori in cartongesso"`, `"parete in cartongesso"` |
| `requests` referencing it | **0** |
| `companyIntervention` referencing it | **0** |
| Search visibility | Matched any query containing "cartongesso" |
| Profession page visibility | Surfaced under `imbianchino`'s `finiture` ProjectGroup (incorrectly — it isn't painting/plastering work) |

**A concrete, active defect found during the audit, not just a cosmetic leftover:** two of this orphan's three aliases — `"controsoffitto in cartongesso"` and `"parete in cartongesso"` — are byte-identical to aliases declared in frozen source for `realizzare-controsoffitto` and `realizzare-parete-cartongesso` respectively. `InterventionAlias.value` is globally unique. Because the orphan row created its aliases first (back when it was the only intervention), the catalog sync's `skipDuplicates: true` insert was *silently* dropping those two aliases for the new interventions every time the sync ran — confirmed by querying their actual alias rows before cleanup: `realizzare-controsoffitto` had only 2 of its 3 declared aliases, `realizzare-parete-cartongesso` only 2 of its 3. This orphan wasn't just dead weight; it was actively degrading the new catalog's alias coverage.

## B. Action Taken

**Decision: A — deleted, not migrated.** There was nothing to migrate: zero `Request` rows and zero `CompanyIntervention` rows referenced it, so no live data depended on its identity. Migrating would have meant inventing a mapping for relationships that don't exist. Per the explicit rule not to recreate the concept, the row (and its 3 aliases, removed via the existing `onDelete: Cascade` relation) was deleted outright via `prisma.intervention.delete()`.

The catalog was then re-synced (`taxonomy:frozen:sync-db`). With the orphan gone, the two previously-blocked alias values were free to be created on their correct owners.

## C. References Removed

- The `Intervention` row itself (cascaded its 3 `InterventionAlias` rows).
- No `Request`, `CompanyIntervention`, `Category`, or `ProjectGroup` rows referenced it, so nothing else needed reassignment.
- **Recovered, not just removed:** after the re-sync, `realizzare-controsoffitto` gained back `"controsoffitto in cartongesso"` and `realizzare-parete-cartongesso` gained back `"parete in cartongesso"` — aliases that were always supposed to belong to them but had been silently shadowed by the orphan's prior claim on those exact strings.

## D. Validation Results

All checks run against the live database with assertions that fail loudly on any regression, not visual inspection:

| Check | Result |
|---|---|
| Row exists | **No** |
| Search `"cartongesso"` | `realizzare-controparete`, `realizzare-controsoffitto`, `realizzare-parete-cartongesso` only |
| Search `"cartongesso e finiture"` | Same 3 — no orphan slug, no stale match |
| Search `"lavori in cartongesso"` | Same 3 — confirms the recovered alias is live |
| Search `"imbianchino"` | The 5 `finiture` interventions only |
| `/professionisti/cartongessista` | Exactly `realizzare-parete-cartongesso`, `realizzare-controsoffitto`, `realizzare-controparete` — nothing else |
| `/professionisti/imbianchino` | Exactly `tinteggiare-interni`, `tinteggiare-esterni`, `intonacare-pareti`, `ripristinare-intonaco`, `applicare-stucco-decorativo` — nothing else |

Both profession pages now contain **exactly** their intended intervention sets — not "no longer show the orphan," but precisely the correct 3-and-5 split with zero extra and zero missing entries.

---

## CARTONGESSO_E_FINITURE_EXISTS = NO

The orphan intervention is fully deleted from the database. It does not appear in search, profession pages, discovery, or the catalog. No orphan catalog concepts remain — and as a direct consequence of removing it, two real aliases on the current interventions that it had been silently blocking are now correctly present.
