-- RenameColumn (manual: preserves the 7 existing non-null values populated
-- in Phase 8.5 — a default Prisma diff would DROP+ADD and lose them)
ALTER TABLE "Category" RENAME COLUMN "defaultProjectGroupIds" TO "projectGroupIds";

-- CreateTable
CREATE TABLE "ProjectGroupAlias" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "projectGroupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectGroupAlias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectGroupAlias_value_key" ON "ProjectGroupAlias"("value");

-- CreateIndex
CREATE INDEX "ProjectGroupAlias_projectGroupId_idx" ON "ProjectGroupAlias"("projectGroupId");

-- AddForeignKey
ALTER TABLE "ProjectGroupAlias" ADD CONSTRAINT "ProjectGroupAlias_projectGroupId_fkey" FOREIGN KEY ("projectGroupId") REFERENCES "ProjectGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
