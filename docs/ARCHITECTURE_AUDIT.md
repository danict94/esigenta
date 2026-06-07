# Esigenta V2 — Architecture Audit

## Monorepo Structure

### Apps

- apps/web
- apps/admin

### Packages

- packages/db
- packages/ui
- packages/config

---

# Core Architecture Principles

## Rule 1 — Domain Logic Ownership

Business/domain logic MUST NOT live inside:

- apps/web
- apps/admin

Business/domain logic MUST live inside:

- packages/db

---

## Rule 2 — UI Package Purity

packages/ui is presentation-only.

It MUST NOT contain:

- Prisma logic
- business rules
- request matching
- taxonomy logic
- company logic
- marketplace workflows

Audit status:
- PASSED

---

## Rule 3 — Apps Are Edge Adapters

apps/web and apps/admin are responsible for:

- rendering
- auth/session
- routing
- form parsing
- redirects
- orchestration

They MUST NOT own:

- Prisma transactions
- matching rules
- workflow invariants
- semantic validation
- taxonomy authority

---

# Current Domain Authorities

## packages/db

Current bounded contexts:

- auth
- credits
- email
- funnel
- identity
- requests
- taxonomy

---

# Funnel Architecture

Current structure:

- capabilities
- compiler
- presets
- runtime
- types

Status:
- GOOD
- already modular
- centralized

---

# Request Architecture

Current structure includes:

- dispatch
- customer-soft-access
- customer-access-token
- unlock-request-for-company
- request-links

Status:
- GOOD
- already centralized
- customer-without-account model already exists

---

# Current Violations

## HIGH PRIORITY

### apps/web/src/app/(area-impresa)/area-impresa/configura-servizi/actions.ts

Contains:

- domain validation
- matching mode normalization
- allowedServiceIds logic
- category/service validation
- Prisma transaction
- CompanyCategory persistence
- CompanyService persistence

Target:
- move to packages/db

Priority:
- HIGH

---

## MEDIUM PRIORITY

### apps/web/src/app/(public-business)/area-impresa/iscriviti/actions.ts

Contains:

- onboarding normalization
- onboarding validation
- domain workflow logic

Target:
- move onboarding domain logic to packages/db

Priority:
- MEDIUM

---

## MEDIUM PRIORITY

### apps/web/src/app/(area-impresa)/area-impresa/profilo/page.tsx

Contains:

- normalization logic
- radius validation
- company update orchestration
- contact change request workflow logic

Status:
- becoming a fat page

Priority:
- MEDIUM

---

# Architecture Health Assessment

## Good

- packages/ui is clean
- requests domain centralized
- dispatch centralized
- taxonomy centralized
- funnel architecture modular
- bounded contexts already emerging

## Problems

- some app actions still own business logic
- Prisma transactions still exist inside apps/web
- domain invariants duplicated in UI/actions

---

# Official SSOT Principle

Apps orchestrate.

packages/db decides.

packages/ui presents.

---

# Refactor Strategy

## Do NOT rewrite the entire system.

Use incremental boundary tightening.

---

# Refactor Priority Order

1. company service configuration
2. company onboarding workflow
3. profile domain extraction
4. future conversation/chat domain

---

# Future Architecture Direction

## Request-Centric Model

The Request is the central entity.

NOT the customer account.

Customer access should remain:

- token-based
- email-based
- soft-access

---

# Planned Future Domains

Potential future packages/db domains:

- company-service-configuration
- request-conversations
- account-management

---

# Audit Summary

Esigenta architecture is NOT chaotic.

The project already has:

- emerging bounded contexts
- centralized request logic
- centralized taxonomy
- centralized dispatch
- modular funnel architecture

Main issue:
- boundary enforcement between apps and packages/db.