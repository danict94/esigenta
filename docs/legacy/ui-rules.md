Perfetto.
Questo è esattamente il momento giusto per scriverlo.

Questo primo MD deve diventare:

# LA LEGGE UI DI ESIGENTA V2

Non teoria.
Non corporate.
Ma:

* pratica
* concreta
* permanente

---

Crea:

```txt id="0wjglz"
docs/ui-rules.md
```

e mettici questo:

````md id="1wjglz"
# Esigenta V2 — UI Rules

## Purpose

Esigenta V2 is a consumer-first marketplace platform.

The UI must feel:
- calm
- trustworthy
- editorial
- service-oriented
- easy to understand
- European marketplace style

The UI must NOT feel like:
- AI startup
- crypto product
- dashboard-heavy SaaS
- flashy landing page
- Dribbble concept UI

---

# Design Direction

Primary references:
- Homedeal
- European service marketplaces
- calm editorial layouts
- low-noise interfaces

Modernized with:
- cleaner spacing
- better mobile rhythm
- softer typography
- improved hierarchy

---

# Core UI Principles

## Prefer calm interfaces

Avoid:
- visual noise
- excessive gradients
- giant typography
- aggressive contrasts
- oversized cards
- excessive animations

Prefer:
- whitespace
- clean hierarchy
- readability
- subtle shadows
- soft surfaces
- controlled density

---

# Radius Rules

Preferred:
- rounded-none
- rounded-md
- rounded-lg

Avoid:
- rounded-full
- rounded-2xl
- rounded-3xl
- bubble UI

Esigenta should feel:
- practical
- trustworthy
- service-oriented

NOT:
- playful
- futuristic
- app-like

---

# Surface Rules

Preferred:
- off-white backgrounds
- white surfaces
- subtle borders
- realistic soft shadows

Avoid:
- glassmorphism
- glowing shadows
- neon colors
- floating dashboard cards

Preferred shadow style:

```css
box-shadow:
  0 0 1px rgba(0,0,0,0.08),
  0 0 14px rgba(0,0,0,0.16);
````

---

# Typography Rules

Typography should feel:

* calm
* readable
* editorial
* trustworthy

Avoid:

* oversized hero text
* aggressive weights
* startup-style marketing copy

Preferred font:

* Plus Jakarta Sans

---

# Layout Rules

Always use shared layout primitives from `@esigenta/ui`.

Required primitives:

* Section
* Container
* Stack

Avoid:

* random wrappers
* arbitrary spacing
* duplicated layout logic

---

# Tokens Rules

All spacing, radius, typography and layout values must come from shared tokens.

Semantic colors must come from Tailwind v4 CSS theme variables in:

* `apps/web/src/app/globals.css`

Do NOT:

* hardcode spacing randomly
* invent new radius values
* duplicate typography styles
* use hardcoded neutral/zinc color utilities for product UI
* use arbitrary semantic color variables in components

Use:

* `packages/ui/src/styles/tokens.ts`
* generated semantic utilities like `bg-brand-primary`, `text-text-primary`, `border-border-primary`

as the single source of truth for their respective layers.

---

# Existing Shared Primitives

Current shared primitives:

## Layout

* Container
* Section
* Stack

## Utilities

* cn()

## Tokens

* containers
* spacing
* radius
* typography
* shadows

These must be reused before creating new abstractions.

---

# Hero Rules

Hero sections should:

* explain a real-world problem
* feel calm
* focus on clarity
* guide users naturally

Avoid:

* fake dashboards
* fake analytics
* startup buzzwords
* overwhelming visuals

---

# Navigation Rules

Navigation must stay:

* simple
* breathable
* minimal

Avoid:

* mega menus
* crowded navbars
* too many links

---

# Component Rules

Before creating a new component:

1. Check if it already exists
2. Reuse shared primitives
3. Reuse tokens
4. Keep API simple
5. Keep components composable
6. Avoid premature abstractions

---

# Mobile Rules

Esigenta is mobile-first.

Every component must:

* work on small screens first
* preserve spacing rhythm
* preserve readability
* avoid overflow and crowded layouts

---

# Quality Rules

Every UI change must:

* pass typecheck
* remain scalable
* avoid duplication
* keep visual consistency
* preserve marketplace tone

Run before commit:

```bash
pnpm typecheck
```

---

# Final Principle

Esigenta should feel like:

* a real-world trusted service platform

NOT:

* a trendy startup landing page
* a dashboard product
* a flashy tech demo

```
```
## Current Layout Primitives

Located in:
`packages/ui/src/layout`

- Container
- Section
- Stack

These primitives are mandatory for page composition.

Avoid custom layout wrappers unless strictly necessary.

---

## Current Navigation Components

Located in:
`apps/web/src/components`

### Layout
- PublicShell
- Footer

### Navigation
- Navbar

These components define the current public marketplace shell.

---

## Current Shared Utilities

Located in:
`packages/ui/src/lib`

- cn()

Do not duplicate class merging utilities.

---

## Current Shared Tokens

Located in:
`packages/ui/src/styles/tokens.ts`

### Containers
- xs
- sm
- md
- lg
- xl
- xxl
- full

### Radius
- sm
- md
- lg
- xl
- full

### Spacing
- sectionXs
- sectionSm
- sectionMd
- sectionLg
- sectionXl
- containerX

### Typography
- hero
- title
- subtitle
- body
- caption

### Shadows
- sm
- md
- lg

These tokens are the single source of truth for UI consistency.
