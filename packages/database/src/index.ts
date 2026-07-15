// packages/database — Prisma, schema, migrations, seed, client, transaction helper
export { prisma } from "./client"
export type { Prisma } from "@prisma/client"

// GEO REFOUNDATION (docs/archive-legacy/refoundation/geo-refoundation/01_DESIGN.md) — the only write
// boundary for Company/Request location. Lives here (not @esigenta/domain)
// because @esigenta/auth must also call it and cannot depend on
// @esigenta/domain (which itself depends on @esigenta/auth).
export { setCompanyLocation, setCompanyLocationWithClient } from "./geo/set-company-location"
export type { SetCompanyLocationResult } from "./geo/set-company-location"
export { setRequestLocationWithClient } from "./geo/set-request-location"
export type { SetRequestLocationResult } from "./geo/set-request-location"

// ADMIN NOTIFICATIONS — same cross-package placement reason as above:
// @esigenta/auth must also read admin recipients and cannot depend on
// @esigenta/domain.
export { getAdminNotificationRecipientEmails } from "./admin/get-admin-notification-recipients"

// CATALOG / COMPANY CONFIGURATION — same cross-package placement reason as
// above: @esigenta/auth's onboarding bootstrap must also resolve/write
// CompanyCategory/CompanyIntervention and cannot depend on
// @esigenta/domain. @esigenta/domain's request eligibility and services
// configuration reuse these same primitives instead of reimplementing the
// Category -> ProjectGroup -> Intervention traversal or the replace-set
// write a second time.
export { resolveCategoryBySlugWithClient } from "./catalog/resolve-category-by-slug"
export type { ResolvedCategoryBySlug } from "./catalog/resolve-category-by-slug"
export { resolveInterventionsForCategoryIdsWithClient } from "./catalog/resolve-interventions-for-category-ids"
export type { CategoryInterventionRow } from "./catalog/resolve-interventions-for-category-ids"
export { writeCompanyServiceConfigurationWithClient } from "./company/write-company-service-configuration"
export type { WriteCompanyServiceConfigurationInput } from "./company/write-company-service-configuration"
export { readCompanyMarketplaceCapabilitySnapshot } from "./company/read-company-marketplace-capability-snapshot"
export type { CompanyMarketplaceCapabilitySnapshotRow } from "./company/read-company-marketplace-capability-snapshot"
