-- Add a nullable public request code so existing requests can be backfilled safely.
ALTER TABLE "Request" ADD COLUMN "requestCode" TEXT;

-- PostgreSQL allows multiple NULL values in a unique index, so this is safe before backfill.
CREATE UNIQUE INDEX "Request_requestCode_key" ON "Request"("requestCode");
