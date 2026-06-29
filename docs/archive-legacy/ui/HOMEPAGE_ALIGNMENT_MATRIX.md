# HOMEPAGE_ALIGNMENT_MATRIX

Survival criterion: **Homepage alignment, not consumer count.** Every item below is judged purely on whether its current visual implementation matches the approved design language documented in `HOME_DESIGN_SYSTEM.md` — `cc.*` colors, the 4/6/8px radius family, the two-tier shadow system (`elevation`/`slab`), fluid `clamp()` typography, Geist Sans, and the documented CTA/form/surface patterns. Consumer count is reported for migration-planning purposes only; it does not change the verdict.

Reference system (excluded, not judged): Homepage, Navbar, Footer, `palette.ts`, `tokens.cantiere.*`, `HOME_DESIGN_SYSTEM.md`.

## Colors

| Name | Location | Homepage Equivalent | Status | Consumer Count | Migration Effort |
|---|---|---|---|---|---|
| `--fp-color-neutral-white/black/anthracite` | globals.css | `cc.paper` / `cc.ink` | NOT ALIGNED | High (foundational) | HIGH |
| `semanticSurfaceTokens` (`base/primary/muted/subtle/secondary/tertiary/footer/elevated/marketingSoft/soft/dark`) | tokens.ts | `cc.paper` / `cc.linen` / `cc.surface` | NOT ALIGNED | High (Card, Badge, layouts) | HIGH |
| `--fp-color-text-primary/secondary/muted/inverse/on-hero-*` | globals.css | `cc.ink` / `cc.inkSecondary` | NOT ALIGNED | High | HIGH |
| `--fp-color-border-primary/secondary/soft/focus` | globals.css | `cc.hairline` | NOT ALIGNED | High (every border in the legacy system) | MEDIUM |
| `--fp-color-brand-primary` (+hover/on) | globals.css | `cc.accent` | NOT ALIGNED | Button `brand` variant, `funnelTokens.accent` | MEDIUM |
| `--fp-color-action-primary` (+hover/on) | globals.css | `cc.accent` | NOT ALIGNED | Button `primary` variant (the default) | HIGH (default variant, widest reach) |
| `--fp-color-accent-warm` (+hover/on) | globals.css | `cc.accent` | NOT ALIGNED | Button `warm`, Badge `success`, navbar-token logo mark, SEO direct-token bypass | HIGH |

There is no single color value anywhere in `packages/ui` that traces back to `cc.*`. The two systems share zero source values — even where hues are visually adjacent (`accent-warm` `#de7356` vs `cc.accent` `#CC785C`), they are independently defined, not derived from one another.

## Typography

| Name | Location | Homepage Equivalent | Status | Consumer Count | Migration Effort |
|---|---|---|---|---|---|
| `tokens.typography.{hero,title,subtitle,body,caption,micro,microLabel}` | tokens.ts | `ccType.heading` / hero `<h1>` `clamp()` | NOT ALIGNED | Low direct, but foundational | MEDIUM |
| `homeTokens.{sectionTitle,sectionTitleCompact,sectionDescription,sectionLabel}` | tokens.ts | `ccType.heading` | NOT ALIGNED | SEO templates (7 files) | MEDIUM |
| `funnelTokens.{introTitle,introDescription,stepTitle,stepDescription}` | tokens.ts | `ccType.heading` | NOT ALIGNED | Richiesta funnel (2 files, money path) | MEDIUM (high care, not high volume) |
| `--fp-font-nav` (Inter / Plus Jakarta Sans) | globals.css | `ccFont` (Geist Sans) | NOT ALIGNED | `admin-shell.tsx` only (web's navbar already migrated) | LOW (file count) |
| `--font-sans: var(--font-plus-jakarta-sans)` (`@theme inline`) | globals.css | Geist Sans | NOT ALIGNED | Global body font | HIGH (touches every page) |
| `body { font-family: ... }` | globals.css | Geist Sans | NOT ALIGNED | Every page in `apps/web`/`apps/admin` | HIGH |
| `--fp-letter-spacing-canvas` + `body`/`body [class]` global override | globals.css | Per-element `tracking-[...]`, no global override | NOT ALIGNED | Every classed element, both apps | **HIGHEST** — single largest blast radius in the system |

Every typographic value in `packages/ui` is breakpoint-stepped. The Homepage's defining typographic trait — continuous `clamp()` scaling, explicitly chosen to replace breakpoint jumps — has no counterpart anywhere in the legacy system.

## Radius

| Name | Location | Homepage Equivalent | Status | Consumer Count | Migration Effort |
|---|---|---|---|---|---|
| `radiusTokens.{none,sm,md,lg,xl,2xl,3xl,full}` | tokens.ts | `tokens.cantiere.radius.{sm,md,lg}` (4/6/8px) | NOT ALIGNED | Card, Button (internal `radius` field), Badge sizing | MEDIUM |
| `--fp-radius-marketing-surface` (0.75rem / 12px) | globals.css | Not in the 4/6/8px family at all | NOT ALIGNED | `marketingSurfaceFrameTokens`, HeroSurface | LOW (2 consumers) |

The legacy radius scale is the unmodified Tailwind default vocabulary (`rounded-md`/`lg`/`xl`). It does not contain 4px, 6px, or 8px as discrete values anywhere.

## Shadows

| Name | Location | Homepage Equivalent | Status | Consumer Count | Migration Effort |
|---|---|---|---|---|---|
| `--fp-shadow-surface` | globals.css | `tokens.cantiere.shadow.elevation` | NOT ALIGNED | `tokens.shadows.surface` | LOW |
| `--fp-shadow-card` | globals.css | `tokens.cantiere.shadow.elevation` | NOT ALIGNED | `cardTokens.base` (47-file reach via Card) | MEDIUM — closest legacy/Homepage pair in the whole system (same 2-layer structure, same opacity steps), but still a different rgb tint and spread, so still not aligned as-is |
| `--fp-shadow-home-hero-card` | globals.css | `tokens.cantiere.shadow.slab` | NOT ALIGNED | `tokens.shadows.homeHeroCard` | LOW |
| `tokens.shadows.sm` (`shadow-sm`, Tailwind default) | tokens.ts | `tokens.cantiere.shadow.elevation` | NOT ALIGNED | 1 file (`admin/(protected)/page.tsx`) | LOW |

## Containers, Surfaces, Layout

| Name | Location | Homepage Equivalent | Status | Consumer Count | Migration Effort |
|---|---|---|---|---|---|
| `containerWidthTokens` (7 sizes, all alias `--fp-container-max-width: 1024px`) | tokens.ts | Homepage's own 1280px (hero) / 1120px (content) / full-bleed pattern | NOT ALIGNED | Container (18 files) | HIGH |
| `--fp-container-padding-inline` / `-mobile` (24px / 16px) | globals.css | Homepage's `px-5`/`sm:px-10`/`lg:px-16` responsive scale | NOT ALIGNED | Container gutters | MEDIUM |
| `marketingSurfaceFrameTokens` (rounded-inset frame, `shadow-none`) | tokens.ts | No equivalent — conflicts with Design Principle 5 ("full-bleed is an earned exception, not a default") | NOT ALIGNED | HeroSurface (2 files) | LOW (file count), conceptually significant |
| `structuralSurfaceTokens.{hero,editorial,footer}` | tokens.ts | `cc.paper`/`cc.linen` panels | NOT ALIGNED | HeroSurface (via inlined logic) | LOW |
| `layoutTokens.{container,pageShell,heroSurface,marketingSurface,messaging}` | tokens.ts | Homepage's actual per-section spacing/width pattern | NOT ALIGNED | Container, PageShell, HeroSurface, messaging UI | HIGH (geometry backbone of 3 components) |
| `sizingTokens.controlHeight.{sm,md,lg,xl}` (h-10/12/14/16) | tokens.ts | Homepage's actual control heights: h-11 (search button, nav toggle), h-12 (CTA), h-16 (search field) | NOT ALIGNED — the scale doesn't even contain h-11, the Homepage's own most-used interactive height | Button, Badge, Input sizing | MEDIUM |
| `densityTokens.*` (px-4/5/6/8, p-6, space-y-1.5) | tokens.ts | Homepage's observed padding/gap values (px-5/10/12/16, gap-1.5/2/5/6) | NOT ALIGNED (coincidental overlap on isolated values is not derivation) | Button, Card, Badge, form controls | MEDIUM |
| `--fp-home-content-inset-x`, `-section-y`, `-section-y-compact`, `-section-gap`, `-search-inner-height`, `-search-button-size` | globals.css | None — these tune the **old, pre-consolidation** homepage, already superseded by `palette.ts` | NOT ALIGNED | `homeTokens` internals (feeds SEO's `tokens.home.*` usage, 7 files) | MEDIUM |

## Forms

| Name | Location | Homepage Equivalent | Status | Consumer Count | Migration Effort |
|---|---|---|---|---|---|
| `formControlTokens.{base,states,inputSizes,textarea,select,checkbox}` | tokens.ts | Search-field border + accent-glow `boxShadow` focus pattern (the only real Homepage form precedent) | NOT ALIGNED | Input (20), Textarea (8), Select (5), Checkbox (2) | MEDIUM |

## Navigation tokens

| Name | Location | Homepage Equivalent | Status | Consumer Count | Migration Effort |
|---|---|---|---|---|---|
| `homeTokens.nav.*` (root, logo, desktopMenu, link, mobileToggle, mobilePanel, heroLogo, heroMenu, etc. — ~24 sub-keys) | tokens.ts | `navbar.tsx` (the canonical, already-built replacement) | NOT ALIGNED — and uniquely, **already proven replaceable**, since web's own navbar fully replaced this exact token group | 1 file (`admin-shell.tsx`) | LOW (smallest file count of any NOT ALIGNED item, with a working reference implementation already in hand) |

This is the single clearest case in the matrix: the replacement isn't hypothetical, it's already running in production on every `apps/web` page.

## CTA / Interactive

| Name | Location | Homepage Equivalent | Status | Consumer Count | Migration Effort |
|---|---|---|---|---|---|
| `interactiveTokens.variants.{primary,secondary,brand,warm,brandOutline,ghost}` | tokens.ts | The 3 documented CTA treatments: filled accent, accent-outline, text-link | NOT ALIGNED | Button (36 files, all variants) | HIGH |
| `interactiveTokens.radius` (= `radiusTokens.md`, Tailwind `rounded-md`) | tokens.ts | `tokens.cantiere.radius.md` (6px) | NOT ALIGNED (coincidentally close in some Tailwind configs, not derived from `cc`) | Button | LOW |
| `interactiveTokens.sizes` | tokens.ts | Homepage's h-11/h-12 control heights | NOT ALIGNED (inherits `sizingTokens`/`densityTokens` misalignment) | Button | MEDIUM |

## Surfaces (Card / Badge)

| Name | Location | Homepage Equivalent | Status | Consumer Count | Migration Effort |
|---|---|---|---|---|---|
| `cardTokens.{base,header,content,title,description}` | tokens.ts | `cc.paper` / `cc.hairline` / `tokens.cantiere.shadow.elevation` | NOT ALIGNED | Card (47 files — broadest reach of any single item in this matrix) | HIGH |
| `badgeTokens.{base,variants,sizes}` | tokens.ts | `cc.accent` / `cc.ink` / `cc.hairline` — no Homepage badge pattern exists at all, so even the *concept* has no precedent | NOT ALIGNED | Badge (34 files) | MEDIUM-HIGH |

## Funnel

| Name | Location | Homepage Equivalent | Status | Consumer Count | Migration Effort |
|---|---|---|---|---|---|
| `funnelTokens.*` (page, rail, intro, step, actions, accent) | tokens.ts | Homepage's fluid heading scale + `cc.accent` | NOT ALIGNED | 2 files — but the entire request-submission funnel | MEDIUM file-count, HIGH care required (money path) |

## Components (current rendered visual output)

These were already classified KEEP AS INFRASTRUCTURE in `LEGACY_UI_DEMOLITION_PLAN.md` — that verdict is about API survival, a different question. Judged purely on today's rendered visual output against the Homepage:

| Name | Location | Homepage Equivalent | Status | Consumer Count | Migration Effort |
|---|---|---|---|---|---|
| Button | `packages/ui/src/components/button.tsx` | Primary/Secondary/Text CTA patterns | NOT ALIGNED | 36 | HIGH |
| Input / Textarea / Select / Checkbox | `packages/ui/src/components/{input,textarea,select,checkbox}.tsx` | Search Input pattern | NOT ALIGNED | 20 / 8 / 5 / 2 | MEDIUM |
| Card (+subparts) | `packages/ui/src/components/card.tsx` | No direct equivalent exists; rebuild on `cc.paper`/`cc.hairline`/elevation | NOT ALIGNED | 47 | HIGH |
| Badge | `packages/ui/src/components/badge.tsx` | No direct equivalent exists | NOT ALIGNED | 34 | MEDIUM-HIGH |
| Container | `packages/ui/src/layout/container.tsx` | Homepage's 1280/1120/full-bleed widths | NOT ALIGNED | 18 | HIGH |
| PageShell | `packages/ui/src/layout/page-shell.tsx` | Homepage's per-section spacing | NOT ALIGNED | 31 | HIGH |
| HeroSurface | `packages/ui/src/layout/hero-surface.tsx` | Full-bleed (earned) or plain `cc.paper`/`cc.linen` panel | NOT ALIGNED | 2 | LOW (file count), conceptually significant |

## Helpers

| Name | Location | Homepage Equivalent | Status | Consumer Count | Migration Effort |
|---|---|---|---|---|---|
| `cn()` | `packages/ui/src/lib/cn.ts` | N/A — used by `home-image.tsx` itself | **ALIGNED** | Universal | NONE — carries no visual opinion, nothing to replace |

---

## Summary

Of every visual primitive, token family, CSS variable, and component inspected, exactly **one** item is ALIGNED with the Homepage design language: `cn()`, a pure class-merging utility with no visual content of its own. Every color, shadow, radius, typography, spacing, container, form, navigation, and CTA primitive in `packages/ui` is NOT ALIGNED — including the cases with the closest surface-level resemblance (`--fp-shadow-card` vs `tokens.cantiere.shadow.elevation`, `interactiveTokens.radius` vs `cantiere.radius.md`), because none of them share a source value with `cc.*` — proximity is not derivation.

The lowest-effort, highest-confidence replacement is `homeTokens.nav.*`: it has the smallest consumer count (1 file) of any NOT ALIGNED item, and its replacement isn't theoretical — `navbar.tsx` already is that replacement, proven in production on every page of `apps/web`. The highest-effort items are the ones with both broad reach and foundational status: `containerWidthTokens`, `cardTokens`, `interactiveTokens.variants`, and the global typography/letter-spacing system — these don't just need new values, they need a width/scale/CTA decision made once and then propagated everywhere.

This matrix does not authorize migration or deletion on its own — it is the alignment verdict that `LEGACY_UI_DEMOLITION_PLAN.md` and `TOTAL_UI_DEMOLITION_EXECUTION_PLAN.md` execute against, phase by phase.
