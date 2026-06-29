# TOTAL_UI_DEMOLITION_EXECUTION_PLAN

The decision is made: the Homepage design language ("Cantiere Calmo" — `cc.*` / `tokens.cantiere.*`) is the only approved visual system. This document is the execution roadmap to remove every other one. It supersedes `LEGACY_UI_DEMOLITION_PLAN.md` where that document hedged toward compatibility — this version optimizes for removal, not coexistence.

Inputs: `docs/design/HOME_DESIGN_SYSTEM.md`, `docs/archive-legacy/ui/LEGACY_UI_DEPENDENCY_MAP.md`, `docs/archive-legacy/ui/LEGACY_UI_DEMOLITION_PLAN.md`, and the Phase 1 deletions already executed against this repo (see "Already done" below).

## Classification used throughout

- **DELETE NOW** — zero live consumers today, or consumers exist only inside something already scheduled for deletion in this same phase. No migration required.
- **DELETE AFTER MIGRATION** — real consumers exist; deletable only once Phase 3/4 has moved those consumers onto Homepage-derived primitives.
- **KEEP AS INFRASTRUCTURE** — the implementation (component API, file, abstraction) survives; every line of its current visual styling is rebuilt on `cc.*`/`tokens.cantiere.*`. Nothing of the legacy *look* survives, only the *shape*.

## Already done (do not re-execute)

The following were deleted in the prior demolition sprint and are not part of this roadmap — they are confirmed gone:
- `packages/ui/src/layout/marketing-surface.tsx` (inlined into `hero-surface.tsx`)
- `legacyCssSurfaceTokens`, `tokens.surfaces`, `neutralColorTokens`/`tokens.neutralColors`, `SurfaceToken` and `NeutralColorToken` types — from `tokens.ts`
- `--fp-radius-hero-surface`, `--fp-color-accent-step-one/two/three`, `--fp-color-decorative-purple`/`primary-purple`, `--fp-color-accent-warning`/`warning-primary`, `.fp-hero-surface` CSS class — from `globals.css`
- `MarketingSurface` export (component + types) from `index.ts`

Typecheck and build were green on `apps/web` and `apps/admin` after this work. `--fp-hero-surface-background` was deliberately **kept** — it has a live consumer (`structuralSurfaceTokens.hero`) that the prior plan had misclassified as dead.

---

## Phase 1 — Delete everything removable immediately

These are net-new findings beyond the prior sprint, verified zero-consumer just now:

| Item | Location | Why it's dead |
|---|---|---|
| `layoutTokens.marketing` (`heroGutter`, `sectionInner` keys) | `packages/ui/src/styles/tokens.ts` | Zero consumers anywhere — neither `apps/web`, `apps/admin`, nor any other key inside `tokens.ts` itself references `layout.marketing` |

No other genuinely zero-consumer items remain after the prior sprint's sweep — the remainder of the legacy system is load-bearing (real pages depend on it) and must go through Phase 2-5, not a direct delete.

**Files to delete in this phase:** none (no file currently has zero consumers; `marketing-surface.tsx` already went in the prior sprint).

**Tokens to delete in this phase:** `layoutTokens.marketing` key (and remove its reference inside `layoutTokens`'s object literal — it is a leaf, no other token depends on it).

**CSS variables to delete in this phase:** none — everything remaining in `globals.css` has at least one live consumer (verified in the dependency map); the easy, consumer-free variables were already removed in the prior sprint.

Execution: remove the `marketing` key from `layoutTokens` in `tokens.ts`; typecheck + build `apps/web`/`apps/admin`.

---

## Phase 2 — Mark every remaining legacy styling primitive for replacement

Nothing here is deleted yet. This phase produces the replacement values; Phase 3 wires them into components; Phase 4 migrates pages; Phase 5 deletes what's left over.

| Primitive family | Current (legacy) | Marked for replacement by |
|---|---|---|
| **Colors** | `--fp-color-accent-warm`, `--fp-color-brand-primary`, `--fp-color-action-primary` (+ hover/on-color pairs); `semanticSurfaceTokens` pointing at `--fp-color-surface-*` | `cc.accent`/`cc.accentHover` (single accent hue); `cc.paper`/`cc.linen`/`cc.surface`/`cc.ink` for all surface roles |
| **Typography** | `tokens.typography.{hero,heroSecondary,title,subtitle,body,caption,micro,microLabel}` — fixed breakpoint steps | `clamp()`-based scale modeled on `ccType.heading` and the hero `<h1>` clamp documented in `HOME_DESIGN_SYSTEM.md` |
| **Radius** | `radiusTokens.{sm,md,lg,xl,2xl,3xl,full}` — Tailwind-default scale | `tokens.cantiere.radius.{sm,md,lg}` (4/6/8px) |
| **Spacing** | `tokens.spacing.{sectionXs...sectionXl}` | A canonical section-spacing scale derived from the Homepage's observed per-section range (`py-16` to `py-32`) — a deliberate decision, not a 1:1 port, since the Homepage itself has no single unified scale |
| **Shadows** | `tokens.shadows.{sm,md,lg,card,surface,homeHeroCard}`, `--fp-shadow-card`, `--fp-shadow-surface`, `--fp-shadow-home-hero-card` | `tokens.cantiere.shadow.{elevation,slab}` |
| **Surfaces** | `structuralSurfaceTokens` (`hero`/`editorial`/`footer`), `marketingSurfaceFrameTokens` | `cc.paper`/`cc.linen` panels, full-bleed where narrative role warrants it (Design Principle 5) |
| **Forms** | `formControlTokens` (border/focus language built on `--fp-color-border-*`) | Border + accent-glow focus pattern modeled on the `explosion.tsx` search field — the only real Homepage form precedent |
| **Layouts** | `containerWidthTokens` (all 7 sizes alias to one `1024px` value), `layoutTokens.pageShell`/`heroSurface` | Real, distinct widths derived from the Homepage's observed 1280px/1120px/full-bleed pattern |
| **CTA styles** | `interactiveTokens.variants.{primary,secondary,brand,warm,brandOutline,ghost}` | The 3 CTA treatments in `HOME_DESIGN_SYSTEM.md`: filled accent (Primary), accent-outline (Secondary), text-link (Text CTA) |
| **Global tracking** | `--fp-letter-spacing-canvas` applied to `body` and `body [class]` (every classed element in `apps/web`) | Removed entirely — the Homepage sets `tracking-[...]` per element, never globally. This is the single highest-blast-radius item in the whole plan; treat as its own isolated step with full visual review, not folded into a routine token swap |

---

## Phase 3 — Component Refoundation

KEEP AS INFRASTRUCTURE for all of these — API preserved, every rendered class/style rebuilt on Phase 2's replacement values.

| Component | What survives | What's deleted from it |
|---|---|---|
| **Button** | `variant`/`size` prop API, 4 variant names | Every current class string in `interactiveTokens.variants` — rebuilt around `cc.accent` fill/outline/text-link, replacing `--fp-color-action-primary`/`brand-primary`/`accent-warm` entirely. `warm`/`brandOutline` either get folded into the new variant set or removed — they currently exist only as a token-level bypass used by 5 SEO files, not as real Button variants |
| **Input / Textarea / Select / Checkbox** | Component API | `formControlTokens` base/border/focus classes — rebuilt on the search-field border + accent-glow pattern |
| **Card** (+Header/Content/Title/Description) | Component API, 5-part composition | `cardTokens` — `border-border-primary`/`bg-surface-elevated`/`shadow-card` replaced with `cc.paper`/`cc.hairline`/`tokens.cantiere.shadow.elevation` |
| **Badge** | Component API, 4 variants | `badgeTokens.variants` — rebuilt on `cc.accent`/`cc.ink`/`cc.hairline` (note: `warning` variant currently doesn't even use the now-deleted `--fp-color-accent-warning`, so this is a clean rebuild, not a re-point) |
| **Container** | Component API | `containerWidthTokens`'s single-value-for-all-sizes quirk — replaced with real, distinct widths |
| **PageShell** | Component API | `layoutTokens.pageShell` padding — replaced with Phase 2's spacing scale |
| **HeroSurface** | Component API (now a single inlined file, post Phase-1-prior-sprint) | `structuralSurfaceTokens.hero`/`marketingSurfaceFrameTokens` — rebuilt as either a full-bleed treatment or a plain `cc.paper`/`cc.linen` panel, decided per its 2 real consumers' (`signup-page.tsx`, `area-impresa-marketing-page.tsx`) actual narrative need, evaluated against Design Principle 5 ("full-bleed is an earned exception, not a default") |

After this phase: the legacy visual language no longer exists in the component layer. Legacy pages still render (nothing breaking yet) — they just haven't been pointed at the rebuilt output until Phase 4.

---

## Phase 4 — Area-by-area migration

Order follows the severity/size ranking already established in `LEGACY_UI_DEPENDENCY_MAP.md`.

1. **Legal** (4 files: `cookie-policy-page`, `privacy-page`, `termini-page`, `legal-section`) — 100% Card-dependent, smallest, lowest risk. Proves Phase 3's rebuilt Card in a real page first.
2. **SEO** (9 templates + 4 `not-found.tsx` routes) — must move the 5 files bypassing Button via `tokens.interactive.variants.{warm,brandOutline}` onto the rebuilt Button component directly (token-swap alone does not fix this — they don't go through Button today). Also migrate `tokens.home.*` usage (`sectionLabel` etc., 7 files) onto Phase 2's spacing/typography.
3. **Richiesta** (12 files, including the 2-file `tokens.funnel` money-path) — dedicated QA pass given severity; this is request submission, not a content page.
4. **Area Impresa** (~35 files, broadest component surface — all of Phase 3's rebuilt components land here) — largest single migration.
5. **Admin** (~19 files, separate app) — migrate `admin-shell.tsx` off `tokens.home.nav.*` onto the canonical `Navbar`; this is the last cross-app tie to dead-in-web tokens. Independent of 1-4, can run in parallel.

Exit condition for Phase 4: re-run the `LEGACY_UI_DEPENDENCY_MAP.md` greps for every token family and component listed in that document — every result should now point at Phase 3's rebuilt implementations, not legacy CSS variables.

---

## Phase 5 — Final demolition

Executed only after Phase 4 confirms (via grep, not assumption) zero remaining consumers for each item:

- Delete `homeTokens` entirely (`section`/`sectionLabel`/`sectionTitle`/etc. and `nav.*`) from `tokens.ts`.
- Delete `--fp-home-content-inset-x`, `-section-y`, `-section-y-compact`, `-section-gap`, `-search-inner-height`, `-search-button-size`, and `--fp-font-nav` from `globals.css`.
- Delete `marketingSurfaceFrameTokens` and `structuralSurfaceTokens` once the Phase 3 HeroSurface rebuild no longer references them.
- Delete `--fp-hero-surface-background` (now safe — its sole consumer, `structuralSurfaceTokens.hero`, is gone) and `--fp-radius-marketing-surface`.
- Delete `--fp-shadow-surface`, `--fp-shadow-card`, `--fp-shadow-home-hero-card` once `tokens.shadows` is fully repointed at `tokens.cantiere.shadow.*` and nothing references the legacy names.
- Delete `--fp-color-accent-warm`, `--fp-color-brand-primary`, `--fp-color-action-primary` (+ all hover/on-color pairs) once every component/page resolves to `cc.accent` instead.
- Delete `containerWidthTokens`'s legacy single-value implementation once Container ships its real widths.
- Delete `interactiveTokens.variants.{warm,brandOutline}` once SEO's 5 files are migrated onto rebuilt Button variants.
- Full-repo grep sweep for every identifier named in this document (not sampling) to confirm zero remaining references.
- Full typecheck + build of `apps/web` and `apps/admin`, plus a visual smoke pass: one page per area (Home, one Legal page, one SEO template, one Richiesta page, one Area Impresa page, one Admin page).

---

## Final Architecture

### Files expected to disappear
- `packages/ui/src/layout/marketing-surface.tsx` — **already gone**
- No further files are expected to disappear; every remaining file in `packages/ui/src/components/` and `packages/ui/src/layout/` survives as KEEP AS INFRASTRUCTURE (rebuilt, not removed)

### Token families expected to disappear
- `legacyCssSurfaceTokens`, `tokens.surfaces`, `neutralColorTokens` — **already gone**
- `layoutTokens.marketing` — Phase 1 of this document
- `homeTokens` (entire group, including `nav.*`) — Phase 5
- `marketingSurfaceFrameTokens`, `structuralSurfaceTokens` — Phase 5
- `interactiveTokens.variants.warm` / `.brandOutline` as standalone bypass-only entries — Phase 5 (folded into rebuilt Button variants or removed outright)
- The legacy `containerWidthTokens` single-value implementation — Phase 5 (replaced by real widths, not removed as a concept)

### CSS variables expected to disappear
- `--fp-radius-hero-surface`, `--fp-color-accent-step-one/two/three`, `--fp-color-decorative-purple`/`primary-purple`, `--fp-color-accent-warning`/`warning-primary` — **already gone**
- `--fp-hero-surface-background`, `--fp-radius-marketing-surface` — Phase 5
- `--fp-shadow-surface`, `--fp-shadow-card`, `--fp-shadow-home-hero-card` — Phase 5
- `--fp-color-accent-warm`, `--fp-color-brand-primary`, `--fp-color-action-primary` (+ hover/on-color pairs) — Phase 5
- `--fp-font-nav` — Phase 5
- `--fp-home-content-inset-x`, `-section-y`, `-section-y-compact`, `-section-gap`, `-search-inner-height`, `-search-button-size` — Phase 5
- `--fp-letter-spacing-canvas` and its `body`/`body [class]` global application — Phase 2 (removed as its own isolated step, not bundled with the rest)

### Styling abstractions expected to disappear
- The `tokens.surfaces` backward-compat namespace — **already gone**
- `MarketingSurface` as a separate composite layer — **already gone** (inlined)
- The "marketing surface frame" concept (rounded-inset panel) as a generic abstraction — replaced by HeroSurface's direct full-bleed-or-plain-panel choice
- The dual-accent-hue system (`accent-warm` vs `cc.accent`) — collapses to one hue
- The breakpoint-jump typography system — collapses to `clamp()`-based fluid scaling
- The single-value-pretending-to-be-7-sizes container width system — collapses to real, named widths

### The architecture this produces
One palette (`cc.*`, exposed through `tokens.cantiere.*`), one radius family, one shadow language (two tiers: soft elevation, heavier slab), one fluid typography system, one CTA vocabulary (filled, outline, text-link), and one container-width decision — used identically whether the consumer is the Homepage itself, `Button` in an Area Impresa form, `Card` on a Legal page, or `PageShell` in Admin. `tokens.ts` stops being an independent design system that happens to sit next to `tokens.cantiere.*`; it becomes a semantic-naming layer that resolves entirely through `cc.*` values. There is no second color system, no second shadow system, no second radius scale, no compatibility namespace, and no token family whose only purpose is bridging old pages to old values. Every shared component still exists and is still reusable — none of their APIs needed to change — but nothing about how they render predates the Homepage.
