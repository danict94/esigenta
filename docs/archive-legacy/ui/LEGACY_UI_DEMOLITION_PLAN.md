# LEGACY_UI_DEMOLITION_PLAN

A roadmap for replacing the legacy `packages/ui` visual language with the approved Homepage design language. This is a plan, not an execution — no code in this repository is changed by this document.

Inputs:
- `docs/design/HOME_DESIGN_SYSTEM.md` — the approved visual language (colors, type, spacing, radius, shadow, motion, principles)
- `docs/archive-legacy/ui/LEGACY_UI_DEPENDENCY_MAP.md` — the exact files/pages/areas that consume every legacy dependency today

## Reference system (final, not in scope for change)

Homepage (`site/home/**`), Navbar/Footer (`site/shell/{navbar,footer}.tsx`), `site/shell/palette.ts`, `tokens.cantiere.*`, and `HOME_DESIGN_SYSTEM.md`. Every decision below is judged against this system, never the other way around.

## Objective

One visual language. One design system. No legacy color, shadow, radius, typography, or CTA style survives in the final state — only the abstractions (component APIs, not their current styling) are eligible to survive, and only if rebuilt on the Homepage's values.

---

## Dependency Classification

### Components

| Name | Location | Consumers | Status | Replacement strategy | Homepage equivalent | Migration impact |
|---|---|---|---|---|---|---|
| Button | `packages/ui/src/components/button.tsx` | 36 files | **KEEP** (API) | Rebuild `variants`/`sizes` to render `cc.accent` fill, `cc.accent` outline, and a ghost/text treatment instead of `--fp-color-action-primary`/`brand-primary`. Variant *names* can stay; their styling cannot. | Primary CTA (`moment.tsx`), Secondary/accent-outline CTA (`navbar.tsx`), Text CTA (`explosion.tsx`, `index-directory.tsx`) | HIGH — 36 consumers, but visual-only change if API is preserved |
| Input | `packages/ui/src/components/input.tsx` | 20 files | **KEEP** (API) | Rebuild border/focus treatment around the Homepage's bottom-border + accent-glow focus pattern (`explosion.tsx` search field is the only real precedent — see note below) | Search Input (`explosion.tsx`) | MEDIUM |
| Textarea | `packages/ui/src/components/textarea.tsx` | 8 files | **KEEP** (API) | Same border/focus language as Input | **None exists** — no Homepage equivalent; new visual values must be derived from Input's rebuilt language, not invented independently | MEDIUM |
| Checkbox | `packages/ui/src/components/checkbox.tsx` | 2 files | **KEEP** (API) | Rebuild fill/border around `cc.accent`/`cc.hairline` | **None exists** | LOW (thin footprint) |
| Select | `packages/ui/src/components/select.tsx` | 5 files | **KEEP** (API) | Same border language as Input | **None exists** | LOW-MEDIUM |
| Card (+Header/Content/Title/Description) | `packages/ui/src/components/card.tsx` | 47 / 12 / 23 / 12 / 12 | **KEEP** (API) | Rebuild `tokens.card.*` around `cc.paper`/`cc.hairline`/`ccElevation` instead of `border-border-primary`/`bg-surface-elevated`/`shadow-card` | **No direct equivalent** — the Homepage has no card pattern; this is a genuine gap. Card's rebuilt look should borrow the Homepage's *surface and border language* (paper + hairline + soft elevation), not invent a new one | HIGH — broadest-reach component in the system, including 100% of Legal pages |
| Badge | `packages/ui/src/components/badge.tsx` | 34 files | **KEEP** (API) | Rebuild 4 variants around `cc.*` — currently uses legacy `border-secondary`/`bg-secondary`/`brand-primary`/`border-focus` with **zero** real connection to `--fp-color-accent-warning` (verified dead, see Phase 1) | **No direct equivalent** — status/label pattern doesn't exist on the Homepage; rebuild using `cc.accent`/`cc.ink`/`cc.hairline` as the only available palette | MEDIUM |
| Container | `packages/ui/src/layout/container.tsx` | 18 files | **KEEP** (API), **REPLACE** (values) | All 7 named sizes currently alias to one value (`1024px` quirk). Must become a real decision informed by the Homepage's own 3 widths (`1280`/`1120`/full-bleed) | Hero width (1280), content-rail width (1120), full-bleed (no constraint) | HIGH — touches the width of every page that uses Container |
| PageShell | `packages/ui/src/layout/page-shell.tsx` | 31 files | **KEEP** (API), **REPLACE** (values) | Depends on Container's resolved widths + `tokens.layout.pageShell` padding, which must move off legacy spacing onto Homepage-observed section padding | Section spacing pattern (per-section, not unified — see HOME_DESIGN_SYSTEM.md → Layout) | HIGH — second-broadest layout primitive |
| HeroSurface | `packages/ui/src/layout/hero-surface.tsx` | 2 files (`signup-page.tsx`, `area-impresa-marketing-page.tsx`) | **KEEP** (API), **REPLACE** (visual language) | Current implementation renders a rounded-frame, inset, shadow-none marketing panel — this directly conflicts with Design Principle 5 ("full-bleed is an earned exception tied to narrative role, not a generic layout choice"). Rebuild as either a full-bleed treatment (if the narrative role warrants it) or a plain `cc.paper`/`cc.linen` panel — not as a separately-framed "surface" object | `moment.tsx`'s full-bleed treatment (if narrative role matches) — otherwise no direct equivalent | LOW (2 consumers) but **conceptually significant** — this is where the legacy "marketing surface" abstraction is tested against Homepage principles |
| MarketingSurface | `packages/ui/src/layout/marketing-surface.tsx` | 0 direct, 1 internal (`hero-surface.tsx`) | **DELETE** | Inline its `tokens.structuralSurfaces[variant]` logic directly into the rebuilt `HeroSurface` in Phase 3 — once HeroSurface no longer needs a separately-variant-switched composite, this file has no remaining reason to exist | N/A | LOW — zero external consumers, safe once HeroSurface is rebuilt |

### Token families (`packages/ui/src/styles/tokens.ts`)

| Name | Consumers (apps) | Status | Replacement strategy | Homepage equivalent | Migration impact |
|---|---|---|---|---|---|
| `radiusTokens` | Internal only (Card/Button/etc.) | **REPLACE** | Replace the Tailwind-default scale (`rounded-md/lg/xl/2xl/3xl`) with the Homepage's 3-step pixel family | `tokens.cantiere.radius.{sm,md,lg}` (4/6/8px) — already promoted, ready to consume | LOW (internal-only, no app file touches this directly) |
| `semanticSurfaceTokens` | Internal (Card, Badge, layouts) | **REPLACE** | Re-point `base/primary/muted/.../footer/elevated/dark` at `cc.paper`/`cc.linen`/`cc.surface`/`cc.ink` instead of `--fp-color-surface-*` | `cc.paper`, `cc.linen`, `cc.surface`, `cc.ink` | MEDIUM — every component built on `tokens.card`/`tokens.badge` inherits the change automatically |
| `neutralColorTokens` | 0 direct app consumers verified | **DELETE** | No replacement needed — `cc.ink` already covers the "dark neutral" role; the separate black/anthracite pair adds nothing the Homepage system uses | `cc.ink` | LOW — verified zero direct consumers |
| `marketingSurfaceFrameTokens` | Internal (`MarketingSurface`) | **DELETE** | Tied to the rounded-inset hero-frame concept being demolished alongside `MarketingSurface` itself | N/A — full-bleed/plain-panel replaces the "framed surface" concept | LOW, contingent on HeroSurface rebuild (Phase 3) |
| `structuralSurfaceTokens` | Internal (`MarketingSurface`) | **REPLACE → then DELETE** | Its 3 recipes (`hero`/`editorial`/`footer`) get inlined and rebuilt directly into the components that use them (HeroSurface, and whatever takes over Footer-adjacent marketing panels, if any) rather than surviving as a separate indirection layer | N/A | LOW, contingent on Phase 3 |
| `legacyCssSurfaceTokens` | **Verified zero consumers anywhere** (app or internal) | **DELETE NOW** | No migration needed — already unreachable. `tokens.surfaces` (the namespace built on top of it) and the `SurfaceToken` type are equally dead | N/A | **NONE — Phase 1, immediate** |
| `containerWidthTokens` | Internal (`Container`) | **REPLACE** | Resolve the all-alias-to-`1024px` quirk into real, distinct widths derived from the Homepage's 1280/1120 | Hero/content-rail widths | HIGH (see Container above) |
| `sizingTokens` (controlHeight/badge/checkbox/textarea) | Internal | **KEEP** (structural scale), values tuned in Phase 3 | The dimensional scale itself (`h-10/12/14/16`) is sound infrastructure; only needs verification against the Homepage's actual control heights (`h-11` search button, `h-12` CTA, `h-16` search field) | Observed control heights in `explosion.tsx`/`moment.tsx` | LOW |
| `densityTokens` (padding density) | Internal | **KEEP**, values tuned in Phase 3 | Same reasoning as `sizingTokens` | Observed padding in Homepage sections | LOW |
| `layoutTokens` | Internal | **REPLACE** (sub-recipes) | `pageShell`/`heroSurface`/`marketing`/`messaging` recipes all currently reference the legacy surface/frame tokens being replaced/deleted above | N/A | MEDIUM |
| `cardTokens` | Internal (`Card`) | **REPLACE** | See Card above | `cc.paper`/`cc.hairline`/`ccElevation` | HIGH (inherits Card's 47-file reach) |
| `badgeTokens` | Internal (`Badge`) | **REPLACE** | See Badge above | `cc.accent`/`cc.ink`/`cc.hairline` | MEDIUM (inherits Badge's 34-file reach) |
| `interactiveTokens` (Button variants/sizes) | Internal (`Button`) + **direct bypass** in 5 SEO files via `tokens.interactive.variants.{warm,brandOutline}` | **REPLACE** | Highest-priority token rebuild: every variant currently resolves to `--fp-color-action-primary`/`accent-warm`/`brand-primary`. The 5 SEO files bypassing the Button component must be migrated onto the rebuilt Button (Phase 4), not just have their token values swapped in place | `cc.accent` (fill), `cc.accent` outline, text-link pattern | HIGH — this is the single dependency with the widest visual blast radius (every CTA in the app) |
| `formControlTokens` | Internal (Input/Textarea/Select/Checkbox) | **REPLACE** | Border/focus language rebuilt around `cc.hairline`/`cc.accent` glow, modeled on the search-field focus treatment | Search Input focus glow | MEDIUM (inherits Input's 20-file reach) |
| `homeTokens` (`section`/`sectionLabel`/`sectionTitle`/etc.) | SEO templates (7 files: `cost-city-page-template`, `cost-page-template`, `intervention-page-template`, `seo-faq`, etc.) | **REPLACE → then DELETE** | These are literal pre-consolidation homepage tokens, now repurposed by SEO pages for section spacing/labels. Migrate SEO templates onto Homepage-derived spacing/typography (Phase 4), then delete this group entirely | Section spacing/typography observed in `explosion.tsx`/`index-directory.tsx`/`moment.tsx` | MEDIUM — concentrated in SEO, but real |
| `homeTokens.nav.*` | **1 file: `apps/admin/src/components/admin-shell.tsx`** | **DELETE** (after admin migration) | The only remaining consumer of pre-consolidation nav tokens anywhere in the codebase. `apps/web` already proves the replacement (`navbar.tsx`) works. Migrate `admin-shell.tsx` onto the canonical Navbar (or an admin-appropriate variant of it), then delete | `navbar.tsx` | LOW file count, but it's the last structural tie between Admin and the legacy nav language |
| `funnelTokens` | **2 files, both load-bearing: `request-step-ui.tsx`, `request-flow-page.tsx`** | **KEEP** (abstraction), **REPLACE** (values) | This is the entire quote-request submission funnel. Rebuild its typography/spacing/accent values around `cc.*`, with extra care and explicit QA — do not delete or rush this one | Fluid heading scale (`ccType.heading`), `cc.accent`, observed section spacing | HIGH severity-per-file despite low file count — this is the money path |
| `tokens.typography` (top-level: `hero`/`title`/`subtitle`/`body`/`caption`/`micro`) | 9 files (Area Impresa, Richiesta) | **REPLACE** | Legacy breakpoint-jump sizes conflict with Design Principle 6 (fluid typography). Rebuild each step as a `clamp()` expression modeled on `ccType.heading` and the hero `<h1>`'s clamp | `ccType.heading`, hero `<h1>` clamp | MEDIUM |
| `tokens.spacing` (`sectionXs`...`sectionXl`) | 5 files | **REPLACE** | The Homepage itself has no single section-spacing scale (see HOME_DESIGN_SYSTEM.md → Layout) — Phase 2 must make a deliberate decision here, deriving a canonical scale from the *range* of values observed (`py-16` to `py-32`), not from the legacy values | Observed per-section padding in `explosion.tsx`/`index-directory.tsx`/footer | LOW-MEDIUM |
| `tokens.shadows` (`sm`/`md`/`lg`/`card`/`surface`/`homeHeroCard`) | 6 files | **REPLACE → then DELETE legacy entries** | `tokens.shadows.card` is structurally near-identical to `tokens.cantiere.shadow.elevation` (same 2-layer pattern, same opacity steps, different tint/spread — already documented in the design-system audit). Repoint consumers at the cantiere shadow, then delete the legacy `--fp-shadow-card`/`--fp-shadow-surface`/`--fp-shadow-home-hero-card` variables | `tokens.cantiere.shadow.elevation`, `tokens.cantiere.shadow.slab` | LOW-MEDIUM |
| `tokens.layout` (top-level, message-thread usage) | 2 files (`support-thread.tsx`, `message-thread.tsx`) | **REPLACE** | Small surface, but shared between Admin and web messaging — coordinate both call sites together | N/A directly; inherits from `layoutTokens` rebuild | LOW |

### CSS Variables (`packages/ui/src/styles/globals.css`)

| Name | Consumers | Status | Replacement strategy | Migration impact |
|---|---|---|---|---|
| `--fp-color-accent-step-one/two/three` | **Verified zero consumers** (app or internal Tailwind class usage) | **DELETE NOW** | Originally for "Come funziona?" editorial dividers — no longer referenced anywhere | NONE — Phase 1 |
| `--fp-color-decorative-purple` / `--fp-color-primary-purple` | **Verified zero consumers** | **DELETE NOW** | No component or page references either | NONE — Phase 1 |
| `--fp-color-accent-warning` / `--fp-color-warning-primary` | **Verified zero consumers** (Badge's `warning` variant does not use them) | **DELETE NOW** | Confirmed orphaned — Badge's warning styling uses generic secondary/primary tokens instead | NONE — Phase 1 |
| `--fp-radius-hero-surface` / `--fp-hero-surface-background` / `.fp-hero-surface` CSS class | Zero consumers (tied to dead `legacyCssSurfaceTokens`) | **DELETE NOW** | Same dead chain as `tokens.surfaces` above | NONE — Phase 1 |
| `--fp-color-accent-warm` / `--fp-color-brand-primary` (+ hover/on-primary pairs) | `Button`, `Badge` (`success` variant), SEO `warm`/`brandOutline` bypass | **REPLACE** | This is the direct color-role conflict with `cc.accent` flagged in the design-system audit — same role (the one CTA/accent signal), two different hues. Repoint at `cc.accent`/`cc.accentHover` | HIGH — every component using "brand"/"warm" semantics changes hue |
| `--fp-color-action-primary` (+ hover/on-primary) | `Button` primary variant | **REPLACE** | Same accent unification as above | HIGH |
| `--fp-shadow-card` / `--fp-shadow-surface` / `--fp-shadow-home-hero-card` | `tokens.card`, `tokens.shadows` | **REPLACE → DELETE** | Repoint at `--fp-shadow-cantiere-elevation`/`-slab`, then remove once unreferenced | MEDIUM |
| `--fp-container-max-width` / `-padding-inline` / `-padding-inline-mobile` | `Container` (all 7 sizes alias to this) | **REPLACE** | Resolve into the real width decision (see Container above) | HIGH |
| `--fp-radius-marketing-surface` | `marketingSurfaceFrameTokens` | **DELETE** | Dies alongside `MarketingSurface`/`HeroSurface` rebuild | LOW, contingent on Phase 3 |
| `--fp-font-nav` | `tokens.home.nav.*` (admin-shell only) | **DELETE** (after admin migration) | Replaced by Geist via `ccFont` already in `navbar.tsx` | LOW, contingent on Phase 4 admin migration |
| `--fp-home-content-inset-x` / `-section-y` / `-section-y-compact` / `-section-gap` / `-search-inner-height` / `-search-button-size` | `homeTokens` internals (feeds SEO's `tokens.home.*` usage) | **DELETE** (after `homeTokens` migration in Phase 4) | Pre-consolidation tuning variables; die alongside `homeTokens` | MEDIUM, contingent on Phase 4 |
| `--fp-letter-spacing-canvas` | Applied globally — `body { letter-spacing: ... }` and `body [class] { letter-spacing: ... }` | **REPLACE** | This is the single highest-risk CSS variable in the system: a blanket `letter-spacing` override applied to **every classed element in `apps/web`**. The Homepage does not use a global tracking override — it sets `tracking-[...]` per element. Removing/changing this affects every page simultaneously, not just legacy ones. Requires its own dedicated, carefully-sequenced step — do not fold into a routine token swap. | **HIGHEST single-variable risk in this plan** |
| `--fp-color-neutral-anthracite` (and the `neutralColorTokens` Tailwind classes built on it) | `--fp-color-surface-footer`/`surface-dark` alias to it; `neutralColorTokens` classes themselves unused | **REPLACE** (the alias target), **DELETE** (the unused class pair) | Footer/dark surfaces should resolve to `cc.ink` instead | LOW-MEDIUM |

### Helpers

| Name | Location | Status | Reason |
|---|---|---|---|
| `cn()` | `packages/ui/src/lib/cn.ts` | **KEEP** | Pure class-merging utility, carries no visual language, used by `home-image.tsx` itself (the one Homepage file that already bridges into `@esigenta/ui`) |

---

## Demolition Roadmap

### Phase 1 — Highest-value removals, lowest effort, immediate cleanup
No consumer migration required — these are verified zero-consumer today.

1. Delete `legacyCssSurfaceTokens`, `tokens.surfaces` (the backward-compat namespace), and the `SurfaceToken` type from `tokens.ts`.
2. Delete `--fp-radius-hero-surface`, `--fp-hero-surface-background`, and the `.fp-hero-surface` CSS class from `globals.css`.
3. Delete `--fp-color-accent-step-one/two/three` and their `@theme inline` registrations.
4. Delete `--fp-color-decorative-purple` / `--fp-color-primary-purple` and their `@theme inline` registrations.
5. Delete `--fp-color-accent-warning` / `--fp-color-warning-primary` and their `@theme inline` registrations.
6. Inline `MarketingSurface`'s logic directly into `HeroSurface` and delete `marketing-surface.tsx` (technically belongs with the Phase 3 HeroSurface rebuild, but flagged here because its removal carries zero visual risk on its own — it can be done the moment HeroSurface's rebuild begins, not at the very end).

Verification after Phase 1: typecheck + build of `apps/web` and `apps/admin`; no visual diff expected anywhere (everything removed is provably unreferenced).

### Phase 2 — Legacy visual language replacement (token layer only, no component rebuild yet)
Goal: make the *correct* values available and start repointing internal token definitions, without yet touching component code or app pages. This phase is invisible to consumers until Phase 3 wires it through.

1. **Colors** — repoint `--fp-color-accent-warm`, `--fp-color-brand-primary`, `--fp-color-action-primary` (and their hover/on-color pairs) at `cc.accent`/`cc.accentHover` values. Repoint `semanticSurfaceTokens` at `cc.paper`/`cc.linen`/`cc.surface`/`cc.ink`. This is the single highest-leverage change in the whole plan — once done, every component built on these CSS vars inherits the Homepage palette automatically in Phase 3.
2. **Radius** — repoint `radiusTokens` at the `cc` 4/6/8px family (already available as `tokens.cantiere.radius`).
3. **Shadows** — repoint `tokens.shadows.card` at `tokens.cantiere.shadow.elevation`; repoint any heavier card/photo-adjacent shadow need at `tokens.cantiere.shadow.slab`. Delete `--fp-shadow-surface`/`--fp-shadow-home-hero-card` once unreferenced.
4. **Typography** — rebuild `tokens.typography.*` as `clamp()`-based scales modeled on `ccType.heading` and the hero `<h1>` clamp, replacing the breakpoint-jump steps.
5. **Spacing** — make the deliberate section-spacing-scale decision flagged in `HOME_DESIGN_SYSTEM.md` (the Homepage itself has 3 different per-section values; this phase must pick a canonical scale derived from that range, not invent a 4th unrelated one).
6. **CTA styles** — rebuild `interactiveTokens.variants` (`primary`/`secondary`/`brand`/`ghost`) around the 3 CTA treatments documented in `HOME_DESIGN_SYSTEM.md` (filled accent, accent-outline, text-link). Resolve `warm`/`brandOutline` into this set rather than leaving them as a parallel bypass.
7. **`--fp-letter-spacing-canvas`** — handle separately and carefully (see CSS Variables table). Recommended approach: remove the global `body`/`body [class]` override entirely and let each component declare its own tracking, matching how the Homepage already works. This single change has the largest blind-spot risk in the plan — every page must be visually checked after this step, not just the ones in the dependency map.

Verification after Phase 2: typecheck + build only (token-layer changes shouldn't yet be wired to any component's rendered output if components still reference the old token paths — confirm this isolation before proceeding; if any token rename breaks a component reference, fix forward immediately, don't leave Phase 2 half-wired).

### Phase 3 — Shared component refoundation
Rebuild each component's *rendered* styling on the Phase 2 token layer. APIs preserved; legacy styling not preserved.

1. **Button** — wire `variants`/`sizes` to the rebuilt `interactiveTokens`. Verify against all 3 documented CTA treatments.
2. **Input / Textarea / Select / Checkbox** — wire `formControlTokens` to the rebuilt border/focus language. Input and Select get the closest real precedent (the search field); Textarea/Checkbox have no Homepage precedent and must extrapolate from Input's rebuilt language, documented as such.
3. **Card** (+subparts) — wire `cardTokens` to `cc.paper`/`cc.hairline`/cantiere shadow.
4. **Badge** — wire `badgeTokens` to `cc.accent`/`cc.ink`/`cc.hairline`.
5. **Container** — resolve the width decision from Phase 1/2 planning into real, distinct named sizes.
6. **PageShell** — wire to Container's resolved widths + the Phase 2 spacing scale.
7. **HeroSurface** — rebuild as either a full-bleed treatment or a plain `cc.paper`/`cc.linen` panel, per its 2 real consumers' actual narrative need (re-evaluate `signup-page.tsx`/`area-impresa-marketing-page.tsx` content against Design Principle 5 before choosing). `MarketingSurface` is deleted as part of this step (Phase 1 flagged it, executed here).
8. **Forms as a group** — once Input/Textarea/Select/Checkbox are individually rebuilt, do one pass checking they read as one consistent form language (border weight, focus glow, spacing) rather than 4 independently-rebuilt pieces that happen to share token names.
9. **Surfaces/Layouts** — `structuralSurfaceTokens`/`layoutTokens` sub-recipes rebuilt/inlined alongside the components that consume them (mostly resolved as a side effect of steps 1-7, not a separate body of work).

Verification after Phase 3: visual review of every component in isolation (no app page touched yet) + typecheck/build. This is the point where the legacy visual language stops existing in the component layer, even though legacy pages haven't been migrated to the new components yet (they still render fine — the rebuild is additive/non-breaking at the API level).

### Phase 4 — Area migrations
No new legacy visual dependency should remain after this phase. Order reflects the ranking already established in `LEGACY_UI_DEPENDENCY_MAP.md`.

1. **Legal** (4 files) — smallest, all-or-nothing (100% Card-dependent). Migrate first as a low-risk proof that Phase 3's rebuilt Card reads correctly in a real page.
2. **SEO** (9 templates + 4 not-found routes) — the only area with a direct token bypass (`tokens.interactive.variants.{warm,brandOutline}` in 5 files). These 5 files must be migrated onto the rebuilt `Button` component directly — token-value swapping alone does not fix this, since they don't go through Button at all today. Also migrate `tokens.home.*` usage (`sectionLabel` etc., 7 files) onto Phase 2's rebuilt typography/spacing.
3. **Richiesta** (12 files) — includes `tokens.funnel` (2 files, the request-submission funnel). Treat this sub-step with its own explicit QA pass given its severity — this is the money path.
4. **Area Impresa** (~35 files) — largest file count, broadest component surface (all components from Phase 3 in use here). Expect this to be the longest single migration.
5. **Admin** (~19 files, separate app) — migrate `admin-shell.tsx` off `tokens.home.nav.*` onto the canonical `Navbar` (or an admin-appropriate composition of it). This removes the last cross-app dependency on dead-in-web tokens. Can run in parallel with 1-4 since Admin is a separate Next.js app.

### Phase 5 — Final legacy removal
Only after Phase 4 confirms zero remaining consumers per item:

1. Delete `homeTokens` (`section`/`sectionLabel`/etc. and `nav.*`) entirely from `tokens.ts`.
2. Delete `--fp-home-content-inset-x`/`-section-y`/`-section-y-compact`/`-section-gap`/`-search-inner-height`/`-search-button-size` and `--fp-font-nav` from `globals.css`.
3. Delete `neutralColorTokens` and its unused Tailwind class pair; repoint any remaining `--fp-color-neutral-anthracite` alias target at `cc.ink`.
4. Delete `marketingSurfaceFrameTokens` and `structuralSurfaceTokens` if nothing remains pointing at them after the Phase 3 HeroSurface rebuild.
5. Delete any now-unreferenced legacy CSS variables left over from Phase 2's repointing (`--fp-shadow-surface`, `--fp-shadow-home-hero-card`, `--fp-radius-marketing-surface`, and any legacy color variable fully superseded by `cc.*`).
6. Run a final, full-repo grep for every legacy token/variable name listed in this document to confirm zero remaining references before considering the demolition complete.

Verification after Phase 5: full typecheck + build of `apps/web` and `apps/admin`; full-repo grep sweep (not sampling) for every deleted identifier; visual smoke pass across one page per area (Home, one Legal page, one SEO template, one Richiesta page, one Area Impresa page, one Admin page).

---

## Target Architecture

One visual language, defined entirely by the Homepage, Navbar, Footer, and `HOME_DESIGN_SYSTEM.md`. There is no second palette, no second shadow system, no second radius family, no second typography scale, and no second CTA language anywhere in the codebase.

Shared infrastructure components (`Button`, `Input`, `Textarea`, `Checkbox`, `Select`, `Card`, `Badge`, `Container`, `PageShell`, `HeroSurface`) survive **only as APIs** — every line of their visual implementation is rebuilt on `cc.*`/`tokens.cantiere.*` values. A consumer of `Button` in `apps/admin` and a hand-written CTA on the Homepage should be visually indistinguishable in their shared properties (accent color, radius family, focus treatment) by the end of this plan — the only acceptable difference is that the Homepage may still hand-roll certain one-off treatments (e.g. the search field's specific glow) that haven't yet proven reusable enough to generalize into a component.

`tokens.cantiere.*` stops being a side-channel addition and becomes the only color/shadow/radius source `tokens.ts` resolves to internally — `cc.*` is the literal source of truth, `tokens.cantiere.*` is its Tailwind-consumable mirror, and the rest of `tokens.ts` (`semanticSurfaceTokens`, `cardTokens`, `badgeTokens`, `interactiveTokens`, etc.) becomes a thin semantic-naming layer over those same values rather than an independent color system.

No compatibility layer remains: no `legacyCssSurfaceTokens`, no `tokens.surfaces` backward-compat namespace, no `--fp-font-nav`, no dual accent hue, no token family whose only purpose is bridging old pages to old values. Every remaining token and component answers to one design language — the one the Homepage already proved out.
