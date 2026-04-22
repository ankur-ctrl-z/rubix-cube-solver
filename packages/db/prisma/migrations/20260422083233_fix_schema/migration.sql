/*
  Warnings:

  - You are about to drop the column `cubeString` on the `Scan` table. All the data in the column will be lost.
  - Added the required column `cubeState` to the `Scan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Scan" DROP COLUMN "cubeString",
ADD COLUMN     "cubeState" TEXT NOT NULL;
