-- CreateTable
CREATE TABLE "Country" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "_AllowedCountries" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AllowedCountries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AllowedCountries_B_index" ON "_AllowedCountries"("B");

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_country_fkey" FOREIGN KEY ("country") REFERENCES "Country"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AllowedCountries" ADD CONSTRAINT "_AllowedCountries_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AllowedCountries" ADD CONSTRAINT "_AllowedCountries_B_fkey" FOREIGN KEY ("B") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
