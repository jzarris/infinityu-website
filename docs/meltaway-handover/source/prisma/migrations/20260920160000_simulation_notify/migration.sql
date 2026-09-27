-- AlterTable
ALTER TABLE "Simulation" ADD COLUMN     "notifiedAt" TIMESTAMP(3),
ADD COLUMN     "notifyRequested" BOOLEAN NOT NULL DEFAULT false;

