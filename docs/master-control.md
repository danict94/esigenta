# FixPro V2 — Master Control Document

Version: 0.3
Status: RUNTIME FUNNEL FOUNDATION ACTIVE
Last updated: 2026-05-13

---

# Purpose

This document is the operational memory of the project.

Its purpose is to:

* preserve architectural consistency
* prevent duplication
* preserve UI coherence
* track shared primitives
* track active work areas
* maintain continuity across AI sessions
* avoid loss of technical context

This document MUST be updated:

* at the end of important sessions
* after architecture changes
* after audits
* after shared primitive changes
* after major refactors

---

# Current Project State

Project status:

* foundation phase moving into MVP marketplace lifecycle foundation
* database and taxonomy foundation created
* taxonomy source/build validation is passing
* taxonomy domain model consolidated to macro navigation clusters
* taxonomy search API exists
* homepage SearchBar consumes taxonomy search for typed queries
* semantic funnel runtime foundation is implemented
* request draft submission and email verification foundation are implemented
* contextual runtime preset inference Phase 1 is implemented
* area impresa request listing/review foundation exists
* shared UI foundation in progress
* no production matching/auth/payments/credits logic yet

Current priorities:

1. keep taxonomy architecture stable
2. harden request lifecycle from funnel submission to review
3. keep runtime preset inference deterministic and explicit
4. continue shared UI primitive hardening only where needed
5. later build auth, matching, credits, payments, and notifications

The project is currently focused on:

* architecture correctness
* anti-duplication
* scalable UI foundations
* clean monorepo boundaries
* intervention-first taxonomy governance
* taxonomy-backed search consumption
* semantic request funnel runtime
* request lifecycle foundation
* area impresa request review foundation

NOT on:

* final UI polish
* animations
* advanced visual design
* premature abstractions
* matching-engine implementation before request/review/company contracts are hardened

---

# Monorepo Architecture

## Structure

```txt
/apps
  /web
  /admin

/packages
  /ui
  /config
  /db

/docs
```

---

# Responsibilities

## apps/web

Contains:

* product pages
* homepage
* marketplace UX
* hero sections
* search flow composition
* business logic
* routing
* app-specific navigation
* app-specific layouts

Examples:

* Hero
* SearchBar
* Navbar
* Footer
* PublicShell

`apps/web` is the REAL PRODUCT layer.

---

## apps/admin

Reserved for:

* admin dashboard
* admin auth
* moderation
* operations

Currently not active.

---

## packages/ui

Contains ONLY:

* reusable UI primitives
* layout primitives
* UI utilities
* shared tokens

Allowed examples:

* Button
* Container
* Section
* Stack
* Input
* Surface
* cn()
* tokens

NOT allowed:

* Hero
* SearchBar
* Navbar
* marketplace flows
* business-specific composition
* app shells

`packages/ui` is the SHARED UI FOUNDATION layer.

---

## packages/config

Shared project configuration.

Examples:

* TypeScript config
* lint config
* shared tooling

---

## packages/db

Owns:

* Prisma schema and database access foundation
* taxonomy source files
* taxonomy shared types and validators
* taxonomy build/generate/seed orchestration
* future taxonomy read/consumption helpers

Rules:

* taxonomy source is the semantic authority
* do not bypass validators
* do not redesign source -> build -> generated -> seed -> runtime
* runtime matching remains `request.requiredServices` vs `company.selectedServices`
* domains are macro navigation clusters only
* categories represent professional identity
* services are the runtime matching surface
* interventions are the customer-intent entry point

Current taxonomy status:

* taxonomy build passes
* service reachability guards are active
* category exposure guards are active
* domains were consolidated away from micro-topic fragmentation
* taxonomy can be amplified over time through source files, without changing architecture

---

# Shared UI Registry

## Existing Shared Primitives

Location:

```txt
packages/ui/src
```

---

## Layout Primitives

Location:

```txt
packages/ui/src/layout
```

### Existing

* Container
* Section
* Stack

### Rules

* must be reused before creating custom wrappers
* avoid hardcoded layout containers
* avoid repeated max-width logic

---

## Components

Location:

```txt
packages/ui/src/components
```

### Existing

* Button

### Status

EARLY FOUNDATION

The Button API is not fully stabilized yet.

Do not over-abstract variants prematurely.

---

## Utilities

Location:

```txt
packages/ui/src/lib
```

### Existing

* cn()

### Current Risk

Current implementation is too minimal and may later require:

* clsx
* tailwind-merge

Do not rewrite yet until primitive system stabilizes.

---

## Tokens

FixPro currently has TWO UI foundation layers.

---

### Semantic Theme / Palette Layer

Location:

```txt
apps/web/src/app/globals.css
```

Owns:

* semantic colors
* surfaces
* borders
* brand colors
* text colors

Tailwind v4 semantic colors are defined in CSS using `@theme inline`.

Rules:

* raw color values live only in `:root` as `--fp-color-*`
* Tailwind utility names are exposed through `--color-*` theme variables
* shared primitives and app components consume generated utilities
* examples: `bg-brand-primary`, `text-text-primary`, `border-border-primary`, `shadow-surface`
* `packages/ui` class names must be included with `@source`

Do NOT:

* use `neutral-*`, `slate-*`, or `zinc-*` utilities when a semantic utility exists
* use arbitrary semantic classes like `bg-[var(--brand-primary)]`
* duplicate color palettes in TypeScript tokens
* define product colors inside `packages/ui`

---

### Structural / Layout Token Layer

Location:

```txt
packages/ui/src/styles/tokens.ts
```

Owns:

* typography
* spacing
* radius
* shadows
* containers

Rules:

* reusable layout and typography class groups live here
* components consume `tokens` before inventing local structural class groups
* color palettes do NOT live here
* business/product composition does NOT live here

---

# Current UI Rules

Primary visual direction:

* calm marketplace UI
* European service marketplace tone
* editorial spacing
* low-noise interfaces

References:

* Homedeal
* European service platforms

Avoid:

* startup aesthetics
* dashboard-heavy layouts
* crypto/AI landing page visuals
* aggressive gradients
* oversized radius
* excessive motion

---

## Design System Governance

Semantic color rules:

* consume semantic utilities generated from `apps/web/src/app/globals.css`
* use `bg-brand-primary`, `text-text-primary`, `text-text-secondary`, `border-border-primary`, etc.
* do not use hardcoded `neutral-*`, `slate-*`, or `zinc-*` utility colors when semantic variables exist
* do not use inline HEX colors in components
* do not use arbitrary semantic variable utilities like `text-[var(--text-primary)]`

Structural token rules:

* typography, spacing, radius, shadows and containers come from `packages/ui/src/styles/tokens.ts`
* shared primitives should consume `tokens` when a reusable structural value already exists
* product composition may add local layout classes only when they express local composition, not a new system

---

# Shared vs Local Boundary Rules

## Shared (`packages/ui`)

Use for:

* primitives
* reusable layout logic
* reusable controls
* reusable surfaces
* reusable tokens

Examples:

* Button
* Input
* Surface
* Container

---

## Local (`apps/web`)

Use for:

* feature composition
* business flows
* marketplace sections
* homepage sections
* search orchestration
* product-specific UX

Examples:

* Hero
* SearchBar
* Navbar
* Footer

---

# Design System Consumption Rules

Typography consumption:

* use `tokens.typography` for shared type roles
* do not duplicate hero/title/subtitle/caption class groups locally when a token exists
* app-specific copy and hierarchy stay in `apps/web`

Semantic color consumption:

* use generated Tailwind utilities from `globals.css`
* examples: `bg-surface-primary`, `bg-surface-elevated`, `text-text-primary`, `text-text-muted`, `border-border-primary`, `bg-brand-primary`
* do not use inline HEX values or hardcoded neutral/slate/zinc color utilities in components

Shared layout primitive usage:

* use `Container`, `Section`, and `Stack` before creating local wrappers
* keep business/page composition local to `apps/web`
* do not move Hero, SearchBar, Navbar, Footer, or shells into `packages/ui`

Shadow token usage:

* use `tokens.shadows` for shared shadow class selection
* do not paste arbitrary shadow strings into components
* if a new shadow becomes necessary, add it deliberately through the design system

CTA consumption:

* use `Button` as the centralized CTA primitive
* do not create new button-like class recipes in app components unless a real primitive gap exists
* avoid expanding Button variants until repeated product needs prove the API

# environment variable
Environment Governance
.env = secrets/local runtime
.env.example = public variable contract
---

# Anti-Duplication Protocol

Before creating ANY new component or logic:

## Step 1 — Read

Read:

* `docs/master-control.md`
* `docs/funnel.md` when touching request/runtime flow
* `docs/taxonomy-matching-architecture.md` when touching taxonomy or matching semantics
* `docs/legacy/ui-rules.md` only for historical UI context

---

## Step 2 — Audit Existing System

Check:

* existing shared primitives
* existing tokens
* existing layout patterns
* existing utilities
* existing boundaries

---

## Step 3 — Verify Before Creating

Ask:

* does this already exist?
* is there a similar component?
* should this stay local?
* should this become shared?
* is this business logic or UI primitive?
* is this a real reusable pattern?

---

## Step 4 — Only Then Write Code

Never create:

* duplicate buttons
* duplicate spacing systems
* duplicate layout wrappers
* duplicate token systems
* premature abstractions

---

# Typecheck Rules

Before commits:

```bash
pnpm typecheck
```

Must verify:

* `@fixpro/ui`
* `apps/web`

No commit should happen with broken typecheck.

---
# Mandatory Foundation Audit

Before modifying UI or creating components, ALWAYS inspect existing shared foundations first.

Mandatory audit locations:

## Shared UI Foundation
- apps/web/src/app/globals.css
- packages/ui/src/lib
- packages/ui/src/styles
- packages/ui/src/styles/tokens.ts
- packages/ui/src/index.ts

## Shared Layout Primitives
- packages/ui/src/layout/container.tsx
- packages/ui/src/layout/section.tsx
- packages/ui/src/layout/stack.tsx

## Shared Components
- packages/ui/src/components/button.tsx

## Web App Composition
- apps/web/src/components/navigation
- apps/web/src/components/layout
- apps/web/src/components/home

## Current Marketplace Components
- apps/web/src/components/navigation/navbar.tsx
- apps/web/src/components/layout/public-shell.tsx
- apps/web/src/components/layout/footer.tsx
- apps/web/src/components/home/search-bar.tsx
- apps/web/src/components/home/hero.tsx

Do NOT:
- hardcode styles already represented in tokens
- hardcode semantic colors already represented in `globals.css`
- recreate primitives
- bypass shared layout primitives
- duplicate typography styles
- duplicate spacing systems

Always verify:
- semantic palette variables
- existing tokens
- existing primitives
- existing wrappers
- existing utilities
before writing new UI code.

# Current Active Areas

* request lifecycle hardening
* area impresa request listing/review foundation
* contextual runtime preset inference
* taxonomy consumption/search hardening
* homepage search entry integration
* shared UI primitives
* token stabilization
* CTA consistency
* marketplace visual language

---

# Recently Modified Areas

## Session 2026-05-13

### Modified

* contextual runtime preset definitions
* runtime preset inference from `resolved.interventionSlug`
* runtime capability preset registry
* runtime preset type/validation contract
* funnel architecture documentation
* roadmap/current-state documentation

### Validated

* `@fixpro/db` typecheck passes
* resolver smoke check maps contextual slugs to the expected presets
* `buildRequestDraft` accepts profiles generated by the new presets
* fallback preset is `GENERIC`
* legacy presets remain registered for compatibility

---

## Session 2026-05-11

### Modified

* semantic funnel runtime foundation
* runtime acquisition capabilities
* runtime preset composition
* request draft building
* request enrichment
* runtime validation
* funnel export surface
* MVP runtime funnel API bridge
* MVP dynamic funnel renderer
* SearchBar -> runtime funnel opening flow
* submit-ready request draft endpoint
* request creation flow
* request email verification flow
* apps/admin foundation
* apps/web route group split
* web component ownership folders

### Validated

* `@fixpro/db` typecheck passes
* root `pnpm typecheck` passes
* taxonomy build passes with existing taxonomy warnings only
* taxonomy remains semantic SSOT
* frontend remains presentation-only for funnel runtime
* funnel renderer consumes runtime capabilities dynamically
* request creation uses existing Request schema
* no Prisma schema or migration changes were made in this phase
* web dev server boots on port 3000
* admin dev server boots on port 3001

---

## Session 2026-05-10

### Modified

* taxonomy categories exposure
* taxonomy domain consolidation
* taxonomy registry wiring
* intervention alias hygiene
* project roadmap/governance documentation

### Validated

* taxonomy build passes
* taxonomy contains 2 sectors, 68 services, 68 interventions, 4 categories, 8 macro domains
* domains remain secondary navigation/SEO only
* runtime matching architecture remains service-based

---

## Session 2026-05-08

### Modified

* homepage foundation
* Hero component
* SearchBar prototype
* Button primitive
* token system
* Tailwind v4 semantic palette
* monorepo structure
* typecheck pipeline

### Removed

* fake token split files
* empty navigation shared layer
* empty cluster primitive

### Audited

* package boundaries
* shared vs local architecture
* typecheck coverage
* token consistency
* semantic utility generation
* duplication risks

---

# Recently Modified Files

## Session 2026-05-13

### Modified

* docs/master-control.md
* docs/roadmap.md
* docs/funnel.md
* packages/db/src/funnel/compiler/resolve-runtime-profile.ts
* packages/db/src/funnel/compiler/resolve-capabilities.ts
* packages/db/src/funnel/types/runtime-profile.ts
* packages/db/src/funnel/runtime/validate-runtime.ts
* packages/db/src/funnel/presets/painting.ts
* packages/db/src/funnel/presets/plumbing-emergency.ts
* packages/db/src/funnel/presets/home-renovation.ts
* packages/db/src/funnel/presets/bathroom-renovation.ts
* packages/db/src/funnel/presets/electrical-work.ts
* packages/db/src/funnel/presets/generic.ts

---

## Session 2026-05-11

### Modified

* docs/master-control.md
* packages/db/src/index.ts
* packages/db/src/funnel/index.ts
* packages/db/src/funnel/capabilities/timing.ts
* packages/db/src/funnel/capabilities/budget.ts
* packages/db/src/funnel/capabilities/surface-area.ts
* packages/db/src/funnel/capabilities/rooms.ts
* packages/db/src/funnel/presets/interior-work.ts
* packages/db/src/funnel/presets/exterior-work.ts
* packages/db/src/funnel/presets/emergency-repair.ts
* packages/db/src/funnel/presets/renovation.ts
* packages/db/src/funnel/presets/quick-service.ts
* packages/db/src/funnel/compiler/resolve-capabilities.ts
* packages/db/src/funnel/compiler/resolve-runtime-profile.ts
* packages/db/src/funnel/compiler/build-request-draft.ts
* packages/db/src/funnel/types/capability.ts
* packages/db/src/funnel/runtime/resolve-step-order.ts
* packages/db/src/funnel/runtime/resolve-step-visibility.ts
* packages/db/src/funnel/runtime/validate-runtime.ts
* packages/db/src/funnel/runtime/enrich-request.ts
* packages/db/src/funnel/create-runtime-funnel.ts
* apps/web/src/app/api/funnel/runtime/route.ts
* apps/web/src/app/api/funnel/draft/route.ts
* apps/web/src/components/funnel/runtime-funnel.tsx
* apps/web/src/components/home/funnel-entry.tsx
* apps/web/src/components/home/search-bar.tsx
* apps/web/src/components/home/hero.tsx
* packages/db/src/requests/create-request.ts
* packages/db/src/requests/verify-request.ts
* packages/db/src/requests/request-errors.ts
* packages/db/src/requests/request-structured-data.ts
* packages/db/src/requests/send-verification-email.ts
* packages/db/src/requests/verification-token.ts
* packages/db/src/requests/index.ts
* apps/web/src/app/api/requests/route.ts
* apps/web/src/app/richiesta/verifica/page.tsx
* .env.example
* apps/admin/package.json
* apps/admin/tsconfig.json
* apps/admin/next.config.ts
* apps/admin/next-env.d.ts
* apps/admin/src/app/layout.tsx
* apps/admin/src/app/page.tsx
* apps/web/src/app/(public)/page.tsx
* apps/web/src/app/(public)/richiesta/[slug]/page.tsx
* apps/web/src/app/(public)/richiesta/verifica/page.tsx
* apps/web/src/app/(area-impresa)/layout.tsx
* apps/web/src/app/(cliente)/layout.tsx

---

## Session 2026-05-10

### Modified

* docs/master-control.md
* docs/roadmap.md
* packages/db/taxonomy/source/index.ts
* packages/db/taxonomy/source/categories/edilizia.ts
* packages/db/taxonomy/source/domains/ristrutturazione.ts
* packages/db/taxonomy/source/domains/costruzione.ts
* packages/db/taxonomy/source/domains/facciate.ts
* packages/db/taxonomy/source/domains/muratura.ts
* packages/db/taxonomy/source/domains/idraulica.ts
* packages/db/taxonomy/source/interventions/cartongesso.ts
* packages/db/taxonomy/source/interventions/pavimenti.ts
* packages/db/taxonomy/source/interventions/intonaci-rasature.ts
* packages/db/taxonomy/source/interventions/piscine.ts

### Removed

* packages/db/taxonomy/source/domains/balconi-terrazzi.ts
* packages/db/taxonomy/source/domains/cartongesso.ts
* packages/db/taxonomy/source/domains/finiture.ts
* packages/db/taxonomy/source/domains/piscine.ts

---

## Session 2026-05-08

### Modified

* apps/web/src/app/globals.css
* packages/ui/src/styles/tokens.ts
* packages/ui/src/components/button.tsx
* apps/web/src/components/home/hero.tsx
* apps/web/src/components/home/search-bar.tsx

### Removed

* packages/ui/src/navigation/*
* packages/ui/src/layout/cluster.tsx

---

# Stabilized Areas

## DONE

* monorepo foundation
* src/app migration
* packages/ui boundaries
* root typecheck coverage
* package ownership rules
* foundation cleanup audit
* taxonomy source architecture
* taxonomy validation layer
* taxonomy macro-domain model
* semantic funnel runtime foundation
* taxonomy search API foundation
* SearchBar taxonomy consumption foundation
* request draft submission foundation
* request email verification foundation
* contextual runtime preset inference Phase 1

These areas should NOT be reworked unless a real architectural reason appears.

---

# Current Open Risks

## UI Primitive Risks

* Surface primitive not created yet
* Input primitive not created yet
* CTA styling now routes through `Button`, but link-style CTA semantics are not formalized yet
* navigation/footer micro-typography remains local until a repeated token role is proven

---

## Token Risks

* semantic palette system recently introduced and not fully consumed across future UI yet
* semantic utility consumption strategy still stabilizing
* structural tokens still early and may need tightening as primitives mature
* semantic control-state coverage is intentionally minimal

---

## Architecture Risks

* `cn()` utility still simplistic
* primitive system still early-stage
* dependency hygiene pass not completed
* request creation/email verification foundation exists, but production moderation/auth/rate limiting/email delivery are not hardened
* runtime preset inference is intentionally explicit; unmapped intervention slugs fall back to `GENERIC`
* taxonomy search/consumption layer exists as a foundation search endpoint; ranking and clarification remain future work
* taxonomy must be amplified gradually without micro-domain expansion

---

# Current Priorities

## Immediate

1. harden request creation, verification, and review lifecycle
2. expand runtime preset mapping only through explicit taxonomy slug decisions
3. replace or hydrate homepage preload suggestions with taxonomy-backed suggestions
4. define company identity/onboarding/auth boundaries before matching
5. create Input primitive only if the funnel/search UI proves a reusable need
6. create Surface primitive only if repeated product surfaces prove a reusable need

---

## Later

* marketplace categories section
* trust section
* auth system
* onboarding
* matching logic

---

# Session Update Protocol

At the end of important sessions, update:

## Required Updates

* Recently Modified Areas
* Recently Modified Files
* Current Open Risks
* Shared UI Registry
* Stabilized Areas
* Current Priorities

Do NOT rewrite the entire document.

---

# AI Session Rule

Before any future implementation:

```txt
Execute an architecture audit based on master-control.md.
Check existing primitives, tokens, layout patterns and boundaries before writing new code.
Do not duplicate styles, wrappers, logic or primitives.
Report findings before implementation.
```

---

# Final Principle

FixPro V2 must evolve as:

* a scalable marketplace system
* with controlled architecture
* controlled UI growth
* controlled abstractions
* and persistent architectural memory

NOT as:

* isolated pages
* random components
* uncontrolled AI-generated code
* or disconnected sessions.
