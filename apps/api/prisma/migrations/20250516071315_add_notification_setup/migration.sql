-- CreateTable
CREATE TABLE "SearchNotificationSetup" (
    "id" SERIAL NOT NULL,
    "carId" INTEGER NOT NULL,
    "customEmails" TEXT[],

    CONSTRAINT "SearchNotificationSetup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SearchNotificationSetupToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SearchNotificationSetupToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "SearchNotificationSetup_carId_key" ON "SearchNotificationSetup"("carId");

-- CreateIndex
CREATE INDEX "_SearchNotificationSetupToUser_B_index" ON "_SearchNotificationSetupToUser"("B");

-- AddForeignKey
ALTER TABLE "SearchNotificationSetup" ADD CONSTRAINT "SearchNotificationSetup_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SearchNotificationSetupToUser" ADD CONSTRAINT "_SearchNotificationSetupToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "SearchNotificationSetup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SearchNotificationSetupToUser" ADD CONSTRAINT "_SearchNotificationSetupToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
