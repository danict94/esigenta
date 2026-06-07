# Esigenta V2 — Semantic Funnel Runtime Architecture

Version: 2.1
Status: ACTIVE RUNTIME FOUNDATION - CONTEXTUAL PRESETS
Last updated: 2026-05-13

---

# Purpose

This document is the operational reference for the Esigenta request funnel runtime.

Its purpose is to:

* preserve runtime architecture consistency
* prevent taxonomy duplication
* define funnel/runtime ownership boundaries
* track implemented runtime flow
* describe real file ownership
* reduce unnecessary audits
* provide operational context for AI-assisted development

This document is NOT:

* a product pitch
* a UX manifesto
* a theoretical architecture essay

It is:

# operational runtime memory

for developers and AI assistants.

---

# Current Runtime Goal

Esigenta is building:

# semantic request acquisition infrastructure

The funnel must:

* interpret customer intent
* collect structured operational context
* generate normalized marketplace request data
* remain lightweight for the customer

The funnel must NOT become:

* static forms
* category-first questionnaires
* one-form-per-intervention systems
* workflow engines
* enterprise form builders

---

# Core Runtime Principle

The taxonomy already owns:

```txt
query
→ intervention
→ services
→ categories
→ domains
```

The funnel does NOT redefine this graph.

The funnel:

# consumes taxonomy semantics

and determines:

# which information is useful

to create a high-quality request.

---

# Runtime Layer Separation

## Taxonomy Layer

Location:

```txt
packages/db/taxonomy
```

Owns:

* semantic meaning
* aliases
* interventions
* services
* categories
* domains
* search normalization
* semantic traversal
* clarification
* taxonomy validation

Answers:

```txt
WHAT does the user mean?
```

---

## Funnel Runtime Layer

Location:

```txt
packages/db/src/funnel
```

Owns:

* runtime capability composition
* acquisition orchestration
* runtime profiles
* adaptive step visibility
* request draft generation
* runtime enrichment

Answers:

```txt
WHAT information is useful?
```

---

## Requests Layer

Location:

```txt
packages/db/src/requests
```

Owns:

* request lifecycle contracts
* request statuses
* request ownership contracts
* moderation preparation
* future commercial preparation

Answers:

```txt
WHAT does the request become inside the marketplace?
```

---

## Web App Layer

Location:

```txt
apps/web
```

Owns:

* Hero
* SearchBar
* runtime rendering
* transitions
* animations
* local UI state
* lightweight UX orchestration

Answers:

```txt
HOW does the experience feel?
```

The frontend must NEVER:

* resolve taxonomy
* resolve aliases
* rebuild semantic logic
* duplicate runtime logic
* perform semantic traversal

---

# Current Runtime Flow

## ACTIVE IMPLEMENTED FLOW

```txt
SearchBar
→ taxonomy search API
→ intervention selection
→ /richiesta/[slug]
→ runtime API
→ runtime capability composition
→ RuntimeFunnel renderer
→ RequestDraft generation
```

---

After runtime draft generation, the current foundation can submit the draft
through the request creation API and start the email verification flow.

---

# Current Runtime Status

## IMPLEMENTED

### Taxonomy Runtime

Implemented:

* taxonomy search
* intervention resolution
* alias resolution
* semantic traversal
* taxonomy build validation

---

### Funnel Runtime

Implemented:

* dedicated funnel route
* runtime capability system
* runtime profile system
* capability presets
* contextual runtime preset inference from `resolved.interventionSlug`
* adaptive visibility
* runtime renderer
* request draft generation
* request submission from runtime draft

---

### Request Lifecycle Foundation

Implemented:

* Request Prisma lifecycle fields
* RequestStatus enum
* request lifecycle contracts
* ownership contracts
* request creation contracts
* request creation from funnel draft
* email verification foundation
* pending request listing/review foundation for area impresa

---

## NOT IMPLEMENTED YET

* customer bootstrap flow
* auth/session system
* production-grade moderation workflow
* company onboarding
* credits lifecycle
* refunds lifecycle
* review system
* matching engine
* notifications
* production email delivery hardening

---

# Current Runtime Philosophy

The funnel must FEEL:

* lightweight
* guided
* conversational
* fast
* mobile-friendly
* calm

The user must NEVER perceive:

* a database form
* a workflow engine
* an enterprise questionnaire
* technical complexity

Internally:

```txt
rich structured runtime
```

Externally:

```txt
simple guided flow
```

---

# Runtime Composition Model

The runtime is built from:

# reusable acquisition capabilities

NOT:

```txt
one custom funnel per intervention
```

---

# Capability System

## Shared Capabilities

Reusable everywhere:

* location
* property
* photos
* urgency
* timing
* budget
* surface-area
* rooms
* contact

---

## Specialized Capabilities

Future candidates, not active runtime primitives yet:

* wall-condition
* scaffold
* floor-level
* outdoor-access
* electrical-power
* water-damage
* furniture-protection

---

# Capability Rule

Capabilities represent:

# acquisition primitives

NOT:

# semantic meaning

Example:

```ts
{
  id: "surface-area",
  type: "number",
  question: "Quanti mq circa?"
}
```

This capability can be reused across many interventions.

---

# Runtime Presets

The runtime prefers:

# preset composition

instead of:

```txt
manual intervention funnels
```

---

## Active Presets

### PAINTING

Includes:

* location
* property
* rooms
* surface-area
* photos
* timing
* contact

---

### PLUMBING_EMERGENCY

Includes:

* location
* property
* photos
* timing
* contact

---

### HOME_RENOVATION

Includes:

* location
* property
* rooms
* surface-area
* photos
* timing
* budget
* contact

---

### BATHROOM_RENOVATION

Includes:

* location
* property
* rooms
* surface-area
* photos
* timing
* budget
* contact

---

### ELECTRICAL_WORK

Includes:

* location
* property
* photos
* timing
* contact

---

### GENERIC

Includes:

* location
* property
* photos
* timing
* contact

---

## Legacy Compatibility Presets

Still registered for compatibility:

* INTERIOR_WORK
* EXTERIOR_WORK
* EMERGENCY_REPAIR
* RENOVATION
* QUICK_SERVICE

New inference should prefer contextual presets and fall back to `GENERIC`.

---

# Current Preset Inference

Runtime inference is intentionally simple:

```txt
resolved.interventionSlug
-> deterministic preset map
-> capabilities
```

Current mapping:

* `perdita-acqua`, `riparare-tubo`, `infiltrazione-acqua` -> `PLUMBING_EMERGENCY`
* `tinteggiare-casa`, `imbiancare-stanza`, active tinteggiatura taxonomy slugs -> `PAINTING`
* `rifare-bagno` -> `BATHROOM_RENOVATION`
* `ristrutturare-casa`, `ristrutturare-appartamento` -> `HOME_RENOVATION`
* active electrician intervention slugs -> `ELECTRICAL_WORK`
* unknown intervention slugs -> `GENERIC`

Do not add:

* scoring systems
* condition engines
* workflow graphs
* AI routing
* one funnel per service

---

# Runtime Adaptation Rules

The runtime must remain:

# linear-first

NOT:

* graph-driven
* workflow-heavy
* no-code-engine style
* deeply branching

---

## Good Adaptation

Example:

```txt
interno = sì
```

skip:

```txt
serve ponteggio?
```

---

## Dangerous Adaptation

Avoid:

* giant branching trees
* workflow graphs
* nested runtime engines
* intervention-specific runtime files

---

# Runtime UX Flow

## Step 1 — Location

Goal:

* geo matching
* operational radius
* routing precision

Collect:

* address
* city
* CAP
* coordinates
* property type

Implementation:

* Google Maps autocomplete
* structured geo extraction

---

## Step 2 — Work Scope

Goal:

* understand project size
* improve quotation quality
* improve request quality

Examples:

* interno o esterno
* mq circa
* ambienti
* stato superfici

The funnel should prefer:

# approximate acquisition

NOT technical precision.

---

## Step 3 — Complexity Context

Goal:

* operational feasibility
* execution complexity
* professional confidence

Examples:

* serve ponteggio
* immobile abitato
* mobili da proteggere

---

## Step 4 — Media

Goal:

* improve lead quality
* improve estimate quality

Preferred:

* photos
* future video support

Photos should be:

# strongly encouraged

NOT aggressively mandatory.

---

## Step 5 — Timing And Intent

Goal:

* urgency detection
* seriousness detection
* lead scoring

Examples:

* quando vuoi iniziare
* disponibilità sopralluogo
* intenzione reale di eseguire il lavoro

---

## Step 6 — Free Description

Free text comes:

# near the end

after structured acquisition.

---

## Step 7 — Contact Collection

Collect only at the end:

* name
* phone
* email

The user should feel:

```txt
sto inviando una richiesta
```

NOT:

```txt
mi sto registrando
```

---

# Request Lifecycle Direction

## Current Direction

```txt
visitor
→ funnel
→ RequestDraft
→ request creation
→ email verification
→ PENDING_REVIEW
→ admin approval
→ marketplace publication
```

---

# Request Snapshot Philosophy

The Request model stores:

* customer snapshot
* geo snapshot
* structured runtime data
* required services snapshot
* intervention snapshot

The Request must remain:

# stable over time

and independent from:

* future taxonomy changes
* runtime evolution
* future funnel changes

---

# Structured Runtime Data

The runtime should persist:

```prisma
structuredData Json?
```

NOT:

```prisma
rooms Int
mq Int
wallCondition String
```

The funnel will evolve frequently.

Rigid schemas are dangerous.

---

# Current File Ownership Map

## packages/db/src/funnel/capabilities

Owns:

* reusable acquisition primitives
* capability metadata
* runtime acquisition questions

Must NOT:

* perform persistence
* perform matching
* contain UI rendering

---

## packages/db/src/funnel/presets

Owns:

* runtime capability bundles
* reusable acquisition patterns

Must NOT:

* contain intervention-specific forms
* duplicate taxonomy meaning

---

## packages/db/src/funnel/compiler

Owns:

* runtime profile resolution
* capability composition
* request draft building

Must NOT:

* perform persistence
* perform frontend rendering

---

## packages/db/src/funnel/runtime

Owns:

* runtime ordering
* adaptive visibility
* runtime validation
* request enrichment

Must NOT:

* perform semantic resolution
* perform persistence

---

## packages/db/src/requests

Owns:

* request lifecycle contracts
* ownership contracts
* request creation contracts

Must NOT:

* perform taxonomy traversal
* contain funnel runtime logic

---

## apps/web/src/components/home/search-bar.tsx

Owns:

* lightweight search UX
* taxonomy result interaction
* search rendering

Must NOT:

* resolve taxonomy semantics
* contain runtime acquisition logic

---

## apps/web/src/components/funnel/runtime-funnel.tsx

Owns:

* runtime capability rendering
* local runtime state
* lightweight runtime UX

Must NOT:

* resolve taxonomy
* perform persistence
* rebuild runtime composition

---

## apps/web/src/app/richiesta/[slug]/page.tsx

Owns:

* dedicated funnel route
* runtime route entrypoint

Must NOT:

* contain taxonomy logic
* contain persistence logic

---

# Legacy / Forbidden Architecture

## NEVER CREATE

* one funnel per intervention
* category-first funnels
* intervention runtime folders
* frontend taxonomy resolution
* giant rigid request schemas
* workflow-engine funnels
* dashboard-heavy customer flows

---

# Important Runtime Rule

The funnel is:

# request acquisition infrastructure

The request lifecycle is:

# marketplace infrastructure

These domains must remain separated.

---

# Final Principle

The taxonomy remains:

# semantic infrastructure

The funnel becomes:

# acquisition infrastructure

The requests layer becomes:

# marketplace lifecycle infrastructure

The frontend becomes:

# lightweight runtime experience

These layers must remain permanently separated.
