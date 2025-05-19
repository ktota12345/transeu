/*
  Warnings:

  - You are about to drop the column `searchScheduleId` on the `Car` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Car" DROP CONSTRAINT "Car_searchScheduleId_fkey";

-- AlterTable
ALTER TABLE "Car" DROP COLUMN "searchScheduleId";

-- CreateTable
CREATE TABLE "_CarSearchSchedules" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CarSearchSchedules_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CarSearchSchedules_B_index" ON "_CarSearchSchedules"("B");

-- AddForeignKey
ALTER TABLE "_CarSearchSchedules" ADD CONSTRAINT "_CarSearchSchedules_A_fkey" FOREIGN KEY ("A") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarSearchSchedules" ADD CONSTRAINT "_CarSearchSchedules_B_fkey" FOREIGN KEY ("B") REFERENCES "SearchScheduleSetup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
