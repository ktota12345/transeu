-- CreateTable
CREATE TABLE "VehicleEquipment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "apiNameTimocom" TEXT NOT NULL,

    CONSTRAINT "VehicleEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleEquipment_apiNameTimocom_key" ON "VehicleEquipment"("apiNameTimocom");
