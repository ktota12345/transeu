-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "resetToken" VARCHAR(255),
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- Wstawienie przykładowej firmy
INSERT INTO "Company" ("id", "name", "createdAt", "updatedAt")
VALUES (1, 'Testowa Firma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Wstawienie użytkownika admin
INSERT INTO "User" ("email", "username", "password", "role", "companyId", "createdAt", "updatedAt")
VALUES (
           'admin@example.com',
           'admin',
           'hashed_admin_password', -- hasło musisz wcześniej zahashować, np. bcrypt
           'ADMIN',
           1,
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
       );

-- Wstawienie zwykłego użytkownika
INSERT INTO "User" ("email", "username", "password", "role", "companyId", "createdAt", "updatedAt")
VALUES (
           'user@example.com',
           'user',
           'hashed_user_password',
           'USER',
           1,
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
       );
