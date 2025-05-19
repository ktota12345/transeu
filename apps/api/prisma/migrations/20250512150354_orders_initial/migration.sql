-- CreateTable
CREATE TABLE "LocationDetails" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "timeWindow" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "additionalInfo" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "LocationDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cargo" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "weightUnit" TEXT NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "volumeUnit" TEXT NOT NULL,
    "loadingMeters" DOUBLE PRECISION NOT NULL,
    "packages" INTEGER NOT NULL,
    "packageType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "adr" BOOLEAN NOT NULL,
    "temperature" DOUBLE PRECISION,
    "stackable" BOOLEAN NOT NULL,
    "fragile" BOOLEAN NOT NULL,
    "additionalRequirements" TEXT NOT NULL,

    CONSTRAINT "Cargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "requirements" TEXT[],
    "capacity" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "additionalEquipment" TEXT NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Financials" (
    "id" SERIAL NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "ratePerKm" DOUBLE PRECISION NOT NULL,
    "estimatedDistance" DOUBLE PRECISION NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "fuelCost" DOUBLE PRECISION NOT NULL,
    "driverCost" DOUBLE PRECISION NOT NULL,
    "estimatedCosts" DOUBLE PRECISION NOT NULL,
    "estimatedProfit" DOUBLE PRECISION NOT NULL,
    "margin" INTEGER NOT NULL,
    "valuePerKm" DOUBLE PRECISION NOT NULL,
    "paymentTerm" TEXT NOT NULL,

    CONSTRAINT "Financials_pkey" PRIMARY KEY ("id")
);
