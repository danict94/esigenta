-- DropIndex
DROP INDEX "Company_onboardingCategorySlug_idx";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "onboardingCategorySlug";
