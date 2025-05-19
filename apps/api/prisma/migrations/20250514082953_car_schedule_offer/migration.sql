-- CreateTable
CREATE TABLE "CarSchedule" (
    "id" SERIAL NOT NULL,
    "carId" INTEGER NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarScheduleOffer" (
    "id" SERIAL NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "fromLocation" TEXT NOT NULL,
    "toLocation" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "carId" INTEGER NOT NULL,
    "driverId" INTEGER NOT NULL,
    "carScheduleId" INTEGER NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarScheduleOffer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CarSchedule" ADD CONSTRAINT "CarSchedule_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarScheduleOffer" ADD CONSTRAINT "CarScheduleOffer_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarScheduleOffer" ADD CONSTRAINT "CarScheduleOffer_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarScheduleOffer" ADD CONSTRAINT "CarScheduleOffer_carScheduleId_fkey" FOREIGN KEY ("carScheduleId") REFERENCES "CarSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
