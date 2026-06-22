// packages/database — Prisma, schema, migrations, seed, client, transaction helper
export { prisma } from "./client"
export type { Prisma } from "@prisma/client"

// GEO REFOUNDATION (docs/geo-refoundation/01_DESIGN.md) — the only write
// boundary for Company/Request location. Lives here (not @esigenta/domain)
// because @esigenta/auth must also call it and cannot depend on
// @esigenta/domain (which itself depends on @esigenta/auth).
export { setCompanyLocation, setCompanyLocationWithClient } from "./geo/set-company-location"
export type { SetCompanyLocationResult } from "./geo/set-company-location"
export { setRequestLocationWithClient } from "./geo/set-request-location"
export type { SetRequestLocationResult } from "./geo/set-request-location"
