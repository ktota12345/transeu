-- CreateTable
CREATE TABLE "VehicleLoadSecuring" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "apiNameTimocom" TEXT NOT NULL,

    CONSTRAINT "VehicleLoadSecuring_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleLoadSecuring_apiNameTimocom_key" ON "VehicleLoadSecuring"("apiNameTimocom");
