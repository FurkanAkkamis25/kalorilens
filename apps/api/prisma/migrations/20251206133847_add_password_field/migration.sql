/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "firebase_uid" DROP NOT NULL;

-- CreateTable
CREATE TABLE "DailySummary" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_kcal" INTEGER NOT NULL DEFAULT 0,
    "total_protein" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_carb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_fat" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "DailySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailySummary_user_id_date_key" ON "DailySummary"("user_id", "date");

-- AddForeignKey
ALTER TABLE "DailySummary" ADD CONSTRAINT "DailySummary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
