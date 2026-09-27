-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "lockedUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "PhotoConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "textShown" TEXT NOT NULL,
    "purposes" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawnAt" TIMESTAMP(3),

    CONSTRAINT "PhotoConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyPhoto" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'image/jpeg',
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retentionAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'accepted',
    "refusalReasons" TEXT,

    CONSTRAINT "BodyPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cohort" TEXT NOT NULL,
    "units" TEXT NOT NULL DEFAULT 'imperial',
    "paramsMetric" TEXT NOT NULL,
    "paramsDisplay" TEXT NOT NULL,
    "goalWeightKgRequested" DOUBLE PRECISION NOT NULL,
    "goalWeightKgApplied" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "remoteCallId" TEXT,
    "outputKeys" TEXT,
    "diagnostics" TEXT,
    "refusalReasons" TEXT,
    "userMessage" TEXT,
    "modelVersion" TEXT,
    "configOverrides" TEXT,
    "rerunOfId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateLimitBucket_windowStart_idx" ON "RateLimitBucket"("windowStart");

-- CreateIndex
CREATE INDEX "PhotoConsent_userId_idx" ON "PhotoConsent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BodyPhoto_storageKey_key" ON "BodyPhoto"("storageKey");

-- CreateIndex
CREATE INDEX "BodyPhoto_userId_idx" ON "BodyPhoto"("userId");

-- CreateIndex
CREATE INDEX "BodyPhoto_retentionAt_idx" ON "BodyPhoto"("retentionAt");

-- CreateIndex
CREATE INDEX "Simulation_userId_idx" ON "Simulation"("userId");

-- CreateIndex
CREATE INDEX "Simulation_photoId_idx" ON "Simulation"("photoId");

-- CreateIndex
CREATE INDEX "Simulation_status_idx" ON "Simulation"("status");

-- CreateIndex
CREATE INDEX "Simulation_createdAt_idx" ON "Simulation"("createdAt");

-- AddForeignKey
ALTER TABLE "PhotoConsent" ADD CONSTRAINT "PhotoConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyPhoto" ADD CONSTRAINT "BodyPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyPhoto" ADD CONSTRAINT "BodyPhoto_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "PhotoConsent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "BodyPhoto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

