-- AlterTable: minimal public-profile fields on Company (Phase 8.C), additive only.
-- Nullable everywhere; publicSlug is unique but nullable — Postgres allows
-- multiple NULLs under a unique constraint, so companies without a slug
-- yet don't collide. No new enum, no publicProfileStatus (premature until
-- a public vetrina actually exists). Completeness is derived at read time
-- by deriveCompanyProfileCompleteness, never stored.
ALTER TABLE "Company" ADD COLUMN     "fullDescription" TEXT,
ADD COLUMN     "publicName" TEXT,
ADD COLUMN     "publicProfileConsentAt" TIMESTAMP(3),
ADD COLUMN     "publicSlug" TEXT,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "yearsOfExperience" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Company_publicSlug_key" ON "Company"("publicSlug");
