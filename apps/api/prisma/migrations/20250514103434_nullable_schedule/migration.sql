-- DropForeignKey
ALTER TABLE "CarScheduleOffer" DROP CONSTRAINT "CarScheduleOffer_carScheduleId_fkey";

-- AlterTable
ALTER TABLE "CarScheduleOffer" ALTER COLUMN "carScheduleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CarScheduleOffer" ADD CONSTRAINT "CarScheduleOffer_carScheduleId_fkey" FOREIGN KEY ("carScheduleId") REFERENCES "CarSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
