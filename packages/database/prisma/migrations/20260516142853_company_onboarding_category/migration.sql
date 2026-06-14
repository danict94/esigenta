-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "onboardingCategorySlug" TEXT;

-- CreateIndex
CREATE INDEX "Company_onboardingCategorySlug_idx" ON "Company"("onboardingCategorySlug");
