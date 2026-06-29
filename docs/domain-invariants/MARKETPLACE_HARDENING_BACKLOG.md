# MARKETPLACE HARDENING BACKLOG

Status: ACTIVE

Last Updated: 2026-06-22

Purpose:

Track every structural issue discovered through audits after:

* Taxonomy Refoundation
* Geo Refoundation
* Matching Investigation
* Notification Investigation
* Domain Invariants Audit

Only unresolved items belong here.

Resolved items remain in their original reports.

---

# P0 — ACTIVE

## P0.1 CompanyConfigured Consolidation

Status:

IN_PROGRESS

Origin:

docs/archive-legacy/refoundation/company-configuration/ONBOARDING_CONFIGURATION_REFOUNDATION_AUDIT.md

docs/domain-invariants/00_INVENTORY.md

Problem:

Three different answers to:

"Is this company configured?"

Current implementations:

* Matching
* Dashboard
* Configura Servizi

Current source conflict:

* CompanyCategory
* CompanyIntervention
* onboardingCategorySlug

Target:

Single source of truth.

Source:

* CompanyCategory
* CompanyIntervention

Success criteria:

CompanyConfigured implementations = 1

---

# P0.2 MarketplaceReady Consolidation

Status:

NOT_STARTED

Origin:

docs/domain-invariants/00_INVENTORY.md

Problem:

Dead marketplace policies exist but are not used.

Examples:

* company-status-policy.ts
* marketplace-policy.ts

Real callers reimplement approval logic inline.

Target:

Single implementation:

isCompanyMarketplaceReady()

Success criteria:

MarketplaceReady implementations = 1

---

# P0.3 RequestVisibleToCompany Consolidation

Status:

NOT_STARTED

Origin:

docs/domain-invariants/00_INVENTORY.md

Problem:

4 independent visibility implementations.

Potential disagreement between:

* list page
* detail page
* dashboard
* matching eligibility

Target:

Single visibility decision path.

Success criteria:

RequestVisibleToCompany implementations = 1

---

# P1 — PLATFORM ARCHITECTURE

## P1.1 Notification Architecture Consolidation

Status:

NOT_STARTED

Origin:

docs/archive-legacy/bugs/COMPANY_NOTIFICATION_VISIBILITY_AUDIT.md

docs/archive-legacy/bugs/REQUEST_PUBLICATION_DISPATCH_AUDIT.md

Problem:

Current system works but future channels are planned.

Future channels:

* App
* Email
* WhatsApp
* SMS

Target:

Event
↓
Eligibility
↓
Delivery

Eligibility decided once.

Channels become delivery-only.

Success criteria:

NotificationEligible implementations = 1

---

## P1.2 GeoLocation Orphan Cleanup

Status:

NOT_STARTED

Origin:

docs/archive-legacy/refoundation/geo-refoundation/04_CLEANUP_REPORT.md

Problem:

GeoLocation rows can remain orphaned after Company/Request deletion.

Current finding:

3 orphan rows identified.

Target:

Explicit ownership and cleanup strategy.

Success criteria:

GeoLocation orphan generators = 0

---

# P2 — OPERATIONS

## P2.1 Email Deliverability

Status:

POSTPONED

Origin:

docs/archive-legacy/bugs/EMAIL_SYSTEM_RELIABILITY_AUDIT.md

Problem:

Pipeline works.

Delivery works.

Messages reach Gmail.

Emails may land in Spam.

Current sender:

[onboarding@resend.dev](mailto:onboarding@resend.dev)

Target:

Production-grade email setup.

Required:

* verified domain
* SPF
* DKIM
* DMARC
* branded sender

Success criteria:

Production deliverability verified.

---

# P2.2 Search Intelligence V2

Status:

POSTPONED

Origin:

docs/archive-legacy/refoundation/catalog-evolution/SEARCH_INTELLIGENCE_AUDIT.md

docs/archive-legacy/refoundation/catalog-evolution/SEARCH_INTELLIGENCE_V2_REVIEW.md

Problem:

Search works.

Ranking quality can improve.

Areas:

* generic token weighting
* specificity ranking
* normalization
* typo tolerance
* future stemming

Success criteria:

Search relevance improved without new taxonomy structures.

---

# DOMAIN INVARIANTS TRACKER

## Inventory Complete

Origin:

docs/domain-invariants/00_INVENTORY.md

Current state:

CompanyConfigured
→ DUPLICATED

MarketplaceReady
→ DUPLICATED

RequestVisibleToCompany
→ DUPLICATED

NotificationEligible
→ UNKNOWN

CompanyCanUnlockRequest
→ UNKNOWN

CompanyCanContactClient
→ UNKNOWN

RequestPublishable
→ CLEAN

RequestDispatchable
→ CLEAN

CompanyProfileComplete
→ NOT IMPLEMENTED

---

# TARGET END STATE

Every critical marketplace decision must have:

* one implementation
* one source of truth
* one decision path

No runtime fallback based on onboarding snapshots.

No duplicate business rules.

No dead policy modules.

No orphan generators.

No hidden legacy paths.

# Roadmap

Annotare in questo file lo stato di chiusura dei bug ancora aperti e come sono stati risolti.
