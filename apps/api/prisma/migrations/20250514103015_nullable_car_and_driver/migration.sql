-- DropForeignKey
ALTER TABLE "CarScheduleOffer" DROP CONSTRAINT "CarScheduleOffer_carId_fkey";

-- DropForeignKey
ALTER TABLE "CarScheduleOffer" DROP CONSTRAINT "CarScheduleOffer_driverId_fkey";

-- AlterTable
ALTER TABLE "CarScheduleOffer" ALTER COLUMN "carId" DROP NOT NULL,
ALTER COLUMN "driverId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CarScheduleOffer" ADD CONSTRAINT "CarScheduleOffer_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarScheduleOffer" ADD CONSTRAINT "CarScheduleOffer_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
