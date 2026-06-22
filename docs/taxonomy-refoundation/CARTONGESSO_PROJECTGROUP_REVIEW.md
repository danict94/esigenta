# CARTONGESSO PROJECTGROUP REVIEW

Read-only catalog quality review, not an architecture phase. No code changed.

---

## Audit — current state

**`finiture.ts`** (ProjectGroup `finiture`, 8 interventions):

| Slug | Work |
|---|---|
| `realizzare-parete-cartongesso` | Build a drywall (cartongesso) partition wall |
| `realizzare-controsoffitto` | Build a drywall suspended ceiling |
| `realizzare-controparete` | Build a drywall counter-wall/lining |
| `tinteggiare-interni` | Interior painting |
| `tinteggiare-esterni` | Exterior painting |
| `intonacare-pareti` | Wall plastering (wet plaster, not drywall) |
| `ripristinare-intonaco` | Plaster repair |
| `applicare-stucco-decorativo` | Decorative/Venetian stucco |

**Category mappings** (`packages/taxonomy/src/frozen/source/categories/*.ts`):

| Category | ProjectGroup(s) |
|---|---|
| `idraulico` | `impianti-idraulici` |
| `elettricista` | `impianti-elettrici` |
| `installatore-fotovoltaico` | `fotovoltaico` |
| `tecnico-climatizzazione` | `climatizzazione` |
| `imbianchino` | `finiture` |
| **`cartongessista`** | **`finiture`** |

Every category in the catalog maps to one ProjectGroup dedicated entirely to that trade's work — **except `imbianchino` and `cartongessista`, which both map to the same `finiture` ProjectGroup.** This is the only place in the current catalog where two distinct professional categories share an undifferentiated ProjectGroup.

---

## Evaluation

**1. How many interventions are truly "cartongesso"?**

Exactly 3 of the 8 in `finiture`: `realizzare-parete-cartongesso`, `realizzare-controsoffitto`, `realizzare-controparete`. All three are dry-construction (drywall/plasterboard) work. The other 5 are painting (`tinteggiare-*`) or wet-plaster/stucco work (`intonacare-pareti`, `ripristinare-intonaco`, `applicare-stucco-decorativo`) — a different trade in Italian practice (imbianchino, who commonly bundles tinteggiatura with rasatura/stuccatura, not cartongesso construction).

**2. Are they semantically coherent as a standalone area?**

Yes. All 3 are the same physical activity — building something out of cartongesso (partition wall, suspended ceiling, counter-wall) — and map to a single, well-recognized Italian trade: *cartongessista*. They share no overlap with painting or wet plastering.

**3. Would users realistically search "cartongesso" / "lavori in cartongesso" / "cartongessista" as a separate intent?**

Yes. These are common, specific Italian search terms tied to a recognized trade, distinct from "imbianchino" or "tinteggiatura" — already reflected in the catalog by the fact that `cartongessista` exists as its *own* category, separate from `imbianchino`, even though both currently point at the same ProjectGroup.

**4. Would a dedicated hub make sense?**

Yes, and concretely so: the category `cartongessista` already exists and is already routable (`getProfessionPage("cartongessista")`). It does not need to be invented. What's broken is what that page currently *shows*: because `cartongessista` → `finiture`, today's `/professionisti/cartongessista` page would surface `tinteggiare-interni`, `tinteggiare-esterni`, `intonacare-pareti`, etc. — work a cartongessista does not do — alongside the 3 interventions that are actually relevant.

**5. Would a dedicated ProjectGroup improve discovery/search/SEO/profession pages/future growth?**

Yes, on the evidence already in the catalog, not speculation:
- **Profession pages**: directly fixes the cartongessista page showing painting/plastering work, and the imbianchino page showing wall-construction work — both happen today, right now, with zero hypotheticals involved.
- **Search**: `search-taxonomy.ts`'s category-discovery layer expands a matched Category to *all* interventions in its ProjectGroup(s). A "cartongessista" match currently surfaces all 8 `finiture` interventions, 5 of which are irrelevant to that trade.
- **SEO/future growth**: cartongesso-specific catalog growth (e.g. additional drywall work) would otherwise keep diluting the same ProjectGroup as painting growth, with no structural separation between the two trades.

**6. Would keeping them inside Finiture create ambiguity?**

Yes — and this is the strongest finding: it already does, today, independent of any future change. `cartongessista` and `imbianchino` are the *only* two categories in the entire catalog that share a ProjectGroup; every other category (idraulico, elettricista, installatore-fotovoltaico, tecnico-climatizzazione) maps 1:1 to a ProjectGroup dedicated solely to its own trade. The current `finiture` arrangement is the one structural outlier, not the norm.

---

## Decision

## CREATE_CARTONGESSO_PROJECTGROUP

**Justification:** the catalog itself, not theory, supports this. Three interventions are unambiguously a standalone, coherent trade (cartongesso/drywall construction), a category (`cartongessista`) already exists specifically for it, and the *only* reason its profession page and search results are wrong today is that it shares a ProjectGroup with an unrelated trade (`imbianchino`/painting). Every other category in the catalog already follows the 1-category-to-1-dedicated-ProjectGroup pattern; `finiture` is the single exception, and splitting it removes that exception rather than creating a new kind of structure.

**Resulting shape** (for if/when this is implemented — not done in this review):
- New `project-groups/cartongesso.ts`: `realizzare-parete-cartongesso`, `realizzare-controsoffitto`, `realizzare-controparete`.
- `categories/cartongessista.ts`: `projectGroups: ["finiture"]` → `projectGroups: ["cartongesso"]`.
- `finiture.ts` keeps exactly what its name says: `tinteggiare-interni`, `tinteggiare-esterni`, `intonacare-pareti`, `ripristinare-intonaco`, `applicare-stucco-decorativo` — tinteggiature, intonaci, decorazioni, finiture superficiali, matching `imbianchino`'s actual scope of work.

**Expected future growth under Option A, rejected:** none observed or claimed — this decision is based on the current 8-intervention inventory, not a projection.
