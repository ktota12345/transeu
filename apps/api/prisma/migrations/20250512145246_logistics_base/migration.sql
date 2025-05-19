-- CreateTable
CREATE TABLE "LogisticsBase" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "addressFull" TEXT NOT NULL,
    "addressCity" TEXT NOT NULL,
    "addressPostalCode" TEXT NOT NULL,
    "addressCountry" TEXT NOT NULL,
    "coordinatesLat" DOUBLE PRECISION NOT NULL,
    "coordinatesLng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "LogisticsBase_pkey" PRIMARY KEY ("id")
);
