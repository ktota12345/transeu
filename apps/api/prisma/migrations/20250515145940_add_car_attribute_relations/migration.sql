-- CreateTable
CREATE TABLE "_CarVehicleTypes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CarVehicleTypes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CarVehicleLoadSecurings" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CarVehicleLoadSecurings_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CarVehicleEquipments" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CarVehicleEquipments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CarSwapBodies" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CarSwapBodies_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CarBodyProperties" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CarBodyProperties_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CarVehicleTypes_B_index" ON "_CarVehicleTypes"("B");

-- CreateIndex
CREATE INDEX "_CarVehicleLoadSecurings_B_index" ON "_CarVehicleLoadSecurings"("B");

-- CreateIndex
CREATE INDEX "_CarVehicleEquipments_B_index" ON "_CarVehicleEquipments"("B");

-- CreateIndex
CREATE INDEX "_CarSwapBodies_B_index" ON "_CarSwapBodies"("B");

-- CreateIndex
CREATE INDEX "_CarBodyProperties_B_index" ON "_CarBodyProperties"("B");

-- AddForeignKey
ALTER TABLE "_CarVehicleTypes" ADD CONSTRAINT "_CarVehicleTypes_A_fkey" FOREIGN KEY ("A") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarVehicleTypes" ADD CONSTRAINT "_CarVehicleTypes_B_fkey" FOREIGN KEY ("B") REFERENCES "VehicleType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarVehicleLoadSecurings" ADD CONSTRAINT "_CarVehicleLoadSecurings_A_fkey" FOREIGN KEY ("A") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarVehicleLoadSecurings" ADD CONSTRAINT "_CarVehicleLoadSecurings_B_fkey" FOREIGN KEY ("B") REFERENCES "VehicleLoadSecuring"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarVehicleEquipments" ADD CONSTRAINT "_CarVehicleEquipments_A_fkey" FOREIGN KEY ("A") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarVehicleEquipments" ADD CONSTRAINT "_CarVehicleEquipments_B_fkey" FOREIGN KEY ("B") REFERENCES "VehicleEquipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarSwapBodies" ADD CONSTRAINT "_CarSwapBodies_A_fkey" FOREIGN KEY ("A") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarSwapBodies" ADD CONSTRAINT "_CarSwapBodies_B_fkey" FOREIGN KEY ("B") REFERENCES "SwapBody"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarBodyProperties" ADD CONSTRAINT "_CarBodyProperties_A_fkey" FOREIGN KEY ("A") REFERENCES "BodyProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarBodyProperties" ADD CONSTRAINT "_CarBodyProperties_B_fkey" FOREIGN KEY ("B") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
