-- CreateEnum
CREATE TYPE "RequestPhotoStatus" AS ENUM ('TEMPORARY', 'ATTACHED');

-- CreateTable
CREATE TABLE "RequestPhoto" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "status" "RequestPhotoStatus" NOT NULL DEFAULT 'TEMPORARY',
    "requestId" TEXT,
    "attachedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RequestPhoto_uploadId_key" ON "RequestPhoto"("uploadId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestPhoto_fileKey_key" ON "RequestPhoto"("fileKey");

-- CreateIndex
CREATE INDEX "RequestPhoto_requestId_idx" ON "RequestPhoto"("requestId");

-- AddForeignKey
ALTER TABLE "RequestPhoto" ADD CONSTRAINT "RequestPhoto_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
