-- CreateTable
CREATE TABLE "SwapBody" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "apiNameTimocom" TEXT NOT NULL,

    CONSTRAINT "SwapBody_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SwapBody_apiNameTimocom_key" ON "SwapBody"("apiNameTimocom");
