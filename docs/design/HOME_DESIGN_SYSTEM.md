# HOME_DESIGN_SYSTEM

Design-system specification for the approved Homepage ("Cantiere Calmo"). This is a documentation snapshot of what exists today in code — it contains no proposed values, no future design, no migration guidance.

Source of truth analyzed:
- `apps/web/src/site/home/**` (`home-page.tsx`, `explosion.tsx`, `index-directory.tsx`, `moment.tsx`, `grain.tsx`, `reveal.tsx`, `home-image.tsx`, `systems.ts`)
- `apps/web/src/site/shell/navbar.tsx`
- `apps/web/src/site/shell/footer.tsx`
- `apps/web/src/site/shell/palette.ts`
- `apps/web/src/site/shell/icons.tsx`

Every value below is traceable to one of these files. Where no implementation exists for a documented category, that is stated explicitly rather than invented.

---

# Foundations

## Colors

Defined in `apps/web/src/site/shell/palette.ts` as the `cc` object (codename "Cantiere Calmo"):

| Token | Value | Role (per source comments / observed usage) |
|---|---|---|
| `cc.ink` | `#171511` | Primary text, primary icon/border tone on light surfaces |
| `cc.inkSecondary` | `#5B5648` | Secondary text — captions, body copy, eyebrow labels |
| `cc.paper` | `#FAF8F4` | Base background; also used as text-on-dark color in the photographic section |
| `cc.paperTranslucent` | `rgba(250,248,244,0.72)` | Navbar background once scrolled/menu open |
| `cc.surface` | `#F1EEE7` | Defined but not directly observed in use within the audited files |
| `cc.linen` | `#ECE4D4` | "Warm linen — deeper and warmer than `surface`. Now the hero ground." Used as the hero section's background and gradient endpoint |
| `cc.hairline` | `#E4E0D6` | All 1px border/divider treatments (navbar border, footer border, dropdown border, list dividers) |
| `cc.accent` | `#CC785C` | "The accent: Claude's terracotta/clay... used sparingly — CTA fill, search affordance, focus states, links." |
| `cc.accentHover` | `#B05E3F` | Defined; hover state for accent |
| `cc.accentTint` | `#F5E8DF` | Defined; lightest accent step |

Two additional literal values appear outside the `cc` object and are **not currently named tokens**:
- `#FFFFFF` — used as the `index-directory.tsx` section background and as the white border around photo "slabs" in `explosion.tsx`. This is a real, repeated value but exists only as a literal, not as `cc.*`.
- `rgba(23,21,17,0.78)` → transparent — the dark gradient overlay in `moment.tsx`, derived from `cc.ink`'s RGB but written as a separate literal, not a token.

## Typography

Font family: `var(--font-geist-sans)` (`ccFont` in `palette.ts`), applied via inline `style` on every section root.

**Display/heading scale** — two fluid steps, defined once as theme tokens in `packages/ui/src/styles/globals.css` and consumed as Tailwind utilities (the `--fp-text-cantiere-*` variables are the single design knob):
- `text-cantiere-display`: `clamp(2.25rem, 1.5rem + 3.2vw, 4rem)`, with `line-height 1.02`, `letter-spacing -0.02em`, `font-weight 500` bundled into the token. Used by the hero `<h1>` (`explosion.tsx`) and the funnel step question `<h2>` (`request-step-ui.tsx`).
- `text-cantiere-heading`: `clamp(1.625rem, 1.1rem + 2.2vw, 2.375rem)`, with `letter-spacing -0.01em` bundled in; weight and leading stay at the call site (section headings are `font-medium`, the funnel step description is regular). Used by `index-directory.tsx`, `moment.tsx`, the area-impresa marketing headings, and the richiesta page `<h1>`s.

**Micro/body scale** — implicit, consistent pixel steps observed across `explosion.tsx`, `index-directory.tsx`, `moment.tsx`, `navbar.tsx`, `footer.tsx`:
| Size | Observed usage |
|---|---|
| 20px | Search input text |
| 17px | Hero subhead, `moment.tsx` subhead — `leading-[1.5]` |
| 16px | Index-directory description, guide title |
| 15px | CTA link text, dropdown result text, navbar desktop links |
| 14px | Navbar accent button, footer-style text links, "Esplora tutti gli interventi" |
| 13px | Caption under photo slabs, footer copyright/legal links |
| 12px | Uppercase eyebrows ("Cosa devi sistemare?", "Per i professionisti") — `tracking-[0.1em]` |
| 11px | Uppercase eyebrow ("Guide ai costi") — `tracking-[0.16em]` |

No font-weight scale beyond `font-medium` (headings, CTAs) and default/regular (body) is observed.

## Spacing

No shared spacing scale exists — every section defines its own vertical rhythm directly:
- `explosion.tsx` section: `px-5 pb-20 pt-16 sm:px-10 sm:pt-20 md:px-12 md:pb-28 md:pt-24 lg:px-16`
- `index-directory.tsx` section: `py-20 md:py-28 lg:py-32`, inner `px-5 sm:px-10 md:px-12 lg:px-16`
- `moment.tsx`: full-bleed, no section padding — content positioned via `absolute inset-x-0 bottom-0 px-5 pb-12 sm:px-10 sm:pb-16 md:px-16 md:pb-20`
- `footer.tsx`: `px-5 py-16 sm:px-10 lg:px-16`
- `navbar.tsx`: fixed `h-[72px]`, `px-5 sm:px-10 lg:px-16`

Internal gaps observed: `gap-6` (footer, hero photo row), `gap-5` (mobile photo stack), `gap-2`/`gap-1.5` (icon+text pairs), `mt-3`/`mt-4`/`mt-5`/`mt-6`/`mt-7` for stacked text blocks.

## Radius

Three pixel values, used as arbitrary Tailwind values (`rounded-[Npx]`), not a named scale:
| Value | Usage |
|---|---|
| `4px` | Photo "slab" images, both desktop and mobile (`explosion.tsx`) |
| `6px` | Navbar accent-link border (desktop) |
| `8px` | Search button, search results dropdown panel, mobile nav accent button, primary CTA button (`moment.tsx`) |

## Shadows

Two named values in `palette.ts`, each with a documented, narrow role:
- `ccElevation` — `0 1px 2px rgba(23,21,17,.04), 0 12px 32px rgba(23,21,17,.07)`. Per source comment: "Soft, low-opacity elevation — the one place this system allows shadow." Used on: the navbar once scrolled, the navbar's mobile menu panel.
- `ccSlabShadow` — `0 18px 40px -16px rgba(23,21,17,.28), 0 6px 14px -8px rgba(23,21,17,.18)`. Per source comment: heavier, "tuned for the light linen ground." Used on: hero photo slabs (desktop + mobile), the search-results dropdown panel.

No other shadow values appear anywhere in the audited files.

## Containers

No single container width — three different treatments coexist, each used consistently within its own section:
- `max-w-[1280px]` — `explosion.tsx` (hero)
- `max-w-[1120px]` — `index-directory.tsx`, `footer.tsx`
- Full-bleed, no max-width — `navbar.tsx` (padding only), `moment.tsx` (edge-to-edge photographic section)

## Motion

- `Reveal` (`reveal.tsx`): `IntersectionObserver` with `threshold: 0.2`, fires once. Animates `opacity` 0→100 and `translateY` (`translate-y-3` → `translate-y-0`), `duration-700 ease-out`, staggered via a `delayMs` prop (explosion uses `index * 90` for desktop slabs, `index * 70` for mobile). Respects `prefers-reduced-motion` via `motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100`.
- Navbar background/border/shadow: `transition-colors duration-300` / `transition-shadow duration-300`, driven by scroll position (`scrolled` state, threshold `window.scrollY > 8`).
- Photo slab hover: `transition-transform duration-300`, `group-hover:rotate-0` (slabs are rotated at rest, straighten on hover).
- Arrow-icon micro-interaction: `transition-transform group-hover:translate-x-1`, used on every "explore more" text link and the CTA button icon.
- Search bar focus: `transition-shadow duration-300` between resting glow and focused glow (see Forms).

## Interaction

- Hover states: opacity reduction (`hover:opacity-70` on inkSecondary text links), background tint (`hover:bg-black/5` on dropdown result rows, `hover:bg-[#CC785C]/10` on the navbar accent link).
- No explicit `focus-visible` ring styling is present anywhere in `navbar.tsx`, `footer.tsx`, or the home sections — focus relies on browser default outlines. This is stated as an observation of current implementation, not a recommendation.
- Scroll-driven state: the navbar's solid/translucent toggle and the mobile menu's open/closed state are the only stateful interaction patterns in the shell.

---

# Navigation

## Navbar
`apps/web/src/site/shell/navbar.tsx`

- Fixed, full-width header, `z-50`, `backdrop-blur-md`, height `72px`.
- Two visual states, both scroll-driven (`scrolled = window.scrollY > 8`):
  - Resting: transparent background, transparent border.
  - Scrolled (or mobile menu open): `cc.paperTranslucent` background, `cc.hairline` border, `ccElevation` shadow.
- Logo: text wordmark "esigenta", `17px`, `font-semibold`, `tracking-[-0.01em]`, color `cc.ink`.
- Desktop nav (`lg:flex`, hidden below `lg`): 3 links — "Le mie richieste", "Accedi", and an accent link "Sei un professionista?" styled as a bordered button (`cc.accent` border + text, `rounded-[6px]`, `px-3 py-1.5`, `14px font-medium`, `hover:bg-[#CC785C]/10`).
- Mobile: hamburger/close icon toggle (`MenuIcon`/`CloseIcon` from `icons.tsx`), opens a dropdown panel below the bar (`cc.paper` background, `ccElevation` shadow, `cc.hairline` border) listing the same 3 links, with the accent link rendered as a filled-outline button.
- `variant` prop: `"default" | "funnel"` — `"funnel"` removes the first link ("Le mie richieste") from both desktop and mobile menus. This is the only variant currently implemented.

## Footer
`apps/web/src/site/shell/footer.tsx`

- `cc.paper` background, `cc.ink` text, single top `cc.hairline` border.
- Content centered at `max-w-[1120px]`, `py-16`.
- Single-row layout (column on mobile, row on `sm:` and up): copyright text (`13px`, `cc.inkSecondary`) on one side; a `<nav>` of legal links (Privacy, Informativa sui cookie, Termini di servizio) plus a `CookiePreferencesButton`, all `13px`, `cc.inkSecondary`, on the other.
- No logo, no multi-column layout, no newsletter/social block — the footer is intentionally minimal.

---

# Buttons

No shared Button component exists in this system — every instance below is a hand-built `<Link>`/`<button>`.

## Primary CTA
`moment.tsx` — link to `/area-impresa`.
- `h-12`, `rounded-[8px]`, `px-6`, `15px font-medium`.
- Filled: `backgroundColor: cc.accent`, `color: cc.paper`.
- Icon: `ArrowRightIcon`, `gap-2` from label.

## Secondary CTA (accent-outline)
`navbar.tsx` — desktop "Sei un professionista?" link.
- `rounded-[6px]`, `px-3 py-1.5`, `14px font-medium`.
- Outline: `border: cc.accent`, `color: cc.accent`, transparent fill, `hover:bg-[#CC785C]/10`.
- The mobile-menu version of the same link uses `rounded-[8px]`, `px-4 py-2.5`, `15px` instead — same outline treatment at a slightly larger size.

## Text CTA
`explosion.tsx` ("Esplora tutti gli interventi"), `index-directory.tsx` ("Vedi tutte le guide" and each guide row's arrow).
- No border, no fill — `inline-flex` text + `ArrowRightIcon`, `gap-1.5`/`gap-2`.
- Color: `cc.inkSecondary` (explosion) or `cc.accent` (index-directory).
- Interaction: icon `transition-transform group-hover:translate-x-1`; no color change on hover for the "Esplora" link, the index-directory guide rows have no separate hover color change either (only the icon moves).

## Icon button (search)
`explosion.tsx` search-submit button — not listed in the requested categories above but present in the system: `h-11 w-11`, `rounded-[8px]`, filled `cc.accent` background, `cc.paper` icon color, contains only `ArrowRightIcon`.

---

# Forms

## Search Input
`explosion.tsx` — the only input pattern in the system.
- Row container: `h-16`, bottom border (`cc.hairline`) + 2px top border (`cc.accent`), `pl-1 pr-1.5`.
- Text: `20px`, transparent background, no visible focus ring on the `<input>` itself.
- Focus state is expressed entirely on the row container via `boxShadow`, not on the input border: resting `0 0 18px -8px {cc.accent}66`; focused `0 0 0 1px {cc.accent}, 0 0 28px -4px {cc.accent}AA`. Transition: `duration-300`.
- Trailing icon-button (see Buttons → Icon button) submits the query.
- Results dropdown: absolute-positioned list, `cc.paper` background, `cc.hairline` border, `ccSlabShadow`, `rounded-[8px]`; each row is a full-width button, `15px`, `hover:bg-black/5`.

## Text Input
No standalone text input exists in the audited Homepage/Shell files outside the search field above. There is no traceable implementation to document.

## Textarea
Not present anywhere in `site/home/**` or `site/shell/**`. No traceable implementation exists.

## Select
Not present anywhere in `site/home/**` or `site/shell/**`. No traceable implementation exists.

## Checkbox
Not present anywhere in `site/home/**` or `site/shell/**`. No traceable implementation exists.

---

# Layout

## Section spacing
Each of the three home sections (`explosion`, `index-directory`, `moment`) defines its own vertical padding independently — see Foundations → Spacing. There is no shared "section" wrapper or spacing token; each file hand-writes its own responsive padding string.

## Content width
Three distinct values coexist within the Homepage itself: `1280px` (hero), `1120px` (index-directory, footer), and full-bleed/no-constraint (navbar, moment). These are not reconciled with each other in the current implementation — this is documented as observed fact, not flagged as an error to fix.

## Max-width rules
All three width values above are expressed as Tailwind arbitrary values (`max-w-[Npx]`) directly in the consuming file, not pulled from a shared constant or component.

## Responsive behavior
- Breakpoints used throughout: `sm`, `md`, `lg` (Tailwind defaults). No custom breakpoints observed.
- `explosion.tsx` renders **two structurally different markups** for the photo row — a horizontal staggered desktop layout (`hidden md:flex`) and a vertical alternating-alignment mobile layout (`md:hidden`) — rather than one layout reflowing responsively.
- `navbar.tsx` switches from a horizontal link row to a hamburger-triggered dropdown at the `lg` breakpoint.
- `moment.tsx` full-bleed photo section height changes by breakpoint: `h-[62vh] min-h-[420px]` → `md:h-[78vh]`.

---

# Visual Language

## Photography
- `ccPhotoGrade` (`palette.ts`): `[filter:saturate(0.94)_contrast(1.04)_brightness(1.01)]`, applied identically to every real photo on the homepage (`explosion.tsx` system photos, `moment.tsx` professional photo) "so the catalog reads as one continuous shoot rather than five unrelated assets" (source comment).
- Hero photo "slabs" (`explosion.tsx`): bordered (`6px` desktop / `5px` mobile, literal `#FFFFFF`), rotated at rest (`-rotate-4` to `rotate-3` range), straighten on hover, `rounded-[4px]`, `ccSlabShadow`.
- `moment.tsx` photo: single full-bleed, no border, no rounding, `object-cover`, with a bottom-to-top dark gradient overlay (`rgba(23,21,17,.78)` → transparent) for text legibility — explicitly described in-source as "no card, no container, no rounded corners... the single audience handoff on the page."
- Fallback handling (`home-image.tsx`): on image load error, renders a labeled placeholder (`bg-surface-tertiary`, `text-text-muted` — note these two values come from the legacy `@esigenta/ui` token system, not `cc.*`, since `home-image.tsx` is the one Homepage file that bridges into the shared package).

## Iconography
`icons.tsx` — three hand-drawn SVGs (`ArrowRightIcon`, `MenuIcon`, `CloseIcon`), `viewBox="0 0 24 24"`, `1.5px` stroke, round caps/joins, `currentColor` (so they inherit `cc.*` text colors wherever placed). No icon library is used for these three; `lucide-react`'s `ImageIcon` is used only inside `home-image.tsx`'s error fallback state.

## Contrast rules
- Light sections (`explosion`, `index-directory`, navbar, footer): `cc.ink`/`cc.inkSecondary` text on `cc.paper`/`cc.linen`/`#FFFFFF` backgrounds.
- Dark section (`moment`): `cc.paper` and `rgba(250,248,244,*)` text over a photographic background darkened by the ink-colored gradient overlay — the only place in the system where light text sits on a dark/photographic ground.
- Accent color is reserved — per its own source comment — for CTA fill, the search affordance, focus states, and links; it is never used as a body-text or background color at scale.

## Surface treatment
- `cc.paper` — default base surface (navbar resting/scrolled, footer, dropdown panels).
- `cc.linen` — the hero's "ground," described in-source as deeper/warmer than `cc.surface`.
- `#FFFFFF` (literal, not a named token) — the index-directory section background; the only stated rationale in-source is that it provides "a clean break between the two dark photographic sections that bracket it."
- `cc.hairline` — the sole border/divider treatment across every component; no other border color is used in the home/shell system.
- A faint film-grain noise overlay (`grain.tsx`) sits over the entire page (`opacity-[0.035]`, `mix-blend-multiply`, SVG `feTurbulence` filter), described in-source as making "the 'paper' in the Cantiere Calmo palette read as material, not as a flat CSS color."

---

# Design Principles

These are derived directly from intent comments left in the source files, not inferred or invented:

1. **Warm, material neutrals over flat/cold color.** The palette is named "Cantiere Calmo" (calm construction site) and is built entirely from warm paper/ink/linen tones plus one warm terracotta accent — never a cold blue, gray, or stark black/white pairing. The grain overlay exists specifically so the base color reads as a physical material rather than a flat digital fill.

2. **The accent is scarce by design.** `cc.accent` is documented in-source as reserved for CTA fill, the search affordance, focus states, and links — "used sparingly." It should not become a general-purpose decorative color, background fill, or be used at the scale that `cc.ink`/`cc.paper` are used.

3. **Photography reads as one continuous shoot.** `ccPhotoGrade` is applied uniformly to every real photo specifically to prevent the homepage from looking like a collage of unrelated stock assets. Any new photography added to this system should receive the same grading rather than appearing in its native color.

4. **Shadow is rare and purposeful.** The system defines exactly two shadow values, and the source comment for `ccElevation` explicitly frames it as "the one place this system allows shadow" outside the heavier `ccSlabShadow`. This is a restraint principle, not an oversight — new components should not introduce ad hoc shadows.

5. **Full-bleed is an earned exception, not a default.** `moment.tsx` is explicitly called out in-source as the page's "one full-bleed moment — no card, no container, no rounded corners." It is also the page's single audience handoff (homeowner-facing content above it, tradesperson-facing content from this point down). Full-bleed treatment is tied to that narrative role, not used as a generic layout choice elsewhere on the page.

6. **Fluid typography over breakpoint jumps.** The display/heading scale (`text-cantiere-display`, `text-cantiere-heading` in `packages/ui`) is a single continuous `clamp()` per step rather than a two-step (mobile value / lg value) jump, so nothing "snaps" at exactly 1024px. Headings in this system are expected to scale continuously with viewport width, not jump at fixed breakpoints.

7. **Content structure can carry as much intent as visual structure.** `index-directory.tsx`'s comment frames its layout as "a navigable index, not a magazine spread," and notes that prices are deliberately omitted so each guide can present its own figure "as indicative." Visual decisions in this system are tied to specific information-architecture reasoning, not decoration for its own sake.

8. **Motion respects reduced-motion preference by default.** `Reveal`'s entrance animation is wrapped in `motion-reduce:` variants that disable the transition and show content at rest. This is treated as a baseline requirement of the motion language, not an optional add-on.

**What this identity is not** (by contrast with the legacy system documented separately in `docs/archive-legacy/ui/LEGACY_UI_DEPENDENCY_MAP.md`): it does not use the legacy system's font stack (Inter/Plus Jakarta Sans), its cooler accent hue, its breakpoint-stepped typography, or its broader, more varied shadow/radius vocabulary. None of those legacy values appear anywhere in the files audited for this document.
