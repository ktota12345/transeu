-- DropForeignKey
ALTER TABLE "CarrierContact" DROP CONSTRAINT "CarrierContact_carrierId_fkey";

-- AddForeignKey
ALTER TABLE "CarrierContact" ADD CONSTRAINT "CarrierContact_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
