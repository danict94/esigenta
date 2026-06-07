# Esigenta V2 - Roadmap

Version: 0.4
Status: ACTIVE
Last updated: 2026-05-13

---

# Purpose

This document is the operational roadmap for Esigenta V2.

This file tracks only:

- milestones
- phases
- current status
- DONE
- ACTIVE
- NEXT
- BLOCKED

Detailed architecture rules stay in:

- `docs/master-control.md`
- `docs/funnel.md`
- `docs/seo.md`
- `docs/taxonomy-matching-architecture.md`

Do not turn this roadmap into a full architecture document.

---

# Current Snapshot

Current phase:

```txt
REQUEST FUNNEL FOUNDATION IMPLEMENTED
```

Current goal:

```txt
harden request lifecycle and keep runtime inference deterministic
```

The project is currently focused on:

- monorepo boundaries
- shared UI foundation
- Tailwind v4 semantic design system
- Prisma 7 database foundation
- validated taxonomy source/build system
- macro-domain taxonomy governance
- taxonomy-backed search foundation
- semantic funnel runtime foundation
- contextual runtime preset inference
- request draft submission and email verification foundation
- area impresa request listing/review foundation
- governance documentation

The project is not yet focused on:

- authentication
- payments
- messaging
- production matching
- production admin operations
- production marketplace workflows
- final UI polish

---

# Visual Status

[DONE] Taxonomy source system created and validated.

[DONE] Intervention-first taxonomy architecture is stable.

[DONE] Services/categories/interventions are reachable and build-safe.

[DONE] Domains are consolidated as macro navigation clusters.

[DONE] Taxonomy can be amplified over time from source files.

[DONE] Taxonomy search API foundation exists.

[DONE] Hero/SearchBar consumes taxonomy search for typed queries.

[DONE] MVP request funnel runtime is implemented.

[DONE] Runtime preset inference no longer defaults every intervention to `INTERIOR_WORK`.

[DONE] Request draft submission and email verification foundation exist.

[ACTIVE] Request lifecycle/review hardening.

[NEXT] Production auth/company onboarding model.

[BLOCKED] Matching engine until request/review/company contracts are hardened.

Next focus:

```txt
request lifecycle hardening
```

---

# Current Repository State

The working tree currently includes foundation-level changes.

Expected active changes:

- `apps/web` moved from legacy `app/` to `src/app/`
- shared UI primitives moved under `packages/ui`
- invalid shared UI boundaries were removed
- Tailwind semantic palette now lives in `apps/web/src/app/globals.css`
- structural UI tokens live in `packages/ui/src/styles/tokens.ts`
- database foundation was introduced in `packages/db`
- Prisma 7 uses `prisma.config.ts` plus a PostgreSQL driver adapter
- taxonomy source/build architecture is created and validated
- taxonomy domains were consolidated to macro navigation clusters
- taxonomy can be expanded over time through source files without changing the architecture
- taxonomy search API exists under `apps/web/src/app/api/taxonomy/search`
- request funnel runtime APIs exist under `apps/web/src/app/api/funnel`
- request creation API exists under `apps/web/src/app/api/requests`
- contextual runtime presets map intervention slugs to runtime capabilities
- unknown intervention slugs fall back to `GENERIC`

Important notes:

- deleted legacy files under `apps/web/app/*` are part of the `src/app` migration
- docs should prefer current files under `docs/` and `docs/legacy/`
- matching must stay blocked until request/review/company contracts are hardened

---

# Milestones

## M0 - Repository Foundation

Status: DONE

Outcome:

- monorepo foundation exists
- root `pnpm typecheck` covers active packages
- `apps/web`, `packages/ui`, `packages/db`, and `packages/config` are recognized

---

## M1 - UI Foundation

Status: ACTIVE

Completed:

- semantic colors moved to `apps/web/src/app/globals.css`
- typography/layout/radius/shadow/container tokens consolidated in `tokens.ts`
- `Button`, `Container`, `Section`, and `Stack` exist
- invalid shared navigation boundary removed
- fake token split files removed

Still active:

- semantic utility consumption stabilization
- homepage/component alignment
- missing `Input` primitive decision
- missing `Surface` primitive decision

---

## M2 - Database And Taxonomy Foundation

Status: DONE

Completed:

- `packages/db` package added
- Prisma schema foundation added
- Prisma 7 config moved to `prisma.config.ts`
- PostgreSQL adapter added through `@prisma/adapter-pg`
- taxonomy source, types, and persistence layer exist
- taxonomy validation layer exists
- service reachability guards are active
- category exposure guards are active
- macro-domain consolidation is complete
- build passes with 2 sectors, 68 services, 68 interventions, 4 categories, 8 domains

Ongoing rule:

- taxonomy is done as a system and can be amplified gradually through source files
- do not create micro-domains for services, specialties, or SEO fragments

---

## M3 - Request Funnel And Search Entry Foundation

Status: DONE

Completed:

- request funnel architecture
- taxonomy-powered search API
- intervention-first autocomplete foundation
- Hero/SearchBar integration for typed taxonomy queries
- request funnel entry point at `/richiesta/[slug]`
- runtime funnel API bridge
- dynamic runtime funnel renderer
- request draft endpoint
- request creation endpoint
- email verification foundation
- contextual runtime preset inference Phase 1

Ongoing rule:

- do not create one funnel per service or intervention
- keep runtime inference deterministic and explicit
- frontend remains presentation-only for taxonomy and funnel runtime

---

## M4 - Entity-Driven SEO Foundation

Status: NEXT

Scope:

- domain routing
- intervention routing
- geo independence
- entity relationship rendering
- internal linking structure

Depends on:

- current taxonomy entities
- search intent model
- content/geo model decisions

---

## M5 - Marketplace Workflow Foundation

Status: ACTIVE

Completed foundation:

- request creation from funnel draft
- email verification foundation
- pending request listing foundation
- request review foundation

Still active:

- customer bootstrap flow
- company identity/onboarding boundaries
- professional workspace boundaries
- review/moderation hardening

Still blocked:

- production matching
- credits/payments
- messaging

---

## M6 - Operations And Monetization

Status: BLOCKED

Scope:

- admin operations
- moderation operations
- payments
- messaging
- notifications
- analytics

Blocked by:

- auth model
- company onboarding
- production request lifecycle
- matching model

---

# Phases

## Phase 0 - Foundation Cleanup

Status: DONE

Done:

- removed invalid UI shared boundaries
- removed placeholder/fake modularity files
- clarified `apps/web` vs `packages/ui`
- introduced semantic palette and structural token split
- stabilized DB package enough to run taxonomy build and support future generate/seed steps

---

## Phase 1 - Foundation Hardening

Status: DONE

Done:

- roadmap and governance docs aligned with foundation state
- `packages/ui` remains primitive-only
- taxonomy source remains semantic authority
- duplicate search/taxonomy logic has not been introduced in the app layer

---

## Phase 2 - Request Funnel Entry And Taxonomy Consumption

Status: DONE

Done:

- taxonomy search API foundation
- SearchBar typed query integration
- runtime funnel route
- runtime capability composition
- request draft generation
- request submission foundation
- contextual runtime preset inference

---

## Phase 3 - SEO Routing

Status: NEXT

Next work:

- define SEO route architecture
- define geo/content relationship model
- connect search intent to SEO entry points where useful

---

## Phase 4 - Marketplace Product Systems

Status: ACTIVE

Current work:

- request lifecycle hardening
- area impresa request listing/review foundation
- company/customer boundary planning

Blocked work:

- auth
- company onboarding
- matching engine
- messaging
- payments
- production admin operations

---

# Status Board

## DONE

- monorepo foundation
- `apps/web` `src/app` migration
- shared UI package boundary cleanup
- removal of invalid shared navigation layer
- removal of fake token split files
- Tailwind v4 semantic palette foundation
- structural token layer foundation
- `Button` primitive foundation
- `Container`, `Section`, `Stack` layout primitives
- Prisma 7 schema/config foundation
- PostgreSQL adapter integration
- taxonomy source/build system
- taxonomy validation layer
- intervention-first taxonomy model
- service/category/intervention reachability
- macro-domain consolidation
- root typecheck flow
- taxonomy search API foundation
- MVP runtime funnel foundation
- request draft submission foundation
- email verification foundation
- contextual runtime preset inference Phase 1

---

## ACTIVE

- request lifecycle hardening
- area impresa request listing/review foundation
- semantic utility adoption verification
- taxonomy consumption/search hardening
- `packages/ui` primitive boundary enforcement
- runtime preset mapping maintenance

---

## NEXT

- SEO route architecture
- geo/content model
- taxonomy-backed preload suggestions for SearchBar
- customer/company identity boundaries
- `Input` primitive only if SearchBar proves a reusable need
- `Surface` primitive only if repeated surface patterns prove a reusable need

---

## BLOCKED

- matching engine until request/review/company contracts are hardened
- programmatic SEO pages until entity/geo/content model is defined
- company onboarding until auth/company identity boundaries are defined
- payments until marketplace workflow exists
- messaging until request lifecycle exists
- production admin operations until operational domain is defined
- final visual polish until foundation consumption is stable

---

# Recently Modified Areas

## Session 2026-05-13

Runtime funnel:

- contextual runtime presets added
- runtime inference now maps `resolved.interventionSlug` to contextual presets
- fallback preset is `GENERIC`
- legacy presets remain registered for compatibility
- `@esigenta/db` typecheck passes

Documentation:

- funnel runtime doc updated
- master control current state updated
- roadmap current state updated

---

## Session 2026-05-11

Funnel and request foundation:

- semantic funnel runtime foundation
- runtime acquisition capabilities
- request draft building and enrichment
- MVP runtime funnel API bridge
- MVP dynamic funnel renderer
- SearchBar to runtime funnel opening flow
- request creation flow
- request email verification flow
- apps/admin foundation
- apps/web route group split
- web component ownership folders

Validated:

- `@esigenta/db` typecheck passes
- root `pnpm typecheck` passes
- taxonomy build passes with existing taxonomy warnings only

---

## Session 2026-05-10

Taxonomy foundation:

- taxonomy source/build validated
- category exposure fixed
- domain model consolidated to macro navigation clusters
- micro domains removed from active registry
- taxonomy remains ready to amplify over time through source files

---

## Session 2026-05-08

UI/database foundation:

- homepage foundation
- Hero/SearchBar prototype
- Button primitive
- token system
- Tailwind v4 semantic palette
- monorepo structure
- typecheck pipeline

---

# Current Open Risks

## Documentation Risks

- some legacy docs may still reference deleted or moved governance files
- roadmap must remain operational and not duplicate full architecture docs

---

## UI Risks

- semantic palette is introduced but future components may still bypass it
- `Input` primitive does not exist yet
- `Surface` primitive does not exist yet
- Button API is early and should not be over-expanded prematurely

---

## Taxonomy/Search Risks

- search ranking strategy is still basic
- typo tolerance and alias weighting remain future work
- homepage preload suggestions are still static
- geo remains independent but not modeled yet
- taxonomy expansion must avoid micro-domain drift

---

## Runtime/Marketplace Risks

- runtime preset inference is intentionally explicit; unmapped intervention slugs fall back to `GENERIC`
- request creation/email verification foundation exists, but production moderation/auth/rate limiting/email delivery are not hardened
- matching engine is not implemented yet
- auth/customer/pro boundaries are not implemented yet
- database package must stay focused on DB ownership

---

# Update Rules

Update this document when:

- a milestone changes status
- a phase moves forward
- a blocker is removed
- a foundation decision changes
- a major file group is added or removed

Use only these status labels:

- DONE
- ACTIVE
- NEXT
- BLOCKED

Do not add new roadmap statuses without a deliberate governance decision.

---

# Next Planned Work

Recommended next step:

```txt
harden request creation, verification, and review lifecycle
```

Execution order:

1. verify request creation and verification behavior end to end
2. harden area impresa request review/listing flow
3. replace or hydrate SearchBar preload suggestions with taxonomy-backed suggestions
4. define customer/company identity and auth boundaries
5. expand runtime preset mapping only through explicit taxonomy slug decisions
6. define SEO route architecture after lifecycle boundaries are stable
