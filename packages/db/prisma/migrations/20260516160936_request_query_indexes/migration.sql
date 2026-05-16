-- CreateIndex
CREATE INDEX "Request_status_createdAt_idx" ON "Request"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Request_customerId_createdAt_idx" ON "Request"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Request_latitude_longitude_idx" ON "Request"("latitude", "longitude");
