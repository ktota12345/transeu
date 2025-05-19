/*
  Warnings:

  - You are about to drop the column `cargoTypes` on the `Agent` table. All the data in the column will be lost.
  - The `emotionDetectionLevel` column on the `Agent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `emptyKmCost` column on the `Agent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `maxClientIdleTime` column on the `Agent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `maxCounterOffers` column on the `Agent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `maxResponseTime` column on the `Agent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `minOrderValue` column on the `Agent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `minProfitMargin` column on the `Agent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `minRatePerKm` column on the `Agent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `minResponseTime` column on the `Agent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priceThreshold` column on the `Agent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `targetRatePerKm` column on the `Agent` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "cargoTypes",
ADD COLUMN     "additionalFees" JSONB,
ADD COLUMN     "availabilityQueryParams" JSONB,
ADD COLUMN     "availabilityUpdateFrequency" TEXT,
ADD COLUMN     "certificates" TEXT[],
ADD COLUMN     "checkPriority" TEXT,
ADD COLUMN     "currencies" TEXT[],
ADD COLUMN     "customCheckInterval" INTEGER,
ADD COLUMN     "customLogisticsPoint" JSONB,
ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keywordTriggers" TEXT[],
ADD COLUMN     "maxConcurrentNegotiations" INTEGER,
ADD COLUMN     "maxExecutionTime" INTEGER,
ADD COLUMN     "maxOperatingRadius" INTEGER,
ADD COLUMN     "minAvailabilityBuffer" INTEGER,
ADD COLUMN     "negotiationAggressiveness" INTEGER DEFAULT 0,
ADD COLUMN     "negotiationStagesRequiringHuman" TEXT[],
ADD COLUMN     "negotiationStrategiesSelected" TEXT[],
ADD COLUMN     "operator" TEXT,
ADD COLUMN     "preferredCargoTypes" TEXT[],
ADD COLUMN     "preferredCountries" TEXT[],
ADD COLUMN     "preferredDays" TEXT[],
ADD COLUMN     "preferredHours" JSONB,
ADD COLUMN     "preferredPaymentTerms" TEXT[],
ADD COLUMN     "preferredRoutes" TEXT[],
ADD COLUMN     "priority" INTEGER,
ADD COLUMN     "regionsToAvoid" TEXT[],
ADD COLUMN     "roadPreferences" TEXT[],
ADD COLUMN     "scheduleExceptions" JSONB,
ADD COLUMN     "selectedGermanDestinations" TEXT[],
ADD COLUMN     "selectedLogisticsBase" INTEGER,
ADD COLUMN     "specialEquipment" TEXT[],
ADD COLUMN     "specialRequirements" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "timeBuffer" INTEGER,
ADD COLUMN     "timocomSettings" JSONB,
ADD COLUMN     "trailerTypes" TEXT[],
ADD COLUMN     "unusualClientRequirements" TEXT[],
ADD COLUMN     "unwantedCargoTypes" TEXT[],
ADD COLUMN     "unwantedCountries" TEXT[],
ADD COLUMN     "vehicleBases" TEXT[],
ADD COLUMN     "workIntensity" TEXT,
ADD COLUMN     "workingDays" TEXT[],
ALTER COLUMN "destinationCity" DROP DEFAULT,
ALTER COLUMN "searchRadius" DROP DEFAULT,
ALTER COLUMN "checkFrequency" DROP DEFAULT,
DROP COLUMN "emotionDetectionLevel",
ADD COLUMN     "emotionDetectionLevel" INTEGER,
DROP COLUMN "emptyKmCost",
ADD COLUMN     "emptyKmCost" DECIMAL(65,30) DEFAULT 0.0,
DROP COLUMN "maxClientIdleTime",
ADD COLUMN     "maxClientIdleTime" INTEGER,
DROP COLUMN "maxCounterOffers",
ADD COLUMN     "maxCounterOffers" INTEGER,
DROP COLUMN "maxResponseTime",
ADD COLUMN     "maxResponseTime" INTEGER,
DROP COLUMN "minOrderValue",
ADD COLUMN     "minOrderValue" DECIMAL(65,30) DEFAULT 0.0,
DROP COLUMN "minProfitMargin",
ADD COLUMN     "minProfitMargin" DOUBLE PRECISION DEFAULT 0.0,
DROP COLUMN "minRatePerKm",
ADD COLUMN     "minRatePerKm" DECIMAL(65,30) DEFAULT 0.0,
DROP COLUMN "minResponseTime",
ADD COLUMN     "minResponseTime" INTEGER,
ALTER COLUMN "negotiationInstructions" DROP DEFAULT,
DROP COLUMN "priceThreshold",
ADD COLUMN     "priceThreshold" DOUBLE PRECISION,
DROP COLUMN "targetRatePerKm",
ADD COLUMN     "targetRatePerKm" DECIMAL(65,30) DEFAULT 0.0;
