-- Phase 16 — Physical Cleanup of the legacy Service-based taxonomy.
--
-- Every table/column dropped here was verified to have zero runtime
-- consumers as of docs/archive-legacy/refoundation/taxonomy-refoundation/15B_FINAL_CONSUMERS_REPORT.md
-- and re-verified immediately before this migration. Full data backup
-- taken before this migration: docs/archive-legacy/refoundation/taxonomy-refoundation/16_pre_drop_backup.json
--
-- Rollback: see docs/archive-legacy/refoundation/taxonomy-refoundation/16_PHYSICAL_CLEANUP_REPORT.md §H.
-- Restoring requires re-running `prisma migrate dev` against a schema with
-- these models re-added, then replaying 16_pre_drop_backup.json's "data"
-- object as INSERT statements (or via Prisma's createMany per model).

-- Drop tables that reference "Service" first (FK dependency order).
DROP TABLE IF EXISTS "CompanyService";
DROP TABLE IF EXISTS "ServiceAlias";
DROP TABLE IF EXISTS "CategoryService";
DROP TABLE IF EXISTS "InterventionService";
DROP TABLE IF EXISTS "RequestRequiredService";

-- Now the root table itself.
DROP TABLE IF EXISTS "Service";

-- Company.requestMatchingMode: zero real reads/writes confirmed
-- (Phase 15A) — only explanatory comments referenced it.
ALTER TABLE "Company" DROP COLUMN IF EXISTS "requestMatchingMode";
DROP TYPE IF EXISTS "CompanyRequestMatchingMode";

-- RequestDispatch.matchedServiceIds: zero references anywhere in the
-- codebase, confirmed by repo-wide search (Phase 16 Task 1 inventory).
ALTER TABLE "RequestDispatch" DROP COLUMN IF EXISTS "matchedServiceIds";
