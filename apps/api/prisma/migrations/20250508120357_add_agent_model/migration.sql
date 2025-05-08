-- CreateTable
CREATE TABLE "Agent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "specializations" TEXT[],
    "priorityClients" TEXT[],
    "cargoTypes" TEXT[],
    "additionalServices" TEXT[],

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);
