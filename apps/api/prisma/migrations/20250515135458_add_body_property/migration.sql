-- CreateTable
CREATE TABLE "BodyProperty" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "apiNameTimocom" TEXT NOT NULL,

    CONSTRAINT "BodyProperty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BodyProperty_apiNameTimocom_key" ON "BodyProperty"("apiNameTimocom");
