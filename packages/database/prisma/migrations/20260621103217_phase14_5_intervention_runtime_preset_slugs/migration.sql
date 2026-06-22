-- AlterTable
ALTER TABLE "Intervention" ADD COLUMN     "runtimePresetSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[];
