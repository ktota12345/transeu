-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "searchScheduleId" INTEGER;

-- CreateTable
CREATE TABLE "SearchScheduleSetup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "schedule" JSONB NOT NULL,

    CONSTRAINT "SearchScheduleSetup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_searchScheduleId_fkey" FOREIGN KEY ("searchScheduleId") REFERENCES "SearchScheduleSetup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
